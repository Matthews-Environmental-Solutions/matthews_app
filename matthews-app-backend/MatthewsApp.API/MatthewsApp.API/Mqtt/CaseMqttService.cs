using MatthewsApp.API.Dtos;
using MatthewsApp.API.Enums;
using MatthewsApp.API.Mappers;
using MatthewsApp.API.Models;
using MatthewsApp.API.PrismEvents;
using MatthewsApp.API.Repository.Interfaces;
using MatthewsApp.API.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using MQTTnet;
using MQTTnet.Client;
using Prism.Events;
using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace MatthewsApp.API.Mqtt;

public class CaseMqttService : IHostedService
{
    // list keeps all instances alive, so they can be executed again.
    // To stop any IMqttClient just remove it from the list
    private readonly Dictionary<string, IMqttClient> _mqttClientsList = new Dictionary<string, IMqttClient>();

    private readonly List<MqttConnectionSettingDto> _mqttConnectionSettings = new List<MqttConnectionSettingDto>();

    private readonly IEventAggregator _ea;
    private readonly MqttFactory _mqttFactory;
    private readonly CaseHub _caseHub;
    private readonly IConfiguration _configuration;
    private readonly IServiceScopeFactory _serviceScopeFactory;

    private ICollection<DeviceDto> _devices;

    public CaseMqttService(
        IConfiguration configuration,
        CaseHub caseHub,
        IServiceScopeFactory serviceScopeFactory,
        IEventAggregator ea)
    {
        _caseHub = caseHub;
        _configuration = configuration;
        _mqttFactory = new MqttFactory();
        _serviceScopeFactory = serviceScopeFactory;
        _ea = ea;
    }

    public async Task StartAsync(CancellationToken cancellationToken)
    {
        using (var scope = _serviceScopeFactory.CreateScope())
        {
            ILogger<CaseMqttService> _logger = scope.ServiceProvider.GetService<ILogger<CaseMqttService>>();
            _logger.LogInformation("---------- Case Mqtt Service is starting");

            // 1. SUBSCRIBE TO EVENT(S)
            _ea.GetEvent<EventCaseAnyChange>().Subscribe(SendCasesToSeveralDevices);
            _ea.GetEvent<CaseSelectEvent>().Subscribe(SelectCase);
            _ea.GetEvent<CaseDeselectEvent>().Subscribe(DeselectCase);

            // 2. Continue to refresh list of devices each 15 minutes
            GetDevicesAsync(); // must NOT BE await!!

            // 3. MQTT
            ConnectToMqttBrokers();
        }
    }

    public async Task StopAsync(CancellationToken cancellationToken)
    {
        using (var scope = _serviceScopeFactory.CreateScope())
        {
            ILogger<CaseMqttService> _logger = scope.ServiceProvider.GetService<ILogger<CaseMqttService>>();
            _logger.LogInformation("---------- Case Mqtt Service is stopping");

            _ea.GetEvent<EventCaseAnyChange>().Unsubscribe(SendCasesToSeveralDevices);
            _ea.GetEvent<CaseSelectEvent>().Unsubscribe(SelectCase);
            _ea.GetEvent<CaseDeselectEvent>().Unsubscribe(DeselectCase);

            var mqttClientDisconnectOptions = _mqttFactory.CreateClientDisconnectOptionsBuilder().Build();

            foreach (KeyValuePair<string, IMqttClient> client in _mqttClientsList)
            {
                await client.Value.DisconnectAsync(mqttClientDisconnectOptions, CancellationToken.None);
            }
        }
    }

    /// <summary>
    /// It is a Task which will refresh the list of devices each N minutes.
    /// The N minutes is taken from configuration. When you call it, do not use "await".
    /// </summary>
    /// <returns>void</returns>
    private async Task GetDevicesAsync()
    {
        _ = Task.Run(
            async () =>
            {
                while (true)
                {
                    using (var scope = _serviceScopeFactory.CreateScope())
                    {
                        ILogger<CaseMqttService> _logger = scope.ServiceProvider.GetService<ILogger<CaseMqttService>>();
                        try
                        {
                            ICaseI4cHttpClientService _caseI4CHttpClientService = scope.ServiceProvider.GetService<ICaseI4cHttpClientService>();
                            _logger?.LogInformation("---------- Case Mqtt Service - GetDevicesAsync");

                            // 1. get devices
                            _devices = await _caseI4CHttpClientService.GetAllDevicesAsync();
                            _logger?.LogInformation($"---------- Case Mqtt Service - Number of devices: {_devices.Count}");

                            // 2. then iterate devices, 
                            foreach (DeviceDto device in _devices)
                            {
                                // device must has adapter
                                if (device.adapterId is null) continue;

                                // if connection already exist then skip
                                if (_mqttConnectionSettings.Any(c => c.DeviceId == device.id)) continue;

                                // 3. use adapterId and get credentials (host, port, username and password). They are in "adapterConfiguration"
                                AdapterDto adapter = await _caseI4CHttpClientService.GetAdapterByDeviceIdAsync((Guid)device.adapterId);
                                string cfg = adapter.configuration;
                                AdapterConfigurationDto adapterConfiguration = JsonSerializer.Deserialize<AdapterConfigurationDto>(cfg);

                                // 4. use device ID and get the device details
                                DeviceDetailsDto deviceDetails = await _caseI4CHttpClientService.GetDeviceDetailsAsync(device.id);
                                if (deviceDetails.configuration is null) continue;
                                DeviceDetailsConfigurationDto deviceDetailsCfg = JsonSerializer.Deserialize<DeviceDetailsConfigurationDto>(deviceDetails.configuration);

                                MqttConnectionSettingDto connection = new MqttConnectionSettingDto(
                                    device.id,
                                    adapterConfiguration.host,
                                    Int32.Parse(adapterConfiguration.port),
                                    adapterConfiguration.username,
                                    adapterConfiguration.password,
                                    deviceDetailsCfg.topic
                                    );

                                _mqttConnectionSettings.Add(connection);

                                _logger?.LogInformation($"---------- Case Mqtt Service - MqttConnectionSettingDto is added for device: {connection.DeviceId} with topic {connection.Topic}");

                                Debug.WriteLine($"{deviceDetailsCfg.topic}");
                            }

                        }
                        catch (Exception ex)
                        {
                            _logger.LogError($"Error: {ex.Message}");
                            throw;
                        }
                        finally
                        {
                            await Task.Delay(TimeSpan.FromMinutes(Int32.Parse(_configuration["deviceListRefreshIntervalInMinutes"])));
                        }
                    }
                }
            });
    }

    /// <summary>
    /// It will establich connection to all mqtt brokers that are used from all devices. More, it will subscribe to topic.
    /// </summary>
    private void ConnectToMqttBrokers()
    {
        _ = Task.Run(
            async () =>
            {
                // User proper cancellation and no while(true).
                while (true)
                {
                    using (var scope = _serviceScopeFactory.CreateScope())
                    {
                        ILogger<CaseMqttService> _logger = scope.ServiceProvider.GetService<ILogger<CaseMqttService>>();

                        try
                        {
                            foreach (MqttConnectionSettingDto setting in _mqttConnectionSettings)
                            {
                                IMqttClient _mqttClient;

                                // 1. check if connection to mqtt broker already exists. If yes just take it, if not create it and add it to Dictionary.
                                if (_mqttClientsList.ContainsKey(setting.Host))
                                {
                                    _mqttClient = _mqttClientsList.GetValueOrDefault(setting.Host);
                                }
                                else
                                {
                                    _mqttClient = CreateMqttClient();
                                    _mqttClientsList.Add(setting.Host, _mqttClient);
                                }

                                // This code will also do the very first connect! So no call to _ConnectAsync_ is required in the first place.
                                if (!await _mqttClient.TryPingAsync())
                                {
                                    MqttClientOptions options = new MqttClientOptionsBuilder()
                                        .WithClientId(Guid.NewGuid().ToString())
                                        .WithTcpServer(setting.Host, setting.Port)
                                        .WithCredentials(setting.Username, setting.Password)
                                            .WithTls()
                                            .WithCleanSession()
                                            .Build();

                                    _logger.LogInformation($"---------- Case Mqtt Service - ConnectAsync to {setting.Host}");
                                    MqttClientConnectResult result = await _mqttClient.ConnectAsync(options, CancellationToken.None);
                                    setting.Connected = result.ResultCode == MqttClientConnectResultCode.Success;

                                    if (setting.Connected)
                                    {
                                        _logger.LogInformation($"---------- Case Mqtt Service - Connection established to {setting.Host}");

                                        // Once connection is established, get the clientId
                                        setting.ClientId = _mqttClient.Options.ClientId;
                                        // collect all topics to subscribe for particular mqtt broker (host)
                                        List<string> topics = GetTopicsForMqttClient(setting.Host);

                                        // Subscribe to topics when session is clean etc.
                                        MqttClientSubscribeOptionsBuilder mqttSubscribeOptionsBuilder = _mqttFactory.CreateSubscribeOptionsBuilder();
                                        foreach (string topic in topics)
                                        {
                                            mqttSubscribeOptionsBuilder.WithTopicFilter(f =>
                                            {
                                                _logger.LogInformation($"---------- Case Mqtt Service - Subscribe to topic {topic}/CaseUpdate");
                                                f.WithTopic($"{topic}/CaseUpdate");
                                            });
                                        }
                                        var mqttSubscribeOptions = mqttSubscribeOptionsBuilder.Build();

                                        await _mqttClient.SubscribeAsync(mqttSubscribeOptions, CancellationToken.None);
                                        _logger.LogInformation($"---------- Case Mqtt Service - MQTT client subscribed to topics");
                                        Debug.WriteLine("MQTT client subscribed to topics.");

                                        // Send initial information to all devices connected with this broker (connection)
                                        await SendInitialInformationToDevicesOfConnection(setting.Host);

                                        // Send initial list of cases to all devices on client connection
                                        List<Guid> ids = _mqttConnectionSettings.Where(s => s.Host == setting.Host).Select(s => s.DeviceId).ToList();
                                        SendCasesToSeveralDevices(ids);
                                    }
                                }

                            }

                        }
                        catch (Exception ex)
                        {
                            // Handle the exception properly (logging etc.).
                            _logger.LogError($"---------- Case Mqtt Service - Error at MQTT connection establish: {ex.Message}");
                            Debug.WriteLine("Error at MQTT connection establish: " + ex.Message);
                        }
                        finally
                        {
                            // Check the connection state every 10 seconds and perform a reconnect if required.
                            await Task.Delay(TimeSpan.FromSeconds(10));
                        }
                    }
                }
            });

    }

    /// <summary>
    /// It will create new mqtt client with two events.
    /// </summary>
    /// <returns>IMqttClient</returns>
    private IMqttClient CreateMqttClient()
    {
        var mqttFactory = new MqttFactory();
        IMqttClient mqttClient = mqttFactory.CreateMqttClient();

        // DEFINE CALLBACKs to mqttClient event
        mqttClient.ApplicationMessageReceivedAsync += async e =>
        {
            using (var scope = _serviceScopeFactory.CreateScope())
            {
                ICasesService casesService = scope.ServiceProvider.GetService<ICasesService>();
                ILogger<CaseMqttService> logger = scope.ServiceProvider.GetService<ILogger<CaseMqttService>>();

                logger.LogInformation($"---------- Case Mqtt Service - Received application message: client {e.ClientId}");

                string receivedMessage = Encoding.UTF8.GetString(e.ApplicationMessage.Payload);
                receivedMessage = receivedMessage.Replace("\r", "").Replace("\t", "").Replace("\n", "");

                try
                {
                    MqttMessageHandler handler = new MqttMessageHandler(receivedMessage, logger, casesService, _caseHub);
                    await handler.InitializeMessageHandlingAsync();
                    await handler.Action();
                }
                catch (Exception ex)
                {

                    throw;
                }
            }
        };

        mqttClient.ConnectedAsync += e =>
        {
            using (var scope = _serviceScopeFactory.CreateScope())
            {
                ILogger<CaseMqttService> _logger = scope.ServiceProvider.GetService<ILogger<CaseMqttService>>();
                _logger.LogInformation($"---------- Case Mqtt Service - The MQTT client is connected.");
                Debug.WriteLine("The MQTT client is connected.");
            }
            return Task.CompletedTask;
        };

        return mqttClient;
    }

    private void SelectCase(Case entityCase)
    {
        SendCaseRequiredToFlexy(entityCase, entityCase.Id.ToString());
        SendCaseRequestToFlexy(entityCase);
        _caseHub.SendMessageToSelectCase($"CaseId: {entityCase.Id}; DeviceId: {entityCase.ScheduledDevice}; ActualStartTime: {string.Empty}; ActualEndTime: {string.Empty}");
    }

    private void DeselectCase(Case entityCase)
    {
        SendCaseRequiredToFlexy(entityCase, string.Empty);
        SendCaseRequestToFlexy(entityCase);
        _caseHub.SendMessageToSelectCase($"CaseId: {string.Empty}; DeviceId: {entityCase.ScheduledDevice}; ActualStartTime: {string.Empty}; ActualEndTime: {string.Empty}");
    }

    private async Task SendCaseRequiredToFlexy(Case entityCase, string caseId)
    {
        
        using (var scope = _serviceScopeFactory.CreateScope())
        {
            ILogger<CaseMqttService> _logger = scope.ServiceProvider.GetService<ILogger<CaseMqttService>>();

            //get all devices which belong to connection(host)
            List<MqttConnectionSettingDto> devicesFromConnection = _mqttConnectionSettings.Where(cs => cs.DeviceId == entityCase.ScheduledDevice).ToList();

            var setting = devicesFromConnection.FirstOrDefault();

            if (setting != null)
            {
                // 1. get mqtt client
                IMqttClient client = _mqttClientsList.GetValueOrDefault(setting.Host);

                if (client != null)
                {
                    // 2. payload
                    CaseRequiredMqttDto jsonPayload = new CaseRequiredMqttDto
                    {
                        CASE_REQUIRED = caseId //case id
                    };

                    var objToString = JsonSerializer.Serialize(jsonPayload);
                    var payload = Encoding.ASCII.GetBytes(objToString);
                    var message = new MqttApplicationMessageBuilder()
                                           .WithTopic($"{setting.Topic}/Cases")
                                           .WithPayload(payload)
                                           .WithRetainFlag(false)
                                           .Build();

                    MqttClientPublishResult _ = await client.PublishAsync(message, CancellationToken.None);

                    _logger.LogInformation($"---------- Case Mqtt Service - Publish message to {setting.Topic}/Cases");
                }
            }
        }
    }

    private async Task SendCaseRequestToFlexy(Case entityCase)
    {
        using (var scope = _serviceScopeFactory.CreateScope())
        {
            ILogger<CaseMqttService> _logger = scope.ServiceProvider.GetService<ILogger<CaseMqttService>>();

            //get all devices which belong to connection(host)
            List<MqttConnectionSettingDto> devicesFromConnection = _mqttConnectionSettings.Where(cs => cs.DeviceId == entityCase.ScheduledDevice).ToList();

            var setting = devicesFromConnection.FirstOrDefault();

            if (setting != null)
            {
                // 1. get mqtt client
                IMqttClient client = _mqttClientsList.GetValueOrDefault(setting.Host);

                if (client != null)
                {
                    //2.payload
                    CaseRequestMqttDto jsonPayload = new CaseRequestMqttDto
                    {
                        CASE_REQUEST = "1"
                    };

                    var objToString = JsonSerializer.Serialize(jsonPayload);
                    var payload = Encoding.ASCII.GetBytes(objToString);
                    var message = new MqttApplicationMessageBuilder()
                                           .WithTopic($"{setting.Topic}/Cases")
                                           .WithPayload(payload)
                                           .WithRetainFlag(false)
                                           .Build();

                    MqttClientPublishResult _ = await client.PublishAsync(message, CancellationToken.None);

                    _logger.LogInformation($"---------- Case Mqtt Service - Publish message to {setting.Topic}/Cases");
                }
            }
        }
    }

    /// <summary>
    /// It will find all topics related to particular mqtt Broker (host).
    /// </summary>
    /// <param name="HostUrl"></param>
    /// <returns>List of topics</returns>
    private List<string> GetTopicsForMqttClient(string HostUrl)
    {
        using (var scope = _serviceScopeFactory.CreateScope())
        {
            ILogger<CaseMqttService> _logger = scope.ServiceProvider.GetService<ILogger<CaseMqttService>>();
            _logger.LogInformation($"---------- Case Mqtt Service - GetTopicsForMqttClient {HostUrl}");
            return _mqttConnectionSettings.Where(s => s.Host == HostUrl).Select(s => s.Topic).ToList();
        }
    }

    private async Task SendInitialInformationToDevicesOfConnection(string host)
    {
        using (var scope = _serviceScopeFactory.CreateScope())
        {
            ILogger<CaseMqttService> _logger = scope.ServiceProvider.GetService<ILogger<CaseMqttService>>();
            _logger.LogInformation($"---------- Case Mqtt Service - Send Initial Information To Devices Of Connection for host {host}");

            // get all devices which belong to connection (host)
            List<MqttConnectionSettingDto> devicesFromConnection = _mqttConnectionSettings.Where(cs => cs.Host == host).ToList();

            // 4. Send initial information to devices
            foreach (MqttConnectionSettingDto connectionSetting in devicesFromConnection)
            {
                await SendInitialInformationToDevice(connectionSetting);
            }
        }
    }

    private async Task SendInitialInformationToDevice(MqttConnectionSettingDto setting)
    {
        using (var scope = _serviceScopeFactory.CreateScope())
        {
            ILogger<CaseMqttService> _logger = scope.ServiceProvider.GetService<ILogger<CaseMqttService>>();
            DeviceDto device = _devices.First(d => d.id == setting.DeviceId);

            if (setting != null)
            {
                // 1. get mqtt client
                IMqttClient client = _mqttClientsList.GetValueOrDefault(setting.Host);

                if (client != null)
                {
                    // 2. payload
                    InitialInformationMessageDto jsonPayload = new InitialInformationMessageDto
                    {
                        FACILITY_ID = device.siteId,
                        CREMATOR_ID = device.id
                    };

                    var objToString = JsonSerializer.Serialize(jsonPayload);
                    var payload = Encoding.ASCII.GetBytes(objToString);

                    var message = new MqttApplicationMessageBuilder()
                               .WithTopic($"{setting.Topic}/Cases")
                               .WithPayload(payload)
                               .WithRetainFlag(false)
                               .Build();

                    MqttClientPublishResult _ = await client.PublishAsync(message, CancellationToken.None);

                    _logger.LogInformation($"---------- Case Mqtt Service - Publish message to {setting.Topic}/Cases");
                }
            }
        }
    }

    private void SendCasesToSeveralDevices(List<Guid> deviceIds)
    {
        using (var scope = _serviceScopeFactory.CreateScope())
        {
            ILogger<CaseMqttService> _logger = scope.ServiceProvider.GetService<ILogger<CaseMqttService>>();
            _logger.LogInformation($"---------- Case Mqtt Service - SendCasesToSeveralDevices");
            foreach (Guid deviceId in deviceIds)
            {
                _ = SendCasesToDeviceAsync(deviceId);
            }
        }
    }

    public async Task SendCasesToDeviceAsync(Guid deviceId)
    {
        using (var scope = _serviceScopeFactory.CreateScope())
        {
            ILogger<CaseMqttService> _logger = scope.ServiceProvider.GetService<ILogger<CaseMqttService>>();
            IEnumerable<Case> cases;
            // get 20 cases
            ICaseRepository _caseRepository = scope.ServiceProvider.GetService<ICaseRepository>();
            cases = await _caseRepository.GetFirst20ScheduledCases(deviceId);

            IEnumerable<Case20Dto> casesToSend = cases.ToCase20DTOs();

            // make payload and serialize
            dynamic obj = MakeFlatCase20Payload(casesToSend);
            string objToStringNew = JsonSerializer.Serialize(obj);
            byte[] payload = Encoding.ASCII.GetBytes(objToStringNew);

            // setting
            MqttConnectionSettingDto setting = _mqttConnectionSettings.First(cs => cs.DeviceId == deviceId);
            // client
            IMqttClient client = _mqttClientsList.GetValueOrDefault(setting.Host);

            // message
            var message = new MqttApplicationMessageBuilder()
                               .WithTopic($"{setting.Topic}/Cases")
                               .WithPayload(payload)
                               .WithRetainFlag(false)
                               .Build();

            MqttClientPublishResult _ = await client.PublishAsync(message, CancellationToken.None);
            _logger.LogInformation($"---------- Case Mqtt Service - Publish 20 cases to device {deviceId}");
        }
    }

    private static dynamic MakeFlatCase20Payload(IEnumerable<Case20Dto> casesToSend)
    {
        string RequestMessage = "{}";
        Dictionary<string, string> jsonDict = JsonSerializer.Deserialize<Dictionary<string, string>>(RequestMessage);

        var casesList = casesToSend.ToList();
        int counter = 0;

        foreach (var caseFor20 in casesList)
        {
            counter++;
            jsonDict.Add($"CASE_{counter}_ID", caseFor20.ID.ToString());
            jsonDict.Add($"CASE_{counter}_CLIENT_ID", caseFor20.Client_ID);
            jsonDict.Add($"CASE_{counter}_FIRST_NAME", caseFor20.FIRST_NAME);
            jsonDict.Add($"CASE_{counter}_SURNAME", caseFor20.SURNAME);
            jsonDict.Add($"CASE_{counter}_WEIGHT", caseFor20.WEIGHT);
            jsonDict.Add($"CASE_{counter}_COFFIN_TYPE", caseFor20.COFFIN_TYPE);
            jsonDict.Add($"CASE_{counter}_GENDER", caseFor20.GENDER);
            jsonDict.Add($"CASE_{counter}_AGE", caseFor20.AGE);
            jsonDict.Add($"CASE_{counter}_READY", caseFor20.READY);
            jsonDict.Add($"CASE_{counter}_SCHEDULED_START_TIME", caseFor20.SCHEDULED_START_TIME);
            jsonDict.Add($"CASE_{counter}_PHYSICAL_ID", caseFor20.LOADED_PHYSICAL_ID);
        }

        if (counter < 20)
        {
            int rest = 20 - counter;
            for (int i = ++counter; i < counter + rest; i++)
            {
                jsonDict.Add($"CASE_{i}_ID", string.Empty);
                jsonDict.Add($"CASE_{i}_CLIENT_ID", string.Empty);
                jsonDict.Add($"CASE_{i}_FIRST_NAME", string.Empty);
                jsonDict.Add($"CASE_{i}_SURNAME", string.Empty);
                jsonDict.Add($"CASE_{i}_SIZE", string.Empty);
                jsonDict.Add($"CASE_{i}_WEIGHT", string.Empty);
                jsonDict.Add($"CASE_{i}_COFFIN_TYPE", string.Empty);
                jsonDict.Add($"CASE_{i}_GENDER", string.Empty);
                jsonDict.Add($"CASE_{i}_AGE", string.Empty);
                jsonDict.Add($"CASE_{i}_READY", string.Empty);
                jsonDict.Add($"CASE_{i}_SCHEDULED_START_TIME", string.Empty);
                jsonDict.Add($"CASE_{i}_PHYSICAL_ID", string.Empty);
            }
        }

        return jsonDict;
    }

    private IMqttClient FindClientByClientId(string clientId)
    {

        IMqttClient cli = _mqttClientsList.FirstOrDefault(c => c.Value.Options.ClientId == clientId).Value;
        return cli;
    }
}

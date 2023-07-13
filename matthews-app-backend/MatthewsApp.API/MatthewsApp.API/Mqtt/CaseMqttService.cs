using MatthewsApp.API.Dtos;
using MatthewsApp.API.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using MQTTnet;
using MQTTnet.Client;
using MQTTnet.Server;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using System.Timers;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace MatthewsApp.API.Mqtt;

public class CaseMqttService : IHostedService
{
    // list keeps all instances alive, so they can be executed again.
    // To stop any IMqttClient just remove it from the list
    private Dictionary<string, IMqttClient> _mqttClientsList = new Dictionary<string, IMqttClient>();

    private List<MqttConnectionSettingDto> _mqttConnectionSettings = new List<MqttConnectionSettingDto>();

    private MqttFactory _mqttFactory;
    private readonly CaseHub _caseHub;
    private IConfiguration _configuration;
    private ICollection<DeviceDto> _devices;
    private readonly ILogger<CaseMqttService> _logger;
    private CaseI4cHttpClientService _caseI4CHttpClientService;

    public CaseMqttService(ILogger<CaseMqttService> logger, IConfiguration configuration, CaseI4cHttpClientService caseI4CHttpClientService, CaseHub caseHub)
    {
        _logger = logger;
        _caseHub = caseHub;
        _configuration = configuration;
        _mqttFactory = new MqttFactory();
        _caseI4CHttpClientService = caseI4CHttpClientService;
    }

    // THIS METHOD IS TO TEST SENDING MESSAGES VIA SIGNALR
    public void DisplayTimeEvent(object source, ElapsedEventArgs e)
    {
        Debug.WriteLine(" \r{0} ", DateTime.Now);
        _caseHub.SendMessageToRefreshList("poruka");
    }

    public async Task StartAsync(CancellationToken cancellationToken)
    {
        // THIS CODE IS TO TEST SENDING MESSAGES VIA SIGNALR
        //var timer = new System.Timers.Timer(5000);
        //timer.Elapsed += new ElapsedEventHandler(DisplayTimeEvent);
        //timer.Enabled = true;

        try
        {
            // 1. GET ALL MATTHEWS DEVICES FROM ALL FACILITIES
            _devices = await _caseI4CHttpClientService.GetAllDevicesAsync();

            // 2. then iterate devices, 
            foreach (DeviceDto device in _devices)
            {
                if (device.adapterId is null) continue;

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

                Debug.WriteLine($"{deviceDetailsCfg.topic}");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error on StartAsync: {ex.Message}");
            throw;
        }

        // 2. Continue to refresh list of devices each 15 minutes
        GetDevicesAsync(); // must NOT BE await!!

        // 3. MQTT
        ConnectToMqttBrokers();
    }

    public async Task StopAsync(CancellationToken cancellationToken)
    {
        var mqttClientDisconnectOptions = _mqttFactory.CreateClientDisconnectOptionsBuilder().Build();

        foreach (KeyValuePair<string, IMqttClient> client in _mqttClientsList)
        {
            await client.Value.DisconnectAsync(mqttClientDisconnectOptions, CancellationToken.None);
        }

        //return Task.CompletedTask;
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

                                await _mqttClient.ConnectAsync(options, CancellationToken.None);

                                // collect all topics to subscribe for particular mqtt broker (host)
                                List<string> topics = GetTopicsForMqttClient(setting.Host);

                                // Subscribe to topics when session is clean etc.
                                MqttClientSubscribeOptionsBuilder mqttSubscribeOptionsBuilder = _mqttFactory.CreateSubscribeOptionsBuilder();
                                foreach (string topic in topics)
                                {
                                    mqttSubscribeOptionsBuilder.WithTopicFilter(f =>
                                    {
                                        f.WithTopic($"{topic}/CaseUpdate");
                                    });
                                }
                                var mqttSubscribeOptions = mqttSubscribeOptionsBuilder.Build();

                                await _mqttClient.SubscribeAsync(mqttSubscribeOptions, CancellationToken.None);
                                Debug.WriteLine("MQTT client subscribed to topic.");
                            }

                        }
                    }
                    catch (Exception ex)
                    {
                        // Handle the exception properly (logging etc.).
                        Debug.WriteLine("Error at MQTT connection establish: " + ex.Message);
                    }
                    finally
                    {
                        // Check the connection state every 10 seconds and perform a reconnect if required.
                        await Task.Delay(TimeSpan.FromSeconds(10));
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

        // DEFINE CALLBACKs to mqttClient events
        mqttClient.ApplicationMessageReceivedAsync += e =>
        {
            Debug.WriteLine("Received application message: " + e.ClientId + " " + e.ResponseReasonString);
            return Task.CompletedTask;
        };

        //_mqttClient.ApplicationMessageReceivedAsync += delegate (MqttApplicationMessageReceivedEventArgs args)
        //{
        //    Debug.WriteLine("Received application message: " + args.ClientId);
        //    return Task.CompletedTask;
        //};

        mqttClient.ConnectedAsync += e =>
        {
            Debug.WriteLine("The MQTT client is connected.");
            return Task.CompletedTask;
        };

        return mqttClient;
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
                    try
                    {
                        _devices = await _caseI4CHttpClientService.GetAllDevicesAsync();
                    }
                    catch (Exception)
                    {
                        throw;
                    }
                    finally
                    {
                        await Task.Delay(TimeSpan.FromMinutes(Int32.Parse(_configuration["deviceListRefrechIntervalInMinutes"])));
                    } 
                }
            });
    }

    /// <summary>
    /// It will find all topics related to particular mqtt Broker (host).
    /// </summary>
    /// <param name="HostUrl"></param>
    /// <returns>List of topics</returns>
    private List<string> GetTopicsForMqttClient(string HostUrl)
    {
        return _mqttConnectionSettings.Where(s => s.Host == HostUrl).Select(s => s.Topic).ToList();
    }
}

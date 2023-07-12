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

namespace MatthewsApp.API.Mqtt;

public class CaseMqttService : IHostedService
{
    private IMqttClient _mqttClient;

    // list keeps all instances alive, so they can be executed again.
    // To stop any IMqttClient just remove it from the list
    private Dictionary<Guid, IMqttClient> _mqttClientsList = new Dictionary<Guid, IMqttClient>();

    private Dictionary<Guid, Task> _mqttTaskList = new Dictionary<Guid, Task>();

    private List<MqttConnectionSettingDto> _mqttConnectionSettings = new List<MqttConnectionSettingDto>();
    
    private MqttFactory _mqttFactory;
    private readonly CaseHub _caseHub;
    private IConfiguration _configuration;
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
            ICollection<DeviceDto> devices = await _caseI4CHttpClientService.GetAllDevicesAsync();

            // 2. then iterate devices, 
            foreach (DeviceDto device in devices)
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

            throw;
        }

        // 2. MQTT
        ConnectToMqttBrokers();
    }

    public async Task StopAsync(CancellationToken cancellationToken)
    {
        var mqttClientDisconnectOptions = _mqttFactory.CreateClientDisconnectOptionsBuilder().Build();

        await _mqttClient.DisconnectAsync(mqttClientDisconnectOptions, CancellationToken.None);

        //return Task.CompletedTask;
        //throw new System.NotImplementedException();
    }


    private void ConnectToMqttBrokers()
    {
        foreach (MqttConnectionSettingDto setting in _mqttConnectionSettings)
        {
            var mqttFactory = new MqttFactory();
            _mqttClient = mqttFactory.CreateMqttClient();

            var options = new MqttClientOptionsBuilder()
                .WithClientId(Guid.NewGuid().ToString())
                .WithTcpServer(setting.Host, setting.Port)
                .WithCredentials(setting.Username, setting.Password)
                .WithTls()
                .WithCleanSession()
                .Build();

            // DEFINE CALLBACKs to mqttClient events
            _mqttClient.ApplicationMessageReceivedAsync += e =>
            {
                Debug.WriteLine("Received application message: " + e.ClientId + " " + e.ResponseReasonString);
                return Task.CompletedTask;
            };

            //_mqttClient.ApplicationMessageReceivedAsync += delegate (MqttApplicationMessageReceivedEventArgs args)
            //{
            //    Debug.WriteLine("Received application message: " + args.ClientId);
            //    return Task.CompletedTask;
            //};

            _mqttClient.ConnectedAsync += e =>
            {
                Debug.WriteLine("The MQTT client is connected.");
                return Task.CompletedTask;
            };

            Task t = Task.Run(
                async () =>
                {
                    // User proper cancellation and no while(true).
                    while (true)
                    {
                        try
                        {
                            // This code will also do the very first connect! So no call to _ConnectAsync_ is required in the first place.
                            if (!await _mqttClient.TryPingAsync())
                            {
                                await _mqttClient.ConnectAsync(options, CancellationToken.None);
                                // Subscribe to topics when session is clean etc.

                                //iterate by all devices
                                var mqttSubscribeOptions = _mqttFactory.CreateSubscribeOptionsBuilder()
                                    .WithTopicFilter(f =>
                                    {
                                        f.WithTopic(setting.Topic);
                                    })
                                    .Build();

                                await _mqttClient.SubscribeAsync(mqttSubscribeOptions, CancellationToken.None);
                                Debug.WriteLine("MQTT client subscribed to topic.");

                            }
                        }
                        catch (Exception)
                        {
                            // Handle the exception properly (logging etc.).
                            throw;
                        }
                        finally
                        {
                            // Check the connection state every 5 seconds and perform a reconnect if required.
                            await Task.Delay(TimeSpan.FromSeconds(5));
                        }
                    }
                });

            _mqttTaskList.Add(setting.DeviceId, t);
            _mqttClientsList.Add(setting.DeviceId, _mqttClient);
        }
        
    }
}

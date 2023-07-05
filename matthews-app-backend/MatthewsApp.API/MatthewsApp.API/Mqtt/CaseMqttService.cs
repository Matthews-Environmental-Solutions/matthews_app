using MatthewsApp.API.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using MQTTnet;
using MQTTnet.Client;
using MQTTnet.Server;
using System;
using System.Diagnostics;
using System.Threading;
using System.Threading.Tasks;

namespace MatthewsApp.API.Mqtt;

public class CaseMqttService : IHostedService
{
    private IMqttClient _mqttClient;
    private MqttFactory _mqttFactory;
    private IConfiguration _configuration;
    private readonly ILogger<CaseMqttService> _logger;
    private CaseI4cHttpClientService _caseI4CHttpClientService;

    public CaseMqttService(ILogger<CaseMqttService> logger, IConfiguration configuration, CaseI4cHttpClientService caseI4CHttpClientService)
    {
        _logger = logger;
        _configuration = configuration;
        _mqttFactory = new MqttFactory();
        _caseI4CHttpClientService = caseI4CHttpClientService;
    }

    public async Task StartAsync(CancellationToken cancellationToken)
    {

        // 1. GET LIST OF ALL MATTHEWS DEVICES FROM ALL FACILITIES - It does not depends of user permissions.
        // HOW TO DO THIS?
        //string facilities = await _caseI4CHttpClientService.GetAllFacilities();
        string devices = await _caseI4CHttpClientService.GetAllDevicesAsync();

        // 2. MQTT
        var mqttFactory = new MqttFactory();
        _mqttClient = mqttFactory.CreateMqttClient();

        var options = new MqttClientOptionsBuilder()
            .WithClientId(Guid.NewGuid().ToString())
            .WithTcpServer(_configuration["mqttHostUrl"], Int32.Parse(_configuration["mqttHostPort"]))
            .WithCredentials(_configuration["mqttUser"], _configuration["mqttPsw"])
            .WithTls()
            .WithCleanSession()
            .Build();

        // DEFINE CALLBACKs to mqttClient events
        _mqttClient.ApplicationMessageReceivedAsync += e =>
        {
            Debug.WriteLine("Received application message.");
            return Task.CompletedTask;
        };

        _mqttClient.ConnectedAsync += e =>
        {
            Debug.WriteLine("The MQTT client is connected.");
            return Task.CompletedTask;
        };

        _ = Task.Run(
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
                                    f.WithTopic("9c558a71-ec7e-400c-babf-c4d3fba407a7");
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

    }

    public async Task StopAsync(CancellationToken cancellationToken)
    {
        var mqttClientDisconnectOptions = _mqttFactory.CreateClientDisconnectOptionsBuilder().Build();

        await _mqttClient.DisconnectAsync(mqttClientDisconnectOptions, CancellationToken.None);

        //return Task.CompletedTask;
        //throw new System.NotImplementedException();
    }
}

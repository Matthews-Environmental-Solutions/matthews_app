using System;

namespace MatthewsApp.API.Dtos;

public class MqttConnectionSettingDto {
    public Guid DeviceId { get; }
    public string Host { get; }
    public int Port { get; }
    public string Username { get; }
    public string Password { get; }
    public string Topic { get; }
    public bool Connected { get; set; }
    public string ClientId { get; set; }

    public MqttConnectionSettingDto(Guid deviceId, string host, int port, string username, string password, string topic)
    {
        DeviceId = deviceId;
        Host = host;
        Port = port;
        Username = username;
        Password = password;
        Topic = topic;
    }
}

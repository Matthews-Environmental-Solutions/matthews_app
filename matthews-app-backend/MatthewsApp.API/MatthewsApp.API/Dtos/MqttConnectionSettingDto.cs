using System;

namespace MatthewsApp.API.Dtos;

public record MqttConnectionSettingDto(
    Guid DeviceId,
    string Host,
    int Port,
    string Username,
    string Password,
    string Topic
    )
{
}

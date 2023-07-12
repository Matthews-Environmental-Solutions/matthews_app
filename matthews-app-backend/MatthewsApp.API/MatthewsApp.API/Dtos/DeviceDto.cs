using System;

namespace MatthewsApp.API.Dtos;

public record DeviceDto(
    Guid id,
    Guid? adapterId,
    bool? active
    )
{
}

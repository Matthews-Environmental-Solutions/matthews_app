using System;

namespace MatthewsApp.API.Dtos;

public record DeviceDto(
    Guid id,
    Guid siteId,
    Guid? adapterId,
    bool? active
    )
{
}

using System;

namespace MatthewsApp.API.Dtos;

public record DeviceDto(
    Guid id,
    Guid siteId,
    Guid? adapterId,
    bool? active,
    string alias
)
{
    public int DeviceTypeId { get; init; }   // so i dont have to change constructor
}


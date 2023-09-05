using System;

namespace MatthewsApp.API.Dtos;

public record FacilityDto(
    Guid id,
    string name,
    string icon
    )
{
}

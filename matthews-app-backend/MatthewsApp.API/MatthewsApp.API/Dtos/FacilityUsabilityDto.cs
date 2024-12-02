using System;

namespace MatthewsApp.API.Dtos;

public record FacilityUsabilityDto(Guid id, string name, string icon, bool isValid, string errorMessage)
{
}

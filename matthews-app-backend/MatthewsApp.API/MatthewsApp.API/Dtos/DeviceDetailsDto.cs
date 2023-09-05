using System;

namespace MatthewsApp.API.Dtos;

public record DeviceDetailsDto(
  Guid id,
  string configuration,
  bool active,
  bool visible
    )
{
}

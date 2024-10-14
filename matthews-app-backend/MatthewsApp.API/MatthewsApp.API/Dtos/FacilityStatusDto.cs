using Microsoft.EntityFrameworkCore.Metadata.Internal;
using System;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace MatthewsApp.API.Dtos;

public record FacilityStatusDto(
    Guid Id,
    Guid CreatedBy,
    DateTime CreatedTime,
    Guid? ModifiedBy,
    DateTime? ModifiedTime,
    Guid FacilityId,
    int StatusCode,
    string StatusName,
    string? StatusIcon,
    int Status
    )
{
}

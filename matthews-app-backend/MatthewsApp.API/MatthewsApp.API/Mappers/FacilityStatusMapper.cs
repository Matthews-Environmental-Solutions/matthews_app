using MatthewsApp.API.Dtos;
using MatthewsApp.API.Models;
using System.Collections.Generic;
using System.Linq;

namespace MatthewsApp.API.Mappers;

public static class FacilityStatusMapper
{
    public static FacilityStatusDto ToDTO(this FacilityStatus entity)
    {
        if (entity == default)
        {
            return default!;
        }

        return new FacilityStatusDto
        (
            entity.Id,
            entity.CreatedBy,
            entity.CreatedTime,
            entity.ModifiedBy,
            entity.ModifiedTime,
            entity.FacilityId,
            entity.StatusCode,
            entity.StatusName,
            entity.StatusIcon,
            entity.StartProcess
        );
    }

    public static FacilityStatus ToEntity(this FacilityStatusDto dto)
    {
        if (dto == default)
        {
            return default!;
        }

        return new FacilityStatus
        {
            Id = dto.Id,
            CreatedBy = dto.CreatedBy,
            CreatedTime = dto.CreatedTime,
            ModifiedBy = dto.ModifiedBy,
            ModifiedTime = dto.ModifiedTime,
            FacilityId = dto.FacilityId,
            StatusCode = dto.StatusCode,
            StatusName = dto.StatusName,
            StatusIcon = dto.StatusIcon,
            StartProcess = dto.StartProcess
        };
    }

    public static IEnumerable<FacilityStatusDto> ToDTOs(this IEnumerable<FacilityStatus> entities)
    {
        return entities.Select(e => e.ToDTO());
    }

    public static IEnumerable<FacilityStatus> ToEntities(this IEnumerable<FacilityStatusDto> dtos)
    {
        return dtos.Select(e => e.ToEntity());
    }
}

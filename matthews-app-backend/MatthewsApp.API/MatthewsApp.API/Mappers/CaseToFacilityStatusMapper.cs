using MatthewsApp.API.Dtos;
using MatthewsApp.API.Models;
using System.Collections.Generic;
using System.Linq;

namespace MatthewsApp.API.Mappers;

public static class CaseToFacilityStatusMapper
{
    public static CaseToFacilityStatusDto ToDTO(this CaseToFacilityStatus entity)
    {
        if (entity == default)
        {
            return default!;
        }

        return new CaseToFacilityStatusDto
        (
            entity.CaseId,
            entity.FacilityStatusId,
            entity.IsDone,
            entity.CreatedBy,
            entity.CreatedTime,
            entity.ModifiedBy,
            entity.ModifiedTime
        );
    }

    public static CaseToFacilityStatus ToEntity(this CaseToFacilityStatusDto dto)
    {
        if (dto == default)
        {
            return default!;
        }

        return new CaseToFacilityStatus
        {
            CaseId = dto.CaseId,
            FacilityStatusId = dto.FacilityStatusId,
            IsDone = dto.IsDone,
            CreatedBy = dto.CreatedBy,
            CreatedTime = dto.CreatedTime,
            ModifiedBy = dto.ModifiedBy,
            ModifiedTime = dto.ModifiedTime
        };
    }

    public static IEnumerable<CaseToFacilityStatusDto> ToDTOs(this IEnumerable<CaseToFacilityStatus> entities)
    {
        return entities.Select(e => e.ToDTO());
    }

    public static IList<CaseToFacilityStatus> ToEntities(this IEnumerable<CaseToFacilityStatusDto> dtos)
    {
        return dtos.Select(e => e.ToEntity()).ToList();
    }
}

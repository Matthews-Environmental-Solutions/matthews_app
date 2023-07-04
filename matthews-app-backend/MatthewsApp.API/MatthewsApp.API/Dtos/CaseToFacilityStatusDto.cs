using System;

namespace MatthewsApp.API.Dtos;

public record CaseToFacilityStatusDto(
    Guid CaseId,
    Guid FacilityStatusId,
    bool IsDone,
    Guid CreatedBy,
    DateTime CreatedTime,
    Guid? ModifiedBy,
    DateTime? ModifiedTime
    )
{
}

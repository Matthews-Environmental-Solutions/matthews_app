using MatthewsApp.API.Enums;
using System.Collections.Generic;
using System;

namespace MatthewsApp.API.Dtos;

public record CaseWithStatusesDto(
    Guid? ActualDevice, // Guid
    string ActualDeviceAlias,
    DateTime? ActualEndTime, // DateTime
    Guid? ActualFacility, // Guid
    DateTime? ActualStartTime, // DateTime
    int Age,    // int
    string ClientCaseId,
    string ClientId,
    ContainerSize ContainerSize, // ContainerSize
    ContainerType ContainerType, // ContainerType
    Guid CreatedBy, // Guid
    DateTime CreatedTime, // DateTime
    string Electricity,
    string FirstName,
    string Fuel,
    GenderType Gender, // GenderType
    Guid Id, // Guid
    bool IsObsolete, // bool
    string LastName,
    Guid? ModifiedBy, // Guid
    DateTime? ModifiedTime, // DateTime
    Guid? PerformedBy, // Guid
    Guid? ScheduledDevice, // Guid
    string ScheduledDeviceAlias,
    Guid? ScheduledFacility, // Guid
    DateTime? ScheduledStartTime, // DateTime
    CaseStatus Status,
    double Weight, // double
    IEnumerable<CaseToFacilityStatusDto> CaseToFacilityStatuses
    ) 
{
}

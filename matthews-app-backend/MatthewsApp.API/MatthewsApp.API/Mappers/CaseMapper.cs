using MatthewsApp.API.Dtos;
using System.Collections.Generic;
using System.Linq;
using MatthewsApp.API.Models;
using System;
using Microsoft.AspNetCore.Http;

namespace MatthewsApp.API.Mappers;

public static class CaseMapper
{
    public static CaseDto ToDTO(this Case entity)
    {
        if (entity == default)
        {
            return default!;
        }

        return new CaseDto
        (
            entity.ActualDevice,
            entity.ActualDeviceAlias,
            entity.ActualEndTime,
            entity.ActualFacility,
            entity.ActualStartTime,
            entity.Age,
            entity.ClientCaseId,
            entity.ClientId,
            entity.ContainerSize,
            entity.ContainerType,
            entity.CreatedBy,
            entity.CreatedTime,
            entity.Electricity,
            entity.FirstName,
            entity.Fuel,
            entity.Gender,
            entity.Id,
            entity.IsObsolete,
            entity.LastName,
            entity.ModifiedBy,
            entity.ModifiedTime,
            entity.PerformedBy,
            entity.ScheduledDevice,
            entity.ScheduledDeviceAlias,
            entity.ScheduledFacility,
            entity.ScheduledStartTime,
            entity.Status,
            entity.Weight,
            entity.FacilityStatusId
        );
    }

    public static Case ToEntity(this CaseDto dto)
    {
        if (dto == default)
        {
            return default!;
        }

        return new Case
        {
            ActualDevice = dto.ActualDevice,
            ActualDeviceAlias = dto.ActualDeviceAlias,
            ActualEndTime = dto.ActualEndTime,
            ActualFacility = dto.ActualFacility,
            ActualStartTime = dto.ActualStartTime,
            Age = dto.Age,
            ClientCaseId = dto.ClientCaseId,
            ClientId = dto.ClientId,
            ContainerSize = dto.ContainerSize,
            ContainerType = dto.ContainerType,
            CreatedBy = dto.CreatedBy,
            CreatedTime = dto.CreatedTime,
            Electricity = dto.Electricity,
            FirstName = dto.FirstName,
            Fuel = dto.Fuel,
            Gender = dto.Gender,
            Id = dto.Id,
            IsObsolete = dto.IsObsolete,
            LastName = dto.LastName,
            ModifiedBy = dto.ModifiedBy,
            ModifiedTime = dto.ModifiedTime,
            PerformedBy = dto.PerformedBy,
            ScheduledDevice = dto.ScheduledDevice,
            ScheduledDeviceAlias = dto.ScheduledDeviceAlias,
            ScheduledFacility = dto.ScheduledFacility,
            ScheduledStartTime = dto.ScheduledStartTime is null ? DateTime.MinValue : dto.ScheduledStartTime,
            Status = dto.Status,
            Weight = dto.Weight,
            FacilityStatusId = dto.FacilityStatusId
        };
    }

    public static Case20Dto ToCase20Dto(this Case entity)
    {
        if (entity == default)
        {
            return default!;
        }

        return new Case20Dto
        (
            entity.Id,
            entity.ClientCaseId,
            entity.FirstName,
            entity.LastName,
            ((int) entity.ContainerSize).ToString(),
            entity.Weight.ToString(),
            ((int) entity.ContainerType).ToString(),
            ((int) entity.Gender).ToString(),
            entity.Age.ToString(),
            "1"
        );
    }

    public static IEnumerable<CaseDto> ToDTOs(this IEnumerable<Case> entities)
    {
        return entities.Select(e => e.ToDTO());
    }

    public static IEnumerable<Case> ToEntities(this IEnumerable<CaseDto> dtos) 
    { 
        return dtos.Select(e => e.ToEntity());
    }

    public static IEnumerable<Case20Dto> ToCase20DTOs(this IEnumerable<Case> entities)
    {
        return entities.Select(e => e.ToCase20Dto());
    }
}

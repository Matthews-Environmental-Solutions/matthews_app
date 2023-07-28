using IdentityModel;
using MatthewsApp.API.Dtos;
using MatthewsApp.API.Enums;
using MatthewsApp.API.Mappers;
using MatthewsApp.API.Models;
using MatthewsApp.API.Mqtt;
using MatthewsApp.API.PrismEvents;
using MatthewsApp.API.Repository.Interfaces;
using Microsoft.EntityFrameworkCore;
using Prism.Events;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MatthewsApp.API.Services;

public interface ICasesService
{
    void Create(Case caseEntity);
    void Delete(Case caseEntity);
    void Update(Case caseEntity);
    Task<IEnumerable<Case>> GetAll();
    Task<Case> GetById(Guid id);
    bool IsCaseExists(Guid id);
    Task<IEnumerable<Case>> GetUnscheduledCases();
    Task<IEnumerable<Case>> GetScheduledCasesByDay(Guid facilityId, DateTime date);
    Task<IEnumerable<Case>> GetScheduledCasesByWeek(Guid facilityId, DateTime dateStartDateOfWeek);
    Task<IEnumerable<Case>> GetAllCasesByFacility(Guid facilityId);
    Task<IEnumerable<Case>> GetScheduledCasesByTimePeriod(Guid facilityId, DateTime dateStart, DateTime dateEnd);
    void UpdateCaseWhenCaseStart(StartCaseDto dto);
    void UpdateCaseWhenCaseEnd(EndCaseDto dto);
}

public class CasesService : ICasesService
{
    private readonly ICaseRepository _caseRepository;
    private IEventAggregator _ea;

    public CasesService(ICaseRepository repository, IEventAggregator ea)
    {
        _caseRepository = repository;
        _ea = ea;
    }

    public void Create(Case entity)
    {
        _caseRepository.Create(entity);

        // Send event
        SendEventToHostedService(entity);
    }

    public void Delete(Case entity)
    {
        _caseRepository.Delete(entity.Id);

        // Send event
        SendEventToHostedService(entity);
    }

    public void Update(Case entity)
    {
        _caseRepository.Update(entity);

        // Send event
        SendEventToHostedService(entity);
    }

    public async void UpdateCaseWhenCaseStart(StartCaseDto dto)
    {
        Case entity = _caseRepository.GetById(dto.LOADED_ID);
        entity.ActualStartTime = dto.StartTime;
        entity.Status = CaseStatus.IN_PROGRESS;
        Update(entity);
    }

    public async void UpdateCaseWhenCaseEnd(EndCaseDto dto)
    {
        Case entity = _caseRepository.GetById(dto.COMPLETED_ID);
        entity.ActualEndTime = dto.EndTime;
        entity.Status = CaseStatus.CREMATION_COMPLETE;
        Update(entity);
    }

    public async Task<IEnumerable<Case>> GetAll()
    {
        try
        {
            IEnumerable<Case> cases = await _caseRepository.GetAll();
            return cases.Select(i => {
                i.ScheduledStartTime = DateTime.SpecifyKind(i.ScheduledStartTime is null ? DateTime.MinValue : i.ScheduledStartTime.Value, DateTimeKind.Utc);
                return i;
            });
        } catch (Exception ex)
        {
            throw new Exception(ex.Message);
        }
        
    }

    public async Task<IEnumerable<Case>> GetUnscheduledCases()
    {
        IEnumerable<Case> cases = await _caseRepository.GetAllUnscheduled();
        return cases.Select(i => {
            i.ScheduledStartTime = DateTime.SpecifyKind(i.ScheduledStartTime is null ? DateTime.MinValue : i.ScheduledStartTime.Value, DateTimeKind.Utc);
            return i;
        });
    }

    public async Task<IEnumerable<Case>> GetScheduledCasesByDay(Guid facilityId, DateTime date)
    {
        try
        {
            IEnumerable<Case> cases = await _caseRepository.GetScheduledCasesByDay(facilityId, date);
            return cases.Select(i => {
                i.ScheduledStartTime = DateTime.SpecifyKind(i.ScheduledStartTime is null ? DateTime.MinValue : i.ScheduledStartTime.Value, DateTimeKind.Utc);
                return i;
            });
        }
        catch (Exception ex)
        {
            throw new Exception(ex.Message);
        }
    }

    public async Task<IEnumerable<Case>> GetScheduledCasesByWeek(Guid facilityId, DateTime dateStartDateOfWeek)
    {
        try
        {
            IEnumerable<Case> cases = await _caseRepository.GetScheduledCasesByWeek(facilityId, dateStartDateOfWeek);
            return cases.Select(i => {
                i.ScheduledStartTime = DateTime.SpecifyKind(i.ScheduledStartTime is null ? DateTime.MinValue : i.ScheduledStartTime.Value, DateTimeKind.Utc);
                return i;
            });
        }
        catch (Exception ex)
        {
            throw new Exception(ex.Message);
        }
    }

    public async Task<IEnumerable<Case>> GetScheduledCasesByTimePeriod(Guid facilityId, DateTime dateStart, DateTime dateEnd)
    {
        try
        {
            IEnumerable<Case> cases = await _caseRepository.GetScheduledCasesByTimePeriod(facilityId, dateStart, dateEnd);
            return cases.Select(i => {
                i.ScheduledStartTime = DateTime.SpecifyKind(i.ScheduledStartTime is null ? DateTime.MinValue : i.ScheduledStartTime.Value, DateTimeKind.Utc);
                return i;
            });
        }
        catch (Exception ex)
        {
            throw new Exception(ex.Message);
        }
    }

    public async Task<IEnumerable<Case>> GetAllCasesByFacility(Guid facilityId)
    {
        try
        {
            IEnumerable<Case> cases = await _caseRepository.GetCasesByFacility(facilityId);
            return cases.Select(i => {
                i.ScheduledStartTime = DateTime.SpecifyKind(i.ScheduledStartTime is null ? DateTime.MinValue : i.ScheduledStartTime.Value, DateTimeKind.Utc);
                return i;
            });
        }
        catch (Exception ex)
        {
            throw new Exception(ex.Message);
        }
    }

    public async Task<Case> GetById(Guid id)
    {
        try
        {
            Case Case = await _caseRepository.GetOne(id);
            Case.ScheduledStartTime = DateTime.SpecifyKind(Case.ScheduledStartTime is null ? DateTime.MinValue : Case.ScheduledStartTime.Value, DateTimeKind.Utc);
            return Case;
        }
        catch (Exception ex)
        {
            throw ex;
        }
    }

    public bool IsCaseExists(Guid id)
    {
        return _caseRepository.GetAll().Result.Any(e => e.Id == id);
    }

    private void SendEventToHostedService(Case entity)
    {
        // Send event
        if (entity.ScheduledDevice is not null && entity.ScheduledDevice != Guid.Empty)
        {
            Guid deviceIdGuid = entity.ScheduledDevice ?? Guid.Empty;
            _ea.GetEvent<EventCaseAnyChange>().Publish(deviceIdGuid);
        }
    }
    
}

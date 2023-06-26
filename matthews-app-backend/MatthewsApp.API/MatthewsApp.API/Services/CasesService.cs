using MatthewsApp.API.Dtos;
using MatthewsApp.API.Mappers;
using MatthewsApp.API.Models;
using MatthewsApp.API.Repository.Interfaces;
using Microsoft.EntityFrameworkCore;
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
    void UpdateWithStatuses(CaseWithStatusesDto caseDto);
    Task<IEnumerable<Case>> GetAll();
    Task<Case> GetById(Guid id);
    bool IsCaseExists(Guid id);
    Task<IEnumerable<Case>> GetUnscheduledCases();
    Task<IEnumerable<Case>> GetScheduledCasesByDay(Guid facilityId, DateTime date);
    Task<IEnumerable<Case>> GetScheduledCasesByWeek(Guid facilityId, DateTime dateStartDateOfWeek);
}

public class CasesService : ICasesService
{
    private readonly ICaseRepository _caseRepository;
    private readonly ICaseToFacilityStatusRepository _caseToFacilityStatusRepository;


    public CasesService(ICaseRepository repository, ICaseToFacilityStatusRepository caseToFacilityStatusRepository)
    {
        _caseRepository = repository;
        _caseToFacilityStatusRepository = caseToFacilityStatusRepository;
    }

    public void Create(Case entity)
    {
        _caseRepository.Create(entity);
    }

    public void Delete(Case entity)
    {
        _caseRepository.Delete(entity.Id);
    }

    public void Update(Case entity)
    {
        _caseRepository.Update(entity);
    }

    public void UpdateWithStatuses(CaseWithStatusesDto dto)
    {
        _caseRepository.UpdateWithStatuses(dto);
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
            
}

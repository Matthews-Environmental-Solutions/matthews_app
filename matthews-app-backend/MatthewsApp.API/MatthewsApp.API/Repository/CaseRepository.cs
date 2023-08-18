using Humanizer;
using MatthewsApp.API.Dtos;
using MatthewsApp.API.Enums;
using MatthewsApp.API.Extensions;
using MatthewsApp.API.Mappers;
using MatthewsApp.API.Models;
using MatthewsApp.API.Repository.Interfaces;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;

namespace MatthewsApp.API.Repository;

public class CaseRepository : BaseRepository<Case, Guid>, ICaseRepository
{

    public CaseRepository(IMatthewsAppDBContext context) : base(context) 
    {
    }

    public Case GetById (Guid id)
    {
        return _dataContext.Cases
            .AsNoTracking()
            .FirstOrDefault(c => c.Id == id);
    }

    public override void Delete(Guid id)
    {
        var entity = _dataContext.Context.Set<Case>().Find((id));
        if (entity is null)
        {
            throw new Exception("Entity not found for deletion");
        }
        entity.IsObsolete = true;
        entity.ModifiedTime = DateTime.Now;
        _dataContext.Context.Entry(entity).State = EntityState.Modified;
        _dataContext.Context.SaveChanges();
    }

    public override async Task<Case> GetOne(Guid id)
    {
        return await _dataContext.Cases
            //.AsNoTracking()
            .FirstAsync(c => c.Id == id);
    }

    public async Task<Case> GetNextCaseForDevice(Guid deviceId)
    {
        IEnumerable<Case> cases = await _dataContext.Cases.ToArrayAsync();
        return cases.Where(c => 
                c.ScheduledDevice.Equals(deviceId)
                && c.Status == CaseStatus.READY_TO_CREMATE
                && c.IsObsolete == false
            )
            .OrderBy(c => c.ScheduledStartTime)
            .ToList()
            .First();
    }

    //ToDo: Ovo treba ukloniti.
    public override async Task<IEnumerable<Case>> GetAll()
    {
        IEnumerable<Case> cases = await _dataContext.Cases.ToArrayAsync();
        return cases.Where(c => c.ScheduledStartTime > DateTime.MinValue.AddDays(100) &&c.IsObsolete == false);
    }

    public async Task<IEnumerable<Case>> GetAllUnscheduled()
    {
        IEnumerable<Case> cases = await _dataContext.Cases.ToArrayAsync();

        return cases.Where(c => 
             (
                c.ScheduledStartTime < DateTime.MinValue.AddDays(100) 
                || c.Status == CaseStatus.UNSCHEDULED
                || c.ScheduledFacility == Guid.Empty
                || c.ScheduledDevice == Guid.Empty
             )

            && c.IsObsolete == false
            )
            .ToList();
    }

    public async Task<IEnumerable<Case>> GetScheduledCasesByDay(Guid facilityId, DateTime date)
    {
        DateTime dateEnd = date.AddDays(1);
        IEnumerable<Case> cases = await _dataContext.Cases.ToArrayAsync();
        return cases.Where(c => 
            c.IsObsolete == false
            && c.ScheduledFacility.Equals(facilityId)
            && !c.ScheduledDevice.Equals(Guid.Empty)
            && c.ScheduledStartTime.Value >= date
            && c.ScheduledStartTime.Value < dateEnd
            ).ToList();
    }

    public async Task<IEnumerable<Case>> GetScheduledCasesByWeek(Guid facilityId, DateTime dateStartDateOfWeek)
    {
        DateTime dateEnd = dateStartDateOfWeek.AddDays(7);
        IEnumerable<Case> cases = await _dataContext.Cases.ToArrayAsync();
        return cases.Where(c =>
            c.IsObsolete == false
            && c.ScheduledFacility.Equals(facilityId)
            && !c.ScheduledDevice.Equals(Guid.Empty)
            && c.ScheduledStartTime.Value >= dateStartDateOfWeek
            && c.ScheduledStartTime.Value < dateEnd
            ).ToList();
    }

    public async Task<IEnumerable<Case>> GetFirst20ScheduledCases(Guid scheduledDeviceId)
    {
        IEnumerable<Case> cases = await _dataContext.Cases.ToArrayAsync();
        return cases.Where(c =>
            c.IsObsolete == false
            && c.ScheduledStartTime > DateTime.MinValue.AddDays(100)
            && !c.ScheduledFacility.Equals(Guid.Empty)
            && c.ScheduledDevice.Equals(scheduledDeviceId)
            && c.Status == CaseStatus.READY_TO_CREMATE
            ).ToList().OrderBy(c => c.ScheduledStartTime).Take(20);
    }

    public async Task<IEnumerable<Case>> GetScheduledCasesByTimePeriod(Guid facilityId, DateTime dateStart, DateTime dateEnd)
    {
        IEnumerable<Case> cases = await _dataContext.Cases.ToArrayAsync();
        return cases.Where(c =>
            c.IsObsolete == false
            && c.ScheduledFacility.Equals(facilityId)
            && !c.ScheduledDevice.Equals(Guid.Empty)
            && c.ScheduledStartTime.Value >= dateStart
            && c.ScheduledStartTime.Value < dateEnd
            ).ToList();
    }


    public async Task<IEnumerable<Case>> GetCasesByFacility(Guid facilityId)
    {
        IEnumerable<Case> cases = await _dataContext.Cases.ToArrayAsync();
        return cases.Where(c =>
            c.IsObsolete == false
            && c.ScheduledFacility.Equals(facilityId)
            && (c.Status == CaseStatus.WAITING_FOR_PERMIT || c.Status == CaseStatus.UNSCHEDULED || c.Status == CaseStatus.READY_TO_CREMATE)
            ).ToList();
    }

    public async Task<IEnumerable<Case>> GetReadyCasesByDevice(Guid deviceId)
    {
        IEnumerable<Case> cases = await _dataContext.Cases.ToArrayAsync();
        return cases.Where(c =>
            c.IsObsolete == false
            && c.ScheduledDevice.Equals(deviceId)
            && c.Status == CaseStatus.READY_TO_CREMATE
            ).ToList();
    }
}

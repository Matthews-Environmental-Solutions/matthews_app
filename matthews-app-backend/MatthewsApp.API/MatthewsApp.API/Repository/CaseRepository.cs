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
            .Include(c => c.CaseToFacilityStatuses)
            //.AsNoTracking()
            .FirstAsync(c => c.Id == id);
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
        IEnumerable<Case> cases = await _dataContext.Cases.ToArrayAsync();
        return cases.Where(c => 
            c.IsObsolete == false
            && c.ScheduledFacility.Equals(facilityId)
            && !c.ScheduledDevice.Equals(Guid.Empty)
            && c.ScheduledStartTime.Value.Day.Equals(date.Day)
            && c.ScheduledStartTime.Value.Month.Equals(date.Month)
            && c.ScheduledStartTime.Value.Year.Equals(date.Year)
            ).ToList();
    }

    public async Task<IEnumerable<Case>> GetScheduledCasesByWeek(Guid facilityId, DateTime dateStartDateOfWeek)
    {
        DateTime dateEnd = dateStartDateOfWeek.AddDays(7);
        IEnumerable<Case> cases = await _dataContext.Cases.ToArrayAsync();
        return cases.Where(c =>
            c.IsObsolete == false
            && c.ScheduledFacility.Equals(facilityId)
            && c.ScheduledStartTime.Value.Date >= dateStartDateOfWeek.Date
            && c.ScheduledStartTime.Value.Date < dateEnd.Date
            ).ToList();
    }

    public async Task UpdateWithStatuses(CaseWithStatusesDto dto)
    {
        DbContext? context = _dataContext.Context;
        var transaction = context.Database.BeginTransaction();
        try
        {

            var entity = _dataContext.Cases.Include(c => c.CaseToFacilityStatuses).First(c => c.Id == dto.Id);

            entity = entity.UpdateFieldsFromDto(dto);
            entity.ModifiedTime = DateTime.Now;

            // Remove unchecked statuses
            for (int i = entity.CaseToFacilityStatuses.Count - 1; i >= 0; i--)
            {
                var statusFromEntity = entity.CaseToFacilityStatuses[i];
                var statusFromDto = dto.CaseToFacilityStatuses.FirstOrDefault(fs => fs.CaseId == statusFromEntity.CaseId && fs.FacilityStatusId == statusFromEntity.FacilityStatusId);
                if (statusFromDto.IsDone == false)
                {
                    entity.CaseToFacilityStatuses.RemoveAt(i);
                }
            }

            // Add checked (new) statuses
            foreach(var status in dto.CaseToFacilityStatuses)
            {
                bool founded = entity.CaseToFacilityStatuses.Any(fs => fs.CaseId == status.CaseId && fs.FacilityStatusId == status.FacilityStatusId);
                if (status.IsDone && !founded)
                {
                    entity.CaseToFacilityStatuses.Add(status.ToEntity());
                }
            }

            context.Set<Case>().Attach(entity);
            context.Entry(entity).State = EntityState.Modified;
            context.SaveChanges();
            transaction.Commit();
        }
        catch (Exception ex)
        {
            transaction.Rollback();
            throw;
        }
    }

    public async Task<IEnumerable<Case>> GetCasesByFacility(Guid facilityId)
    {
        IEnumerable<Case> cases = await _dataContext.Cases.ToArrayAsync();
        return cases.Where(c =>
            c.IsObsolete == false
            && c.ScheduledFacility.Equals(facilityId)
            ).ToList();
    }
}

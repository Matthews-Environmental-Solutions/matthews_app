using MatthewsApp.API.Models;
using MatthewsApp.API.Repository.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
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

    //ToDo: Ovo treba ukloniti.
    public override async Task<IEnumerable<Case>> GetAll()
    {
        IEnumerable<Case> cases = await _dataContext.Cases.ToArrayAsync();
        return cases.Where(c => c.ScheduledStartTime > DateTime.MinValue.AddDays(100) &&c.IsObsolete == false);
    }

    public async Task<IEnumerable<Case>> GetAllUnscheduled()
    {
        IEnumerable<Case> cases = await _dataContext.Cases.ToArrayAsync();

        return cases.Where(c => c.ScheduledStartTime < DateTime.MinValue.AddDays(100) && c.IsObsolete == false).ToList();
    }

    public async Task<IEnumerable<Case>> GetScheduledCasesByDay(Guid facilityId, DateTime date)
    {
        IEnumerable<Case> cases = await _dataContext.Cases.ToArrayAsync();
        return cases.Where(c => 
            c.IsObsolete == false
            && c.ScheduledFacility.Equals(facilityId)
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

    //public async Task<Case> GetOne(Guid id)
    //{
    //    return await context.Cases.FindAsync(id);
    //}

    //public void Update(Case entity)
    //{
    //    var transaction = context.Database.BeginTransaction();
    //    try
    //    {
    //        context.Entry(entity).State = EntityState.Modified;
    //        context.SaveChanges();
    //        transaction.Commit();
    //    }
    //    catch (Exception)
    //    {
    //        transaction.Rollback();
    //        throw;
    //    }
    //}

    
}

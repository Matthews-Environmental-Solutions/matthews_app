using MatthewsApp.API.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MatthewsApp.API.Repository
{
    public class CaseRepository : ICaseRepository
    {
        protected readonly MatthewsAppDBContext context;

        public CaseRepository(MatthewsAppDBContext context)
        {
            this.context = context;
        }

        public void Create(Case entity)
        {
            var transaction = context.Database.BeginTransaction();
            try
            {
                this.context.Cases.Add(entity);
                this.context.SaveChanges();
                transaction.Commit();
            }
            catch (Exception)
            {
                transaction.Rollback();
                throw;
            }
        }

        public void Delete(Case entity)
        {
            entity.IsObsolete = true;
            context.Entry(entity).State = EntityState.Modified;
            context.SaveChanges();
        }

        public async Task<IEnumerable<Case>> GetAll()
        {
            IEnumerable<Case> cases = await context.Cases.ToArrayAsync();
            return cases.Where(c => c.ScheduledStartTime > DateTime.MinValue.AddDays(100) &&c.IsObsolete == false);
        }

        public async Task<IEnumerable<Case>> GetAllUnscheduled()
        {
            IEnumerable<Case> cases = await context.Cases.ToArrayAsync();

            return cases.Where(c => c.ScheduledStartTime < DateTime.MinValue.AddDays(100) && c.IsObsolete == false).ToList();
        }

        public async Task<IEnumerable<Case>> GetScheduledCasesByDay(Guid facilityId, DateTime date)
        {
            IEnumerable<Case> cases = await context.Cases.ToArrayAsync();
            return cases.Where(c => 
                c.IsObsolete == false
                && c.FacilityId.Equals(facilityId)
                && c.ScheduledStartTime.Day.Equals(date.Day)
                && c.ScheduledStartTime.Month.Equals(date.Month)
                && c.ScheduledStartTime.Year.Equals(date.Year)
                ).ToList();
        }

        public async Task<IEnumerable<Case>> GetScheduledCasesByWeek(Guid facilityId, DateTime dateStartDateOfWeek)
        {
            DateTime dateEnd = dateStartDateOfWeek.AddDays(7);
            IEnumerable<Case> cases = await context.Cases.ToArrayAsync();
            return cases.Where(c =>
                c.IsObsolete == false
                && c.FacilityId.Equals(facilityId)
                && c.ScheduledStartTime.Date >= dateStartDateOfWeek.Date
                && c.ScheduledStartTime.Date < dateEnd.Date
                ).ToList();
        }

        public async Task<Case> GetOne(Guid id)
        {
            return await context.Cases.FindAsync(id);
        }

        public void Update(Case entity)
        {
            var transaction = context.Database.BeginTransaction();
            try
            {
                context.Entry(entity).State = EntityState.Modified;
                context.SaveChanges();
                transaction.Commit();
            }
            catch (Exception)
            {
                transaction.Rollback();
                throw;
            }
        }

        
    }
}

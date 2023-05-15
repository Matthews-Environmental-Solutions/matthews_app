using MatthewsApp.API.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MatthewsApp.API.Repository
{
    public class CaseRepository : IRepository<Case>
    {
        protected readonly MatthewsAppDBContext context;

        public CaseRepository(MatthewsAppDBContext context)
        {
            this.context = context;
        }

        public void Create(Case entity)
        {
            this.context.Cases.Add(entity);
            this.context.SaveChanges();
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

        public async Task<Case> GetOne(Guid id)
        {
            return await context.Cases.FindAsync(id);
        }

        public void Update(Case entity)
        {
            context.Entry(entity).State = EntityState.Modified;
            context.SaveChanges();
        }
    }
}

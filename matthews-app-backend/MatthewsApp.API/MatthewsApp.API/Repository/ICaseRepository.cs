using MatthewsApp.API.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MatthewsApp.API.Repository
{
    public interface ICaseRepository : IRepository<Case>
    {
        Task<IEnumerable<Case>> GetAllUnscheduled();
        Task<IEnumerable<Case>> GetScheduledCasesByDay(Guid facilityId, DateTime date);
    }
}

using MatthewsApp.API.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MatthewsApp.API.Repository.Interfaces
{
    public interface IFacilityStatusRepository : IBaseRepository<FacilityStatus, Guid>
    {
        Task<IEnumerable<FacilityStatus>> GetAllByFacility(Guid id);
    }
}

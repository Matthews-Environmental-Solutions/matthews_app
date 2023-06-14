using MatthewsApp.API.Models;
using MatthewsApp.API.Repository.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MatthewsApp.API.Repository
{
    public class FacilityStatusRepository : BaseRepository<FacilityStatus, Guid>, IFacilityStatusRepository
    {

        public FacilityStatusRepository(IMatthewsAppDBContext context) : base(context)
        {
        }

        public async Task<IEnumerable<FacilityStatus>> GetAllByFacility(Guid id)
        {
            return (await _dataContext.FacilityStatuses.ToArrayAsync())
                .Where(f => f.FacilityId == id);
        }
    }
}

using MatthewsApp.API.Enums;
using MatthewsApp.API.Models;
using MatthewsApp.API.Repository.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MatthewsApp.API.Repository;

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

    public async override Task<FacilityStatus> GetOne(Guid id)
    {
        return await _dataContext.Context.Set<FacilityStatus>().FirstOrDefaultAsync(f => f.Id == id);
    }

    public FacilityStatus GetReadyToCremateFacilityStatus(Guid facilityId)
    {
        return _dataContext.FacilityStatuses.FirstOrDefault(f => f.FacilityId == facilityId && f.Status == CaseStatus.READY_TO_CREMATE);
    }

    public FacilityStatus GetCycleCompleteFacilityStatus(Guid facilityId)
    {
        return _dataContext.FacilityStatuses.FirstOrDefault(f => f.FacilityId == facilityId && f.Status == CaseStatus.CYCLE_COMPLETE);
    }

    public FacilityStatus GetInProgressFacilityStatus(Guid facilityId)
    {
        return _dataContext.FacilityStatuses.FirstOrDefault(f => f.FacilityId == facilityId && f.Status == CaseStatus.IN_PROGRESS);
    }

    public FacilityStatus GetCremationCompleteFacilityStatus(Guid facilityId)
    {
        return _dataContext.FacilityStatuses.FirstOrDefault(f => f.FacilityId == facilityId && f.Status == CaseStatus.CREMATION_COMPLETE);
    }

    public FacilityStatus GetFirstAwaitingPermissionFacilityStatus(Guid facilityId)
    {
        return _dataContext.FacilityStatuses.FirstOrDefault(f => f.FacilityId == facilityId && f.Status == CaseStatus.WAITING_FOR_PERMIT);
    }

    public FacilityStatus GetTrackedEntity(Guid facilityId)
    {
        return _dataContext.FacilityStatuses.Local.FirstOrDefault(e => e.Id == facilityId);
    }

    public void Detach(FacilityStatus entity)
    {
        _dataContext.FacilityStatuses.Entry(entity).State = EntityState.Detached;
    }
}

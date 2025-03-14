using MatthewsApp.API.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MatthewsApp.API.Repository.Interfaces;

public interface IFacilityStatusRepository : IBaseRepository<FacilityStatus, Guid>
{
    void Detach(FacilityStatus entity);
    Task<IEnumerable<FacilityStatus>> GetAllByFacility(Guid id);
    FacilityStatus GetCremationCompleteFacilityStatus(Guid facilityId);
    FacilityStatus GetCycleCompleteFacilityStatus(Guid facilityId);
    FacilityStatus GetFirstAwaitingPermissionFacilityStatus(Guid demoFacilityId);
    FacilityStatus GetInProgressFacilityStatus(Guid facilityId);
    FacilityStatus GetReadyToCremateFacilityStatus(Guid facilityId);
    FacilityStatus GetTrackedEntity(Guid facilityId);
}

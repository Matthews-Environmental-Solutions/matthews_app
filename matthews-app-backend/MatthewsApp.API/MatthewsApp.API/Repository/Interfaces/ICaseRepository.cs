using MatthewsApp.API.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MatthewsApp.API.Repository.Interfaces;

public interface ICaseRepository : IBaseRepository<Case, Guid>
{
    Task CleanDbForDemo(Guid deviceId);
    void Detach(Case entity);
    Task<IEnumerable<Case>> GetAllUnscheduled();
    Case GetById(Guid id);
    Task<IEnumerable<Case>> GetCaseInProgressOrCycleCompleteByDevice(Guid deviceId);
    Task<IEnumerable<Case>> GetFirst20ScheduledCases(Guid scheduledDeviceId);
    Task<Case> GetNextCaseForDevice(Guid deviceId);
    Task<IEnumerable<Case>> GetReadyCasesByDevice(Guid deviceId);
    Task<IEnumerable<Case>> GetScheduledCasesByDay(Guid facilityId, DateTime date);
    Task<IEnumerable<Case>> GetScheduledCasesByTimePeriod(Guid facilityId, DateTime dateStart, DateTime dateEnd);
    Task<IEnumerable<Case>> GetScheduledCasesByWeek(Guid facilityId, DateTime dateStartDateOfWeek);
    Task<Case> GetSelectCaseByDevice(Guid deviceId);
    Task<IEnumerable<Case>> GetSelectedCasesByDevice(Guid deviceId);
    Task<IEnumerable<Case>> GetSelectedCasesReadyToCremateByDevice(Guid deviceId);
    Case GetTrackedEntity(Guid id);
    Task SeedDbForDemo(Guid deviceId, string scheduledDeviceAlias);
}

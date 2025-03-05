using MatthewsApp.API.Dtos;
using MatthewsApp.API.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MatthewsApp.API.Repository.Interfaces;

public interface ICaseRepository : IBaseRepository<Case, Guid>
{
    Task<bool> CheckIfDeviceHasCaseInProgress(Guid deviceId);
    Task<bool> CheckIfDeviceHasCaseSelected(Guid deviceId);
    Task<bool> CheckIfDeviceIsEmpty(Guid deviceId);
    Task CleanDbForDemo(Guid deviceId);
    void Detach(Case entity);
    Task<IEnumerable<Case>> GetAllUnscheduled();
    Case GetById(Guid id);
    Task<Case> GetByIdAsync(Guid id);
    Task<IEnumerable<Case>> GetCasesByFacility(Guid facilityId);
    Task<IEnumerable<Case>> GetFirst20ScheduledCases(Guid scheduledDeviceId);
    Task<Case> GetInProgressCaseByDevice(Guid deviceId);
    Task<IEnumerable<Case>> GetInProgressCasesByDevice(Guid deviceId);
    Task<IEnumerable<Case>> GetInProgressOrSelectedCasesByDevice(Guid deviceId);
    Task<Case> GetNextCaseForDevice(Guid deviceId);
    Task<IEnumerable<Case>> GetReadyCasesByDevice(Guid deviceId);
    Task<IEnumerable<Case>> GetScheduledCasesByDay(Guid facilityId, DateTime date);
    Task<IEnumerable<Case>> GetScheduledCasesByTimePeriod(Guid facilityId, DateTime dateStart, DateTime dateEnd);
    Task<IEnumerable<Case>> GetScheduledCasesByWeek(Guid facilityId, DateTime dateStartDateOfWeek);
    Task<Case> GetSelectCaseByDevice(Guid deviceId);
    Task<IEnumerable<Case>> GetSelectedCasesByDevice(Guid deviceId);
    Task<Case> GetSelectOrInProgressCaseByDevice(Guid deviceId);
    Case GetTrackedEntity(Guid id);
    Task SeedDbForDemo(Guid deviceId);
}

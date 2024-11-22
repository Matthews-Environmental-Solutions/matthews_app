using MatthewsApp.API.Dtos;
using MatthewsApp.API.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MatthewsApp.API.Repository.Interfaces;

public interface ICaseRepository : IBaseRepository<Case, Guid>
{
    Task CleanDbForDemo(Guid deviceId);
    Task<IEnumerable<Case>> GetAllUnscheduled();
    Case GetById(Guid id);
    Task<Case> GetByIdAsync(Guid id);
    Task<IEnumerable<Case>> GetCasesByFacility(Guid facilityId);
    Task<IEnumerable<Case>> GetFirst20ScheduledCases(Guid scheduledDeviceId);
    Task<Case> GetNextCaseForDevice(Guid deviceId);
    Task<IEnumerable<Case>> GetReadyCasesByDevice(Guid deviceId);
    Task<IEnumerable<Case>> GetScheduledCasesByDay(Guid facilityId, DateTime date);
    Task<IEnumerable<Case>> GetScheduledCasesByTimePeriod(Guid facilityId, DateTime dateStart, DateTime dateEnd);
    Task<IEnumerable<Case>> GetScheduledCasesByWeek(Guid facilityId, DateTime dateStartDateOfWeek);
    Task SeedDbForDemo(Guid deviceId);
}

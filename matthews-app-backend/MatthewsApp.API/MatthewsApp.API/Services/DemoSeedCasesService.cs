using MatthewsApp.API.Enums;
using MatthewsApp.API.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using MatthewsApp.API.Repository.Interfaces;
using System.Threading.Tasks;
using System.IO;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using Microsoft.EntityFrameworkCore.Metadata.Internal;

namespace MatthewsApp.API.Services;

public interface IDemoSeedCasesService
{
    Task Initialize();
    List<Guid> GetDevices();
    void SaveCasesToDatabase();
    List<Guid> GetFacilities();
}

public class DemoSeedCasesService : IDemoSeedCasesService
{
    private readonly ILogger<DemoSeedCasesService> _logger;
    private readonly ICaseRepository _caseRepository;
    private readonly IFacilityStatusRepository _facilityStatusRepository;


    DateTime todayAtMidnight = DateTime.Now.Date;
    private List<Case> _cases = new();
    private HashSet<Guid> _devices = new();
    private HashSet<Guid> _facilities = new();
    Dictionary<Guid, List<FacilityStatus>> facilityStatuses = new Dictionary<Guid, List<FacilityStatus>>();

    public DemoSeedCasesService(IFacilityStatusRepository facilityStatusRepository, ICaseRepository caseRepository, ILogger<DemoSeedCasesService> logger)
    {
        _facilityStatusRepository = facilityStatusRepository;
        _caseRepository = caseRepository;
        _logger = logger;
    }

    public async Task Initialize()
    {
        _cases = await ReadCsv("Matthews Demo Sample Cases v4.csv");
        GetDevices();
        await CleanByDevice();
    }

    public List<Guid> GetDevices()
    {
        _logger.LogInformation($"--- --- GetDevices");
        //get all devices from cases
        foreach (var item in _cases)
        {
            if (item.ScheduledDevice != null)
            {
                _devices.Add((Guid)item.ScheduledDevice);
            }
        }

        return _devices.ToList();
    }

    public void SaveCasesToDatabase()
    {
        foreach (var item in _cases)
        {
            try
            {
                _logger.LogInformation($"Save: {item.FirstName}");
                _caseRepository.Create(item);
            }
            catch (Exception ex)
            {
                // Log the error for debugging purposes
                _logger.LogInformation($"Error saving case to database {item.FirstName}: {ex.Message}");
                throw;
            }
        }
    }

    public List<Guid> GetFacilities()
    {
        //get all devices from cases
        foreach (var item in _cases)
        {
            if (item.ScheduledFacility != null || item.ScheduledFacility != Guid.Empty)
            {
                _facilities.Add((Guid)item.ScheduledFacility);
            }
        }
        return _facilities.ToList();
    }

    public async Task<List<Case>> ReadCsv(string relativePath)
    {
        _logger.LogInformation($"--- --- ReadCsv");
        var dataList = new List<Case>();

        // Get the absolute path based on the relative path
        string absolutePath = Path.Combine(Directory.GetCurrentDirectory(), relativePath);

        // Check if the file exists
        if (!File.Exists(absolutePath))
        {
            _logger.LogInformation("--- --- --- Error: The file does not exist at the specified path.");
            return dataList;
        }

        using (var reader = new StreamReader(absolutePath))
        {
            bool isFirstLine = true;
            int index = 0;
            while (!reader.EndOfStream)
            {
                var line = reader.ReadLine();
                var values = line.Split(';');

                if (isFirstLine)
                {
                    isFirstLine = false; // Skip header row
                    continue;
                }

                _logger.LogInformation($"{index}: {values[3]}");
                

                _logger.LogInformation($"values8: {values[8]}");
                if (!Enum.TryParse(values[8].ToUpper(), out GenderType gender))
                {
                    gender = GenderType.OTHER; // Default value if parsing fails
                }

                _logger.LogInformation($"values6: {values[6]}");
                if (!Enum.TryParse(values[6].ToUpper(), out ContainerType containerType))
                {
                    containerType = ContainerType.CARDBOARD; // Default value if parsing fails
                }

                _logger.LogInformation($"values1: {values[1]}");
                if (!Enum.TryParse(values[1].ToUpper(), out CaseStatus caseStatus))
                {
                    caseStatus = CaseStatus.WAITING_FOR_PERMIT;
                }

                _logger.LogInformation($"values11: {values[11]}");
                if (!Guid.TryParse(values[11], out Guid scheduledFacilityId))
                {
                    caseStatus = CaseStatus.WAITING_FOR_PERMIT;
                    scheduledFacilityId = Guid.Empty;
                }

                _logger.LogInformation($"values13: {values[13]}");
                if (!Guid.TryParse(values[13], out Guid scheduledDeviceId))
                {
                    caseStatus = CaseStatus.WAITING_FOR_PERMIT;
                    scheduledDeviceId = Guid.Empty;
                }

                _logger.LogInformation($"values16: {values[16]}");
                if (!double.TryParse(values[16], out double scheduledStartTimeOffset))
                {
                    scheduledStartTimeOffset = 0;
                    _logger.LogInformation($"values16 cant be parsed and we set value zero: {scheduledStartTimeOffset}");
                }

                _logger.LogInformation($"Add days of offset to calculate scheduledStartTime");
                _logger.LogInformation($"todayAtMidnight: {todayAtMidnight}");
                DateTime? scheduledStartTime = values[16].IsNullOrEmpty() ? null : todayAtMidnight.AddDays(scheduledStartTimeOffset);

                _logger.LogInformation($"GetFacilityStatusIdByCaseStatus");
                Guid facilityStatusId = await GetFacilityStatusIdByCaseStatus(scheduledFacilityId, caseStatus);

                _logger.LogInformation($"new Case");
                var myObject = new Case
                {
                    Id = Guid.NewGuid(),
                    CreatedBy = Guid.Empty,
                    CreatedTime = DateTime.Now,
                    ClientId = "123", // always to be 123
                    ClientCaseId = values[0], //"SB-203101", // use column Case ID
                    FirstName = values[3], //"Rebeca",
                    LastName = values[4], //"Machado",
                    Weight = int.Parse(values[5]), // 390,
                    Gender = gender,
                    ContainerType = containerType,
                    Age = int.Parse(values[9]),
                    ScheduledFacility = scheduledFacilityId,
                    ScheduledDevice = scheduledDeviceId,
                    ScheduledDeviceAlias = values[12], // use column Cremator
                    ScheduledStartTime = scheduledStartTime,  // use column TimeOffsetTotal
                    ActualDeviceAlias = values[12], // use column Cremator
                    PerformedBy = "Demo User", // always to be Demo User
                    Fuel = string.Empty,
                    Electricity = string.Empty,
                    FacilityStatusId = facilityStatusId // use column Case Status
                };

                _logger.LogInformation($"before add object to list");
                dataList.Add(myObject);
                index++;
            }
        }

        return dataList;
    }

    private async Task<Guid> GetFacilityStatusIdByCaseStatus(Guid facilityId, CaseStatus status)
    {
        // Check if the facility's statuses are already cached
        if (!facilityStatuses.TryGetValue(facilityId, out var statuses))
        {
            // Fetch and cache statuses for the facility if not already present
            statuses = (await _facilityStatusRepository.GetAllByFacility(facilityId)).ToList();
            facilityStatuses[facilityId] = statuses;
        }

        // Find the specific status in the cached list
        var facilityStatus = statuses.FirstOrDefault(f => f.Status == status);

        // Return the ID if found, otherwise return Guid.Empty
        return facilityStatus?.Id ?? Guid.Empty;
    }

    private async Task CleanByDevice()
    {
        _logger.LogInformation($"--- --- CleanByDevice");
        var tasks = _devices
            .Select(async deviceId =>
            {
                try
                {
                    await _caseRepository.CleanDbForDemo(deviceId);
                }
                catch (Exception ex)
                {
                    // Log the error for debugging purposes
                    Console.WriteLine($"Error cleaning database for device {deviceId}: {ex.Message}");
                }
            });

        await Task.WhenAll(tasks);
    }

}

using Humanizer;
using IdentityModel;
using MatthewsApp.API.Dtos;
using MatthewsApp.API.Enums;
using MatthewsApp.API.Models;
using MatthewsApp.API.PrismEvents;
using MatthewsApp.API.Repository.Interfaces;
using Microsoft.Extensions.Logging;
using Prism.Events;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MatthewsApp.API.Services;

public interface ICasesService
{
    Task Create(Case entity);
    void Delete(Case entity);
    Task<Case> Update(Case entity);
    void Select(Guid caseId);

    /// <summary>
    /// Deselects the case with the specified caseId. If publichEvent is true, an event is published to send mqtt message to Flexy.
    /// </summary>
    /// <param name="caseId"></param>
    /// <param name="publichEvent"></param>
    Task UpdateCaseWhenCaseDeselect(Guid caseId, bool publichEvent);

    Task<Case> GetById(Guid id);
    bool IsCaseExists(Guid id);
    Task<IEnumerable<Case>> GetUnscheduledCases(List<Guid> Facilities);
    Task<IEnumerable<Case>> GetScheduledCasesByDay(Guid facilityId, DateTime date);
    Task<IEnumerable<Case>> GetScheduledCasesByWeek(Guid facilityId, DateTime dateStartDateOfWeek);
    Task<IEnumerable<Case>> GetScheduledCasesByTimePeriod(Guid facilityId, DateTime dateStart, DateTime dateEnd);
    Task<Case> UpdateCaseWhenCaseStart(CaseFromFlexyDto dto);
    Task<Case> UpdateCaseWhenCaseSelect(CaseFromFlexyDto dto);
    Task<Case> UpdateCaseWhenCaseEnd(CaseFromFlexyDto dto);
    Task<Case> UpdateCaseWhenCaseRestart(CaseFromFlexyDto dto);
    Task<Case> UpdateCaseWhenCaseRemove(CaseFromFlexyDto dto);
    Task<Case> GetNextCaseForDevice(Guid deviceId);
    Task<IEnumerable<Case>> GetReadyCasesByDevice(Guid deviceId);
    Task<bool> ResetDemo();
    Task<IEnumerable<CaseStatusDto>> GetCaseStatuses();
    Task<Case> GetSelectCaseByDevice(Guid deviceId);
    Task FixAllPreviousCasesInProgressOrCycleCompleteByDevice(Guid caseId, Guid deviceId, Guid facilityId);
    Task FixAllPreviousSelectedCasesByDevice(Guid caseId, Guid deviceId, Guid fACILITY_ID);
    Task FixSelectedCasesesInReadyToCreateByDevice(Guid caseId, Guid deviceId, Guid fACILITY_ID);
}

public class CasesService : ICasesService
{
    private readonly ICaseI4cHttpClientService _caseI4CHttpClientService;
    private readonly ICaseRepository _caseRepository;
    private readonly IFacilityStatusRepository _facilityStatusRepository;
    private readonly ILogger<CasesService> _logger;
    private readonly CaseHub _caseHub;
    private IEventAggregator _ea;
    private readonly IDemoSeedCasesService _demoSeedCasesService;

    public CasesService(ICaseRepository repository, IFacilityStatusRepository facilityStatusRepository, IEventAggregator ea, CaseHub caseHub, ICaseI4cHttpClientService caseI4CHttpClientService, ILogger<CasesService> logger, IDemoSeedCasesService demoSeedCasesService)
    {
        _caseI4CHttpClientService = caseI4CHttpClientService;
        _facilityStatusRepository = facilityStatusRepository;
        _caseRepository = repository;
        _caseHub = caseHub;
        _logger = logger;
        _ea = ea;
        _demoSeedCasesService = demoSeedCasesService;
    }

    public async Task Create(Case entity)
    {
        if (entity.FacilityStatusId == Guid.Empty)
        {
            throw new ArgumentException("FacilityStatusId is required.");
        }
        //entity.FirstName = UTF8toASCII(entity.FirstName);
        //entity.LastName = UTF8toASCII(entity.LastName);

        try
        {
            if(entity.ScheduledDevice != null && !entity.ScheduledDevice.Equals(Guid.Empty))
            {
                entity.ScheduledDeviceAlias = await SetDeviceAliasForCase((Guid)entity.ScheduledDevice);
            }
            var createdEntity = _caseRepository.Create(entity);
            List<Guid> ids = new List<Guid>();

            if (createdEntity.ScheduledDevice != null && !createdEntity.ScheduledDevice.Equals(Guid.Empty))
            {
                ids.Add((Guid)createdEntity.ScheduledDevice);
                // Send event
                SendEventToHostedService(createdEntity, ids);
            }

            // SignalR
            _caseHub.SendMessageToRefreshList($"Create done.", createdEntity.ScheduledFacility.ToString());
        }
        catch (Exception)
        {

            throw;
        }
    }

    public void Delete(Case entity)
    {
        _caseRepository.Delete(entity.Id);
        List<Guid> ids = new List<Guid>();

        if(entity.ScheduledDevice != null && entity.ScheduledDevice != Guid.Empty)
        {
            ids.Add((Guid)entity.ScheduledDevice);

            // Send event
            SendEventToHostedService(entity, ids);
        }
        
        // SignalR
        _caseHub.SendMessageToRefreshList($"Delete done.", entity.ScheduledFacility.ToString());
    }

    public async Task<Case> Update(Case entity)
    {
        _logger.LogDebug("Update of case id");
        Case previousCase = _caseRepository.GetById(entity.Id);

        // Detach the existing entity if it is being tracked
        var trackedEntity = _caseRepository.GetTrackedEntity(entity.Id);
        if (trackedEntity != null)
        {
            _caseRepository.Detach(trackedEntity);
        }

        // Detach the existing FacilityStatus entity if it is being tracked
        if (entity.FacilityStatus != null)
        {
            var trackedFacilityStatus = _facilityStatusRepository.GetTrackedEntity(entity.FacilityStatus.Id);
            if (trackedFacilityStatus != null)
            {
                _facilityStatusRepository.Detach(trackedFacilityStatus);
            }
        }

        if (entity.ScheduledDevice != previousCase.ScheduledDevice)
        {
            entity.ScheduledDeviceAlias = await SetDeviceAliasForCase((Guid)entity.ScheduledDevice);
        }

        _caseRepository.Update(entity);
        List<Guid> ids = new List<Guid>();

        ids.Add(entity.ScheduledDevice ?? Guid.Empty);
        if (entity.ScheduledDevice != previousCase.ScheduledDevice)
        {
            ids.Add(previousCase.ScheduledDevice ?? Guid.Empty);
        }

        // Send event
        SendEventToHostedService(entity, ids);

        // SignalR
        _caseHub.SendMessageToRefreshList($"Update done.", entity.ScheduledFacility.ToString());

        return entity;
    }

    public async void Select(Guid caseId)
    {
        _logger.LogDebug("Selection of case");
        try
        {
            var entity = _caseRepository.GetById(caseId);
            entity.Selected = true;
            await Update(entity);

            _ea.GetEvent<CaseSelectEvent>().Publish(entity);
        }
        catch (Exception)
        {
            throw;
        }
    }

    /// <summary>
    /// Deselects the case with the specified caseId. If publichEvent is true, an event is published to send mqtt message to Flexy.
    /// </summary>
    /// <param name="caseId"></param>
    /// <param name="publichEvent"></param>
    public async Task UpdateCaseWhenCaseDeselect(Guid caseId, bool publichEvent)
    {
        _logger.LogDebug("Deselection of case");
        try
        {
            Case updatedCase = await UpdateDeselectedCase(caseId);
            if (publichEvent)
                _ea.GetEvent<CaseDeselectEvent>().Publish(updatedCase);
        }
        catch (Exception)
        {
            throw;
        }
    }

    private async Task<Case> UpdateDeselectedCase(Guid caseId)
    {
        var entity = _caseRepository.GetById(caseId);
        if (entity != null)
        {
            entity.Selected = false;
            await Update(entity);
            return entity;
        }
        return null;
    }

    public async Task<Case> UpdateCaseWhenCaseStart(CaseFromFlexyDto dto)
    {
        if (dto.LOADED_ID == Guid.Empty)
        {
            return null;
        }

        bool entityDoesNotExistInDb = false;

        Case entity = GetOrCreateCaseFromDto(dto, ref entityDoesNotExistInDb);
        if (entityDoesNotExistInDb)
        {
            entity.ScheduledStartTime = DateTime.UtcNow;
        }
        SetStatusInProgress(entity);
        entity.Selected = true;
        entity.ActualStartTime = dto.StartTime;
        entity.ActualEndTime = null;
        entity.ActualFacility = dto.FACILITY_ID;
        entity.ActualDevice = dto.CREMATOR_ID;
        entity.ActualDeviceAlias = entity.ScheduledDeviceAlias;
        entity.PerformedBy = dto.User;

        return await UptadeOrCreateCase(dto, entity, entityDoesNotExistInDb);
    }

    public async Task<Case> UpdateCaseWhenCaseSelect(CaseFromFlexyDto dto)
    {
        if (dto.LOADED_ID == Guid.Empty)
        {
            return null;
        }

        bool entityDoesNotExistInDb = false;

        Case entity = GetOrCreateCaseFromDto(dto, ref entityDoesNotExistInDb);
        if (entityDoesNotExistInDb)
        {
            entity.ScheduledStartTime = DateTime.UtcNow;
        }
        SetStatusReadyToCremate(entity);
        entity.Selected = true;
        entity.PerformedBy = dto.User;

        return await UptadeOrCreateCase(dto, entity, entityDoesNotExistInDb);
    }

    public async Task<Case> UpdateCaseWhenCaseEnd(CaseFromFlexyDto dto)
    {
        if (dto.LOADED_ID == Guid.Empty)
        {
            return null;
        }

        bool entityDoesNotExistInDb = false;

        Case entity = GetOrCreateCaseFromDto(dto, ref entityDoesNotExistInDb);
        SetStatusCycleComplete(entity);
        entity.Selected = true;
        entity.ActualEndTime = dto.EndTime;
        entity.ActualStartTime = dto.StartTime;
        entity.ActualFacility = dto.FACILITY_ID;
        entity.ActualDevice = dto.CREMATOR_ID;
        entity.ActualDeviceAlias = entity.ScheduledDeviceAlias;

        return await UptadeOrCreateCase(dto, entity, entityDoesNotExistInDb);
    }

    public async Task<Case> UpdateCaseWhenCaseRestart(CaseFromFlexyDto dto)
    {
        if (dto.LOADED_ID == Guid.Empty)
        {
            return null;
        }

        bool entityDoesNotExistInDb = false;

        Case entity = GetOrCreateCaseFromDto(dto, ref entityDoesNotExistInDb);
        SetStatusInProgress(entity);
        entity.ActualStartTime = dto.StartTime;
        entity.ActualFacility = dto.FACILITY_ID;
        entity.ActualDevice = dto.CREMATOR_ID;
        entity.ActualEndTime = null;
        entity.Selected = true;
        entity.ActualDeviceAlias = entity.ScheduledDeviceAlias;

        return await UptadeOrCreateCase(dto, entity, entityDoesNotExistInDb);
    }

    public async Task<Case> UpdateCaseWhenCaseRemove(CaseFromFlexyDto dto)
    {
        if (dto.LOADED_ID == Guid.Empty)
        {
            return null;
        }

        bool entityDoesNotExistInDb = false;

        Case entity = GetOrCreateCaseFromDto(dto, ref entityDoesNotExistInDb);
        SetStatusCremationComplete(entity);
        entity.Selected = false;
        entity.ActualStartTime = dto.StartTime;
        entity.ActualFacility = dto.FACILITY_ID;
        entity.ActualDevice = dto.CREMATOR_ID;
        entity.ActualEndTime = dto.EndTime;
        entity.ActualDeviceAlias = entity.ScheduledDeviceAlias;

        return await UptadeOrCreateCase(dto, entity, entityDoesNotExistInDb);
    }

    public async Task<IEnumerable<Case>> GetUnscheduledCases(List<Guid> Facilities)
    {
        IEnumerable<Case> cases = await _caseRepository.GetUnscheduledCasesByFacilities(Facilities);
        return cases.Select(i =>
        {
            i.ScheduledStartTime = DateTime.SpecifyKind(i.ScheduledStartTime is null ? DateTime.MinValue : i.ScheduledStartTime.Value, DateTimeKind.Utc);
            return i;
        });
    }

    public async Task<IEnumerable<Case>> GetScheduledCasesByDay(Guid facilityId, DateTime date)
    {
        try
        {
            IEnumerable<Case> cases = await _caseRepository.GetScheduledCasesByDay(facilityId, date);
            return cases.Select(i =>
            {
                i.ScheduledStartTime = DateTime.SpecifyKind(i.ScheduledStartTime is null ? DateTime.MinValue : i.ScheduledStartTime.Value, DateTimeKind.Utc);
                return i;
            });
        }
        catch (Exception ex)
        {
            throw new Exception(ex.Message);
        }
    }

    public async Task<IEnumerable<Case>> GetScheduledCasesByWeek(Guid facilityId, DateTime dateStartDateOfWeek)
    {
        try
        {
            IEnumerable<Case> cases = await _caseRepository.GetScheduledCasesByWeek(facilityId, dateStartDateOfWeek);
            return cases.Select(i =>
            {
                i.ScheduledStartTime = DateTime.SpecifyKind(i.ScheduledStartTime is null ? DateTime.MinValue : i.ScheduledStartTime.Value, DateTimeKind.Utc);
                return i;
            });
        }
        catch (Exception ex)
        {
            throw new Exception(ex.Message);
        }
    }

    public async Task<IEnumerable<Case>> GetScheduledCasesByTimePeriod(Guid facilityId, DateTime dateStart, DateTime dateEnd)
    {
        try
        {
            IEnumerable<Case> cases = await _caseRepository.GetScheduledCasesByTimePeriod(facilityId, dateStart, dateEnd);
            return cases.Select(i =>
            {
                i.ScheduledStartTime = DateTime.SpecifyKind(i.ScheduledStartTime is null ? DateTime.MinValue : i.ScheduledStartTime.Value, DateTimeKind.Utc);
                return i;
            });
        }
        catch (Exception ex)
        {
            throw new Exception(ex.Message);
        }
    }

    public async Task<IEnumerable<Case>> GetReadyCasesByDevice(Guid deviceId)
    {
        try
        {
            IEnumerable<Case> cases = await _caseRepository.GetReadyCasesByDevice(deviceId);
            return cases.Select(i =>
            {
                i.ScheduledStartTime = DateTime.SpecifyKind(i.ScheduledStartTime is null ? DateTime.MinValue : i.ScheduledStartTime.Value, DateTimeKind.Utc);
                return i;
            });
        }
        catch (Exception ex)
        {

            throw new Exception(ex.Message);
        }
    }

    public async Task<Case> GetSelectCaseByDevice(Guid deviceId)
    {
        try
        {
            Case Case = await _caseRepository.GetSelectCaseByDevice(deviceId);
            if (Case is not null)
            {
                Case.ScheduledStartTime = DateTime.SpecifyKind(Case.ScheduledStartTime is null ? DateTime.MinValue : Case.ScheduledStartTime.Value, DateTimeKind.Utc);
            }
            return Case;
        }
        catch (Exception)
        {

            throw;
        }
    }

    public async Task<Case> GetById(Guid id)
    {
        try
        {
            Case Case = await _caseRepository.GetOne(id);
            if(Case is not null)
            {
                Case.ScheduledStartTime = DateTime.SpecifyKind(Case.ScheduledStartTime is null ? DateTime.MinValue : Case.ScheduledStartTime.Value, DateTimeKind.Utc);
            }
            return Case;
        }
        catch (Exception ex)
        {
            throw ex;
        }
    }

    public async Task<Case> GetNextCaseForDevice(Guid deviceId)
    {
        try
        {
            Case Case = await _caseRepository.GetNextCaseForDevice(deviceId);
            if (Case is not null)
            {
                Case.ScheduledStartTime = DateTime.SpecifyKind(Case.ScheduledStartTime is null ? DateTime.MinValue : Case.ScheduledStartTime.Value, DateTimeKind.Utc);
            }

            Case.Selected = true;
            _caseRepository.Update(Case);
            
            // Send event
            SendEventToHostedService(Case, new List<Guid> { deviceId });

            // Send to Flexy
            _ea.GetEvent<CaseSelectEvent>().Publish(Case);

            // SignalR
            _caseHub.SendMessageToRefreshList($"Update status to SELECTED done.", Case.ScheduledFacility.ToString());

            return Case;
        }
        catch (Exception ex)
        {
            throw ex;
        }
    }

    public bool IsCaseExists(Guid id)
    {
        return _caseRepository.GetAll().Result.Any(e => e.Id == id);
    }

    /// <summary>
    /// Resets the demo environment by reinitializing and seeding cases.
    /// This method performs the following actions:
    /// 1. Calls the Initialize method of the DemoSeedCasesService to reset and prepare the demo data.
    /// 2. Saves the newly initialized cases to the database.
    /// 3. Publishes an event to notify about changes in the cases for all devices.
    /// 4. Sends SignalR messages to refresh the case list for all facilities.
    /// </summary>
    /// <returns>
    /// A boolean value indicating whether the reset operation was successful.
    /// Returns true if the operation completes without exceptions.
    /// </returns>
    /// <exception cref="Exception">
    /// Throws an exception if any error occurs during the reset process.
    /// </exception>
    public async Task<bool> ResetDemo()
    {
        try
        {
            await _demoSeedCasesService.Initialize();
            _demoSeedCasesService.SaveCasesToDatabase();

            //var scheduledDeviceAlias = await SetDeviceAliasForCase(deviceId);

            List<Guid> deviceIds = _demoSeedCasesService.GetDevices();
            _ea.GetEvent<EventCaseAnyChange>().Publish(deviceIds);
            
            // SignalR
            List<Guid> facilityIds = _demoSeedCasesService.GetFacilities();
            foreach (var facilityId in facilityIds)
            {
                _caseHub.SendMessageToRefreshList($"Reset demo done.", facilityId.ToString());
            }
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogDebug($"--- --- ResetDemo Error: {ex.InnerException}");
            throw;
        }
    }

    public async Task<IEnumerable<CaseStatusDto>> GetCaseStatuses()
    {
        var caseStatuses = Enum.GetValues(typeof(CaseStatus))
                           .Cast<CaseStatus>()
                           .Select(cs => new CaseStatusDto
                           {
                               Name = cs.ToString(),
                               Value = (int)cs
                           }).Where(cs => !cs.Name.Equals("UNSCHEDULED"));
        
        return await Task.FromResult(caseStatuses);
    }

    public async Task FixAllPreviousCasesInProgressOrCycleCompleteByDevice(Guid caseId, Guid deviceId, Guid facilityId)
    {
        var casesInDevice = await _caseRepository.GetCaseInProgressOrCycleCompleteByDevice(deviceId);

        var casesToUpdate = casesInDevice
           .Where(item => item.Id != caseId)
           .Select(async item =>
           {
               SetStatusCremationComplete(item);
               item.ScheduledDeviceAlias = await SetDeviceAliasForCase((Guid)item.ScheduledDevice);
               item.Selected = false;
               item.ActualEndTime = DateTime.UtcNow;
               item.ActualStartTime = item.ScheduledStartTime;
               item.ActualFacility = item.ScheduledFacility;
               item.ActualDevice = item.ScheduledDevice;
               item.ActualDeviceAlias = item.ScheduledDeviceAlias;
               return item;
           }).ToList();

        foreach (var itemCase in casesToUpdate)
        {
            _caseRepository.Update(await itemCase);
        }
    }

    public async Task FixSelectedCasesesInReadyToCreateByDevice(Guid caseId, Guid deviceId, Guid fACILITY_ID)
    {
        var casesInDevice = await _caseRepository.GetSelectedCasesReadyToCremateByDevice(deviceId);

        var casesToUpdate = casesInDevice
           .Where(item => item.Id != caseId)
           .Select(async item =>
           {
               item.ScheduledDeviceAlias = await SetDeviceAliasForCase((Guid)item.ScheduledDevice);
               item.Selected = false;
               return item;
           }).ToList();

        foreach (var itemCase in casesToUpdate)
        {
            _caseRepository.Update(await itemCase);
        }
    }

    public async Task FixAllPreviousSelectedCasesByDevice(Guid caseId, Guid deviceId, Guid fACILITY_ID)
    {
        var casesInDevice = await _caseRepository.GetSelectedCasesByDevice(deviceId);

        var casesToUpdate = casesInDevice
           .Where(item => item.Id != caseId)
           .Select(async item =>
           {
               item.ScheduledDeviceAlias = await SetDeviceAliasForCase((Guid)item.ScheduledDevice);
               item.Selected = false;
               return item;
           }).ToList();

        foreach (var itemCase in casesToUpdate)
        {
            _caseRepository.Update(await itemCase);
        }
    }

    private Case MakeNewCaseFromDto(CaseFromFlexyDto dto)
    {
        Case entity = new Case();
        entity.Id = dto.LOADED_ID;
        entity.FirstName = dto.LOADED_FIRST_NAME;
        entity.LastName = dto.LOADED_SURNAME;
        entity.Age = dto.LOADED_AGE;
        entity.Gender = dto.LOADED_GENDER;
        entity.ScheduledFacility = dto.FACILITY_ID;
        entity.ScheduledDevice = dto.CREMATOR_ID;
        entity.ContainerType = (ContainerType)dto.LOADED_COFFIN_TYPE;
        entity.Weight = dto.LOADED_WEIGHT;
        entity.Gender = dto.LOADED_GENDER;
        //entity.ScheduledStartTime = dto.StartTime;
        entity.ClientId = "1"; //ClientID is missing in CaseStart object from Flexy
        entity.ClientCaseId = dto.LOADED_CLIENT_ID;
        entity.PhysicalId = dto.LOADED_PHYSICAL_ID;

        return entity;
    }

    private Case RemapCaseFromDto(Case oldCase, CaseFromFlexyDto dto)
    {
        oldCase.FirstName = dto.LOADED_FIRST_NAME;
        oldCase.LastName = dto.LOADED_SURNAME;
        oldCase.Age = dto.LOADED_AGE;
        oldCase.Gender = dto.LOADED_GENDER;
        oldCase.ScheduledFacility = dto.FACILITY_ID;
        oldCase.ScheduledDevice = dto.CREMATOR_ID;
        oldCase.ContainerType = (ContainerType)dto.LOADED_COFFIN_TYPE;
        oldCase.Weight = dto.LOADED_WEIGHT;
        oldCase.Gender = dto.LOADED_GENDER;
        oldCase.ClientId = "1"; //ClientID is missing in CaseStart object from Flexy
        oldCase.ClientCaseId = dto.LOADED_CLIENT_ID;
        oldCase.PhysicalId = dto.LOADED_PHYSICAL_ID;

        return oldCase;
    }

    private void SendEventToHostedService(Case entity, List<Guid> deviceIds)
    {
        // Send event
        if (entity.ScheduledDevice is not null && entity.ScheduledDevice != Guid.Empty)
        {
            _ea.GetEvent<EventCaseAnyChange>().Publish(deviceIds);
        }
    }

    private async Task<Case> UptadeOrCreateCase(CaseFromFlexyDto dto, Case entity, bool entityDoesNotExistInDb)
    {
        try
        {
            if (entityDoesNotExistInDb)
            {
                await Create(entity);
            }
            else
            {
                // Detach the existing entity if it is being tracked
                var trackedEntity = _caseRepository.GetTrackedEntity(dto.LOADED_ID);
                if (trackedEntity != null)
                {
                    _caseRepository.Detach(trackedEntity);
                }
                await Update(entity);
            }

            return entity;
        }
        catch (Exception)
        {
            throw;
        }
    }

    private async Task<string> SetDeviceAliasForCase(Guid deviceId)
    {
        DeviceDto cremator = null;
        List<DeviceDto> cremators = (await _caseI4CHttpClientService.GetAllDevicesAsync()).ToList();
        cremator = cremators.FirstOrDefault(c => c.id == deviceId);
        return cremator is not null ? cremator.alias : string.Empty;
    }

    private Case GetOrCreateCaseFromDto(CaseFromFlexyDto dto, ref bool entityDoesNotExistInDb)
    {
        Case entity = _caseRepository.GetById(dto.LOADED_ID);
        if (entity is null)
        {
            entity = MakeNewCaseFromDto(dto);
            entityDoesNotExistInDb = true;
        }
        else
        {
            entity = RemapCaseFromDto(entity, dto);
        }

        return entity;
    }

    private void SetStatusInProgress(Case entity)
    {
        entity.FacilityStatus = _facilityStatusRepository.GetInProgressFacilityStatus((Guid)entity.ScheduledFacility);
        entity.FacilityStatusId = entity.FacilityStatus.Id;
    }

    private void SetStatusReadyToCremate(Case entity)
    {
        entity.FacilityStatus = _facilityStatusRepository.GetReadyToCremateFacilityStatus((Guid)entity.ScheduledFacility);
        entity.FacilityStatusId = entity.FacilityStatus.Id;
    }

    private void SetStatusCycleComplete(Case entity)
    {
        entity.FacilityStatus = _facilityStatusRepository.GetCycleCompleteFacilityStatus((Guid)entity.ScheduledFacility);
        entity.FacilityStatusId = entity.FacilityStatus.Id;
    }

    private void SetStatusCremationComplete(Case entity)
    {
        entity.FacilityStatus = _facilityStatusRepository.GetCremationCompleteFacilityStatus((Guid)entity.ScheduledFacility);
        entity.FacilityStatusId = entity.FacilityStatus.Id;
    }

    
}

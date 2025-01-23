using Humanizer;
using IdentityModel;
using MatthewsApp.API.Dtos;
using MatthewsApp.API.Enums;
using MatthewsApp.API.Models;
using MatthewsApp.API.Mqtt;
using MatthewsApp.API.PrismEvents;
using MatthewsApp.API.Repository.Interfaces;
using Microsoft.Extensions.Logging;
using Prism.Events;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MatthewsApp.API.Services;

public interface ICasesService
{
    void Create(Case caseEntity);
    void Delete(Case caseEntity);
    Case Update(Case caseEntity);
    void Select(Guid caseEntity);
    void Deselect(string loadedId);
    void Deselect(Guid caseId);
    Task<IEnumerable<Case>> GetAll();
    Task<Case> GetById(Guid id);
    bool IsCaseExists(Guid id);
    Task<IEnumerable<Case>> GetUnscheduledCases();
    Task<IEnumerable<Case>> GetScheduledCasesByDay(Guid facilityId, DateTime date);
    Task<IEnumerable<Case>> GetScheduledCasesByWeek(Guid facilityId, DateTime dateStartDateOfWeek);
    Task<IEnumerable<Case>> GetAllCasesByFacility(Guid facilityId);
    Task<IEnumerable<Case>> GetScheduledCasesByTimePeriod(Guid facilityId, DateTime dateStart, DateTime dateEnd);
    Task<Tuple<Case, bool>> UpdateCaseWhenCaseStart(CaseFromFlexyDto dto);
    Task<Tuple<Case, bool>> UpdateCaseWhenCaseSelect(CaseFromFlexyDto dto);
    void UpdateCaseWhenCaseEnd(EndCaseFromFlexyDto dto);
    Task<Case> GetNextCaseForDevice(Guid deviceId);
    Task<IEnumerable<Case>> GetReadyCasesByDevice(Guid deviceId);
    Task<bool> ResetDemo();
    Task<IEnumerable<CaseStatusDto>> GetCaseStatuses();
    Task<Case> GetSelectCaseByDevice(Guid deviceId);
    Task<Case> GetInProgressCaseByDevice(Guid deviceId);
    Task ClearAllSelectedCasesByDevice(CaseFromFlexyDto startCase);
    Task ClearAllInProgressCasesByDevice(CaseFromFlexyDto startOrSelectCase);
    Task<bool> CheckIfDeviceHasCaseInProgress(Guid deviceId);
    Task<DeviceStatusType> GetDeviceStatus(Guid deviceId);
    Task ClearAllInProgressOrSelectedCasesByDevice(CaseFromFlexyDto startCase);
    Task UpdateCaseButNotChangeStatus(CaseFromFlexyDto startOrSelectCase);
    Task ClearAllInProgressOrSelectedCasesByDevice(Guid caseId, Guid crematorId, Guid facilityId);
}

public class CasesService : ICasesService
{
    private readonly ICaseI4cHttpClientService _caseI4CHttpClientService;
    private readonly ICaseRepository _caseRepository;
    private readonly IFacilityStatusRepository _facilityStatusRepository;
    private readonly ILogger<CasesService> _logger;
    private readonly CaseHub _caseHub;
    private IEventAggregator _ea;

    public CasesService(ICaseRepository repository, IFacilityStatusRepository facilityStatusRepository, IEventAggregator ea, CaseHub caseHub, ICaseI4cHttpClientService caseI4CHttpClientService, ILogger<CasesService> logger)
    {
        _caseI4CHttpClientService = caseI4CHttpClientService;
        _facilityStatusRepository = facilityStatusRepository;
        _caseRepository = repository;
        _caseHub = caseHub;
        _logger = logger;
        _ea = ea;
    }

    public void Create(Case entity)
    {
        if (entity.FacilityStatusId == Guid.Empty)
        {
            throw new ArgumentException("FacilityStatusId is required.");
        }
        //entity.FirstName = UTF8toASCII(entity.FirstName);
        //entity.LastName = UTF8toASCII(entity.LastName);

        var createdEntity = _caseRepository.Create(entity);
        List<Guid> ids = new List<Guid>();

        if(createdEntity.ScheduledDevice != null && !createdEntity.ScheduledDevice.Equals(Guid.Empty))
        {
            ids.Add((Guid)createdEntity.ScheduledDevice);
            // Send event
            SendEventToHostedService(createdEntity, ids);
        }

        // SignalR
        _caseHub.SendMessageToRefreshList($"Create done.");
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
        _caseHub.SendMessageToRefreshList($"Delete done.");
    }

    public Case Update(Case entity)
    {
        _logger.LogDebug("Update of case id");
        Case previousCase = _caseRepository.GetById(entity.Id);

        //entity.FirstName = UTF8toASCII(entity.FirstName);
        //entity.LastName = UTF8toASCII(entity.LastName);

        var trackedEntity = _caseRepository.GetTrackedEntity(entity.Id);
        if (trackedEntity != null)
        {
            _caseRepository.Detach(trackedEntity);
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
        _caseHub.SendMessageToRefreshList($"Update done.");

        return entity;
    }

    public void Select(Guid caseId)
    {
        _logger.LogDebug("Selection of case");
        try
        {
            var entity = _caseRepository.GetById(caseId);
            var facilityStatus = _facilityStatusRepository.GetSelectedFacilityStatus((Guid)entity.ScheduledFacility);
            entity.FacilityStatusId = _facilityStatusRepository.GetSelectedFacilityStatus((Guid)entity.ScheduledFacility).Id;
            entity.FacilityStatus = _facilityStatusRepository.GetSelectedFacilityStatus((Guid)entity.ScheduledFacility);
            Update(entity);

            _ea.GetEvent<CaseSelectEvent>().Publish(entity);
        }
        catch (Exception)
        {
            throw;
        }
    }

    public void Deselect(Guid caseId)
    {
        _logger.LogDebug("Deselection of case");
        try
        {
            Case updatedCase = UpdateDeselectedCase(caseId);
            _ea.GetEvent<CaseDeselectEvent>().Publish(updatedCase);
        }
        catch (Exception)
        {
            throw;
        }
    }

    public void Deselect(string loadedId)
    {
        try
        {
            if (Guid.TryParse(loadedId, out Guid caseId))
            {
                Case updatedCase = UpdateDeselectedCase(caseId);
                _ea.GetEvent<CaseDeselectEvent>().Publish(updatedCase);
            }
        }
        catch (Exception)
        {
            throw;
        }
    }

    private Case UpdateDeselectedCase(Guid caseId)
    {
        var entity = _caseRepository.GetById(caseId);
        if (entity != null)
        {
            var readyToCremateStatus = _facilityStatusRepository.GetReadyToCremateFacilityStatus((Guid)entity.ScheduledFacility);
            entity.FacilityStatusId = readyToCremateStatus.Id;
            entity.FacilityStatus = readyToCremateStatus;
            Update(entity);
            return entity;
        }
        return null;
    }

    public async Task<Tuple<Case, bool>> UpdateCaseWhenCaseStart(CaseFromFlexyDto dto)
    {
        if (dto.LOADED_ID == Guid.Empty)
        {
            return new (null, false);
        }

        Case entity;
        bool entityDoesNotExistInDb = false;
        
        entity = _caseRepository.GetById(dto.LOADED_ID);
        if (entity is null)
        {
            entity = MakeNewCaseFromDto(dto);
            entityDoesNotExistInDb = true;
        }
        entity.FacilityStatusId = _facilityStatusRepository.GetInProgressFacilityStatus(dto.FACILITY_ID).Id;
        entity.FacilityStatus = _facilityStatusRepository.GetInProgressFacilityStatus(dto.FACILITY_ID);
        entity.ActualStartTime = dto.StartTime;
        entity.ActualFacility = dto.FACILITY_ID;
        entity.ActualDevice = dto.CREMATOR_ID;

        DeviceDto cremator = null;
        List<DeviceDto> cremators = (await _caseI4CHttpClientService.GetAllDevicesAsync()).ToList();
        cremator = cremators.FirstOrDefault(c => c.id == dto.CREMATOR_ID);

        entity.ScheduledDeviceAlias = cremator is not null ? cremator.alias : string.Empty;
        entity.PerformedBy = dto.User;

        try
        {
            if (entityDoesNotExistInDb)
            {
                Create(entity);
            }
            else
            {
                Update(entity);
            }

            return new Tuple<Case, bool>(entity, entityDoesNotExistInDb);
        }
        catch (Exception)
        {
            throw;
        }
    }

    public async Task<Tuple<Case, bool>> UpdateCaseWhenCaseSelect(CaseFromFlexyDto dto)
    {
        if (dto.LOADED_ID == Guid.Empty)
        {
            return new(null, false);
        }

        Case entity;
        bool entityDoesNotExistInDb = false;

        entity = _caseRepository.GetById(dto.LOADED_ID);
            
        if (entity is null)
        {
            entity = MakeNewCaseFromDto(dto);
            entityDoesNotExistInDb = true;
        }
        else
        {
            entity = RemapCaseFromDto(entity, dto);
        }
        entity.FacilityStatusId = _facilityStatusRepository.GetSelectedFacilityStatus(dto.FACILITY_ID).Id;
        entity.FacilityStatus = _facilityStatusRepository.GetSelectedFacilityStatus(dto.FACILITY_ID);

        DeviceDto cremator = null;
        List<DeviceDto> cremators = (await _caseI4CHttpClientService.GetAllDevicesAsync()).ToList();
        cremator = cremators.FirstOrDefault(c => c.id == dto.CREMATOR_ID);

        entity.ScheduledDeviceAlias = cremator is not null ? cremator.alias : string.Empty;
        entity.PerformedBy = dto.User;

        try
        {
            if (entityDoesNotExistInDb)
            {
                Create(entity);
            }
            else
            {
                // Detach the existing entity if it is being tracked
                var trackedEntity = _caseRepository.GetTrackedEntity(dto.LOADED_ID);
                if (trackedEntity != null)
                {
                    _caseRepository.Detach(trackedEntity);
                }
                Update(entity);
            }

            return new Tuple<Case, bool>(entity, entityDoesNotExistInDb);
        }
        catch (Exception ex)
        {
            throw;
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
        entity.ContainerSize = (ContainerSize)dto.LOADED_SIZE;
        entity.Weight = dto.LOADED_WEIGHT;
        entity.Gender = dto.LOADED_GENDER;
        entity.ScheduledStartTime = dto.StartTime;
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
        oldCase.ContainerSize = (ContainerSize)dto.LOADED_SIZE;
        oldCase.Weight = dto.LOADED_WEIGHT;
        oldCase.Gender = dto.LOADED_GENDER;
        oldCase.ScheduledStartTime = dto.StartTime;
        oldCase.ClientId = "1"; //ClientID is missing in CaseStart object from Flexy
        oldCase.ClientCaseId = dto.LOADED_CLIENT_ID;
        oldCase.PhysicalId = dto.LOADED_PHYSICAL_ID;

        return oldCase;
    }

    public async void UpdateCaseWhenCaseEnd(EndCaseFromFlexyDto dto)
    {
        Case entity = _caseRepository.GetById(dto.COMPLETED_ID);
        if (entity == null) return;
        entity.ActualEndTime = dto.EndTime;
        entity.Fuel = dto.FuelUsed.ToString();
        entity.Electricity = dto.ElectricityUsed.ToString();
        entity.FacilityStatusId = _facilityStatusRepository.GetCremationCompleteFacilityStatus((Guid)entity.ScheduledFacility).Id;
        entity.FacilityStatus = _facilityStatusRepository.GetCremationCompleteFacilityStatus((Guid)entity.ScheduledFacility);
        Update(entity);
    }

    public async Task<IEnumerable<Case>> GetAll()
    {
        try
        {
            IEnumerable<Case> cases = await _caseRepository.GetAll();
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

    public async Task<IEnumerable<Case>> GetUnscheduledCases()
    {
        IEnumerable<Case> cases = await _caseRepository.GetAllUnscheduled();
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

    public async Task<IEnumerable<Case>> GetAllCasesByFacility(Guid facilityId)
    {
        try
        {
            IEnumerable<Case> cases = await _caseRepository.GetCasesByFacility(facilityId);
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
            return await _caseRepository.GetSelectCaseByDevice(deviceId);
        }
        catch (Exception)
        {

            throw;
        }
    }

    public async Task<Case> GetInProgressCaseByDevice(Guid deviceId)
    {
        try
        {
            return await _caseRepository.GetInProgressCaseByDevice(deviceId);
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
            Case.ScheduledStartTime = DateTime.SpecifyKind(Case.ScheduledStartTime is null ? DateTime.MinValue : Case.ScheduledStartTime.Value, DateTimeKind.Utc);
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

    private void SendEventToHostedService(Case entity, List<Guid> deviceIds)
    {
        // Send event
        if (entity.ScheduledDevice is not null && entity.ScheduledDevice != Guid.Empty)
        {
            _ea.GetEvent<EventCaseAnyChange>().Publish(deviceIds);
        }
    }

    /// <summary>
    /// This method is used to reset the demo data only on specific device.
    /// </summary>
    /// <returns></returns>
    public async Task<bool> ResetDemo()
    {
        try
        {
            Guid deviceId = Guid.Parse("f2f5eccc-0c98-4579-941f-a9d81e3817a5");

            await _caseRepository.CleanDbForDemo(deviceId);
            await _caseRepository.SeedDbForDemo(deviceId);

            List<Guid> ids = new List<Guid>();
            ids.Add(deviceId);
            _ea.GetEvent<EventCaseAnyChange>().Publish(ids);
            // SignalR
            _caseHub.SendMessageToRefreshList($"Create 20 cases done.");
            return true;
        }
        catch (Exception)
        {
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

    public async Task ClearAllSelectedCasesByDevice(CaseFromFlexyDto startCase)
    {
        var selectedCases = await _caseRepository.GetSelectedCasesByDevice(startCase.CREMATOR_ID);
        var readyToCremateStatus = _facilityStatusRepository.GetReadyToCremateFacilityStatus(startCase.FACILITY_ID);

        var casesToUpdate = selectedCases
            .Where(selectedCase => selectedCase.Id != startCase.LOADED_ID)
            .Select(selectedCase =>
            {
                selectedCase.FacilityStatusId = readyToCremateStatus.Id;
                selectedCase.FacilityStatus = readyToCremateStatus;
                return selectedCase;
            }).ToList();

        foreach (var selectedCase in casesToUpdate)
        {
            _caseRepository.Update(selectedCase);
        }
    }

    public async Task ClearAllInProgressOrSelectedCasesByDevice(CaseFromFlexyDto startCase)
    {
        var selectedCases = await _caseRepository.GetInProgressOrSelectedCasesByDevice(startCase.CREMATOR_ID);
        var readyToCremateStatus = _facilityStatusRepository.GetReadyToCremateFacilityStatus(startCase.FACILITY_ID);

        var casesToUpdate = selectedCases
            .Where(selectedCase => selectedCase.Id != startCase.LOADED_ID)
            .Select(selectedCase =>
            {
                selectedCase.FacilityStatusId = readyToCremateStatus.Id;
                selectedCase.FacilityStatus = readyToCremateStatus;
                return selectedCase;
            }).ToList();

        foreach (var selectedCase in selectedCases)
        {
            _caseRepository.Update(selectedCase);
        }
    }

    public async Task ClearAllInProgressOrSelectedCasesByDevice(Guid caseId, Guid crematorId, Guid facilityId)
    {
        var selectedCases = await _caseRepository.GetInProgressOrSelectedCasesByDevice(crematorId);
        var readyToCremateStatus = _facilityStatusRepository.GetReadyToCremateFacilityStatus(facilityId);

        var casesToUpdate = selectedCases
            .Where(selectedCase => selectedCase.Id != caseId)
            .Select(selectedCase =>
            {
                selectedCase.FacilityStatusId = readyToCremateStatus.Id;
                selectedCase.FacilityStatus = readyToCremateStatus;
                return selectedCase;
            }).ToList();

        foreach (var selectedCase in selectedCases)
        {
            _caseRepository.Update(selectedCase);
        }
    }

    public async Task<bool> CheckIfDeviceHasCaseInProgress(Guid deviceId)
    {
        return await _caseRepository.CheckIfDeviceHasCaseInProgress(deviceId);
    }

    public async Task<DeviceStatusType> GetDeviceStatus(Guid deviceId)
    {
        var hasSelectedCase = await _caseRepository.CheckIfDeviceHasCaseSelected(deviceId);
        var hasInProgressCase = await _caseRepository.CheckIfDeviceHasCaseInProgress(deviceId);

        if (!hasSelectedCase && !hasInProgressCase)
        {
            return DeviceStatusType.EMPTY;
        }
        else if (!hasSelectedCase && hasInProgressCase)
        {
            return DeviceStatusType.HAS_IN_PROGRESS;
        }
        else if (hasSelectedCase && !hasInProgressCase)
        {
            return DeviceStatusType.HAS_SELECTED;
        }
        else
        {
            return DeviceStatusType.HAS_IN_PROGRESS_AND_SELECTED;
        }

    }

    public async Task ClearAllInProgressCasesByDevice(CaseFromFlexyDto startOrSelectCase)
    {
        IEnumerable<Case> inProgressCases = await _caseRepository.GetInProgressCasesByDevice(startOrSelectCase.CREMATOR_ID);
        var readyToCremateStatus = _facilityStatusRepository.GetReadyToCremateFacilityStatus(startOrSelectCase.FACILITY_ID);

        var casesToUpdate = inProgressCases
            .Where(selectedCase => selectedCase.Id != startOrSelectCase.LOADED_ID)
            .Select(selectedCase =>
            {
                selectedCase.FacilityStatusId = readyToCremateStatus.Id;
                selectedCase.FacilityStatus = readyToCremateStatus;
                return selectedCase;
            }).ToList();

        foreach (var inProgressCase in inProgressCases)
        {
            inProgressCase.FacilityStatusId = _facilityStatusRepository.GetReadyToCremateFacilityStatus(startOrSelectCase.FACILITY_ID).Id;
            inProgressCase.FacilityStatus = _facilityStatusRepository.GetReadyToCremateFacilityStatus(startOrSelectCase.FACILITY_ID);
            _caseRepository.Update(inProgressCase);
        }
    }

    public async Task UpdateCaseButNotChangeStatus(CaseFromFlexyDto dto)
    {
        if (dto.LOADED_ID == Guid.Empty)
        {
            return;
        }

        Case entity = _caseRepository.GetById(dto.LOADED_ID);

        if (entity is null)
        {
            return;
        }
        else
        {
            entity = RemapCaseFromDto(entity, dto);
        }

        DeviceDto cremator = null;
        List<DeviceDto> cremators = (await _caseI4CHttpClientService.GetAllDevicesAsync()).ToList();
        cremator = cremators.FirstOrDefault(c => c.id == dto.CREMATOR_ID);

        entity.ScheduledDeviceAlias = cremator is not null ? cremator.alias : string.Empty;
        entity.PerformedBy = dto.User;

        try
        {
            // Detach the existing entity if it is being tracked
            var trackedEntity = _caseRepository.GetTrackedEntity(dto.LOADED_ID);
            if (trackedEntity != null)
            {
                _caseRepository.Detach(trackedEntity);
            }
            Update(entity);
        }
        catch (Exception ex)
        {
            throw;
        }
    }

    //public static string UTF8toASCII(string text)
    //{
    //    System.Text.Encoding utf8 = System.Text.Encoding.UTF8;
    //    Byte[] encodedBytes = utf8.GetBytes(text);
    //    Byte[] convertedBytes =
    //            Encoding.Convert(Encoding.UTF8, Encoding.ASCII, encodedBytes);
    //    System.Text.Encoding ascii = System.Text.Encoding.ASCII;

    //    return ascii.GetString(convertedBytes);
    //}
}

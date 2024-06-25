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
using System.Text;
using System.Threading.Tasks;

namespace MatthewsApp.API.Services;

public interface ICasesService
{
    void Create(Case caseEntity);
    void Delete(Case caseEntity);
    void Update(Case caseEntity);
    Task<IEnumerable<Case>> GetAll();
    Task<Case> GetById(Guid id);
    bool IsCaseExists(Guid id);
    Task<IEnumerable<Case>> GetUnscheduledCases();
    Task<IEnumerable<Case>> GetScheduledCasesByDay(Guid facilityId, DateTime date);
    Task<IEnumerable<Case>> GetScheduledCasesByWeek(Guid facilityId, DateTime dateStartDateOfWeek);
    Task<IEnumerable<Case>> GetAllCasesByFacility(Guid facilityId);
    Task<IEnumerable<Case>> GetScheduledCasesByTimePeriod(Guid facilityId, DateTime dateStart, DateTime dateEnd);
    Task<Tuple<Case, bool>> UpdateCaseWhenCaseStart(StartCaseDto dto);
    void UpdateCaseWhenCaseEnd(EndCaseDto dto);
    Task<Case> GetNextCaseForDevice(Guid deviceId);
    Task<IEnumerable<Case>> GetReadyCasesByDevice(Guid deviceId);
    Task<bool> ResetDemo();
}

public class CasesService : ICasesService
{
    private readonly ICaseI4cHttpClientService _caseI4CHttpClientService;
    private readonly ICaseRepository _caseRepository;
    private readonly ILogger<CasesService> _logger;
    private readonly CaseHub _caseHub;
    private IEventAggregator _ea;

    public CasesService(ICaseRepository repository, IEventAggregator ea, CaseHub caseHub, ICaseI4cHttpClientService caseI4CHttpClientService, ILogger<CasesService> logger)
    {
        _caseI4CHttpClientService = caseI4CHttpClientService;
        _caseRepository = repository;
        _caseHub = caseHub;
        _logger = logger;
        _ea = ea;
    }

    public void Create(Case entity)
    {
        if (entity.FacilityStatusId == Guid.Empty)
        {
            entity.FacilityStatusId = null;
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
        ids.Add(entity.Id);

        // Send event
        SendEventToHostedService(entity, ids);

        // SignalR
        _caseHub.SendMessageToRefreshList($"Delete done.");
    }

    public void Update(Case entity)
    {
        _logger.LogDebug("Update of case id");
        Case previousCase = _caseRepository.GetById(entity.Id);

        //entity.FirstName = UTF8toASCII(entity.FirstName);
        //entity.LastName = UTF8toASCII(entity.LastName);
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
    }

    public async Task<Tuple<Case, bool>> UpdateCaseWhenCaseStart(StartCaseDto dto)
    {
        Case entity;
        bool entityDoesNotExistInDb = false;
        if (dto.LOADED_ID == null || dto.LOADED_ID == Guid.Empty)
        {
            entity = MakeNewCaseFromDto(dto);
            entityDoesNotExistInDb = true;
            entity.Status = CaseStatus.READY_TO_CREMATE;
        }
        else
        {
            entity = _caseRepository.GetById(dto.LOADED_ID ?? Guid.Empty);
            if (entity is null)
            {
                entity = MakeNewCaseFromDto(dto);
                entityDoesNotExistInDb = true;
            }
            entity.Status = CaseStatus.IN_PROGRESS;
        }

        entity.ActualStartTime = dto.StartTime;
        entity.ActualFacility = dto.FACILITY_ID;
        entity.ActualDevice = dto.CREMATOR_ID;

        DeviceDto cremator = null;

        List<DeviceDto> cremators = (await _caseI4CHttpClientService.GetAllDevicesAsync()).ToList();
        cremator = cremators.FirstOrDefault(c => c.id == dto.CREMATOR_ID);

        entity.ScheduledDeviceAlias = cremator is not null ? cremator.alias : string.Empty;
        entity.PerformedBy = dto.User;

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

    private Case MakeNewCaseFromDto(StartCaseDto dto)
    {
        Case entity = new Case();
        entity.Id = dto.LOADED_ID ?? Guid.NewGuid();
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

    public async void UpdateCaseWhenCaseEnd(EndCaseDto dto)
    {
        Case entity = _caseRepository.GetById(dto.COMPLETED_ID);
        if (entity == null) return;
        entity.ActualEndTime = dto.EndTime;
        entity.Fuel = dto.FuelUsed.ToString();
        entity.Electricity = dto.ElectricityUsed.ToString();
        entity.Status = CaseStatus.CREMATION_COMPLETE;
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

    public async Task<Case> GetById(Guid id)
    {
        try
        {
            Case Case = await _caseRepository.GetOne(id);
            Case.ScheduledStartTime = DateTime.SpecifyKind(Case.ScheduledStartTime is null ? DateTime.MinValue : Case.ScheduledStartTime.Value, DateTimeKind.Utc);
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

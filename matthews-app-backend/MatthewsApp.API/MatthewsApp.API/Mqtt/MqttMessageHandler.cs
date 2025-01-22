using Azure;
using MatthewsApp.API.Dtos;
using MatthewsApp.API.Enums;
using MatthewsApp.API.Models;
using MatthewsApp.API.Services;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Microsoft.Extensions.Logging;
using System;
using System.Text.Json;
using System.Threading.Tasks;

namespace MatthewsApp.API.Mqtt;

public class MqttMessageHandler
{
    //private readonly CaseHub _caseHub = default!;
    private ICasesService _casesService;
    private ILogger<CaseMqttService> _logger;
    private readonly CaseHub _caseHub;

    private MqttMessageType _mqttMessage;
    private DeviceStatusType _daviceStatus;
    private bool _doesPayloadCaseExistInDB;
    private string _receivedMessage;

    private Guid _caseId = Guid.Empty;
    private Guid _deviceId = Guid.Empty;

    private CaseFromFlexyDto _startOrSelectCase = null;
    private DeselectCaseFromFlexyDto _deselectCase = null;
    private EndCaseFromFlexyDto _endCase = null;

    private bool _messageIsValid = true;
    private Case _caseInDb = null;

    public MqttMessageHandler(string receivedMessage, ILogger<CaseMqttService> logger, ICasesService casesService, CaseHub caseHub)
    {
        _logger = logger;
        _casesService = casesService;
        _receivedMessage = receivedMessage;
        _caseHub = caseHub;
    }

    public async Task InitializeMessageHandlingAsync()
    {
        SetMessageType();
        DeserializePayloadToObject();
        await SetDeviceStatusAsync();
        await SetPayload();
    }

    private void SetMessageType()
    {
        if (_receivedMessage.Contains("CaseSelect"))
        {
            _mqttMessage = MqttMessageType.CaseSelect;
        }
        else if (_receivedMessage.Contains("CaseDeselect"))
        {
            _mqttMessage = MqttMessageType.CaseDeselect;
        }
        else if (_receivedMessage.Contains("CaseEnd"))
        {
            _mqttMessage = MqttMessageType.CaseEnd;
        }
        else if (_receivedMessage.Contains("CaseStart"))
        {
            _mqttMessage = MqttMessageType.CaseStart;
        }
        else
        {
            _messageIsValid = false;
            throw new ArgumentOutOfRangeException("Unknown message type");//TODO: bane: to remove this line
        }
    }

    private void DeserializePayloadToObject()
    {
        if (!_messageIsValid)
        {
            return;
        }
        //switch depends of _mqttMessage
        switch (_mqttMessage)
        {
            case MqttMessageType.CaseStart:
                _logger.LogInformation($"---------- Case Mqtt Service - Received CaseStart message");
                StartCasePayloadDto payloadStartCase = JsonSerializer.Deserialize<StartCasePayloadDto>(_receivedMessage);
                _startOrSelectCase = JsonSerializer.Deserialize<CaseFromFlexyDto>(payloadStartCase.CaseStart);
                break;
            case MqttMessageType.CaseEnd:
                _logger.LogInformation($"---------- Case Mqtt Service - Received CaseEnd message");
                EndCasePayloadDto payloadEndCase = JsonSerializer.Deserialize<EndCasePayloadDto>(_receivedMessage);
                _endCase = JsonSerializer.Deserialize<EndCaseFromFlexyDto>(payloadEndCase.CaseEnd);
                break;
            case MqttMessageType.CaseSelect:
                _logger.LogInformation($"---------- Case Mqtt Service - Received CaseSelect message");
                SelectCasePayloadDto payloadSelectCase = JsonSerializer.Deserialize<SelectCasePayloadDto>(_receivedMessage);
                _startOrSelectCase = JsonSerializer.Deserialize<CaseFromFlexyDto>(payloadSelectCase.CaseSelect);
                break;
            case MqttMessageType.CaseDeselect:
                _logger.LogInformation($"---------- Case Mqtt Service - Received CaseDeselect message");
                DeselectCasePayloadDto payloadCaseDeselect = JsonSerializer.Deserialize<DeselectCasePayloadDto>(_receivedMessage);
                _deselectCase = JsonSerializer.Deserialize<DeselectCaseFromFlexyDto>(payloadCaseDeselect.CaseDeselect);
                break;
        }
    }

    private async Task SetDeviceStatusAsync()
    {
        if (!_messageIsValid)
        {
            return;
        }

        if (_startOrSelectCase != null)
        {
            if (_startOrSelectCase.CREMATOR_ID == Guid.Empty)
            {
                _messageIsValid = false;
                return;
            }
            _caseId = _startOrSelectCase.LOADED_ID;
            _deviceId = _startOrSelectCase.CREMATOR_ID;
            _daviceStatus = await _casesService.GetDeviceStatus(_startOrSelectCase.CREMATOR_ID);
        }
        else if (_deselectCase != null)
        {
            Guid.TryParse(_deselectCase.LOADED_ID, out _caseId);
            if(_caseId == Guid.Empty)
            {
                _messageIsValid = false;
                return;
            }
            _deviceId = (Guid)(await _casesService.GetById(_caseId)).ScheduledDevice;
            _daviceStatus = await _casesService.GetDeviceStatus(_deviceId);
        }
        else if (_endCase != null)
        {
            if(_endCase.COMPLETED_ID == Guid.Empty)
            {
                _messageIsValid = false;
                return;
            }
            _caseId = _endCase.COMPLETED_ID;
            _deviceId = (Guid)(await _casesService.GetById(_caseId)).ScheduledDevice;
            _caseInDb = await _casesService.GetById(_caseId);
            _daviceStatus = await _casesService.GetDeviceStatus(_deviceId);
        }
        else
        {
            _messageIsValid = false;
            throw new ArgumentNullException("Case object is null");// TODO: bane: to remove this line
        }
    }

    private async Task SetPayload()
    {
        if (!_messageIsValid)
        {
            return;
        }

        if (_startOrSelectCase != null)
        {
            _caseInDb = await _casesService.GetById(_startOrSelectCase.LOADED_ID);
        }
        else if (_deselectCase != null)
        {
            Guid CaseId = Guid.Parse(_deselectCase.LOADED_ID);
            _caseInDb = await _casesService.GetById(CaseId);
        }
        else if (_endCase != null)
        {
            Guid CaseId = _endCase.COMPLETED_ID;
            _caseInDb = await _casesService.GetById(CaseId);
        }
        else
        {
            throw new ArgumentNullException("Case object is null");
        }

        _doesPayloadCaseExistInDB = _caseInDb != null;
    }

    public async Task Action()
    {
        if (!_messageIsValid)
        {
            return;
        }

        switch (_mqttMessage)
        {
            case MqttMessageType.CaseStart:
                if (_startOrSelectCase.LOADED_ID == Guid.Empty)
                {
                    _messageIsValid = false;
                    return;
                }
                await ActionCaseStart();
                break;

            case MqttMessageType.CaseEnd:
                if (_endCase.COMPLETED_ID == Guid.Empty)
                {
                    _messageIsValid = false;
                    return;
                }
                await ActionCaseEnd();
                break;

            case MqttMessageType.CaseSelect:
                if (_startOrSelectCase.LOADED_ID == Guid.Empty)
                {
                    _messageIsValid = false;
                    return;
                }
                await ActionCaseSelect();
                break;

            case MqttMessageType.CaseDeselect:
                if (_caseId == Guid.Empty)
                {
                    _messageIsValid = false;
                    return;
                }
                await ActionCaseDeselect();
                break;

            default:
                throw new ArgumentOutOfRangeException("Unknown message type");
        }

        SendSignalRMessageToRefreshTheList();
    }

    private async Task ActionCaseStart()
    {
        if (!_messageIsValid)
        {
            return;
        }

        switch (_daviceStatus)
        {
            case DeviceStatusType.EMPTY:
                Tuple<Case, bool> response = await _casesService.UpdateCaseWhenCaseStart(_startOrSelectCase);
                _caseHub.SendMessageToSelectCase($"CaseId: {_startOrSelectCase.LOADED_ID}; DeviceId: {_deviceId}");
                break;
            case DeviceStatusType.HAS_IN_PROGRESS:
                //if (_doesPayloadCaseExistInDB)
                //{
                //    // do nothing
                //}
                //else
                //{
                //    // previous set to READY_TO_CREMATE, new set to IN_PROGRESS
                //    await _casesService.ClearAllInProgressOrSelectedCasesByDevice(_startOrSelectCase); // Da li treba da se nesto salje na MOB APP?
                //    await _casesService.UpdateCaseWhenCaseStart(_startOrSelectCase); // Da li treba da se nesto salje na MOB APP?
                //}
                //_caseId = _startOrSelectCase.LOADED_ID;
                break;
            case DeviceStatusType.HAS_SELECTED:
                if (_doesPayloadCaseExistInDB)
                {
                    if(_caseInDb.Status == CaseStatus.SELECTED)
                    {
                        await _casesService.UpdateCaseWhenCaseStart(_startOrSelectCase);
                        
                    }
                    
                }
                else
                {
                    // do nothing
                }
                
                break;
            case DeviceStatusType.HAS_IN_PROGRESS_AND_SELECTED:
                await _casesService.ClearAllInProgressOrSelectedCasesByDevice(_startOrSelectCase);
                await _casesService.UpdateCaseWhenCaseStart(_startOrSelectCase);
                _caseHub.SendMessageToSelectCase($"CaseId: {_startOrSelectCase.LOADED_ID}; DeviceId: {_deviceId}");
                break;

        }
    }

    private async Task ActionCaseEnd()
    {
        if (!_messageIsValid)
        {
            return;
        }

        switch (_daviceStatus)
        {
            case DeviceStatusType.EMPTY:
                _casesService.UpdateCaseWhenCaseEnd(_endCase);
                break;
            case DeviceStatusType.HAS_IN_PROGRESS:
                _casesService.UpdateCaseWhenCaseEnd(_endCase);
                break;
            case DeviceStatusType.HAS_SELECTED:
                if (_doesPayloadCaseExistInDB && _caseInDb.Status == CaseStatus.SELECTED)
                {
                    _casesService.UpdateCaseWhenCaseEnd(_endCase);
                    _caseHub.SendMessageToSelectCase($"CaseId: {string.Empty}; DeviceId: {_deviceId}");
                }
                break;
            case DeviceStatusType.HAS_IN_PROGRESS_AND_SELECTED:
                await _casesService.ClearAllInProgressOrSelectedCasesByDevice(_endCase.COMPLETED_ID, _deviceId, (Guid)_caseInDb.ScheduledFacility);
                _casesService.UpdateCaseWhenCaseEnd(_endCase);
                _caseHub.SendMessageToSelectCase($"CaseId: {string.Empty}; DeviceId: {_deviceId}");
                break;

        }
    }

    private async Task ActionCaseSelect()
    {
        if (!_messageIsValid)
        {
            return;
        }

        switch (_daviceStatus)
        {
            case DeviceStatusType.EMPTY:
                Tuple<Case, bool> response = await _casesService.UpdateCaseWhenCaseSelect(_startOrSelectCase);
                _caseId = response.Item1.Id;
                _caseHub.SendMessageToSelectCase($"CaseId: {_caseId}; DeviceId: {_deviceId}");
                break;

            case DeviceStatusType.HAS_IN_PROGRESS:
                if (_doesPayloadCaseExistInDB)
                {
                    await _casesService.UpdateCaseButNotChangeStatus(_startOrSelectCase);
                }
                else
                {
                    // do nothing
                }
                break;

            case DeviceStatusType.HAS_SELECTED:
                await _casesService.ClearAllSelectedCasesByDevice(_startOrSelectCase);
                response = await _casesService.UpdateCaseWhenCaseSelect(_startOrSelectCase);
                _caseId = response.Item1.Id;
                _caseHub.SendMessageToSelectCase($"CaseId: {_caseId}; DeviceId: {_deviceId}");
                break;

            case DeviceStatusType.HAS_IN_PROGRESS_AND_SELECTED:
                await _casesService.ClearAllInProgressOrSelectedCasesByDevice(_startOrSelectCase);
                response = await _casesService.UpdateCaseWhenCaseSelect(_startOrSelectCase);
                _caseId = response.Item1.Id;
                _caseHub.SendMessageToSelectCase($"CaseId: {_caseId}; DeviceId: {_deviceId}");
                break;
        }

    }

    private async Task ActionCaseDeselect()
    {
        if (!_messageIsValid)
        {
            return;
        }

        switch (_daviceStatus)
        {
            case DeviceStatusType.EMPTY:
                _casesService.Deselect(_caseId); // set to READY_TO_CREMATE
                _caseHub.SendMessageToSelectCase($"CaseId: {string.Empty}; DeviceId: {_deviceId}");
                break;
            case DeviceStatusType.HAS_IN_PROGRESS:
                if (_doesPayloadCaseExistInDB)
                {
                    _casesService.Deselect(_caseId); // set to READY_TO_CREMATE
                    _caseHub.SendMessageToSelectCase($"CaseId: {string.Empty}; DeviceId: {_deviceId}");
                }
                else
                {
                    // do nothing
                }
                break;
            case DeviceStatusType.HAS_SELECTED:
                if (_doesPayloadCaseExistInDB)
                {
                    _casesService.Deselect(_caseId); // set to READY_TO_CREMATE
                    _caseHub.SendMessageToSelectCase($"CaseId: {string.Empty}; DeviceId: {_deviceId}");
                }
                else
                {
                    // do nothing
                }
                break;
            case DeviceStatusType.HAS_IN_PROGRESS_AND_SELECTED:
                _casesService.Deselect(_caseId); // set to READY_TO_CREMATE
                _caseHub.SendMessageToSelectCase($"CaseId: {string.Empty}; DeviceId: {_deviceId}");
                break;
        }

    }

    private void SendSignalRMessageToRefreshTheList()
    {
        _caseHub.SendMessageToRefreshList($"ClientId: {_caseId}");
    }
}

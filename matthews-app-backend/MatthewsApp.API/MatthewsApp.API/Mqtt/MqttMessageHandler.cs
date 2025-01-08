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
    private bool _isCaseSameAsInPayload;
    private string _receivedMessage;

    private Guid _caseId = Guid.Empty;
    private Guid _deviceId = Guid.Empty;

    private CaseFromFlexyDto _startOrSelectCase = null;
    private DeselectCaseFromFlexyDto _deselectCase = null;
    private EndCaseFromFlexyDto _endCase = null;

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
            throw new ArgumentOutOfRangeException("Unknown message type");
        }
    }

    private void DeserializePayloadToObject()
    {
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
        if (_startOrSelectCase != null)
        {
            _daviceStatus = await _casesService.GetDeviceStatus(_startOrSelectCase.CREMATOR_ID);
        }
        else if (_deselectCase != null)
        {
            _caseId = Guid.Parse(_deselectCase.LOADED_ID);
            _deviceId = (Guid)(await _casesService.GetById(_caseId)).ScheduledDevice;
            _daviceStatus = await _casesService.GetDeviceStatus(_deviceId);
        }
        else if (_endCase != null)
        {
            _caseId = _endCase.COMPLETED_ID;
            _deviceId = (Guid)(await _casesService.GetById(_caseId)).ScheduledDevice;
            _daviceStatus = await _casesService.GetDeviceStatus(_deviceId);
        }
        else
        {
            throw new ArgumentNullException("Case object is null");
        }
    }

    private async Task SetPayload()
    {
        Case caseInDb = null;
        if (_startOrSelectCase != null)
        {
            caseInDb = await _casesService.GetById(_startOrSelectCase.LOADED_ID);
        }
        else if (_deselectCase != null)
        {
            Guid CaseId = Guid.Parse(_deselectCase.LOADED_ID);
            caseInDb = await _casesService.GetById(CaseId);
        }
        else if (_endCase != null)
        {
            Guid CaseId = _endCase.COMPLETED_ID;
            caseInDb = await _casesService.GetById(CaseId);
        }
        else
        {
            throw new ArgumentNullException("Case object is null");
        }

        _isCaseSameAsInPayload = caseInDb != null;
    }

    public async Task Action()
    {
        switch (_mqttMessage)
        {
            case MqttMessageType.CaseStart:
                ActionCaseStart();
                break;

            case MqttMessageType.CaseEnd:
                ActionCaseEnd();
                break;

            case MqttMessageType.CaseSelect:
                await ActionCaseSelect();
                break;

            case MqttMessageType.CaseDeselect:
                await ActionCaseDeselect();
                break;

            default:
                throw new ArgumentOutOfRangeException("Unknown message type");
        }

        SendSignalRMessageToRefreshTheList();
    }

    private void ActionCaseStart()
    {
        switch (_daviceStatus)
        {

        }
    }

    private void ActionCaseEnd()
    {
        switch (_daviceStatus)
        {

        }
    }

    private async Task ActionCaseSelect()
    {
        switch (_daviceStatus)
        {
            case DeviceStatusType.EMPTY:
                Tuple<Case, bool> response = await _casesService.UpdateCaseWhenCaseSelect(_startOrSelectCase);
                _caseId = response.Item1.Id;
                break;

            case DeviceStatusType.HAS_IN_PROGRESS:
                if (_isCaseSameAsInPayload)
                {
                    await _casesService.UpdateCaseButNotChangeStatus(_startOrSelectCase);
                    _caseId = _startOrSelectCase.LOADED_ID;
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
                break;

            case DeviceStatusType.HAS_IN_PROGRESS_AND_SELECTED:
                await _casesService.ClearAllInProgressOrSelectedCasesByDevice(_startOrSelectCase);
                response = await _casesService.UpdateCaseWhenCaseSelect(_startOrSelectCase);
                _caseId = response.Item1.Id;
                break;
        }

        _caseHub.SendMessageToSelectCase($"CaseId: {_caseId}");
    }

    private async Task ActionCaseDeselect()
    {
        switch (_daviceStatus)
        {
            case DeviceStatusType.EMPTY:
                _casesService.Deselect(_caseId); // set to READY_TO_CREMATE
                break;
            case DeviceStatusType.HAS_IN_PROGRESS:
                if (_isCaseSameAsInPayload)
                {
                    _casesService.Deselect(_caseId); // set to READY_TO_CREMATE
                }
                else
                {
                    // do nothing
                }
                break;
            case DeviceStatusType.HAS_SELECTED:
                if (_isCaseSameAsInPayload)
                {
                    _casesService.Deselect(_caseId); // set to READY_TO_CREMATE
                }
                else
                {
                    // do nothing
                }
                break;
            case DeviceStatusType.HAS_IN_PROGRESS_AND_SELECTED:
                _casesService.Deselect(_caseId);
                break;
        }

        _caseHub.SendMessageToSelectCase($"CaseId: {string.Empty}");
    }

    private void SendSignalRMessageToRefreshTheList()
    {
        _caseHub.SendMessageToRefreshList($"ClientId: {_caseId}");
    }
}

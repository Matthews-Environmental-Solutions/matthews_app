using MatthewsApp.API.Dtos;
using MatthewsApp.API.Enums;
using MatthewsApp.API.Models;
using MatthewsApp.API.Services;
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
    private bool _isCaseInDB;
    private string _receivedMessage;

    private Guid _caseId = Guid.Empty;
    private Guid _deviceId = Guid.Empty;

    private CaseFromFlexyDto _caseFromFlexy = null;

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
        await CheckCaseInDb();
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
        else if (_receivedMessage.Contains("CaseRestart"))
        {
            _mqttMessage = MqttMessageType.CaseRestart;
        }
        else if (_receivedMessage.Contains("CaseRemove"))
        {
            _mqttMessage = MqttMessageType.CaseRemove;
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
                CaseStartPayloadDto payloadStartCase = JsonSerializer.Deserialize<CaseStartPayloadDto>(_receivedMessage);
                _caseFromFlexy = JsonSerializer.Deserialize<CaseFromFlexyDto>(payloadStartCase.CaseStart);
                break;
            case MqttMessageType.CaseEnd:
                _logger.LogInformation($"---------- Case Mqtt Service - Received CaseEnd message");
                CaseEndPayloadDto payloadEndCase = JsonSerializer.Deserialize<CaseEndPayloadDto>(_receivedMessage);
                _caseFromFlexy = JsonSerializer.Deserialize<CaseFromFlexyDto>(payloadEndCase.CaseEnd);
                break;
            case MqttMessageType.CaseSelect:
                _logger.LogInformation($"---------- Case Mqtt Service - Received CaseSelect message");
                CaseSelectPayloadDto payloadSelectCase = JsonSerializer.Deserialize<CaseSelectPayloadDto>(_receivedMessage);
                _caseFromFlexy = JsonSerializer.Deserialize<CaseFromFlexyDto>(payloadSelectCase.CaseSelect);
                break;
            case MqttMessageType.CaseDeselect:
                _logger.LogInformation($"---------- Case Mqtt Service - Received CaseDeselect message");
                CaseDeselectPayloadDto payloadCaseDeselect = JsonSerializer.Deserialize<CaseDeselectPayloadDto>(_receivedMessage);
                _caseFromFlexy = JsonSerializer.Deserialize<CaseFromFlexyDto>(payloadCaseDeselect.CaseDeselect);
                break;
            case MqttMessageType.CaseRestart:
                _logger.LogInformation($"---------- Case Mqtt Service - Received CaseRestart message");
                CaseRestartPayloadDto payloadCaseRestart = JsonSerializer.Deserialize<CaseRestartPayloadDto>(_receivedMessage);
                _caseFromFlexy = JsonSerializer.Deserialize<CaseFromFlexyDto>(payloadCaseRestart.CaseRestart);
                break;
            case MqttMessageType.CaseRemove:
                _logger.LogInformation($"---------- Case Mqtt Service - Received CaseRemove message");
                CaseRemovePayloadDto payloadCaseRemove = JsonSerializer.Deserialize<CaseRemovePayloadDto>(_receivedMessage);
                _caseFromFlexy = JsonSerializer.Deserialize<CaseFromFlexyDto>(payloadCaseRemove.CaseRemove);
                break;
        }

        if (_caseFromFlexy != null)
        {
            if (_caseFromFlexy.LOADED_ID == Guid.Empty)
            {
                _messageIsValid = false;
                return;
            }
            if (_caseFromFlexy.CREMATOR_ID == Guid.Empty)
            {
                _messageIsValid = false;
                return;
            }
            _caseId = _caseFromFlexy.LOADED_ID;
            _deviceId = _caseFromFlexy.CREMATOR_ID;
        }
    }

    private async Task CheckCaseInDb()
    {
        if (!_messageIsValid)
        {
            return;
        }

        if (_caseFromFlexy != null)
        {
            _caseInDb = await _casesService.GetById(_caseFromFlexy.LOADED_ID);
        }
        else
        {
            throw new ArgumentNullException("Case object is null");
        }

        _isCaseInDB = _caseInDb != null;
    }

    public async Task Action()
    {
        if (_caseFromFlexy.LOADED_ID == Guid.Empty)
        {
            _messageIsValid = false;
            return;
        }

        if (!_messageIsValid)
        {
            return;
        }

        await FixIfDeviceHasAnyPreviousCase();

        switch (_mqttMessage)
        {
            case MqttMessageType.CaseStart:
                await ActionCaseStart();
                break;

            case MqttMessageType.CaseEnd:
                await ActionCaseEnd();
                break;

            case MqttMessageType.CaseSelect:
                await CheckIfDeviceHasAnySelectedCase();
                await ActionCaseSelect();
                break;

            case MqttMessageType.CaseDeselect:
                await ActionCaseDeselect();
                break;

            case MqttMessageType.CaseRestart:
                await ActionCaseRestart();
                break;

            case MqttMessageType.CaseRemove:
                await ActionCaseRemove();
                break;

            default:
                throw new ArgumentOutOfRangeException("Unknown message type");
        }

        SendSignalRMessageToRefreshTheList();
    }

    private async Task CheckIfDeviceHasAnySelectedCase()
    {
        if (!_messageIsValid)
        {
            return;
        }

        await _casesService.FixAllPreviousSelectedCasesByDevice(_caseId, _deviceId, _caseFromFlexy.FACILITY_ID);
    }

    private async Task FixIfDeviceHasAnyPreviousCase()
    {
        if (!_messageIsValid)
        {
            return;
        }

        await _casesService.FixAllPreviousCasesInProgressOrCycleCompleteByDevice(_caseId, _deviceId, _caseFromFlexy.FACILITY_ID);
        await _casesService.FixSelectedCasesesInReadyToCreateByDevice(_caseId, _deviceId, _caseFromFlexy.FACILITY_ID);
    }

    private async Task ActionCaseStart()
    {
        if (!_messageIsValid)
        {
            return;
        }

        Case response = await _casesService.UpdateCaseWhenCaseStart(_caseFromFlexy);
        _caseHub.SendMessageToSelectCase($"CaseId: {_caseFromFlexy.LOADED_ID}; DeviceId: {_deviceId}; ActualStartTime: {response.ActualStartTime}; ActualEndTime: {string.Empty}");
    }

    private async Task ActionCaseEnd()
    {
        if (!_messageIsValid)
        {
            return;
        }

        Case response = await _casesService.UpdateCaseWhenCaseEnd(_caseFromFlexy);
        _caseHub.SendMessageToSelectCase($"CaseId: {_caseFromFlexy.LOADED_ID}; DeviceId: {_deviceId}; ActualStartTime: {response.ActualStartTime}; ActualEndTime: {response.ActualEndTime}");
    }

    private async Task ActionCaseSelect()
    {
        if (!_messageIsValid)
        {
            return;
        }

        Case response = await _casesService.UpdateCaseWhenCaseSelect(_caseFromFlexy);
        _caseId = response.Id;
        _caseHub.SendMessageToSelectCase($"CaseId: {_caseId}; DeviceId: {_deviceId}; ActualStartTime: {string.Empty}; ActualEndTime: {string.Empty}");
    }

    private async Task ActionCaseDeselect()
    {
        if (!_messageIsValid)
        {
            return;
        }

        _casesService.UpdateCaseWhenCaseDeselect(_caseId, false);
        _caseHub.SendMessageToSelectCase($"CaseId: {string.Empty}; DeviceId: {_deviceId}; ActualStartTime: {string.Empty}; ActualEndTime: {string.Empty}");
    }

    private async Task ActionCaseRestart()
    {
        if (!_messageIsValid)
        {
            return;
        }

        Case response = await _casesService.UpdateCaseWhenCaseRestart(_caseFromFlexy);
        _caseHub.SendMessageToSelectCase($"CaseId: {_caseFromFlexy.LOADED_ID}; DeviceId: {_deviceId}; ActualStartTime: {response.ActualStartTime}; ActualEndTime: {string.Empty}");
    }

    private async Task ActionCaseRemove()
    {
        if (!_messageIsValid)
        {
            return;
        }

        Case response = await _casesService.UpdateCaseWhenCaseRemove(_caseFromFlexy);
        _caseHub.SendMessageToSelectCase($"CaseId: {string.Empty}; DeviceId: {_deviceId}; ActualStartTime: {response.ActualStartTime}; ActualEndTime: {response.ActualEndTime}");
    }

    private void SendSignalRMessageToRefreshTheList()
    {
        _caseHub.SendMessageToRefreshList($"ClientId: {_caseId}", _caseFromFlexy.FACILITY_ID.ToString());
    }
}

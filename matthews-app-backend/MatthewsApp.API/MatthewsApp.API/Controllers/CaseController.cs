using MatthewsApp.API.Dtos;
using MatthewsApp.API.Mappers;
using MatthewsApp.API.Models;
using MatthewsApp.API.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MatthewsApp.API.Controllers;

[Route("[controller]")]
[ApiController]
public class CaseController : ControllerBase
{
    private readonly ICasesService service;
    private readonly ILogger<CaseController> _logger;

    public CaseController(ICasesService service, ILogger<CaseController> logger)
    {
        this.service = service;
        _logger = logger;
    }

    [HttpPost]
    [Route("Save")]
    public async Task<ActionResult<Case>> PostCase([FromBody]CaseDto caseDto)
    {
        _logger.LogInformation("---------- Save");
        try
        {
            var caseEntity = caseDto.ToEntity();
            caseEntity.Id = Guid.NewGuid();
            await service.Create(caseEntity);
            caseEntity.ScheduledStartTime = DateTime.SpecifyKind(caseEntity.ScheduledStartTime is null ? DateTime.MinValue : caseEntity.ScheduledStartTime.Value, DateTimeKind.Utc);
            return CreatedAtAction(nameof(PostCase), new { id = caseEntity.Id }, caseEntity);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCase(string id)
    {
        if (!Guid.TryParse(id, out var idParsed))
        {
            return BadRequest();
        }

        Case caseEntity = await service.GetById(idParsed);
        if (caseEntity == null)
        {
            return NotFound();
        }
        caseEntity.ScheduledStartTime = DateTime.SpecifyKind(caseEntity.ScheduledStartTime is null ? DateTime.MinValue : caseEntity.ScheduledStartTime.Value, DateTimeKind.Utc);
        service.Delete(caseEntity);
        return Ok();
    }

    [HttpPut]
    [Route("Update")]
    public async Task<ActionResult> Update([FromBody] CaseDto caseDto)
    {
        _logger.LogInformation("---------- Update");
        try
        {
            await service.Update(caseDto.ToEntity());
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!service.IsCaseExists(caseDto.Id))
            {
                return NotFound();
            }
            return BadRequest();
        }
        return Ok(caseDto.Id);
    }

    [HttpPut]
    [Route("Select")]
    public ActionResult Select([FromBody] Guid caseId)
    {
        _logger.LogInformation("---------- Select");
        try
        {
            service.Select(caseId);
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!service.IsCaseExists(caseId))
            {
                return NotFound();
            }
            return BadRequest();
        }
        return Ok(caseId);
    }

    [HttpPut]
    [Route("Deselect")]
    public async Task<ActionResult> Deselect([FromBody] Guid caseId)
    {
        _logger.LogInformation("---------- Deselect");
        try
        {
            await service.UpdateCaseWhenCaseDeselect(caseId, true);
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!service.IsCaseExists(caseId))
            {
                return NotFound();
            }
            return BadRequest();
        }
        return Ok(caseId);
    }

    [HttpGet]
    [Route("GetReadyCasesByDevice/{deviceId}")]
    public async Task<ActionResult<IEnumerable<CaseDto>>> GetReadyCasesByDevice(Guid deviceId)
    {
        _logger.LogInformation("---------- GetReadyCasesByDevice {deviceId}", deviceId);
        try
        {
            return Ok((await service.GetReadyCasesByDevice(deviceId)).ToDTOs());
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpGet]
    [Route("GetSelectCaseByDevice/{deviceId}")]
    public async Task<ActionResult<CaseDto>> GetSelectCaseByDevice(Guid deviceId)
    {
        _logger.LogInformation("---------- GetReadyCasesByDevice {deviceId}", deviceId);
        try
        {
            return Ok((await service.GetSelectCaseByDevice(deviceId)).ToDTO());
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpGet]
    [Route("GetScheduledCasesByDay/{facilityId}/{date}")]
    public async Task<ActionResult<IEnumerable<CaseDto>>> GetScheduledCasesByDay(Guid facilityId, DateTime date)
    {
        _logger.LogInformation("---------- GetScheduledCasesByDay {facilityId} and {date}", facilityId, date);
        try
        {
            return Ok((await service.GetScheduledCasesByDay(facilityId, date)).ToDTOs());
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpGet]
    [Route("GetScheduledCasesByWeek/{facilityId}/{dateStartDateOfWeek}")]
    public async Task<ActionResult<IEnumerable<CaseDto>>> GetScheduledCasesByWeek(Guid facilityId, DateTime dateStartDateOfWeek)
    {
        _logger.LogInformation("---------- GetScheduledCasesByWeek {facilityId} and {dateStartDateOfWeek}", facilityId, dateStartDateOfWeek);
        try
        {
            return Ok((await service.GetScheduledCasesByWeek(facilityId, dateStartDateOfWeek)).ToDTOs());
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpGet]
    [Route("GetScheduledCasesByTimePeriod/{facilityId}/{dateStart}/{dateEnd}")]
    public async Task<ActionResult<IEnumerable<CaseDto>>> GetScheduledCasesByTimePeriod(Guid facilityId, DateTime dateStart, DateTime dateEnd)
    {
        _logger.LogInformation("---------- GetScheduledCasesByTimePeriod {facilityId} and {dateStart} - {dateEnd}", facilityId, dateStart, dateEnd);
        try
        {
            return Ok((await service.GetScheduledCasesByTimePeriod(facilityId, dateStart, dateEnd)).ToDTOs());
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost]
    [Route("GetUnscheduledCases")]
    public async Task<ActionResult<IEnumerable<CaseDto>>> GetUnscheduledCases([FromBody] List<FacilityDto> Facilities)
    {
        _logger.LogInformation("---------- GetUnscheduledCases");
        try
        {
            var facilityIds = Facilities.Select(f => f.id).ToList();
            return Ok((await service.GetUnscheduledCases(facilityIds)).ToDTOs());
        }
        catch (Exception ex)
        {

            return BadRequest(ex.Message);
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<CaseDto>> GetCase(Guid id)
    {
        _logger.LogInformation("---------- GetCase {id}", id);

        Case Case = await service.GetById(id);

        if (Case == null)
        {
            return NotFound();
        }
        return Ok(Case.ToDTO());
    }

    [HttpGet("GetNextCaseForDevice/{deviceId}")]
    public async Task<ActionResult<CaseDto>> GetNextCaseForDevice(Guid deviceId)
    {
        _logger.LogInformation("---------- GetNextCaseForDevice {deviceId}", deviceId);

        Case Case = await service.GetNextCaseForDevice(deviceId);

        if (Case == null)
        {
            return NotFound();
        }
        return Ok(Case.ToDTO());
    }

    [HttpGet("GetCaseStatuses")]
    public async Task<ActionResult<IEnumerable<CaseStatusDto>>> GetCaseStatuses()
    {
        _logger.LogInformation("---------- GetCaseStatuses");

        try
        {
            return Ok(await service.GetCaseStatuses());
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpGet("ResetDemo")]
    public async Task<ActionResult<bool>> ResetDemo()
    {
        _logger.LogInformation("---------- RESET DEMO");

        try
        {
            _ = await service.ResetDemo();
            _logger.LogInformation("---------- RESET DEMO successfull");
            return Ok(true);
        }
        catch (Exception ex)
        {
            _logger.LogError($"---------- RESET DEMO error: {ex.Message}: {ex.StackTrace}");
            return BadRequest(ex.Message);
        }

    }
}

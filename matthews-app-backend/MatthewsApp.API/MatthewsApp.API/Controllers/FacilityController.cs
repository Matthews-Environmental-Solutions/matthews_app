using MatthewsApp.API.Dtos;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using System;
using Microsoft.Extensions.Logging;
using MatthewsApp.API.Services;

namespace MatthewsApp.API.Controllers;

[Route("[controller]")]
[ApiController]
public class FacilityController : ControllerBase
{
    private readonly ILogger<CaseController> _logger;
    private readonly IFacilityService _facilityService;
    private readonly ICommunicationService _communicationService;

    public FacilityController(ILogger<CaseController> logger, IFacilityService service, ICommunicationService communicationService)
    {
        _logger = logger;
        _facilityService = service;
        _communicationService = communicationService;
    }

    //"gruop name is the guid of the facility"
    [HttpGet]
    [Route("SubscribeToGroup/{group}")]
    public Task<ResponseCommunicationDto> SubscribeToGroup(string group)
    {
        return _communicationService.SubscribeToGroup(group);
    }

    //"gruop name is the guid of the facility"
    [HttpGet]
    [Route("UnsubscribeFromGroup/{group}")]
    public async Task<ResponseCommunicationDto> UnsubscribeFromGroup(string group)
    {
        return await _communicationService.UnsubscribeFromGroup(group);
    }

    [HttpPost]
    [Route("GetFacilities")]
    public async Task<ActionResult<IEnumerable<FacilityUsabilityDto>>> GetFacilities([FromBody] List<FacilityDto> Facilities)
    {
        _logger.LogInformation("---------- GetFacilities ");
        try
        {
            return Ok((await _facilityService.GetFacilities(Facilities)));
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }
}

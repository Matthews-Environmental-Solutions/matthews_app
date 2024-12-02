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
public class FacilityController : Controller
{
    private readonly ILogger<CaseController> _logger;
    private readonly IFacilityService _facilityService;

    public FacilityController(ILogger<CaseController> logger, IFacilityService service)
    {
        _logger = logger;
        _facilityService = service;
    }

    [HttpGet]
    [Route("GetFacilities")]
    public async Task<ActionResult<IEnumerable<FacilityUsabilityDto>>> GetFacilities()
    {
        _logger.LogInformation("---------- GetFacilities ");
        try
        {
            return Ok((await _facilityService.GetFacilities()));
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }
}

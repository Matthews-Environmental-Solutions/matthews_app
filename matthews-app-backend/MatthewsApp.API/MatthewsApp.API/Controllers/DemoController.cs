using MatthewsApp.API.Dtos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.Threading.Tasks;
using System;

namespace MatthewsApp.API.Controllers;

[Route("[controller]")]
[ApiController]
public class DemoController : ControllerBase
{
    private readonly ILogger<DemoController> _logger;
    private readonly IConfiguration _configuration;

    public DemoController(ILogger<DemoController> logger, IConfiguration configuration)
    {
        _logger = logger;
        _configuration = configuration;
    }

    [HttpGet]
    [Route("IsUseDemoEntitiesOnly")]
    public async Task<ActionResult<bool>> IsUseDemoEntitiesOnly()
    {
        _logger.LogInformation("---------- IsUseDemoEntitiesOnly");
        try
        {
            bool result = _configuration.GetValue<bool>("useDemoEntitiesOnly");
            return Ok(new { useDemoEntitiesOnly = result });
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }
}

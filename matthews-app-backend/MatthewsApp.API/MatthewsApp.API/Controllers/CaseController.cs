using MatthewsApp.API.Dtos;
using MatthewsApp.API.Mappers;
using MatthewsApp.API.Models;
using MatthewsApp.API.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MatthewsApp.API.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class CaseController : Controller
    {
        private readonly ICasesService service;
        public CaseController(ICasesService service)
        {
            this.service = service;
        }

        [HttpPost]
        [Route("Save")]
        public ActionResult<Case> PostCase([FromBody]CaseDto caseDto)
        {
            try
            {
                var caseEntity = caseDto.ToEntity();
                caseEntity.Id = Guid.NewGuid();
                service.CreateCase(caseEntity);

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

            Case caseEntitry = await service.GetCaseById(idParsed);
            if (caseEntitry == null)
            {
                return NotFound();
            }

            service.DeleteCase(caseEntitry);
            return Ok();
        }

        [HttpPut]
        [Route("Update")]
        public ActionResult PutCase([FromBody] CaseDto caseDto)
        {
            try
            {
                service.UpdateCase(caseDto.ToEntity());
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

        [HttpGet]
        [Route("GetAllCases")]
        public async Task<ActionResult<IEnumerable<Case>>> GetAllCases()
        {
            
            try
            {
                return Ok(await service.GetAllCases());
            }
            catch (Exception ex)
            {

                return BadRequest(ex.Message);
            }
        }

        [HttpGet]
        [Route("GetScheduledCasesByDay/{facilityId}/{date}")]
        public async Task<ActionResult<IEnumerable<Case>>> GetScheduledCasesByDay(Guid facilityId, DateTime date)
        {
            try
            {
                return Ok(await service.GetScheduledCasesByDay(facilityId, date));
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet]
        [Route("GetScheduledCasesByWeek/{facilityId}/{dateStartDateOfWeek}")]
        public async Task<ActionResult<IEnumerable<Case>>> GetScheduledCasesByWeek(Guid facilityId, DateTime dateStartDateOfWeek)
        {
            try
            {
                return Ok(await service.GetScheduledCasesByWeek(facilityId, dateStartDateOfWeek));
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet]
        [Route("GetUnscheduledCases")]
        public async Task<ActionResult<IEnumerable<Case>>> GetUnscheduledCases()
        {
            return Ok(await service.GetUnscheduledCases());
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Case>> GetCase(string id)
        {
            if (!Guid.TryParse(id, out var idParsed))
            {
                return BadRequest();
            }

            Case announcement = await service.GetCaseById(idParsed);

            if (announcement == null)
            {
                return NotFound();
            }
            return Ok(announcement);
        }
    }
}

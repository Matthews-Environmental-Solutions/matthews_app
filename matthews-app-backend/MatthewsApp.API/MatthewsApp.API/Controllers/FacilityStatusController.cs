using MatthewsApp.API.Dtos;
using MatthewsApp.API.Models;
using MatthewsApp.API.Services;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using System;
using MatthewsApp.API.Mappers;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;

namespace MatthewsApp.API.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class FacilityStatusController : Controller
    {
        private readonly IFacilityStatusService service;

        public FacilityStatusController(IFacilityStatusService service)
        {
            this.service = service;
        }

        [HttpPost]
        [Route("Create")]
        public ActionResult<FacilityStatusDto> Create([FromBody] FacilityStatusDto dto)
        {
            try
            {
                var entity = dto.ToEntity();
                entity.Id = Guid.NewGuid();
                service.Create(entity);

                return CreatedAtAction(nameof(Create), new { id = entity.Id }, entity.ToDTO());
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            if (!Guid.TryParse(id, out var idParsed))
            {
                return BadRequest();
            }

            FacilityStatus caseEntitry = await service.GetById(idParsed);
            if (caseEntitry == null)
            {
                return NotFound();
            }

            service.Delete(caseEntitry);
            return Ok();
        }

        [HttpPut]
        [Route("Update")]
        public ActionResult<FacilityStatusDto> Update([FromBody] FacilityStatusDto dto)
        {
            try
            {
                service.Update(dto.ToEntity());
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!service.IsFacilityStatusExists(dto.Id))
                {
                    return NotFound();
                }
                return BadRequest();
            }
            return Ok(dto);
        }

        [HttpGet]
        [Route("GetFacilityStatusesByFacility/{facilityId}")]
        public async Task<ActionResult<IEnumerable<FacilityStatus>>> GetScheduledCasesByDay(Guid facilityId)
        {
            try
            {
                return Ok(await service.GetAllByFacility(facilityId));
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}

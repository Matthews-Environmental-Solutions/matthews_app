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
        public ActionResult<Case> PostCase(Case caseEntity)
        {
            service.CreateCase(caseEntity);

            return CreatedAtAction(nameof(PostCase), new { id = caseEntity.Id }, caseEntity);
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

        [HttpPut("{id}")]
        public ActionResult PutCase(Guid id, Case caseEntitry)
        {
            if (id != caseEntitry.Id)
            {
                return BadRequest();
            }
            try
            {
                service.UpdateCase(caseEntitry);
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!service.IsCaseExists(id))
                {
                    return NotFound();
                }
            }
            return Ok(caseEntitry.Id);
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

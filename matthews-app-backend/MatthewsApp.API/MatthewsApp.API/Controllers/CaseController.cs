using MatthewsApp.API.Models;
using MatthewsApp.API.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
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
            if (!int.TryParse(id, out var idParsed))
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
        public ActionResult PutCase(int id, Case caseEntitry)
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
        public async Task<ActionResult<IEnumerable<Case>>> GetAllCases()
        {
            return Ok(await service.GetAllCases());
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Case>> GetCase(string id)
        {
            if (!int.TryParse(id, out var idParsed))
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

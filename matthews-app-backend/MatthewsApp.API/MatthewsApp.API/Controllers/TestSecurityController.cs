using Microsoft.AspNetCore.Mvc;

namespace MatthewsApp.API.Controllers;

using Extensions;
[ApiController]
[Route("[controller]")]
public class TestSecurityController : ControllerBase
{
    [HttpGet(Name = "SubjectId")]
    public string GetSubjectId()
    {
        return User.GetSubjectId();
    }
}

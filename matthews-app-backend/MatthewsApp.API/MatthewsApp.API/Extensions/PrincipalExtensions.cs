using System;
using System.Security.Claims;
using System.Security.Principal;

namespace MatthewsApp.API.Extensions
{
    public static class PrincipalExtensions
    {
        public static string GetSubjectId(this IPrincipal principal)
        {
            var id = principal.Identity as ClaimsIdentity;
            var claim = id.FindFirst("sub");

            if (claim == null) throw new InvalidOperationException("sub claim is missing");
            return claim.Value;
        }
    }
}

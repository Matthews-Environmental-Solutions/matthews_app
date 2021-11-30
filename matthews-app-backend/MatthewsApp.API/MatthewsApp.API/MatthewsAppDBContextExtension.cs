using MatthewsApp.API.Models;
using System.Collections.Generic;
using System.Linq;

namespace MatthewsApp.API
{
    public static class MatthewsAppDBContextExtension
    {
        public static void FillInitialData(this MatthewsAppDBContext matthewsAppDBContext)
        {
            if (matthewsAppDBContext.Cases.Any())
            {
                return;
            }

            var cases = new List<Case>()
            {
                new Case(){CaseId= "1",ContainerSize="Medium",CaseName="Klara",ContainerType= "Wooden caret", Gender="Female",Weight=320 },
                new Case(){CaseId= "2",ContainerSize="Large",CaseName="Pista",ContainerType= "Iron box", Gender="Male",Weight=960 },
                new Case(){CaseId= "3",ContainerSize="Medium",CaseName="Mikols",ContainerType= "Wooden caret", Gender="Male",Weight=444}
            };

            matthewsAppDBContext.AddRange(cases);
            matthewsAppDBContext.SaveChanges();
        }
    }
}

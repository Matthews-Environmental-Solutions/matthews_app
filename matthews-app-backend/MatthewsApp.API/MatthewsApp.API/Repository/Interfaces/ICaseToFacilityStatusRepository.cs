using MatthewsApp.API.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MatthewsApp.API.Repository.Interfaces;

public interface ICaseToFacilityStatusRepository
{
    CaseToFacilityStatus Add(CaseToFacilityStatus status);
    void Delete(CaseToFacilityStatus status);
    void Update(CaseToFacilityStatus status);
}

using MatthewsApp.API.Dtos;
using MatthewsApp.API.Enums;
using MatthewsApp.API.Models;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MatthewsApp.API.Services;

public interface IFacilityService
{
    Task<IEnumerable<FacilityUsabilityDto>> GetFacilities(List<FacilityDto> Facilities);
    Task<IEnumerable<FacilityUsabilityDto>> GetFacilities();
}

public class FacilityService : IFacilityService
{
    private readonly ILogger<FacilityService> _logger;
    private readonly IFacilityStatusService _facilityStatusService;
    private readonly ICaseI4cHttpClientService _caseI4cHttpClientService;

    public FacilityService(ILogger<FacilityService> logger, IFacilityStatusService facilityStatusService, ICaseI4cHttpClientService caseI4cHttpClientService)
    {
        _logger = logger;
        _facilityStatusService = facilityStatusService;
        _caseI4cHttpClientService = caseI4cHttpClientService;
    }

    public async Task<IEnumerable<FacilityUsabilityDto>> GetFacilities()
    {
        List<FacilityDto> facilities = (await _caseI4cHttpClientService.GetAllFacilities()).ToList();
        return await GetFacilities(facilities);
    }

    public async Task<IEnumerable<FacilityUsabilityDto>> GetFacilities(List<FacilityDto> Facilities)
    {
        var facilityUsabilityDtos = new List<FacilityUsabilityDto>();

        //ICollection<FacilityDto> facilities = await _caseI4cHttpClientService.GetAllFacilities();
        var facilityStatuses = await _facilityStatusService.GetAll();


        // iterate through all facilities and check if they have at least one of all facility statuses
        foreach (var facility in Facilities)
        {
            var errorMessage = new StringBuilder();
            var fFacilityStatuses = facilityStatuses
                .Where(facilityStatus => facilityStatus.FacilityId == facility.id)
                .ToList();

            // Define the required statuses
            var requiredStatuses = new Dictionary<CaseStatus, string>
            {
                { CaseStatus.CREMATION_COMPLETE, "CREMATION_COMPLETE status is missing. " },
                { CaseStatus.IN_PROGRESS, "IN_PROGRESS status is missing. " },
                { CaseStatus.READY_TO_CREMATE, "READY_TO_CREMATE status is missing. " },
                { CaseStatus.CYCLE_COMPLETE, "CYCLE_COMPLETE status is missing. " },
                { CaseStatus.WAITING_FOR_PERMIT, "WAITING_FOR_PERMIT status is missing. " }
            };

            // Check for each required status
            bool isValid = true;
            foreach (var status in requiredStatuses)
            {
                if (!fFacilityStatuses.Any(facilityStatus => facilityStatus.Status == status.Key))
                {
                    errorMessage.Append(status.Value);
                    isValid = false;
                }
            }

            var dto = new FacilityUsabilityDto(facility.id, facility.name, facility.icon, isValid, errorMessage.ToString());
            facilityUsabilityDtos.Add(dto);
        }

        return facilityUsabilityDtos;
    }
}

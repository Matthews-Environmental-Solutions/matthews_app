using MatthewsApp.API.Dtos;
using MatthewsApp.API.Enums;
using MatthewsApp.API.Models;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace MatthewsApp.API.Services;

public class FacilityStatusChecker : IHostedService, IDisposable
{
    private readonly ILogger<FacilityStatusChecker> _logger;
    private readonly IServiceProvider _serviceProvider;
    private readonly FacilityHub _facilityHub;
    private Timer _timer;

    public FacilityStatusChecker(ILogger<FacilityStatusChecker> logger, IServiceProvider serviceProvider, FacilityHub facilityHub)
    {
        _logger = logger;
        _serviceProvider = serviceProvider;
        _facilityHub = facilityHub;
    }

    public Task StartAsync(CancellationToken cancellationToken)
    {
        _logger.LogInformation("Facility Status Checker is starting.");
        _timer = new Timer(CheckFacilityStatuses, null, TimeSpan.Zero, TimeSpan.FromMinutes(2));
        return Task.CompletedTask;
    }

    private async void CheckFacilityStatuses(object state)
    {
        _logger.LogInformation("Checking facility statuses...");

        using (var scope = _serviceProvider.CreateScope())
        {
            var facilityService = scope.ServiceProvider.GetRequiredService<IFacilityService>();
            var facilityStatusService = scope.ServiceProvider.GetRequiredService<IFacilityStatusService>();
            IEnumerable<FacilityUsabilityDto> facilities = await facilityService.GetFacilities();

            foreach (var facility in facilities)
            {
                if (!facility.isValid)
                {

                    if (facility.errorMessage.Contains("WAITING_FOR_PERMIT"))
                    {
                        var facilityStatus = new FacilityStatus
                        {
                            Id = Guid.NewGuid(),
                            FacilityId = facility.id,
                            Status = CaseStatus.WAITING_FOR_PERMIT,
                            StatusCode = 1000,
                            StatusName = "Awaiting for permission",
                            StatusIcon = "back_hand"

                        };
                        facilityStatusService.Create(facilityStatus);
                    }

                    if (facility.errorMessage.Contains("READY_TO_CREMATE"))
                    {
                        var facilityStatus = new FacilityStatus
                        {
                            Id = Guid.NewGuid(),
                            FacilityId = facility.id,
                            Status = CaseStatus.READY_TO_CREMATE,
                            StatusCode = 1010,
                            StatusName = "Ready to cremate",
                            StatusIcon = "play_arrow"

                        };
                        facilityStatusService.Create(facilityStatus);
                    }

                    if (facility.errorMessage.Contains("SELECTED"))
                    {
                        var facilityStatus = new FacilityStatus
                        {
                            Id = Guid.NewGuid(),
                            FacilityId = facility.id,
                            Status = CaseStatus.SELECTED,
                            StatusCode = 1020,
                            StatusName = "Selected",
                            StatusIcon = "star"

                        };
                        facilityStatusService.Create(facilityStatus);
                    }

                    if (facility.errorMessage.Contains("IN_PROGRESS"))
                    {
                        var facilityStatus = new FacilityStatus
                        {
                            Id = Guid.NewGuid(),
                            FacilityId = facility.id,
                            Status = CaseStatus.IN_PROGRESS,
                            StatusCode = 1030,
                            StatusName = "In progress",
                            StatusIcon = "local_fire_department"

                        };
                        facilityStatusService.Create(facilityStatus);
                    }

                    //if errorMessage contains "CREMATION_COMPLETE" then create new FacilityStatus that has facilityId and Status "CREMATION_COMPLETE" to database
                    if (facility.errorMessage.Contains("CREMATION_COMPLETE"))
                    {
                        var facilityStatus = new FacilityStatus
                        {
                            Id = Guid.NewGuid(),
                            FacilityId = facility.id,
                            Status = CaseStatus.CREMATION_COMPLETE,
                            StatusCode = 1100,
                            StatusName = "Cremation complete",
                            StatusIcon = "done"

                        };
                        facilityStatusService.Create(facilityStatus);
                    }


                    _logger.LogWarning($"Facility {facility.id} has issues: {facility.errorMessage}");
                }
            }

            facilities = await facilityService.GetFacilities();

            // Send the updated facility statuses to all clients via SignalR. Serialize the facilities to JSON.
            
            string json = System.Text.Json.JsonSerializer.Serialize(facilities);
            await _facilityHub.SendMessageWithAllFacilities(json);
        }
    }

    public Task StopAsync(CancellationToken cancellationToken)
    {
        _logger.LogInformation("Facility Status Checker is stopping.");
        _timer?.Change(Timeout.Infinite, 0);
        return Task.CompletedTask;
    }

    public void Dispose()
    {
        _timer?.Dispose();
    }
}

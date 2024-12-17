using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace MatthewsApp.API.Services;

public class FacilityHub : Hub
{
    public async Task SendMessageWithAllFacilities(string message)
    {
        if (Clients != null)
        {
            await Clients.All.SendAsync("facilitylist", message);
        }
    }

}

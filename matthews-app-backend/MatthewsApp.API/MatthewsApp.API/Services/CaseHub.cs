using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace MatthewsApp.API.Services
{
    public class CaseHub : Hub
    {
        public async Task SendMessageToRefreshList(string message)
        {
            if (Clients != null)
            {
                await Clients.All.SendAsync("refreshcaseslist", message);
            }
        }
    }
}

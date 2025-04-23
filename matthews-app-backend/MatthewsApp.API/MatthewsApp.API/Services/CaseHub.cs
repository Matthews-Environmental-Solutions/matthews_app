using MatthewsApp.API.Dtos;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Threading.Tasks;

namespace MatthewsApp.API.Services;

public class CaseHub : Hub
{
    internal async Task<ResponseCommunicationDto> JoinGroup(string group)
    {
        try
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, group);
            return new ResponseCommunicationDto("joined", group);
        }
        catch (Exception)
        {
            return new ResponseCommunicationDto("not subscribed", group);
        }
    }

    internal async Task<ResponseCommunicationDto> RemoveGroup(string group)
    {
        try
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, group);
            return new ResponseCommunicationDto("removed", group);
        }
        catch (Exception)
        {
            return new ResponseCommunicationDto("not removed", group);
        }
    }

    public async Task SendMessageToRefreshList(string message, string groupName)
    {
        if (Clients != null)
        {
            await Clients.Group(groupName).SendAsync("refreshcaseslist", message);
        }
    }

    public async Task SendMessageToSelectCase(string message)
    {
        if (Clients != null)
        {
            await Clients.All.SendAsync("selectcase", message);
        }
    }
}

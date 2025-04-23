using MatthewsApp.API.Dtos;
using Microsoft.Extensions.Logging;
using System.Threading.Tasks;

namespace MatthewsApp.API.Services;

public interface ICommunicationService
{
    Task<ResponseCommunicationDto> SubscribeToGroup(string group);
    Task<ResponseCommunicationDto> UnsubscribeFromGroup(string group);
}

public class CommunicationService : ICommunicationService
{
    private readonly CaseHub _caseHub;

    public CommunicationService(CaseHub caseHub)
    {
        _caseHub = caseHub;
    }

    public async Task<ResponseCommunicationDto> SubscribeToGroup(string group)
    {
        return await _caseHub.JoinGroup(group);
    }

    public async Task<ResponseCommunicationDto> UnsubscribeFromGroup(string group)
    {
        return await _caseHub.RemoveGroup(group);
    }
}

namespace MatthewsApp.API.Dtos;

public record AdapterConfigurationDto(
    string host,
    string port,
    int ssl,
    string username,
    string password,
    string clientId
    )
{    
}

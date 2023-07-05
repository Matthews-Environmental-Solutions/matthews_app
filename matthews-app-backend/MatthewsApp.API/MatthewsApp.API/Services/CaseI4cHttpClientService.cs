using Azure;
using IdentityModel.Client;
using Microsoft.Extensions.Configuration;
using System;
using System.Diagnostics;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Threading.Tasks;

namespace MatthewsApp.API.Services;

public class CaseI4cHttpClientService
{

    private static readonly HttpClient _httpClient = new HttpClient();
    private IConfiguration _configuration;

    public CaseI4cHttpClientService(IConfiguration configuration)
    {
        _configuration = configuration;
        _httpClient.BaseAddress = new Uri(_configuration["i4connectedApiUrl"]);
        _httpClient.Timeout = new TimeSpan(0, 0, 30);
    }

    public async Task<string> GetAllFacilities()
    {
        HttpResponseMessage response;
        try
        {
            response = await _httpClient.GetAsync("/api/api/sites/list");
            response.EnsureSuccessStatusCode();
        }
        catch (Exception ex)
        {

            throw;
        }
        
        var res = await response.Content.ReadAsStringAsync();
        return res;
    }

    public async Task<string> GetAllDevicesAsync()
    {
        string accessToken = await GetAccessTokenFromIdentityServer();

        HttpResponseMessage response;
        try
        {
            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
            response = await _httpClient.PostAsJsonAsync("/api/api/devices/list?pageSize=1000000&pageNumber=1&sortFields=0", "{}");
            response.EnsureSuccessStatusCode();
        }
        catch (Exception ex)
        {

            throw;
        }
        var res = await response.Content.ReadAsStringAsync();
        return res;
    }

    private async Task<string> GetAccessTokenFromIdentityServer()
    {
        var apiClientCredentials = new ClientCredentialsTokenRequest
        {
            Address = $"{_configuration["OAuth2Introspection:Authority"]}/connect/token",
            ClientId = _configuration["OAuth2Introspection:ClientId"],
            ClientSecret = _configuration["OAuth2Introspection:ClientSecret"]

            // This is the scope our Protected API requires. 
            //Scope = "read:entity"
        };

        var disco = await _httpClient.GetDiscoveryDocumentAsync(_configuration["OAuth2Introspection:Authority"]);
        if (disco.IsError)
        {
            Debug.WriteLine("Neuspesno");
        }

        // 2. Authenticates and get an access token from Identity Server
        var tokenResponse = await _httpClient.RequestClientCredentialsTokenAsync(apiClientCredentials);
        if (tokenResponse.IsError)
        {
            Debug.WriteLine("Neuspesno");
        }

        return tokenResponse.AccessToken;
    }
}

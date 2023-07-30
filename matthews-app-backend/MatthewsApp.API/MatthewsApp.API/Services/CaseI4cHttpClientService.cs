using IdentityModel.Client;
using MatthewsApp.API.Dtos;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace MatthewsApp.API.Services;

public interface ICaseI4cHttpClientService
{
    Task<AdapterDto> GetAdapterByDeviceIdAsync(Guid adapterId);
    Task<ICollection<DeviceDto>> GetAllDevicesAsync();
    Task<DeviceDetailsDto> GetDeviceDetailsAsync(Guid id);
}

public class CaseI4cHttpClientService : ICaseI4cHttpClientService
{

    private static readonly HttpClient _httpClient = new HttpClient();
    private IConfiguration _configuration;
    private string _accessToken;

    public CaseI4cHttpClientService(IConfiguration configuration)
    {
        _configuration = configuration;
        _httpClient.BaseAddress = new Uri(_configuration["i4connectedApiUrl"]);
        _httpClient.Timeout = new TimeSpan(0, 0, 30);
        _accessToken = GetAccessTokenFromIdentityServer().Result;
        _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _accessToken);
    }

    internal async Task<ICollection<FacilityDto>> GetAllFacilities()
    {
        HttpResponseMessage response;
        try
        {
            response = await _httpClient.GetAsync("/api/api/sites/list");
            response.EnsureSuccessStatusCode();

            var res = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<ICollection<FacilityDto>>(res);
        }
        catch (Exception ex)
        {
            throw;
        }
    }

    public async Task<ICollection<DeviceDto>> GetAllDevicesAsync()
    {
        HttpResponseMessage response;
        try
        {
            HttpContent content = new StringContent("{}", UnicodeEncoding.UTF8, "application/json");
            response = await _httpClient.PostAsync("/api/api/devices/list?pageSize=1000000&pageNumber=1&sortFields=0", content);
            response.EnsureSuccessStatusCode();

            var res = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<ICollection<DeviceDto>>(res);
        }
        catch (Exception)
        {
            throw;
        }
    }

    public async Task<AdapterDto> GetAdapterByDeviceIdAsync(Guid DeviceId)
    {
        HttpResponseMessage response;
        try
        {
            response = await _httpClient.GetAsync($"/api/api/adapters/{DeviceId}/details");
            response.EnsureSuccessStatusCode();

            var res = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<AdapterDto>(res);
        }
        catch (Exception)
        {
            throw;
        }
    }

    public async Task<DeviceDetailsDto> GetDeviceDetailsAsync(Guid DeviceId)
    {
        HttpResponseMessage response;
        try
        {
            response = await _httpClient.GetAsync($"/api/api/devices/{DeviceId}/details");
            response.EnsureSuccessStatusCode();

            var res = await response.Content.ReadAsStringAsync();
            DeviceDetailsDto _ = JsonSerializer.Deserialize<DeviceDetailsDto>(res);
            return JsonSerializer.Deserialize<DeviceDetailsDto>(res);
        }
        catch (Exception ex)
        {
            throw;
        }
    }

    private async Task<string> GetAccessTokenFromIdentityServer()
    {
        var disco = await _httpClient.GetDiscoveryDocumentAsync(_configuration["OAuth2Introspection:Authority"]);
        if (disco.IsError)
        {
            Debug.WriteLine("Identity server - Unsuccesful discovery");
        }

        var apiClientCredentials = new PasswordTokenRequest
        {
            Address = disco.TokenEndpoint,
            GrantType = "password",
            Scope = _configuration["OAuth2Introspection:Scope"],
            UserName = _configuration["OAuth2Introspection:UserName"],
            Password = _configuration["OAuth2Introspection:Password"],
            ClientId = _configuration["OAuth2Introspection:ClientId"],
        };

        // 2. Authenticates and get an access token from Identity Server
        var tokenResponse = await _httpClient.RequestPasswordTokenAsync(apiClientCredentials);
        if (tokenResponse.IsError)
        {
            Debug.WriteLine("Identity server - Unsuccesful token response");
        }

        return tokenResponse.AccessToken;
    }
    
}

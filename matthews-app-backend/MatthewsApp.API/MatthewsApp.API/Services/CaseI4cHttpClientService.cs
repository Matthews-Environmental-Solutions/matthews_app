using IdentityModel.Client;
using MatthewsApp.API.Dtos;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Security.Authentication;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace MatthewsApp.API.Services;

public interface ICaseI4cHttpClientService
{
    Task<AdapterDto> GetAdapterByDeviceIdAsync(Guid adapterId);
    Task<ICollection<DeviceDto>> GetAllDevicesAsync();
    Task<ICollection<FacilityDto>> GetAllFacilities();
    Task<DeviceDetailsDto> GetDeviceDetailsAsync(Guid id);
}

public class CaseI4cHttpClientService : ICaseI4cHttpClientService
{
    private readonly ILogger<CaseI4cHttpClientService> _logger;
    private HttpClient _httpClient;
    private IConfiguration _configuration;
    private string _accessToken;
    private DateTime _tokenIssuedAt;
    private TimeSpan _tokenLifetime;

    public CaseI4cHttpClientService(IConfiguration configuration, ILogger<CaseI4cHttpClientService> logger)
    {
        _logger = logger;

        HttpClientHandler handler = new HttpClientHandler()
        {
            SslProtocols = SslProtocols.Tls12 | SslProtocols.Tls11 | SslProtocols.Tls13,

            // You can enable this if you need to bypass SSL certificate validation
            // This is generally not recommended for production code
            ServerCertificateCustomValidationCallback = (sender, cert, chain, sslPolicyErrors) => true

            //ServerCertificateCustomValidationCallback = (sender, cert, chain, sslPolicyErrors) =>
            //{
            //    string knownThumbprint = "6F1432136873ADFDF4F68D6B9B1ED20944327600";

            //    if (cert.GetCertHashString() == knownThumbprint)
            //    {
            //        return true; // Bypass validation for this specific certificate
            //    }

            //    return sslPolicyErrors == System.Net.Security.SslPolicyErrors.None; // Perform standard validation otherwise
            //}
        };
        _httpClient = new HttpClient(handler);
        _configuration = configuration;
        _httpClient.BaseAddress = new Uri(_configuration["i4connectedApiUrl"]);
        _httpClient.Timeout = new TimeSpan(0, 0, 30);

        GetAccessTokenAndConnect();
    }

    public async Task<ICollection<FacilityDto>> GetAllFacilities()
    {
        if (IsTokenExpired())
        {
            GetAccessTokenAndConnect();
        }

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
        if (IsTokenExpired())
        {
            GetAccessTokenAndConnect();
        }

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
        if (IsTokenExpired())
        {
            GetAccessTokenAndConnect();
        }

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
        if (IsTokenExpired())
        {
            GetAccessTokenAndConnect();
        }

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

    private async Task<(string, DateTime, TimeSpan)> GetAccessTokenFromIdentityServer()
    {
        _logger.LogInformation("Getting access token from Identity Server");
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

        _accessToken = tokenResponse.AccessToken;
        _tokenIssuedAt = DateTime.UtcNow;
        _tokenLifetime = TimeSpan.FromSeconds(tokenResponse.ExpiresIn);
        return (_accessToken, _tokenIssuedAt, _tokenLifetime);
    }

    private bool IsTokenExpired()
    {
        // If the token is null, consider it expired
        if (_accessToken == null) return true;

        // Calculate the expiration time based on the issued time and lifetime
        var expirationTime = _tokenIssuedAt.Add(_tokenLifetime.Subtract(TimeSpan.FromSeconds(900)));

        // Check if the token is expired
        return expirationTime < DateTime.UtcNow;
    }

    private void GetAccessTokenAndConnect()
    {
        _ = GetAccessTokenFromIdentityServer().Result;
        _logger.LogInformation("Connecting to i4connected");
        _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _accessToken);
    }

}

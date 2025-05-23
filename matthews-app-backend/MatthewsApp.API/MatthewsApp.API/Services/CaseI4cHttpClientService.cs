using IdentityModel.Client;
using MatthewsApp.API.Dtos;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Security.Authentication;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace MatthewsApp.API.Services;

public interface ICaseI4cHttpClientService
{
    Task<AdapterDto> GetAdapterByDeviceIdAsync(Guid deviceId);
    Task<ICollection<DeviceDto>> GetAllDevicesAsync();
    Task<ICollection<FacilityDto>> GetAllFacilities();
    Task<DeviceDetailsDto> GetDeviceDetailsAsync(Guid deviceId);
}

public class CaseI4cHttpClientService : ICaseI4cHttpClientService
{
    private readonly ILogger<CaseI4cHttpClientService> _logger;
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;

    private string _accessToken;
    private DateTime _tokenIssuedAt;
    private TimeSpan _tokenLifetime;

    public CaseI4cHttpClientService(IConfiguration configuration, ILogger<CaseI4cHttpClientService> logger)
    {
        _configuration = configuration;
        _logger = logger;

        var handler = new HttpClientHandler
        {
            SslProtocols = SslProtocols.Tls12 | SslProtocols.Tls13,
            //ServerCertificateCustomValidationCallback = (sender, cert, chain, sslPolicyErrors) => true
        };

        _httpClient = new HttpClient(handler)
        {
            BaseAddress = new Uri(_configuration["i4connectedApiUrl"]),
            Timeout = TimeSpan.FromSeconds(30)
        };
    }

    public async Task<ICollection<FacilityDto>> GetAllFacilities()
        => await GetWithTokenAsync<ICollection<FacilityDto>>("/api/api/sites/list");

    public async Task<ICollection<DeviceDto>> GetAllDevicesAsync()
        => await PostWithTokenAsync<ICollection<DeviceDto>>("/api/api/devices/list?pageSize=1000000&pageNumber=1&sortFields=0", "{}");

    public async Task<AdapterDto> GetAdapterByDeviceIdAsync(Guid deviceId)
        => await GetWithTokenAsync<AdapterDto>($"/api/api/adapters/{deviceId}/details");

    public async Task<DeviceDetailsDto> GetDeviceDetailsAsync(Guid deviceId)
        => await GetWithTokenAsync<DeviceDetailsDto>($"/api/api/devices/{deviceId}/details");

    private async Task<T> GetWithTokenAsync<T>(string endpoint)
    {
        await EnsureValidTokenAsync();

        try
        {
            var response = await _httpClient.GetAsync(endpoint);
            response.EnsureSuccessStatusCode();

            var content = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<T>(content);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during GET to {Endpoint}", endpoint);
            return default;
        }
    }

    private async Task<T> PostWithTokenAsync<T>(string endpoint, string body)
    {
        await EnsureValidTokenAsync();

        try
        {
            var content = new StringContent(body, Encoding.UTF8, "application/json");
            var response = await _httpClient.PostAsync(endpoint, content);
            response.EnsureSuccessStatusCode();

            var res = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<T>(res);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during POST to {Endpoint}", endpoint);
            return default;
        }
    }

    private async Task EnsureValidTokenAsync()
    {
        if (!IsTokenValid())
        {
            await RefreshTokenAsync();
        }

        _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _accessToken);
    }

    private bool IsTokenValid()
    {
        if (string.IsNullOrEmpty(_accessToken)) return false;
        return DateTime.UtcNow < _tokenIssuedAt.Add(_tokenLifetime).Subtract(TimeSpan.FromMinutes(5));
    }

    private async Task RefreshTokenAsync()
    {
        _logger.LogInformation("Fetching new access token...");

        try
        {
            var disco = await _httpClient.GetDiscoveryDocumentAsync(_configuration["OAuth2Introspection:Authority"]);
            if (disco.IsError)
            {
                _logger.LogError("Discovery failed: {Error}", disco.Error);
                return;
            }

            var username = string.Empty;
            var password = string.Empty;
            if (Environment.OSVersion.Platform == PlatformID.Win32NT)
            {
                username = Environment.GetEnvironmentVariable("MatthewsCaseApiOAuthUsername");
                password = Environment.GetEnvironmentVariable("MatthewsCaseApiOAuthPassword");
                if (string.IsNullOrEmpty(username) || string.IsNullOrEmpty(password))
                {
                    throw new InvalidOperationException("Username and password must be set in the environment variables.");
                }
            }
            else
            {
                throw new PlatformNotSupportedException("This application can only run on Windows.");
            }

            var request = new PasswordTokenRequest
            {
                Address = disco.TokenEndpoint,
                ClientId = _configuration["OAuth2Introspection:ClientId"],
                UserName = username,
                Password = password,
                Scope = _configuration["OAuth2Introspection:Scope"]
            };

            var tokenResponse = await _httpClient.RequestPasswordTokenAsync(request);

            if (tokenResponse.IsError)
            {
                _logger.LogError("Token request failed: {Error}", tokenResponse.Error);
                return;
            }

            _accessToken = tokenResponse.AccessToken;
            _tokenIssuedAt = DateTime.UtcNow;
            _tokenLifetime = TimeSpan.FromSeconds(tokenResponse.ExpiresIn);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error refreshing access token");
        }
    }
}

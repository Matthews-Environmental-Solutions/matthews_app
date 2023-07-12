using Azure;
using IdentityModel.Client;
using MatthewsApp.API.Dtos;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using static System.Net.WebRequestMethods;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace MatthewsApp.API.Services;

public class CaseI4cHttpClientService
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

    internal async Task<ICollection<DeviceDto>> GetAllDevicesAsync()
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

    internal async Task<AdapterDto> GetAdapterByDeviceIdAsync(Guid DeviceId)
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

    internal async Task<DeviceDetailsDto> GetDeviceDetailsAsync(Guid DeviceId)
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


    public Task<ICollection<DeviceDto>> GetAllDevicesMock()
    {
        string json = "[{\"id\":\"ebe0b7d1-8155-4ab2-9788-e69778455690\",\"alias\":\"Simulation 2\",\"deviceTypeId\":null,\"description\":null,\"parentId\":null,\"areaId\":null,\"areaName\":null,\"siteId\":\"e9d185ac-1094-4e0e-83d0-e28b45a1813b\",\"siteName\":\"Woodlawn Cemetery & Crematory\",\"organizationalUnitId\":null,\"organizationalUnitName\":null,\"certification\":null,\"certificationExpiration\":null,\"renewalNotification\":null,\"deviceSWVersionId\":null,\"deviceHWVersionId\":null,\"deviceModelId\":null,\"deviceManufacturerId\":null,\"adapterId\":\"43d8e3df-8e82-4d66-aabc-7cd1f04fff0e\",\"aggregate\":false,\"active\":true,\"entityVariable\":false,\"visible\":true,\"name\":\"Woodlawn Simulation 2\",\"deviceSWVersionName\":null,\"deviceHWVersionName\":null,\"deviceModelName\":null,\"deviceManufacturerName\":null,\"adapterTypeName\":\"MQTT\",\"deviceTypeName\":null,\"deviceTypeIcon\":null,\"deviceTypeOrder\":null,\"adapterTypeId\":1021,\"adapterTypeType\":\"WEBfactory.DWH.Server.Adapters.Mqtt.MqttAdapter, WEBfactory.DWH.Server.Adapters.Mqtt\",\"photoId\":null,\"installationPhotoId\":null,\"suppressAlarms\":false,\"suppressionMode\":0,\"suppressionStartDate\":\"2023-05-30T09:56:19.327\",\"suppressionEndDate\":\"2023-05-30T09:56:19.33\",\"metadata\":\"{}\",\"enableGpsTracking\":false,\"gpsFormatId\":3,\"latitudeSignalId\":null,\"longitudeSignalId\":null,\"coordinateSignalId\":null,\"separator\":null,\"gpsCleanupPolicy\":1,\"gpsCleanupAfter\":0,\"cleanupIntervalId\":0},{\"id\":\"ec90468c-6752-47e9-8b6e-ec9708149dd2\",\"alias\":\"Simulation Device\",\"deviceTypeId\":null,\"description\":null,\"parentId\":null,\"areaId\":null,\"areaName\":null,\"siteId\":\"1be6af25-2a14-49d1-b8fc-cee462733565\",\"siteName\":\"Test Mobile App\",\"organizationalUnitId\":null,\"organizationalUnitName\":null,\"certification\":null,\"certificationExpiration\":null,\"renewalNotification\":null,\"deviceSWVersionId\":null,\"deviceHWVersionId\":null,\"deviceModelId\":null,\"deviceManufacturerId\":null,\"adapterId\":null,\"aggregate\":false,\"active\":true,\"entityVariable\":false,\"visible\":true,\"name\":\"Simulation Device\",\"deviceSWVersionName\":null,\"deviceHWVersionName\":null,\"deviceModelName\":null,\"deviceManufacturerName\":null,\"adapterTypeName\":null,\"deviceTypeName\":null,\"deviceTypeIcon\":null,\"deviceTypeOrder\":null,\"adapterTypeId\":null,\"adapterTypeType\":null,\"photoId\":null,\"installationPhotoId\":null,\"suppressAlarms\":false,\"suppressionMode\":0,\"suppressionStartDate\":\"2023-05-25T07:51:51.58\",\"suppressionEndDate\":\"2023-05-25T07:51:51.58\",\"metadata\":\"{}\",\"enableGpsTracking\":false,\"gpsFormatId\":3,\"latitudeSignalId\":null,\"longitudeSignalId\":null,\"coordinateSignalId\":null,\"separator\":null,\"gpsCleanupPolicy\":1,\"gpsCleanupAfter\":0,\"cleanupIntervalId\":0},{\"id\":\"994fdb3c-84fe-410d-acf9-f04080630e37\",\"alias\":\"Woodlawn Cremator 1\",\"deviceTypeId\":null,\"description\":null,\"parentId\":null,\"areaId\":null,\"areaName\":null,\"siteId\":\"e9d185ac-1094-4e0e-83d0-e28b45a1813b\",\"siteName\":\"Woodlawn Cemetery & Crematory\",\"organizationalUnitId\":\"22e9e777-3580-4924-9621-0c0cc5203dd7\",\"organizationalUnitName\":\"Woodlawn\",\"certification\":null,\"certificationExpiration\":null,\"renewalNotification\":null,\"deviceSWVersionId\":null,\"deviceHWVersionId\":null,\"deviceModelId\":null,\"deviceManufacturerId\":null,\"adapterId\":\"43d8e3df-8e82-4d66-aabc-7cd1f04fff0e\",\"aggregate\":false,\"active\":true,\"entityVariable\":false,\"visible\":true,\"name\":\"Woodlawn Cremator 1\",\"deviceSWVersionName\":null,\"deviceHWVersionName\":null,\"deviceModelName\":null,\"deviceManufacturerName\":null,\"adapterTypeName\":\"MQTT\",\"deviceTypeName\":null,\"deviceTypeIcon\":null,\"deviceTypeOrder\":null,\"adapterTypeId\":1021,\"adapterTypeType\":\"WEBfactory.DWH.Server.Adapters.Mqtt.MqttAdapter, WEBfactory.DWH.Server.Adapters.Mqtt\",\"photoId\":null,\"installationPhotoId\":null,\"suppressAlarms\":false,\"suppressionMode\":0,\"suppressionStartDate\":\"2023-05-23T14:00:09.243\",\"suppressionEndDate\":\"2023-05-23T14:00:09.243\",\"metadata\":\"{}\",\"enableGpsTracking\":false,\"gpsFormatId\":3,\"latitudeSignalId\":null,\"longitudeSignalId\":null,\"coordinateSignalId\":null,\"separator\":null,\"gpsCleanupPolicy\":1,\"gpsCleanupAfter\":0,\"cleanupIntervalId\":0}]";

        ICollection<DeviceDto> devices = JsonSerializer.Deserialize<ICollection<DeviceDto>>(json);

        return Task.FromResult(devices);
    }

    internal Task<ICollection<AdapterDto>> GetAdaptersMock()
    {
        string json = "[{\"id\":\"43d8e3df-8e82-4d66-aabc-7cd1f04fff0e\",\"serverId\":\"2181b0f6-9433-45ad-ac0f-6872fd212bf8\",\"configuration\":\"{\"host\":\"mqtt.i4scada.cloud\",\"port\":\"1883\",\"ssl\":4,\"username\":\"matthews\",\"password\":\"hhsBGL8=r/)k$/#r7b*5F\",\"clientId\":\"cannock-mqtt-i4s-cloud\",\"parser\":0}\",\"enabled\":true,\"timeZoneId\":0,\"adapterTypeId\":1021,\"traceLevel\":0,\"ownerId\":\"2be64e0f-ba2d-46e7-8b9b-561aa32c2a3e\",\"description\":\"cannock-mqtt-i4scada-cloud\",\"name\":\"cannock-mqtt-i4scada-cloud\",\"serverBaseAddress\":\"http://localhost:812\",\"serverName\":\".\"},{\"id\":\"43d8e3df-8e82-4d66-aabc-7cd1f04fff0e\",\"serverId\":\"2181b0f6-9433-45ad-ac0f-6872fd212bf8\",\"configuration\":\"{\"host\":\"mqtt.i4scada.cloud\",\"port\":\"1883\",\"ssl\":4,\"username\":\"matthews\",\"password\":\"hhsBGL8=r/)k$/#r7b*5F\",\"clientId\":\"cannock-mqtt-i4s-cloud\",\"parser\":0}\",\"enabled\":true,\"timeZoneId\":0,\"adapterTypeId\":1021,\"traceLevel\":0,\"ownerId\":\"2be64e0f-ba2d-46e7-8b9b-561aa32c2a3e\",\"description\":\"cannock-mqtt-i4scada-cloud\",\"name\":\"cannock-mqtt-i4scada-cloud\",\"serverBaseAddress\":\"http://localhost:812\",\"serverName\":\".\"}]";

        ICollection<AdapterDto> adapters = JsonSerializer.Deserialize<ICollection<AdapterDto>>(json);

        return Task.FromResult(adapters);
    }

    
}

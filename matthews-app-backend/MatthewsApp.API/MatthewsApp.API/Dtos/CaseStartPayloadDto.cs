using MatthewsApp.API.Dtos.CustomJsonConverters;
using System.Text.Json.Serialization;

namespace MatthewsApp.API.Dtos;

public class CaseStartPayloadDto 
{
    [JsonConverter(typeof(CaseToStringConverter))]
    public string CaseStart { get; set; }
}

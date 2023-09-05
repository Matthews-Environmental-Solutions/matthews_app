using MatthewsApp.API.Dtos.CustomJsonConverters;
using System.Text.Json.Serialization;

namespace MatthewsApp.API.Dtos;

public class StartCasePayloadDto 
{
    [JsonConverter(typeof(CaseStartToStringConverter))]
    public string CaseStart { get; set; }
}

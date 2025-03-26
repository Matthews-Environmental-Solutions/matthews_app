using MatthewsApp.API.Dtos.CustomJsonConverters;
using System.Text.Json.Serialization;

namespace MatthewsApp.API.Dtos;

public class CaseRestartPayloadDto
{
    [JsonConverter(typeof(CaseToStringConverter))]
    public string CaseRestart { get; set; }
}

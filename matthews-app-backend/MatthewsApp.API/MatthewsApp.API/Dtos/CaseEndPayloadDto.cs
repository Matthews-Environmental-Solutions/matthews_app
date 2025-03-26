using MatthewsApp.API.Dtos.CustomJsonConverters;
using System.Text.Json.Serialization;

namespace MatthewsApp.API.Dtos;

public class CaseEndPayloadDto
{
    [JsonConverter(typeof(CaseToStringConverter))]
    public string CaseEnd { get; set; }
}

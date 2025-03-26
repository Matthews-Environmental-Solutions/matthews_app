using MatthewsApp.API.Dtos.CustomJsonConverters;
using System.Text.Json.Serialization;

namespace MatthewsApp.API.Dtos;

public class CaseSelectPayloadDto
{
    [JsonConverter(typeof(CaseToStringConverter))]
    public string CaseSelect { get; set; }
}

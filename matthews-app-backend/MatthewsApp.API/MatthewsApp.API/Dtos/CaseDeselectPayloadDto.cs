using MatthewsApp.API.Dtos.CustomJsonConverters;
using System.Text.Json.Serialization;

namespace MatthewsApp.API.Dtos;

public class CaseDeselectPayloadDto
{
    [JsonConverter(typeof(CaseToStringConverter))]
    public string CaseDeselect { get; set; }
}

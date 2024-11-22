using MatthewsApp.API.Dtos.CustomJsonConverters;
using System.Text.Json.Serialization;

namespace MatthewsApp.API.Dtos;

public class DeselectCasePayloadDto
{
    [JsonConverter(typeof(CaseStartToStringConverter))]
    public string CaseDeselect { get; set; }
}

using MatthewsApp.API.Dtos.CustomJsonConverters;
using System.Text.Json.Serialization;

namespace MatthewsApp.API.Dtos;

public class SelectCasePayloadDto
{
    [JsonConverter(typeof(CaseStartToStringConverter))]
    public string CaseSelect { get; set; }
}

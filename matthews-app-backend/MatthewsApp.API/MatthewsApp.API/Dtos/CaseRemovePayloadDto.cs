using MatthewsApp.API.Dtos.CustomJsonConverters;
using System.Text.Json.Serialization;

namespace MatthewsApp.API.Dtos;

public class CaseRemovePayloadDto
{
    [JsonConverter(typeof(CaseToStringConverter))]
    public string CaseRemove { get; set; }
}

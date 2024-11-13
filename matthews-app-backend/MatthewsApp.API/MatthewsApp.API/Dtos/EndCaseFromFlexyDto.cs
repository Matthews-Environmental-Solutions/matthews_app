using MatthewsApp.API.Dtos.CustomJsonConverters;
using System;
using System.Text.Json.Serialization;

namespace MatthewsApp.API.Dtos;

public class EndCaseFromFlexyDto
{
    public Guid COMPLETED_ID { get; set; }

    [JsonConverter(typeof(CustomDateTimeConverter))]
    public DateTime EndTime { get; set; }

    public double FuelUsed { get; set; }

    public double ElectricityUsed { get; set; }
}

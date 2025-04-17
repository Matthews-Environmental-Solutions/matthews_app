using MatthewsApp.API.Dtos.CustomJsonConverters;
using MatthewsApp.API.Enums;
using System;
using System.Text.Json.Serialization;

namespace MatthewsApp.API.Dtos;

public class CaseFromFlexyDto {

    [JsonConverter(typeof(CustomGuidConverter))]
    public Guid LOADED_ID { get; set; }
    public Guid FACILITY_ID { get; set; }
	public Guid CREMATOR_ID { get; set; }

    
    [JsonConverter(typeof(StringToIntConverter))]
    public int LOADED_COFFIN_TYPE { get; set; }

	[JsonConverter(typeof(CustomDateTimeConverter))]
	public DateTime StartTime { get; set; }

    [JsonConverter(typeof(CustomDateTimeConverter))]
    public DateTime EndTime { get; set; }

    public string User { get; set; }
	public string LOADED_FIRST_NAME { get; set; }
	public string LOADED_SURNAME { get; set; }
    public string LOADED_CLIENT_ID { get; set; }

    [JsonConverter(typeof(StringToIntConverter))]
    public int LOADED_WEIGHT { get; set; }

    [JsonConverter(typeof(GenderConverter))]
    public GenderType LOADED_GENDER { get; set; }

    [JsonConverter(typeof(StringToIntConverter))]
    public int LOADED_AGE { get; set; }

    public string LOADED_PHYSICAL_ID { get; set; }
}

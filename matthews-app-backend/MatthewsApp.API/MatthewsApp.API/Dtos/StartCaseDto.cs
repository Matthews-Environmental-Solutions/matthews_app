using MatthewsApp.API.Dtos.CustomJsonConverters;
using MatthewsApp.API.Enums;
using System;
using System.Text.Json.Serialization;

namespace MatthewsApp.API.Dtos;

public class StartCaseDto { 
    public Guid LOADED_ID { get; set; }
    public Guid FACILITY_ID { get; set; }
	public Guid CREMATOR_ID { get; set; }
	public int LOADED_COFFIN_TYPE { get; set; }

	[JsonConverter(typeof(CustomDateTimeConverter))]
	public DateTime StartTime { get; set; }

	public string User { get; set; }
	public string LOADED_FIRST_NAME { get; set; }
	public string LOADED_SURNAME { get; set; }
	public ContainerSize LOADED_SIZE { get; set; }
	public int LOADED_WEIGHT { get; set; }
	public GenderType LOADED_GENDER { get; set; }
    public int LOADED_AGE { get; set; }
}

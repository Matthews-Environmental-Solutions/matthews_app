﻿using MatthewsApp.API.Dtos.CustomJsonConverters;
using System.Text.Json.Serialization;
using System;

namespace MatthewsApp.API.Dtos;

public class DeselectCaseFromFlexyDto
{
    [JsonConverter(typeof(CustomGuidConverter))]
    public Guid LOADED_ID { get; set; }
}

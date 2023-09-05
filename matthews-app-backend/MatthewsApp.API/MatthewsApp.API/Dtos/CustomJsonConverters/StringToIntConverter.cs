using MatthewsApp.API.Enums;
using System.Text.Json;
using System;
using System.Text.Json.Serialization;

namespace MatthewsApp.API.Dtos.CustomJsonConverters;

public class StringToIntConverter : JsonConverter<int>
{
    private int _result;

    public override int Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        if (Int32.TryParse(reader.GetString(), out _result))
        {
            return _result;
        }
        else
        {
            //ToDo: make exception for not valid string to int
            return 0;
        }
    }

    public override void Write(Utf8JsonWriter writer, int value, JsonSerializerOptions options)
    {
        throw new NotImplementedException();
    }
}

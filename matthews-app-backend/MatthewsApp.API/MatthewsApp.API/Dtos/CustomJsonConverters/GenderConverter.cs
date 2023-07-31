using MatthewsApp.API.Enums;
using System.Text.Json;
using System;
using System.Text.Json.Serialization;

namespace MatthewsApp.API.Dtos.CustomJsonConverters;

public class GenderConverter : JsonConverter<GenderType>
{
    private int _result;

    public override GenderType Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {

        if (Int32.TryParse(reader.GetString(), out _result))
        {
            return (GenderType)_result;
        }
        else
        {
            return (GenderType) 0;
        }
    }

    public override void Write(Utf8JsonWriter writer, GenderType value, JsonSerializerOptions options)
    {
        throw new NotImplementedException();
    }
}

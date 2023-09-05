using System.Text.Json.Serialization;
using System;
using MatthewsApp.API.Enums;
using System.Text.Json;

namespace MatthewsApp.API.Dtos.CustomJsonConverters;

public class ContainerSizeConverter : JsonConverter<ContainerSize>
{
    private int _result;

    public override ContainerSize Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        if (Int32.TryParse(reader.GetString(), out _result))
        {
            return (ContainerSize) _result;
        }
        else
        {
            return (ContainerSize) 0;
        }
    }

    public override void Write(Utf8JsonWriter writer, ContainerSize value, JsonSerializerOptions options)
    {
        throw new NotImplementedException();
    }
}

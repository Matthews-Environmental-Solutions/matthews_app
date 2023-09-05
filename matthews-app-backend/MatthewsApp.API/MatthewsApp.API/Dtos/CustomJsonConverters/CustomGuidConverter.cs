using System.Text.Json.Serialization;
using System;
using Microsoft.SqlServer.Server;
using System.Text.Json;
using System.Buffers.Text;
using System.Buffers;
using System.Diagnostics;

namespace MatthewsApp.API.Dtos.CustomJsonConverters
{
    public class CustomGuidConverter : JsonConverter<Guid>
    {
        private Guid _result;

        public override Guid Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {

            if (Guid.TryParse(reader.GetString(), out _result))
            {
                return _result;
            }
            else
            {
                return Guid.Empty;
            }
            //throw new FormatException();
        }

        public override void Write(Utf8JsonWriter writer, Guid value, JsonSerializerOptions options)
        {
            throw new NotImplementedException();
        }
    }
}

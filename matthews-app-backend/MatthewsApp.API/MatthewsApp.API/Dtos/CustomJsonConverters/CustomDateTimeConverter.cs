using Microsoft.SqlServer.Server;
using System;
using System.Buffers;
using System.Buffers.Text;
using System.Diagnostics;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace MatthewsApp.API.Dtos.CustomJsonConverters
{
    public class CustomDateTimeConverter : JsonConverter<DateTime>
    {
        private readonly string Format = "yyyy-MM-dd HH:mm:ss";

        public override DateTime Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {

            return DateTime.ParseExact(reader.GetString(), Format, null);

            //if (Utf8Parser.TryParse(reader.ValueSpan, out DateTime value, out _, 'R'))
            //{
            //    return value;
            //}

            //throw new FormatException();
        }

        public override void Write(Utf8JsonWriter writer, DateTime value, JsonSerializerOptions options)
        {
            // The "R" standard format will always be 29 bytes.
            Span<byte> utf8Date = new byte[29];

            bool result = Utf8Formatter.TryFormat(value, utf8Date, out _, new StandardFormat('R'));
            Debug.Assert(result);

            writer.WriteStringValue(utf8Date);
        }
    }
}

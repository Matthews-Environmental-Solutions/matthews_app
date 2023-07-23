using System;
using System.IO;
using System.Runtime.Serialization.Formatters.Binary;

namespace MatthewsApp.API.Dtos;

[Serializable]
public class InitialInformationMessageDto
{
    public Guid FACILITY_ID { get; set; }
    public Guid CREMATOR_ID { get; set; }

}

using System;

namespace MatthewsApp.API.Dtos;

public record Case20Dto (
    Guid ID, // Guid
    string Client_ID,
    string FIRST_NAME,
    string SURNAME,
    string WEIGHT,
    string COFFIN_TYPE,
    string GENDER,
    string AGE,
    string READY,
    string SCHEDULED_START_TIME,
    string LOADED_PHYSICAL_ID
    )
{
}

using System.Collections.Generic;

namespace MatthewsApp.API.Dtos;

public class Case20Payload
{
    public List<Case20Dto> CASE_20_ { get; }

    public Case20Payload(List<Case20Dto> case_20_)
    {
        CASE_20_ = case_20_;
    }
}

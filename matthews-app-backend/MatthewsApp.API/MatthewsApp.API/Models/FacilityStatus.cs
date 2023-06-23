using Microsoft.EntityFrameworkCore.Metadata.Internal;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System;
using System.Collections.Generic;

namespace MatthewsApp.API.Models;

public class FacilityStatus : BaseEntity
{

    [Column(TypeName = "uniqueidentifier")]
    [Required]
    public Guid FacilityId { get; set; }


    public int StatusCode { get; set; }

    [Column(TypeName = "nvarchar(256)")]
    [Required]
    public string StatusName { get; set; } = string.Empty;

    [Column(TypeName = "nvarchar(16)")]
    public string? StatusIcon { get; set; }

    public bool StartProcess { get; set; }

    public IEnumerable<CaseToFacilityStatus> CaseToFacilityStatuses { get; set; }
    public IEnumerable<Case> Cases { get; set; }

}

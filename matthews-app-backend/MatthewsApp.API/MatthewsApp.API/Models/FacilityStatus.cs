using Microsoft.EntityFrameworkCore.Metadata.Internal;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System;
using MatthewsApp.API.Enums;

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

    [Column(TypeName = "nvarchar(64)")]
    public string? StatusIcon { get; set; }

    [Required]
    public CaseStatus Status { get; set; } = CaseStatus.UNSCHEDULED;

}

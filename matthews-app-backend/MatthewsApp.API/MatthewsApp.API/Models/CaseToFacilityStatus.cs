using Microsoft.EntityFrameworkCore.Metadata.Internal;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MatthewsApp.API.Models;

public class CaseToFacilityStatus
{
    [Key]
    [Column(TypeName = "uniqueidentifier")]
    public Guid CaseId { get; set; }
    public Case Case { get; set; } = null!;

    [Key]
    [Column(TypeName = "uniqueidentifier")]
    public Guid FacilityStatusId { get; set; }
    public FacilityStatus FacilityStatus { get; set; } = null!;

    public bool IsDone { get; set; }

    [Column(TypeName = "uniqueidentifier")]
    public Guid CreatedBy { get; set; } = Guid.Empty;

    [Column(TypeName = "datetime2(7)")]
    public DateTime CreatedTime { get; set; } = DateTime.MinValue;

    [Column(TypeName = "uniqueidentifier")]
    public Guid? ModifiedBy { get; set; }

    [Column(TypeName = "datetime2(7)")]
    public DateTime? ModifiedTime { get; set; }
}

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

    [Key]
    [Column(TypeName = "uniqueidentifier")]
    public Guid FacilityStatusId { get; set; }

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

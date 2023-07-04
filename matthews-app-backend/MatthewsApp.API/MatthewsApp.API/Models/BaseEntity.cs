using Microsoft.EntityFrameworkCore.Metadata.Internal;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System;

namespace MatthewsApp.API.Models;

public class BaseEntity : IBaseEntity
{
    [Key]
    [Column(TypeName = "uniqueidentifier")]
    public Guid Id { get; set; }


    [Column(TypeName = "uniqueidentifier")]
    public Guid CreatedBy { get; set; } = Guid.Empty;

    [Column(TypeName = "datetime2(7)")]
    public DateTime CreatedTime { get; set; } = DateTime.MinValue;

    [Column(TypeName = "uniqueidentifier")]
    public Guid? ModifiedBy { get; set; }

    [Column(TypeName = "datetime2(7)")]
    public DateTime? ModifiedTime { get; set; }
}

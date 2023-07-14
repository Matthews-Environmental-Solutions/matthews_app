using MatthewsApp.API.Enums;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MatthewsApp.API.Models;

public class Case : BaseEntity
{

    [Column(TypeName = "nvarchar(256)")]
    [Required]
    public string ClientId { get; set; } // Promeni tip nakon što saznamo format ID-a

    [Column(TypeName = "nvarchar(256)")]
    [Required]
    public string ClientCaseId { get; set; }



    [Column(TypeName = "nvarchar(16)")]
    [Required]
    public string FirstName { get; set; }

    [Column(TypeName = "nvarchar(16)")]
    [Required]
    public string LastName { get; set; }

    public double Weight { get; set; }

    [Required]
    public GenderType Gender { get; set; }

    public ContainerType ContainerType { get; set; }

    public ContainerSize ContainerSize { get; set; }

    [Required]
    public bool IsObsolete { get; set; } = false;

    public int Age { get; set; }

    [Required]
    public CaseStatus Status { get; set; } = CaseStatus.UNSCHEDULED;




    [Column(TypeName = "uniqueidentifier")]
    public Guid? ScheduledFacility { get; set; }

    [Column(TypeName = "uniqueidentifier")]
    public Guid? ScheduledDevice { get; set; }

    [Column(TypeName = "nvarchar(564)")]
    public string ScheduledDeviceAlias { get; set; }

    [Column(TypeName = "datetime2(7)")]
    public DateTime? ScheduledStartTime { get; set; }




    [Column(TypeName = "uniqueidentifier")]
    public Guid? ActualFacility { get; set; }

    [Column(TypeName = "uniqueidentifier")]
    public Guid? ActualDevice { get; set; }

    [Column(TypeName = "nvarchar(564)")]
    public string ActualDeviceAlias { get; set; }

    [Column(TypeName = "datetime2(7)")]
    public DateTime? ActualStartTime { get; set; }

    [Column(TypeName = "datetime2(7)")]
    public DateTime? ActualEndTime { get; set; }




    [Column(TypeName = "uniqueidentifier")]
    public Guid? PerformedBy { get; set; }




    public string Fuel { get; set; }

    public string Electricity { get; set; }


    public Guid? FacilityStatusId { get; set; }
    public FacilityStatus FacilityStatus { get; set; }
}
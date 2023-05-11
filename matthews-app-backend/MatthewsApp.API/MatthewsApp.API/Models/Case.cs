using MatthewsApp.API.Enums;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Newtonsoft.Json;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MatthewsApp.API.Models
{
    public class Case
    {
        [Key]
        [Column(TypeName = "uniqueidentifier")]
        public Guid Id { get; set; }

        [Column(TypeName = "nvarchar(256)")]
        [Required]
        public String ClientId { get; set; } // Promeni tip nakon što saznamo format ID-a

        [Column(TypeName = "nvarchar(16)")]
        [Required]
        public string CaseId { get; set; }

        [Column(TypeName = "uniqueidentifier")]
        public Guid FacilityId { get; set; }

        [Column(TypeName = "nvarchar(16)")]
        [Required]
        public string FirstName { get; set; }

        [Column(TypeName = "nvarchar(16)")]
        [Required]
        public string LastName { get; set; }

        public double Weight { get; set; }

        [Required]
        public GenderType Gender { get; set; }

        public ContainerType ContainerType { get; set; } // Pitati Stojana odakle dolaze podaci za ContainerType i zasto je to string

        public ContainerSize ContainerSize { get; set; } // Pitati Stojana odakle dolaze podaci za ContainerSize

        [Required]
        public bool IsObsolete { get; set; } = false;

        public int Age { get; set; }

        [Required]
        public CaseStatus Status { get; set; } = CaseStatus.UNSCHEDULED;


        [Column(TypeName = "uniqueidentifier")]
        public Guid ScheduledFacility { get; set; } = Guid.Empty;

        [Column(TypeName = "uniqueidentifier")]
        public Guid ScheduledDevice { get; set; } = Guid.Empty;

        [Column(TypeName = "nvarchar(564)")]
        public string ScheduledDeviceAlias { get; set; }

        [Column(TypeName = "datetime2(7)")]
        public DateTime ScheduledStartTime { get; set; } = DateTime.MinValue;


        [Column(TypeName = "uniqueidentifier")]
        public Guid ActualFacility { get; set; } = Guid.Empty;

        [Column(TypeName = "uniqueidentifier")]
        public Guid ActualDevice { get; set; } = Guid.Empty;

        [Column(TypeName = "nvarchar(564)")]
        public string ActualDeviceAlias { get; set; }

        [Column(TypeName = "datetime2(7)")]
        public DateTime ActualStartTime { get; set; } = DateTime.MinValue;

        [Column(TypeName = "datetime2(7)")]
        public DateTime ActualEndTime { get; set; } = DateTime.MinValue;


        [Column(TypeName = "uniqueidentifier")]
        public Guid CreatedBy { get; set; } = Guid.Empty;

        [Column(TypeName = "datetime2(7)")]
        public DateTime CreatedTime { get; set; } = DateTime.MinValue;

        [Column(TypeName = "uniqueidentifier")]
        public Guid ModifiedBy { get; set; } = Guid.Empty;

        [Column(TypeName = "datetime2(7)")]
        public DateTime ModifiedTime { get; set; } = DateTime.MinValue;

        [Column(TypeName = "uniqueidentifier")]
        public Guid PerformedBy { get; set; } = Guid.Empty;


        public string Fuel { get; set; }

        public string Electricity { get; set; }

    }
}

using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MatthewsApp.API.Models
{
    public class Case
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        public string CaseId { get; set; }

        public string FacilityId { get; set; }

        public string CaseName { get; set; }

        public double Weight { get; set; }

        public string Gender { get; set; }

        public string ContainerType { get; set; }

        public string ContainerSize { get; set; }

        public bool IsObsolete { get; set; }

        public string Age { get; set; }

        public string Status { get; set; }

        public string SelectedDevice { get; set; }

        public string CreatedBy { get; set; }

        public DateTime CreatedTime { get; set; }

        public DateTime ScheduledTime { get; set; }

        public string SelectedDeviceAlias { get; set; }
    }
}

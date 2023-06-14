using Microsoft.EntityFrameworkCore.Metadata.Internal;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System;

namespace MatthewsApp.API.Models
{
    public interface IBaseEntity
    {
        Guid Id { get; set; }

        Guid CreatedBy { get; set; }

        DateTime CreatedTime { get; set; }

        Guid? ModifiedBy { get; set; }

        DateTime? ModifiedTime { get; set; }
    }
}

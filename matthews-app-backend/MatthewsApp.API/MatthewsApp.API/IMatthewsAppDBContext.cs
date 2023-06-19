using MatthewsApp.API.Models;
using Microsoft.EntityFrameworkCore;

namespace MatthewsApp.API;

public interface IMatthewsAppDBContext
{
    DbContext Context { get; }
    public DbSet<Case> Cases { get; set; }
    public DbSet<FacilityStatus> FacilityStatuses { get; set; }
}

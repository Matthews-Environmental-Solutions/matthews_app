using MatthewsApp.API.Models;
using Microsoft.EntityFrameworkCore;

namespace MatthewsApp.API;

public class MatthewsAppDBContext : DbContext, IMatthewsAppDBContext
{
    public DbContext Context => this;

    public DbSet<Case> Cases { get; set; }
    public DbSet<FacilityStatus> FacilityStatuses { get; set; }

    public MatthewsAppDBContext(DbContextOptions<MatthewsAppDBContext> options)
        : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Case>()
            .Property(c => c.ScheduledFacility)
            .IsRequired(false);

        modelBuilder.Entity<Case>()
            .Property(c => c.ScheduledDevice)
            .IsRequired(false);
        
        modelBuilder.Entity<Case>()
            .Property(c => c.ScheduledStartTime)
            .IsRequired(false);



        modelBuilder.Entity<Case>()
            .Property(c => c.ActualFacility)
            .IsRequired(false);

        modelBuilder.Entity<Case>()
            .Property(c => c.ActualDevice)
            .IsRequired(false);

        modelBuilder.Entity<Case>()
            .Property(c => c.ActualStartTime)
            .IsRequired(false);

        modelBuilder.Entity<Case>()
            .Property(c => c.ActualEndTime)
            .IsRequired(false);



        modelBuilder.Entity<Case>()
           .Property(c => c.ModifiedBy)
           .IsRequired(false);

        modelBuilder.Entity<Case>()
            .Property(c => c.ModifiedTime)
            .IsRequired(false);

        modelBuilder.Entity<Case>()
            .Property(c => c.PerformedBy)
            .IsRequired(false);



        modelBuilder.Entity<FacilityStatus>()
            .Property(c => c.StatusIcon)
            .IsRequired(false);

        modelBuilder.Entity<FacilityStatus>()
           .Property(c => c.ModifiedBy)
           .IsRequired(false);

        modelBuilder.Entity<FacilityStatus>()
            .Property(c => c.ModifiedTime)
            .IsRequired(false);


        base.OnModelCreating(modelBuilder);
    }
}

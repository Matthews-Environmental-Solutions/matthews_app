using MatthewsApp.API.Models;
using Microsoft.EntityFrameworkCore;

namespace MatthewsApp.API
{
    public class MatthewsAppDBContext : DbContext
    {
        public DbSet<Case> Cases { get; set; }

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


            base.OnModelCreating(modelBuilder);
        }
    }
}

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
    }
}

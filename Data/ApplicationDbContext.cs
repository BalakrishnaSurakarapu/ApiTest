using ApiTest.Model;
using Microsoft.EntityFrameworkCore;

namespace ApiTest.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) {  }
        public DbSet<TestUser> TestUsers { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.Entity<TestUser>().ToTable("TestUsers");
        }
    }
}
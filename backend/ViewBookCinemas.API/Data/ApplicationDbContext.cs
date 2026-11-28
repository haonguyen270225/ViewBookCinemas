using Microsoft.EntityFrameworkCore;
using ViewBookCinemas.API.Models.Entities;

namespace ViewBookCinemas.API.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(
            DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }

        public DbSet<Role> Roles { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>()
                .HasOne(user => user.Role)
                .WithMany(role => role.Users)
                .HasForeignKey(user => user.RoleId);

            modelBuilder.Entity<User>()
                .Property(user => user.DateOfBirth)
                .HasColumnType("date");
        }
    }
}
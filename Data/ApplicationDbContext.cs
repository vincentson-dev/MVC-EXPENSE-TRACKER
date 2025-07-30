using Microsoft.EntityFrameworkCore;
using projects.Models;

namespace projects.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<ExpenseTracker> ExpenseTrackers { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure the ExpenseTracker entity
            modelBuilder.Entity<ExpenseTracker>(entity =>
            {
                entity.ToTable("expenseTrackerDB");

                entity.HasKey(e => e.RecId);

                entity.Property(e => e.RecId)
                    .HasColumnName("recId")
                    .ValueGeneratedOnAdd();

                entity.Property(e => e.RecStatus)
                    .HasColumnName("recstatus");

                entity.Property(e => e.Expense)
                    .HasColumnName("expense")
                    .HasColumnType("varchar(max)");

                entity.Property(e => e.Income)
                    .HasColumnName("income")
                    .HasColumnType("varchar(max)");

                entity.Property(e => e.Savings)
                    .HasColumnName("savings")
                    .HasColumnType("varchar(max)");

                entity.Property(e => e.EmergencyFund)
                    .HasColumnName("emergencyFund")
                    .HasColumnType("varchar(max)");

                entity.Property(e => e.Description)
                    .HasColumnName("description")
                    .HasColumnType("varchar(max)");

                entity.Property(e => e.CreatedAt)
                    .HasColumnName("created_at")
                    .HasColumnType("smalldatetime");

                entity.Property(e => e.UpdatedAt)
                    .HasColumnName("updated_at")
                    .HasColumnType("smalldatetime");
            });
        }
    }
}
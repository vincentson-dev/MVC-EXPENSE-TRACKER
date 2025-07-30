using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace projects.Models
{
    [Table("expenseTrackerDB")]
    public class ExpenseTracker
    {
        [Key]
        [Column("recId")]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int RecId { get; set; }

        [Column("recstatus")]
        public bool RecStatus { get; set; }

        [Column("expense")]
        public string? Expense { get; set; }

        [Column("income")]
        public string? Income { get; set; }

        [Column("savings")]
        public string? Savings { get; set; }

        [Column("emergencyFund")]
        public string? EmergencyFund { get; set; }

        [Column("description")]
        public string? Description { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; }

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; }
    }
}

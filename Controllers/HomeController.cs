using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using projects.Data;
using projects.Models;

namespace projects.Controllers;

public class HomeController : Controller
{
    private readonly ILogger<HomeController> _logger;
    private readonly ApplicationDbContext _context;

    public HomeController(ILogger<HomeController> logger, ApplicationDbContext context)
    {
        _logger = logger;
        _context = context;
    }

    public async Task<IActionResult> Index()
    {
        // Get recent transactions (active records only) - limit to 6 with scroll to show 3
        var recentTransactions = await _context.ExpenseTrackers
            .Where(t => t.RecStatus == true)
            .OrderByDescending(t => t.CreatedAt)
            .Take(6)
            .ToListAsync();

        // Calculate totals from varchar fields (convert to decimal for calculation)
        decimal totalIncome = 0;
        decimal totalExpenses = 0;
        decimal totalSavings = 0;
        decimal totalEmergencyFund = 0;

        var activeRecords = await _context.ExpenseTrackers
            .Where(t => t.RecStatus == true)
            .ToListAsync();

        foreach (var record in activeRecords)
        {
            if (!string.IsNullOrEmpty(record.Income) && decimal.TryParse(record.Income, out decimal income))
                totalIncome += income;

            if (!string.IsNullOrEmpty(record.Expense) && decimal.TryParse(record.Expense, out decimal expense))
                totalExpenses += expense;

            if (!string.IsNullOrEmpty(record.Savings) && decimal.TryParse(record.Savings, out decimal savings))
                totalSavings += savings;

            if (!string.IsNullOrEmpty(record.EmergencyFund) && decimal.TryParse(record.EmergencyFund, out decimal emergencyFund))
                totalEmergencyFund += emergencyFund;
        }

        // Calculate net balance
        var netBalanceValue = totalIncome - totalExpenses - totalSavings - totalEmergencyFund;
        
        // Pass data to view with comma formatting
        ViewBag.TotalIncome = totalIncome.ToString("N2");
        ViewBag.TotalExpenses = totalExpenses.ToString("N2");
        ViewBag.TotalSavings = totalSavings.ToString("N2");
        ViewBag.TotalEmergencyFund = totalEmergencyFund.ToString("N2");
        ViewBag.NetBalance = netBalanceValue.ToString("N2");
        ViewBag.NetBalanceValue = netBalanceValue; // Keep numeric value for comparisons
        ViewBag.RecentTransactions = recentTransactions;

        return View();
    }

    [HttpPost]
    public async Task<IActionResult> AddTransaction(decimal amount, string type, string description)
    {
        if (amount > 0 && !string.IsNullOrWhiteSpace(type) && !string.IsNullOrWhiteSpace(description))
        {
            var record = new ExpenseTracker
            {
                RecStatus = true,
                Description = description,
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now
            };

            // Set the appropriate field based on the type
            switch (type)
            {
                case "Income":
                    record.Income = amount.ToString("F2");
                    break;
                case "Expense":
                    record.Expense = amount.ToString("F2");
                    break;
                case "Savings":
                    record.Savings = amount.ToString("F2");
                    break;
                case "EmergencyFund":
                    record.EmergencyFund = amount.ToString("F2");
                    break;
                default:
                    return RedirectToAction("Index");
            }

            _context.ExpenseTrackers.Add(record);
            await _context.SaveChangesAsync();

            // Always return JSON for now to test AJAX
            return Json(new { success = true, message = "Transaction added successfully" });
        }

        // Return error JSON if validation fails
        return Json(new { success = false, message = "Invalid data provided" });
    }

    [HttpPost]
    public async Task<IActionResult> UpdateTransaction(int recId, string description, decimal amount, string type)
    {
        if (recId <= 0 || string.IsNullOrWhiteSpace(description) || amount <= 0 || string.IsNullOrWhiteSpace(type))
        {
            return Json(new { success = false, message = "Invalid data provided" });
        }

        var transaction = await _context.ExpenseTrackers
            .FirstOrDefaultAsync(t => t.RecId == recId && t.RecStatus == true);

        if (transaction == null)
        {
            return Json(new { success = false, message = "Transaction not found" });
        }

        // Clear all amount fields first
        transaction.Income = null;
        transaction.Expense = null;
        transaction.Savings = null;
        transaction.EmergencyFund = null;

        // Set the appropriate field based on the new type
        switch (type)
        {
            case "Income":
                transaction.Income = amount.ToString("F2");
                break;
            case "Expense":
                transaction.Expense = amount.ToString("F2");
                break;
            case "Savings":
                transaction.Savings = amount.ToString("F2");
                break;
            case "EmergencyFund":
                transaction.EmergencyFund = amount.ToString("F2");
                break;
            default:
                return Json(new { success = false, message = "Invalid transaction type" });
        }

        transaction.Description = description.Trim();
        transaction.UpdatedAt = DateTime.Now;

        try
        {
            await _context.SaveChangesAsync();
            return Json(new { success = true, message = "Transaction updated successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating transaction with ID {RecId}", recId);
            return Json(new { success = false, message = "Error updating transaction" });
        }
    }

    [HttpGet]
    public async Task<IActionResult> GetDashboardData()
    {
        // Get recent transactions (active records only) - limit to 6 with scroll to show 3
        var recentTransactions = await _context.ExpenseTrackers
            .Where(t => t.RecStatus == true)
            .OrderByDescending(t => t.CreatedAt)
            .Take(6)
            .ToListAsync();

        // Calculate totals from varchar fields (convert to decimal for calculation)
        decimal totalIncome = 0;
        decimal totalExpenses = 0;
        decimal totalSavings = 0;
        decimal totalEmergencyFund = 0;

        var activeRecords = await _context.ExpenseTrackers
            .Where(t => t.RecStatus == true)
            .ToListAsync();

        foreach (var record in activeRecords)
        {
            if (!string.IsNullOrEmpty(record.Income) && decimal.TryParse(record.Income, out decimal income))
                totalIncome += income;

            if (!string.IsNullOrEmpty(record.Expense) && decimal.TryParse(record.Expense, out decimal expense))
                totalExpenses += expense;

            if (!string.IsNullOrEmpty(record.Savings) && decimal.TryParse(record.Savings, out decimal savings))
                totalSavings += savings;

            if (!string.IsNullOrEmpty(record.EmergencyFund) && decimal.TryParse(record.EmergencyFund, out decimal emergencyFund))
                totalEmergencyFund += emergencyFund;
        }

        // Return JSON data for AJAX with comma formatting
        return Json(new
        {
            totalIncome = totalIncome.ToString("N2"),
            totalExpenses = totalExpenses.ToString("N2"),
            totalSavings = totalSavings.ToString("N2"),
            totalEmergencyFund = totalEmergencyFund.ToString("N2"),
            netBalance = (totalIncome - totalExpenses - totalSavings - totalEmergencyFund).ToString("N2"),
            recentTransactions = recentTransactions.Select(t => new
            {
                recId = t.RecId,
                createdAt = t.CreatedAt,
                description = t.Description,
                income = t.Income,
                expense = t.Expense,
                savings = t.Savings,
                emergencyFund = t.EmergencyFund
            })
        });
    }

    [HttpPost]
    public async Task<IActionResult> DeleteTransaction(int recId)
    {
        try
        {
            var transaction = await _context.ExpenseTrackers.FindAsync(recId);

            if (transaction == null)
            {
                return Json(new { success = false, message = "Transaction not found." });
            }

            // Mark as deleted by setting RecStatus to false
            transaction.RecStatus = false;
            transaction.UpdatedAt = DateTime.Now;

            await _context.SaveChangesAsync();

            return Json(new { success = true, message = "Transaction deleted successfully." });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting transaction with ID: {RecId}", recId);
            return Json(new { success = false, message = "An error occurred while deleting the transaction." });
        }
    }

    public IActionResult Privacy()
    {
        return View();
    }

    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public IActionResult Error()
    {
        return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
    }
}

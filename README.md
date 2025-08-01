# 💰 Personal Finance Tracker

A modern, minimal ASP.NET Core MVC application for tracking personal finances with real-time updates and professional UI design.

![.NET Core](https://img.shields.io/badge/.NET-8.0-blue)
![Entity Framework](https://img.shields.io/badge/Entity%20Framework-Core%209.0.7-green)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5.0-purple)
![SQL Server](https://img.shields.io/badge/SQL%20Server-Database-red)

## ✨ Features

### 💼 Core Functionality
- **Real-time Transaction Management**: Add, edit, and delete income, expenses, savings, and emergency fund entries
- **Dynamic Net Balance Calculation**: Automatic calculation with visual indicators for positive/negative balance
- **Currency Formatting**: Professional display with comma separators (₱1,234.56)
- **Category-based Organization**: Color-coded transaction types for easy identification

### 🎨 Modern UI/UX
- **Minimal Design**: Clean, professional interface with subtle shadows and animations
- **Fixed Header Table**: Scrollable transaction list with persistent column headers
- **Responsive Layout**: Mobile-friendly design using Bootstrap 5
- **SweetAlert2 Integration**: Beautiful success/error notifications
- **Smooth Animations**: Fade-in effects and hover transitions

### 🔧 Technical Features
- **AJAX Operations**: Seamless form submissions without page refresh
- **Entity Framework Core**: Code-first approach with SQL Server integration
- **Real-time Updates**: Live dashboard data refresh after each transaction
- **Professional Color Scheme**: Consistent minimal color palette
- **Accessibility**: Proper ARIA labels and keyboard navigation

## 🚀 Getting Started

### Prerequisites
- .NET 8.0 SDK
- SQL Server (LocalDB or full instance)
- Visual Studio Code or Visual Studio 2022

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/vincentson-dev/MVC-EXPENSE-TRACKER.git
   cd MVC-EXPENSE-TRACKER
   ```

2. **Update Connection String**
   Edit `appsettings.json` and update the connection string:
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=expense_tracker;Trusted_Connection=true;MultipleActiveResultSets=true"
     }
   }
   ```

3. **Install Dependencies**
   ```bash
   dotnet restore
   npm install
   ```

4. **Create Database**
   ```bash
   dotnet ef database update
   ```

5. **Run the Application**
   ```bash
   dotnet run
   ```

6. **Access the Application**
   Open your browser and navigate to `https://localhost:7086`

## 📊 Database Schema

The application uses a single table `expenseTrackerDB` with the following structure:

| Column | Type | Description |
|--------|------|-------------|
| recId | int (Identity) | Primary key |
| description | nvarchar(255) | Transaction description |
| income | varchar(50) | Income amount |
| expense | varchar(50) | Expense amount |
| savings | varchar(50) | Savings amount |
| emergencyFund | varchar(50) | Emergency fund amount |
| recstatus | bit | Active/inactive flag |
| created_at | datetime2 | Creation timestamp |
| updated_at | datetime2 | Last update timestamp |

## 🎯 Usage

### Adding Transactions
1. Use the **Quick Actions** form to add new transactions
2. Enter amount, select category, and provide description
3. Click "Add" - the dashboard updates automatically

### Managing Transactions
- **Edit**: Click the blue edit icon in any transaction row
- **Delete**: Click the red delete icon to remove a transaction
- **View**: Scroll through up to 6 recent transactions with fixed headers

### Dashboard Overview
- **Net Balance**: Displays overall financial health with color indicators
- **Summary Cards**: Shows totals for income, expenses, savings, and emergency fund
- **Recent Transactions**: Real-time list with category-based color coding

## 🏗️ Project Structure

```
├── Controllers/
│   └── HomeController.cs          # Main controller with CRUD operations
├── Data/
│   └── ApplicationDbContext.cs    # Entity Framework context
├── Models/
│   ├── ExpenseTracker.cs         # Main transaction model
│   └── ErrorViewModel.cs         # Error handling model
├── Views/
│   ├── Home/
│   │   └── Index.cshtml          # Main dashboard view
│   └── Shared/
│       └── _Layout.cshtml        # Layout template
├── wwwroot/
│   ├── css/
│   │   └── site.css              # Custom minimal styling
│   ├── js/
│   │   └── custom.js             # AJAX and UI interactions
│   └── lib/                      # Third-party libraries
├── Program.cs                     # Application configuration
└── projects.csproj               # Project dependencies
```

## 🎨 Design Philosophy

This project follows a **minimal design approach** with:
- **Clean Typography**: Segoe UI font family for readability
- **Subtle Animations**: Smooth transitions without distraction
- **Professional Colors**: Consistent color palette throughout
- **Accessible UI**: High contrast and clear visual hierarchy
- **Responsive Design**: Works seamlessly on all device sizes

## 🔧 Technologies Used

- **Backend**: ASP.NET Core 8.0 MVC
- **Database**: Entity Framework Core 9.0.7 with SQL Server
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **UI Framework**: Bootstrap 5.0
- **AJAX Library**: jQuery 3.6+
- **Notifications**: SweetAlert2
- **Icons**: Font Awesome 6.0

## 📝 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Main dashboard |
| POST | `/Home/AddTransaction` | Add new transaction |
| POST | `/Home/UpdateTransaction` | Update existing transaction |
| POST | `/Home/DeleteTransaction` | Delete transaction |
| GET | `/Home/GetDashboardData` | Get dashboard data (AJAX) |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with ❤️ using ASP.NET Core
- UI inspired by modern financial applications
- Icons provided by Font Awesome
- Notifications powered by SweetAlert2

## 📞 Support

For support, please open an issue on GitHub or contact the development team.

---

**Made with 💻 and ☕ by Vincent**

$(document).ready(function () {
    console.log('Custom.js loaded successfully!'); // Debug log

    // Test if edit buttons exist
    setTimeout(function () {
        console.log('Edit buttons found:', $('.edit-transaction-btn').length);
    }, 1000);

    // Test button handler
    $('#testBtn').on('click', function () {
        alert('Test button works! jQuery is functioning.');
        console.log('Test button clicked');
    });

    // Handle Quick Actions form submission with AJAX
    $('form[asp-action="AddTransaction"]').on('submit', function (e) {
        e.preventDefault(); // Prevent default form submission

        // Get form data
        const amount = $('input[name="amount"]').val();
        const type = $('select[name="type"]').val();
        const description = $('input[name="description"]').val();

        // Validate form data
        if (!amount || !type || !description) {
            showNotification('Please fill in all fields', 'error');
            return;
        }

        if (parseFloat(amount) <= 0) {
            showNotification('Amount must be greater than 0', 'error');
            return;
        }

        // Disable form during submission
        const submitBtn = $(this).find('button[type="submit"]');
        const originalText = submitBtn.html();
        submitBtn.prop('disabled', true).html('<i class="fas fa-spinner fa-spin me-1"></i>Adding...');

        // Prepare data for AJAX request
        const transactionData = {
            amount: parseFloat(amount),
            type: type,
            description: description
        };

        // Send AJAX request
        $.ajax({
            url: '/Home/AddTransaction',
            type: 'POST',
            data: transactionData,
            success: function (response) {
                // Clear form
                $('input[name="amount"]').val('');
                $('select[name="type"]').val('');
                $('input[name="description"]').val('');

                // Show success message
                showNotification('Transaction added successfully!', 'success');

                // Refresh the page data
                refreshDashboardData();
            },
            error: function (xhr, status, error) {
                console.error('Error adding transaction:', error);
                showNotification('Error adding transaction. Please try again.', 'error');
            },
            complete: function () {
                // Re-enable form
                submitBtn.prop('disabled', false).html(originalText);
            }
        });
    });

    // Function to refresh dashboard data without full page reload
    function refreshDashboardData() {
        $.ajax({
            url: '/Home/GetDashboardData',
            type: 'GET',
            success: function (data) {
                // Update summary cards
                updateSummaryCards(data);

                // Update recent transactions table
                updateTransactionsTable(data.recentTransactions);
            },
            error: function (xhr, status, error) {
                console.error('Error refreshing dashboard:', error);
                // Fallback: reload the page
                location.reload();
            }
        });
    }

    // Function to update summary cards
    function updateSummaryCards(data) {
        $('.card-body h3:contains("₱")').each(function () {
            const cardTitle = $(this).siblings('h5').text().toLowerCase();

            if (cardTitle.includes('income')) {
                $(this).text('₱' + (data.totalIncome || 0).toFixed(2));
            } else if (cardTitle.includes('expenses')) {
                $(this).text('₱' + (data.totalExpenses || 0).toFixed(2));
            } else if (cardTitle.includes('savings')) {
                $(this).text('₱' + (data.totalSavings || 0).toFixed(2));
            } else if (cardTitle.includes('emergency')) {
                $(this).text('₱' + (data.totalEmergencyFund || 0).toFixed(2));
            }
        });

        // Update net balance card
        $('.card-body h2:contains("₱")').each(function () {
            const cardTitle = $(this).siblings('h5').text().toLowerCase();
            if (cardTitle.includes('net balance')) {
                $(this).text('₱' + (data.netBalance || 0).toFixed(2));

                // Update card color based on balance
                const card = $(this).closest('.card');
                card.removeClass('bg-info bg-secondary');
                if (data.netBalance >= 0) {
                    card.addClass('bg-info');
                } else {
                    card.addClass('bg-secondary');
                }
            }
        });
    }

    // Function to update transactions table
    function updateTransactionsTable(transactions) {
        const tbody = $('#transactions-tbody');
        tbody.empty();

        if (transactions && transactions.length > 0) {
            transactions.forEach(function (transaction) {
                const row = createTransactionRow(transaction);
                tbody.append(row);
            });
        } else {
            tbody.append('<tr><td colspan="6" class="text-center">No transactions found. Add some income or expenses to get started!</td></tr>');
        }
    }

    // Function to create a transaction table row
    function createTransactionRow(transaction) {
        let category = '';
        let amount = '';
        let badge = '';

        if (transaction.income) {
            category = 'Income';
            amount = '<span class="text-success">+₱' + transaction.income + '</span>';
            badge = '<span class="badge bg-success">Income</span>';
        } else if (transaction.expense) {
            category = 'Expense';
            amount = '<span class="text-danger">-₱' + transaction.expense + '</span>';
            badge = '<span class="badge bg-danger">Expense</span>';
        } else if (transaction.savings) {
            category = 'Savings';
            amount = '<span class="text-primary">₱' + transaction.savings + '</span>';
            badge = '<span class="badge bg-primary">Savings</span>';
        } else if (transaction.emergencyFund) {
            category = 'Emergency Fund';
            amount = '<span class="text-warning">₱' + transaction.emergencyFund + '</span>';
            badge = '<span class="badge bg-warning">Emergency Fund</span>';
        }

        const date = new Date(transaction.createdAt).toISOString().split('T')[0];

        // Get the actual amount value for the data attribute
        let actualAmount = '';
        let transactionType = '';

        if (transaction.income) {
            actualAmount = transaction.income;
            transactionType = 'Income';
        } else if (transaction.expense) {
            actualAmount = transaction.expense;
            transactionType = 'Expense';
        } else if (transaction.savings) {
            actualAmount = transaction.savings;
            transactionType = 'Savings';
        } else if (transaction.emergencyFund) {
            actualAmount = transaction.emergencyFund;
            transactionType = 'EmergencyFund';
        }

        return `
            <tr data-rec-id="${transaction.recId}">
                <td>${date}</td>
                <td class="description-cell">${transaction.description || ''}</td>
                <td>${category}</td>
                <td>${amount}</td>
                <td>${badge}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary edit-transaction-btn" 
                            data-rec-id="${transaction.recId}"
                            data-description="${transaction.description || ''}"
                            data-amount="${actualAmount}"
                            data-type="${transactionType}"
                            title="Edit Transaction">
                        <i class="fas fa-edit"></i>
                    </button>
                </td>
            </tr>
        `;
    }

    // Function to show notifications
    function showNotification(message, type) {
        // Remove existing notifications
        $('.alert-notification').remove();

        const alertClass = type === 'success' ? 'alert-success' : 'alert-danger';
        const icon = type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-triangle';

        const notification = $(`
            <div class="alert ${alertClass} alert-dismissible fade show alert-notification" role="alert" style="position: fixed; top: 20px; right: 20px; z-index: 9999; min-width: 300px;">
                <i class="${icon} me-2"></i>${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `);

        $('body').append(notification);

        // Auto-dismiss after 5 seconds
        setTimeout(function () {
            notification.fadeOut(function () {
                $(this).remove();
            });
        }, 5000);
    }

    // Modal functionality for editing transactions
    $(document).on('click', '.edit-transaction-btn', function (e) {
        e.preventDefault();
        console.log('Edit button clicked!'); // Debug log

        const button = $(this);
        const recId = button.data('rec-id');
        const description = button.data('description');
        const amount = button.data('amount');
        const type = button.data('type');

        console.log('Data:', { recId, description, amount, type }); // Debug log

        // Populate modal fields
        $('#editRecId').val(recId);
        $('#editDescription').val(description);
        $('#editAmount').val(amount);
        $('#editType').val(type);
        $('#editOriginalType').val(type);

        // Show modal
        $('#editTransactionModal').modal('show');
    });

    // Handle save button in modal
    $('#saveTransactionBtn').on('click', function () {
        const form = $('#editTransactionForm');
        const recId = $('#editRecId').val();
        const description = $('#editDescription').val().trim();
        const amount = parseFloat($('#editAmount').val());
        const type = $('#editType').val();

        // Validate form
        if (!description) {
            showNotification('Description is required', 'error');
            return;
        }

        if (!amount || amount <= 0) {
            showNotification('Amount must be greater than 0', 'error');
            return;
        }

        if (!type) {
            showNotification('Transaction type is required', 'error');
            return;
        }

        // Disable save button during request
        const saveBtn = $(this);
        const originalText = saveBtn.html();
        saveBtn.prop('disabled', true).html('<i class="fas fa-spinner fa-spin me-1"></i>Saving...');

        // Send AJAX request
        $.ajax({
            url: '/Home/UpdateTransaction',
            type: 'POST',
            data: {
                recId: recId,
                description: description,
                amount: amount,
                type: type
            },
            success: function (response) {
                if (response.success) {
                    showNotification(response.message || 'Transaction updated successfully', 'success');
                    $('#editTransactionModal').modal('hide');

                    // Refresh dashboard data
                    refreshDashboardData();
                } else {
                    showNotification(response.message || 'Error updating transaction', 'error');
                }
            },
            error: function (xhr, status, error) {
                console.error('Error updating transaction:', error);
                showNotification('Error updating transaction', 'error');
            },
            complete: function () {
                // Re-enable save button
                saveBtn.prop('disabled', false).html(originalText);
            }
        });
    });

    // Reset modal when closed
    $('#editTransactionModal').on('hidden.bs.modal', function () {
        $('#editTransactionForm')[0].reset();
    });
});
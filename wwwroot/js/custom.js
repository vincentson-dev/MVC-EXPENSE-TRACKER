$(document).ready(function () {
    console.log('Custom.js loaded successfully!'); // Debug log
    
    // Check if SweetAlert2 is loaded
    if (typeof Swal !== 'undefined') {
        console.log('SweetAlert2 is loaded and ready!');
    } else {
        console.error('SweetAlert2 is not loaded!');
    }

    // Add loading animation to cards
    setTimeout(function() {
        $('.fade-in-up').each(function(index) {
            $(this).css('animation-delay', (index * 0.1) + 's');
        });
    }, 100);

    // Add hover effects to summary cards
    $('.summary-card').hover(
        function() {
            $(this).css('transform', 'translateY(-10px) scale(1.02)');
        },
        function() {
            $(this).css('transform', 'translateY(0) scale(1)');
        }
    );

    // Test if edit buttons exist
    setTimeout(function () {
        console.log('Edit buttons found:', $('.edit-transaction-btn').length);
    }, 1000);

    // Test button handler
    $('#testBtn').on('click', function () {
        alert('Test button works! jQuery is functioning.');
        console.log('Test button clicked');
    });

    // Add a global test function for SweetAlert2
    window.testSwal = function() {
        Swal.fire({
            title: 'Test Alert!',
            text: 'SweetAlert2 is working correctly!',
            icon: 'success',
            confirmButtonText: 'Great!'
        });
    };

    // Initialize transaction header text on page load
    setTimeout(function() {
        const transactionRows = $('#transactions-tbody tr').length;
        if (transactionRows > 0) {
            // Don't count the "no transactions" row
            const actualCount = $('#transactions-tbody tr[data-rec-id]').length;
            updateTransactionHeaderText(actualCount);
        }
    }, 500);

    // Test if form exists
    setTimeout(function () {
        console.log('Forms found:', $('#addTransactionForm').length);
        console.log('Form selector working:', $('#addTransactionForm'));
    }, 1000);

    // Handle Quick Actions form submission with AJAX
    $(document).on('submit', '#addTransactionForm', function (e) {
        e.preventDefault(); // Prevent default form submission
        e.stopPropagation(); // Stop event bubbling
        console.log('Form submission intercepted by AJAX handler'); // Debug log

        // Get form data
        const amount = $('input[name="amount"]').val();
        const type = $('select[name="type"]').val();
        const description = $('input[name="description"]').val();

        console.log('Form data:', { amount, type, description }); // Debug log

        // Validate form data
        if (!amount || !type || !description) {
            Swal.fire({
                title: 'Validation Error',
                text: 'Please fill in all fields',
                icon: 'warning',
                confirmButtonText: 'OK'
            });
            return;
        }

        if (parseFloat(amount) <= 0) {
            Swal.fire({
                title: 'Validation Error',
                text: 'Amount must be greater than 0',
                icon: 'warning',
                confirmButtonText: 'OK'
            });
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
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            },
            data: transactionData,
            success: function (response) {
                console.log('AJAX response received:', response); // Debug log
                if (response.success) {
                    console.log('Success response, showing SweetAlert2'); // Debug log
                    // Use modern SweetAlert2 for success notification
                    Swal.fire({
                        title: '🎉 Success!',
                        text: response.message || 'Transaction added successfully',
                        icon: 'success',
                        timer: 3000,
                        timerProgressBar: true,
                        showConfirmButton: false,
                        toast: true,
                        position: 'top-end',
                        background: 'linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%)',
                        color: 'white',
                        iconColor: 'white'
                    });

                    // Clear form
                    $('input[name="amount"]').val('');
                    $('select[name="type"]').val('');
                    $('input[name="description"]').val('');

                    // Refresh dashboard data
                    refreshDashboardData();
                } else {
                    console.log('Error response, showing error SweetAlert2'); // Debug log
                    // Use modern SweetAlert2 for error notification
                    Swal.fire({
                        title: '⚠️ Error!',
                        text: response.message || 'Error adding transaction',
                        icon: 'error',
                        confirmButtonText: 'Try Again',
                        background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
                        color: 'white',
                        confirmButtonColor: '#ffffff',
                        confirmButtonTextColor: '#ff6b6b'
                    });
                }
            },
            error: function (xhr, status, error) {
                console.error('AJAX error:', error); // Debug log
                console.error('Status:', status); // Debug log
                console.error('Response:', xhr.responseText); // Debug log
                Swal.fire({
                    title: 'Error!',
                    text: 'Error adding transaction. Please try again.',
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
            },
            complete: function () {
                // Re-enable form
                submitBtn.prop('disabled', false).html(originalText);
            }
        });

        return false; // Prevent any further form submission
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
            const cardTitle = $(this).siblings('h6').text().toLowerCase();

            if (cardTitle.includes('income')) {
                $(this).text('₱' + data.totalIncome);
            } else if (cardTitle.includes('expenses')) {
                $(this).text('₱' + data.totalExpenses);
            } else if (cardTitle.includes('savings')) {
                $(this).text('₱' + data.totalSavings);
            } else if (cardTitle.includes('emergency')) {
                $(this).text('₱' + data.totalEmergencyFund);
            }
        });

        // Update net balance card
        $('.card-body h2:contains("₱")').each(function () {
            const cardTitle = $(this).siblings('h5').text().toLowerCase();
            if (cardTitle.includes('net balance')) {
                $(this).text('₱' + data.netBalance);

                // Update card color based on balance (parse the number for comparison)
                const balanceValue = parseFloat(data.netBalance.replace(/,/g, ''));
                const card = $(this).closest('.card');
                card.removeClass('positive negative');
                if (balanceValue >= 0) {
                    card.addClass('positive');
                    card.css('background-color', 'var(--success-color)');
                } else {
                    card.addClass('negative');
                    card.css('background-color', 'var(--danger-color)');
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
            
            // Update header text based on number of transactions
            updateTransactionHeaderText(transactions.length);
        } else {
            tbody.append('<tr><td colspan="6" class="text-center">No transactions found. Add some income or expenses to get started!</td></tr>');
            tbody.append('<tr><td colspan="6" class="text-center"><button class="btn btn-sm btn-primary edit-transaction-btn me-1" data-rec-id="999" data-description="Test Transaction" data-type="Income" data-amount="100.00" title="Test Edit Button">Edit Test</button><button class="btn btn-sm btn-danger delete-transaction-btn" data-rec-id="999" title="Test Delete Button">Delete Test</button></td></tr>');
            updateTransactionHeaderText(0);
        }
    }

    // Function to update transaction header text based on count
    function updateTransactionHeaderText(count) {
        const headerText = $('#transaction-count');
        if (count <= 3) {
            headerText.html(`<i class="fas fa-check-circle me-1"></i>Showing ${count} of ${count} entries`);
        } else {
            headerText.html(`<i class="fas fa-info-circle me-1"></i>Showing 3 of ${count} entries (scroll to see more)`);
        }
    }

    // Function to create a transaction table row
    function createTransactionRow(transaction) {
        let category = '';
        let amount = '';
        let badge = '';

        // Get the actual amount value for the data attribute
        let actualAmount = '';
        let transactionType = '';

        // Helper function to format currency
        function formatCurrency(value) {
            if (value) {
                return parseFloat(value).toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                });
            }
            return value;
        }

        if (transaction.income) {
            category = 'Income';
            amount = '<span class="fw-bold text-success"><i class="fas fa-arrow-up me-1"></i>+₱' + formatCurrency(transaction.income) + '</span>';
            badge = '<span class="badge" style="background-color: var(--success-color); color: white;"><i class="fas fa-wallet me-1"></i>Income</span>';
            actualAmount = transaction.income;
            transactionType = 'Income';
        } else if (transaction.expense) {
            category = 'Expense';
            amount = '<span class="fw-bold text-danger"><i class="fas fa-arrow-down me-1"></i>-₱' + formatCurrency(transaction.expense) + '</span>';
            badge = '<span class="badge" style="background-color: var(--danger-color); color: white;"><i class="fas fa-credit-card me-1"></i>Expense</span>';
            actualAmount = transaction.expense;
            transactionType = 'Expense';
        } else if (transaction.savings) {
            category = 'Savings';
            amount = '<span class="fw-bold" style="color: var(--info-color);"><i class="fas fa-piggy-bank me-1"></i>₱' + formatCurrency(transaction.savings) + '</span>';
            badge = '<span class="badge" style="background-color: var(--info-color); color: white;"><i class="fas fa-piggy-bank me-1"></i>Savings</span>';
            actualAmount = transaction.savings;
            transactionType = 'Savings';
        } else if (transaction.emergencyFund) {
            category = 'Emergency Fund';
            amount = '<span class="fw-bold" style="color: var(--warning-color);"><i class="fas fa-shield-alt me-1"></i>₱' + formatCurrency(transaction.emergencyFund) + '</span>';
            badge = '<span class="badge" style="background-color: var(--warning-color); color: white;"><i class="fas fa-shield-alt me-1"></i>Emergency Fund</span>';
            actualAmount = transaction.emergencyFund;
            transactionType = 'EmergencyFund';
        }

        const date = new Date(transaction.createdAt).toISOString().split('T')[0];

        return `
            <tr data-rec-id="${transaction.recId}">
                <td style="width: 12%;">${date}</td>
                <td class="description-cell" style="width: 30%;">${transaction.description || ''}</td>
                <td style="width: 15%;">${category}</td>
                <td style="width: 15%;">${amount}</td>
                <td style="width: 13%;">${badge}</td>
                <td class="text-center" style="width: 15%;">
                    <div class="btn-group" role="group">
                        <button class="btn btn-sm btn-outline-primary edit-transaction-btn" 
                                data-rec-id="${transaction.recId}"
                                data-description="${transaction.description || ''}"
                                data-amount="${actualAmount}"
                                data-type="${transactionType}"
                                title="Edit Transaction">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger delete-transaction-btn" 
                                data-rec-id="${transaction.recId}"
                                title="Delete Transaction">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
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
            Swal.fire({
                title: 'Validation Error',
                text: 'Description is required',
                icon: 'warning',
                confirmButtonText: 'OK'
            });
            return;
        }

        if (!amount || amount <= 0) {
            Swal.fire({
                title: 'Validation Error',
                text: 'Amount must be greater than 0',
                icon: 'warning',
                confirmButtonText: 'OK'
            });
            return;
        }

        if (!type) {
            Swal.fire({
                title: 'Validation Error',
                text: 'Transaction type is required',
                icon: 'warning',
                confirmButtonText: 'OK'
            });
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
                    Swal.fire({
                        title: 'Updated!',
                        text: response.message || 'Transaction updated successfully',
                        icon: 'success',
                        timer: 2000,
                        timerProgressBar: true,
                        showConfirmButton: false,
                        toast: true,
                        position: 'top-end'
                    });
                    $('#editTransactionModal').modal('hide');

                    // Refresh dashboard data
                    refreshDashboardData();
                } else {
                    Swal.fire({
                        title: 'Error!',
                        text: response.message || 'Error updating transaction',
                        icon: 'error',
                        confirmButtonText: 'OK'
                    });
                }
            },
            error: function (xhr, status, error) {
                console.error('Error updating transaction:', error);
                Swal.fire({
                    title: 'Error!',
                    text: 'Error updating transaction',
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
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

    // Delete transaction functionality
    $(document).on('click', '.delete-transaction-btn', function (e) {
        e.preventDefault();
        console.log('Delete button clicked!'); // Debug log

        const button = $(this);
        const recId = button.data('rec-id');

        console.log('Delete recId:', recId); // Debug log

        // Show SweetAlert2 confirmation dialog
        Swal.fire({
            title: 'Are you sure?',
            text: 'You want to delete this transaction? This action cannot be undone.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.isConfirmed) {
                // Disable delete button during request
                const originalText = button.html();
                button.prop('disabled', true).html('<i class="fas fa-spinner fa-spin me-1"></i>Deleting...');

                // Send AJAX request
                $.ajax({
                    url: '/Home/DeleteTransaction',
                    type: 'POST',
                    data: {
                        recId: recId
                    },
                    success: function (response) {
                        if (response.success) {
                            Swal.fire({
                                title: 'Deleted!',
                                text: response.message || 'Transaction deleted successfully',
                                icon: 'success',
                                timer: 2000,
                                timerProgressBar: true,
                                showConfirmButton: false,
                                toast: true,
                                position: 'top-end'
                            });

                            // Refresh dashboard data
                            refreshDashboardData();
                        } else {
                            Swal.fire({
                                title: 'Error!',
                                text: response.message || 'Error deleting transaction',
                                icon: 'error',
                                confirmButtonText: 'OK'
                            });
                        }
                    },
                    error: function (xhr, status, error) {
                        console.error('Error deleting transaction:', error);
                        Swal.fire({
                            title: 'Error!',
                            text: 'Error deleting transaction',
                            icon: 'error',
                            confirmButtonText: 'OK'
                        });
                    },
                    complete: function () {
                        // Re-enable delete button
                        button.prop('disabled', false).html(originalText);
                    }
                });
            }
        });
    });
});

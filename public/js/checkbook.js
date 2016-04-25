'use strict';

$(document).ready(function() {
    $('.datepicker').pickadate({
        selectMonths: true,
        selectYears: 15
    });

    var docHeight = $(window).height();
    var footerHeight = $('footer').height();
    var footerTop = $('footer').position().top + footerHeight;

    if (footerTop < docHeight) {
        $('footer').css('margin-top', 10 + (docHeight - footerTop) + 'px');
    }
    
    $('.modal-trigger').leanModal();

    $('.add-form').submit(addTransaction);
    $('.transactions').on('click', '.delete-btn', deleteTransaction);
    $('.transactions').on('click', '.edit-btn', editTransaction);
    $('.edit-form').submit(saveTransaction);

    $('#transactions-table').tablesorter();

    updateRunningTotal();
});

function addTransaction(event) {
    event.preventDefault();

    if ($('input[name=transaction]:checked').val() === 'credit') {
        var type = 0;
    } else {
        type = 1;
    }

    var transaction = {
        date: $('#date').val(),
        description: $('#description').val(),
        transaction: type,
        amount: $('#amount').val()
    };
    
    $('#date').val('');
    $('#description').val('');
    $('#amount').val('');
    $('#credit').attr('checked', false);
    $('#debit').attr('checked', false);

    $.ajax({
        url: '/api/checkbook',
        method: 'POST',
        data: transaction,
        success: function(newTransaction) {
            var $transaction = $('.template').clone();
            $transaction.removeClass('template');

            $transaction.find('.date').text(newTransaction.date);
            $transaction.find('.description').text(newTransaction.description);

            if (newTransaction.type === 0) {
                $transaction.find('.credit').text('$' + newTransaction.amount);
                var currentCreditBal = parseFloat($('.credit-total').text());
                var newCreditBal = currentCreditBal + newTransaction.amount;
                $('.credit-total').text(newCreditBal);
            } else {
                $transaction.find('.debit').text('$' + newTransaction.amount);
                var currentDebitBal = parseFloat($('.debit-total').text());
                var newDebitBal = currentDebitBal + newTransaction.amount;
                $('.debit-total').text(newDebitBal);
            }

            $transaction.find('.edit-btn').attr('data-id', newTransaction.id);
            $transaction.find('.delete-btn').attr('data-id', newTransaction.id);

            $('.transactions').append($transaction);
            
            $('.modal-trigger').leanModal('destroy');

            updateRunningTotal();
        },
        error: function(err) {
            console.error('error:', err)
        }
    });
}

function deleteTransaction() {
    var id = $(this).attr('data-id');
    var $transaction = $(this);
    
    $.ajax({
        url: '/api/checkbook/' + id,
        method: 'DELETE',
        success: function() {
            var creditAmt = $transaction.closest('tr').find('.credit').text().replace(/\$/, '');
            var debitAmt = $transaction.closest('tr').find('.debit').text().replace(/\$/, '');

            if (creditAmt > 0) {
                var currentCreditBal = parseFloat($('.credit-total').text());
                var newCreditBal = currentCreditBal - creditAmt;
                $('.credit-total').text(newCreditBal);
            } else {
                var currentDebitBal = parseFloat($('.debit-total').text());
                var newDebitBal = currentDebitBal - debitAmt;
                $('.debit-total').text(newDebitBal);
            }

            $transaction.closest('tr').remove();

            updateRunningTotal();
        },
        error: function(err) {
            console.error('error:', err);
        }
    });
}

function editTransaction() {
    var id = $(this).attr('data-id');
    
    $.ajax({
        url: '/api/checkbook/' + id,
        type: 'GET',
        success: function(data) {
            $('#edit-date').val(data.date);
            $('#edit-description').val(data.description);

            if (data.type === 0) {
                $('#edit-credit').attr('checked', true);
            } else {
                $('#edit-debit').attr('checked', true);
            }

            $('#edit-amount').val(data.amount);
            $('#edit-id').val(data.id);
        },
        error: function(err) {
            console.error('error:', err);
        }
    })
}

function saveTransaction(event) {
    event.preventDefault();

    if ($('input[name=edit-transaction]:checked').val() === 'credit') {
        var type = 0;
    } else {
        type = 1;
    }

    var transaction = {
        date: $('#edit-date').val(),
        description: $('#edit-description').val(),
        transaction: type,
        amount: $('#edit-amount').val()
    };

    $.ajax({
        url: '/api/checkbook/' + $('#edit-id').val(),
        type: 'PUT',
        data: transaction,
        success: function() {
            var $tx = $('.transactions').find('[data-id="' + $('#edit-id').val() + '"]');

            var creditAmt = parseFloat($tx.closest('tr').find('.credit').text().replace(/\$/, ''));
            var debitAmt = parseFloat($tx.closest('tr').find('.debit').text().replace(/\$/, ''));

            $tx.closest('tr').remove();

            var $transaction = $('.template').clone();
            $transaction.removeClass('template');

            $transaction.find('.date').text(transaction.date);
            $transaction.find('.description').text(transaction.description);

            if (transaction.type === 0) {
                $transaction.find('.credit').text('$' + transaction.amount);
                var currentCreditBal = parseFloat($('.credit-total').text());
                var newCreditBal = currentCreditBal - creditAmt + parseFloat(transaction.amount);
                $('.credit-total').text(newCreditBal);
            } else {
                $transaction.find('.debit').text('$' + transaction.amount);
                var currentDebitBal = parseFloat($('.debit-total').text());
                var newDebitBal = currentDebitBal - debitAmt + parseFloat(transaction.amount);
                $('.debit-total').text(newDebitBal);
            }

            $transaction.find('.edit-btn').attr('data-id', $('#edit-id').val());
            $transaction.find('.delete-btn').attr('data-id', $('#edit-id').val());

            $('.transactions').append($transaction);

            $('.modal-trigger').leanModal('destroy');

            $('#edit-date').val('');
            $('#edit-description').val('');
            $('#edit-amount').val('');
            $('#edit-credit').attr('checked', false);
            $('#edit-debit').attr('checked', false);
            $('#edit-id').val('');

            updateRunningTotal();
        },
        error: function(err) {
            console.log('error:', err);
        }
    });
}

function updateRunningTotal() {
    var total = parseFloat($('.credit-total').text()) - parseFloat($('.debit-total').text());
    $('.running-total').text('$' + (Math.round(Math.abs(total * 100))) / 100);

    if (total < 0) {
        $('.running-total').removeClass('green-text').removeClass('black-text').addClass('red-text');
    } else if (total > 0) {
        $('.running-total').removeClass('red-text').removeClass('black-text').addClass('green-text');
    } else {
        $('.running-total').removeClass('green-text').removeClass('black-text').addClass('black-text');
    }
}
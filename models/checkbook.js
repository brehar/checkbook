'use strict';

var db = require('../config/db');

db.run('CREATE TABLE IF NOT EXISTS checkbook (id INTEGER PRIMARY KEY AUTOINCREMENT, date DATETIME, description TEXT, type BOOLEAN, amount REAL)');

exports.get = function(cb) {
    db.all('SELECT * FROM checkbook', cb);
};

exports.getOneById = function(id, cb) {
    db.get('SELECT * FROM checkbook WHERE id = ?', id, cb);
};

exports.getCreditTotal = function(cb) {
    db.get('SELECT sum(amount) AS "Total Credits" FROM checkbook WHERE type=0', cb);
};

exports.getDebitTotal = function(cb) {
    db.get('SELECT sum(amount) AS "Total Debits" FROM checkbook WHERE type=1', cb);
};

exports.create = function(transaction, cb) {
    if (!transaction.amount || !transaction.transaction) {
        return cb('Missing required field.');
    }
    
    db.run('INSERT INTO checkbook (date, description, type, amount) VALUES (?, ?, ?, ?)', transaction.date, transaction.description, transaction.transaction, transaction.amount, (err) => {
        if (err) return cb(err);
        
        db.get('SELECT * FROM checkbook WHERE id = (SELECT MAX(id) FROM checkbook)', cb);
    });
};

exports.removeById = function(id, cb) {
    if (!id) return cb('Transaction id required.');
    
    db.run(`DELETE FROM checkbook WHERE id='${id}'`, function(err) {
        cb(err);
    });
};

exports.updateById = function(id, newTransaction, cb) {
    if (!id) return cb('Transaction id required.');

    if (!newTransaction.amount || !newTransaction.transaction) {
        return cb('Missing required field.');
    }
    
    db.run('UPDATE checkbook SET date = $date, description = $description, type = $type, amount = $amount WHERE id = $id', {
        $date: newTransaction.date,
        $description: newTransaction.description,
        $type: newTransaction.transaction,
        $amount: newTransaction.amount,
        $id: id
    }, cb);
};
'use strict';

var express = require('express');
var router = express.Router();

var Checkbook = require('../models/checkbook');

router.route('/').get((req, res) => {
    Checkbook.get((err, transactions) => {
        if (err) {
            return res.status(400).send(err);
        }

        res.send(transactions);
    });
}).post((req, res) => {
    Checkbook.create(req.body, (err, newTransaction) => {
        if (err) {
            return res.status(400).send(err);
        }
        
        res.send(newTransaction);
    });
});

router.route('/:id').get((req, res) => {
    var id = req.params.id;
    
    Checkbook.getOneById(id, (err, transaction) => {
        if (err || !transaction) {
            return res.status(400).send(err || 'Transaction not found.');
        }

        res.send(transaction);
    })
}).put((req, res) => {
    var id = req.params.id;

    Checkbook.updateById(id, req.body, err => {
        res.send();
    });
}).delete((req, res) => {
    var id = req.params.id;

    Checkbook.removeById(id, err => {
        if (err) return res.status(400).send(err);

        res.send();
    });
});

module.exports = router;
'use strict';

const PORT = process.env.PORT || 3000;

var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');

var Checkbook = require('./models/checkbook');

var app = express();

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static('public'));

app.set('view engine', 'ejs');

app.use('/api', require('./routes/api'));

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/checkbook', (req, res) => {
    Checkbook.get((err, transactions) => {
        if (err) {
            res.status(400).send(err);
        } else {
            Checkbook.getCreditTotal((err, totalCredits) => {
                if (err) {
                    res.status(400).send(err);
                } else {
                    Checkbook.getDebitTotal((err, totalDebits) => {
                        if (err) {
                            res.status(400).send(err);
                        } else {
                            res.render('checkbook', {transactions: transactions, totalCredits: totalCredits, totalDebits: totalDebits});
                        }
                    });
                }
            });
        }
    });
});

app.listen(PORT, err => {
    console.log(err || `Server listening on port ${PORT}`);
});
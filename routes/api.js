'use strict';

var express = require('express');
var router = express.Router();

router.use('/checkbook', require('./checkbook'));

module.exports = router;
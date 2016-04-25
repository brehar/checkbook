'use strict';

var sqlite3 = require('sqlite3').verbose();
var path = require('path');

var dbPath = path.join(__dirname, '../data/checkbook.db');

var db = new sqlite3.Database(dbPath);

module.exports = db;
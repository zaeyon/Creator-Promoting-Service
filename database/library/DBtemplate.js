var mysql = require('mysql');
var db = mysql.createConnection({
    host     : '',
    user     : 'root',
    password : '',
    database : ''
  });
  db. connect();
  module.exports = db;
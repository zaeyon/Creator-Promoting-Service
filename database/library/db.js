var mysql = require('mysql');
var db = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '971006',
    database : 'freeboard'
  });
  db. connect();
  module.exports = db;
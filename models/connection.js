const mysql = require('mysql');

// Variable yang nanti di production bakal jadi env variable / private
const dbServerIP = '34.101.200.213';
const dbPassword = 'balimate';

const pool = mysql.createPool({
    host: dbServerIP,
    user: "root",
    password: dbPassword,
    database: "balimate",
    connectionLimit: 10
});

pool.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
    if (error)
        console.log('Error in database connection');
    else
        console.log('Success connected to database');
});

module.exports = pool
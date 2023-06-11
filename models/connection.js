const mysql = require('mysql');

const dbServerIP = process.env.DB_IP;
const dbPassword = process.env.DB_PASS;

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


module.exports = pool;
const mysql = require('mysql');

// Variable yang nanti di production bakal jadi env variable / private
const dbServerIP = '34.101.200.213';
const dbPassword = 'balimate';

const connection = mysql.createConnection({
    host: dbServerIP,
    user: "root",
    password: dbPassword,
    database: "balimate"
});

connection.connect(function (err) {
    if (err) {
        console.log("Error in the connection");
        console.log(err);
    } else {
        console.log("Success connect to database");
    }
})


// Fungsi siap pakai untuk querying database
// Contoh pemanggilan di getDestinations endpoint di ./router/destination.js

function query(queryStat, callback) {
    connection.query(queryStat,
        function (err, result) {
            if (err) {
                console.log(`ERROR : error executing the query '${queryStat}'\n${err}`);
                callback(0);
            } else {
                callback(result);
            }
        });
}

module.exports = query;
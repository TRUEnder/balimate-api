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

// Fungsi query()
// - Masukan => queryStat (query statement), dan fungsi callback,
// - Melakukan query pada database berdasarkan queryStat 
// - Keluaran => resultnya (array) atau tidak menghasilkan keluaran
// tetapi langsung mengirim response ketika error terjadi
// Contoh pemanggilan di getDestinationById endpoint di ./router/destination.js

function query(queryStat, res, callback) {
    connection.query(queryStat,
        function (err, result) {
            if (err) {
                console.log(`ERROR : error executing the query '${queryStat}'\n${err}`);
                const response = {
                    error: err
                }
                res.status(500);
                res.send(response);
            } else {
                callback(result);
            }
        });
}

// Fungsi queryAndSendResponse()
// - Masukan => queryStat (query statement), method (GET/POST/PUT/DELETE), dan res (object response),
// - Melakukan query pada database berdasarkan queryStat
// - Langsung mengirim response berisi result atau error ke user
// Contoh pemanggilan di getDestinations endpoint di ./router/destination.js

function queryAndSendResponse(queryStat, method, res) {
    connection.query(queryStat,
        function (err, result) {
            if (err) {
                console.log(`ERROR : error executing the query '${queryStat}'\n${err}`);
                const response = {
                    error: err
                }
                res.status(500);
                res.send(response);
            }
            else {
                if (method === 'GET') {
                    const response = {
                        data: result
                    }
                    res.status(200);
                    res.send(response);
                }
                else if (method === 'POST') {
                    const response = {
                        data: "New data successfully added!"
                    }
                    res.status(200);
                    res.send(response);
                }
                else if (method === 'PUT') {
                    const response = {
                        data: "Update success!"
                    }
                    res.status(200);
                    res.send(response);
                }
                else if (method === 'DELETE') {
                    const response = {
                        data: "Data successfully deleted"
                    }
                    res.status(200);
                    res.send(response);
                }
            }
        });
}

module.exports = { query, queryAndSendResponse };
const pool = require('../models/connection');

// Fungsi siap pakai untuk querying database

// Fungsi query()
// - Masukan => queryStat (query statement), dan fungsi callback,
// - Melakukan query pada database berdasarkan queryStat 
// - Keluaran => resultnya (array) atau tidak menghasilkan keluaran
// tetapi langsung mengirim response ketika error terjadi
// Contoh pemanggilan di getDestinationById endpoint di ./router/destination.js

function query(queryStat, res, callback) {
    pool.query(queryStat,
        function (err, result) {
            if (err) {
                console.log(`ERROR : error executing the query '${queryStat}'\n${err}`);
                const response = {
                    code: 'error',
                    error: {
                        code: err.code
                    }
                }
                res.status(500).send(response);
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
    pool.query(queryStat,
        function (err, result) {
            if (err) {
                console.log(`ERROR : error executing the query '${queryStat}'\n${err}`);
                const response = {
                    code: 'error',
                    error: {
                        code: err.code
                    }
                }
                res.status(500).send(response);
            }
            else {
                if (method === 'GET') {
                    const response = {
                        code: 'success',
                        data: result
                    }
                    res.status(200).send(response);
                }

                else {
                    if (result.affectedRows === 0) {
                        const response = {
                            code: 'fail',
                            message: "Data not found"
                        }
                        res.status(404).send(response);
                    }
                    else if (method === 'POST') {
                        const response = {
                            code: 'success',
                            message: "New data successfully added!"
                        }
                        res.status(201).send(response);
                    }
                    else if (method === 'PUT') {
                        const response = {
                            code: 'success',
                            message: "Update success!"
                        }
                        res.status(201).send(response);
                    }
                    else if (method === 'DELETE') {
                        const response = {
                            code: 'success',
                            message: "Data successfully deleted"
                        }
                        res.status(200).send(response);
                    }
                }
            }
        });
}

module.exports = { query, queryAndSendResponse };
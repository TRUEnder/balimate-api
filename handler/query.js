const pool = require('../models/connection');
const { parseTime } = require('../handler/timeHandler')
const { encodeId } = require('../handler/hashids');

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

            } else if (queryStat.includes('SELECT')) {
                // Filter result for some case
                const encodedResult = encodingId(result);

                if (queryStat.includes('FROM destination')) {
                    calculateRating(encodedResult, res)
                        .then((ratingAdded) => {
                            callback(ratingAdded)
                        })

                } else if (queryStat.includes('FROM review')) {
                    callback(parsingTimestamp(encodedResult));

                } else {
                    callback(encodedResult);
                }

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

            } else {

                if (method === 'GET') {
                    const encodedResult = encodingId(result);

                    if (queryStat.includes('FROM destination')) {
                        calculateRating(encodedResult, res)
                            .then((ratingAdded) => {
                                const response = {
                                    code: 'success',
                                    data: ratingAdded
                                }
                                res.status(200).send(response);
                            })

                    } else if (queryStat.includes('FROM review')) {
                        const response = {
                            code: 'success',
                            data: parsingTimestamp(encodedResult)
                        }
                        res.status(200).send(response);

                    } else {
                        const response = {
                            code: 'success',
                            data: encodedResult
                        }
                        res.status(200).send(response);
                    }

                } else {

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

// Fungsi queryPromise()
// - Input => Query statement
// - Keluaran => Mereturn fungsi pool.query() yang semula merupakan
//   callback function, dalam bentuk Promise
// Digunakan dalam kasus yang membutuhkan query dalam bentuk Promise function

function queryPromise(queryStat) {
    return new Promise((resolve, reject) => {
        pool.query(queryStat,
            function (err, result) {
                if (err) {
                    reject(err);

                } else if (queryStat.includes('SELECT')) {

                    // Filter result for some case
                    const encodedResult = encodingId(result);

                    if (queryStat.includes('FROM destination')) {
                        calculateRating(encodedResult, res)
                            .then((ratingAdded) => {
                                resolve(ratingAdded)
                            })

                    } else if (queryStat.includes('FROM review')) {
                        resolve(parsingTimestamp(encodedResult));

                    } else {
                        resolve(encodedResult);
                    }

                } else {

                    resolve(result);

                }
            })
    })
}

// Query filter functions

function encodingId(queryResult) {
    if (queryResult.length !== 0) {
        if (queryResult[0].hasOwnProperty('user_id')) {
            const result = [];
            queryResult.forEach((data) => {
                result.push({
                    ...data,
                    user_id: encodeId(data.user_id)
                })
            })
            return result;
        }
    }
    return queryResult;
}

async function calculateRating(queryResult, res) {

    if (queryResult.length !== 0) {
        // Append every result destination with rating and store it in data[]
        const data = [];

        for (const result of queryResult) {
            try {
                const avgQuery = `SELECT AVG(rating) AS avg FROM review
                                            WHERE place_id=${result.place_id}`
                const count = await queryPromise(avgQuery, res);
                const rating = Math.round(count[0].avg * 2) / 2;

                data.push({ ...result, rating });
            }
            catch (err) {
                const response = {
                    code: 'error',
                    error: { code: err.code }
                }
                res.status(500).send(response);
            }
        }

        return data;
    }
    return queryResult;
}

function parsingTimestamp(queryResult) {
    if (queryResult.length !== 0) {
        if (queryResult[0].hasOwnProperty('timestamp')) {
            const result = [];
            queryResult.forEach((data) => {
                result.push({
                    ...data,
                    timestamp: parseTime(data.timestamp)
                })
            })
            return result;
        }
    }
    return queryResult;
}

module.exports = { query, queryAndSendResponse, queryPromise };
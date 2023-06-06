const express = require("express");
const bodyParser = require('body-parser');
const { query, queryAndSendResponse } = require('../models/mysqlConnection');
const escapeSingleQuote = require('../handler/escapeSingleQuote');
const getDestinationPhotos = require('../handler/getDestinationPhotos');
const { addWeatherInfo, addDistanceInfo } = require('../handler/publicAPIHandler');

const router = express.Router();
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json({ extended: false }));


// ENDPOINT

router.get('/getDestinationById', (req, res) => {
    const queryStat = `SELECT * FROM destination WHERE place_id=${req.query.place_id}`;
    query(queryStat, res, (data) => {
        addWeatherInfo(data[0].place_name, (weather) => {
            getDestinationPhotos(req.query.place_id, res, (photos) => {
                const response = {
                    data,
                    weather: weather,
                    photos,
                }
                res.status(200);
                res.send(response);
            })
        })
    });
})

router.get('/getDestinationPhotos', (req, res) => {
    getDestinationPhotos(req.query.place_id, res, (result) => {
        const response = {
            data: result
        }
        res.status(200);
        res.send(response);
    })
})

router.get('/searchDestination', (req, res) => {
    const queryStat = `SELECT * FROM destination
                        WHERE place_name LIKE '%${escapeSingleQuote(req.query.q)}%';`;
    queryAndSendResponse(queryStat, req.method, res);
})

router.get('/getReviewsOfPlace', (req, res) => {
    const queryStat = `SELECT * FROM review WHERE place_id=${req.query.place_id}`;
    queryAndSendResponse(queryStat, req.method, res);
})


// Endpoint untuk keperluan test

router.get('/getDestinationsLimit10', (req, res) => {
    const queryStat = `SELECT * FROM destination LIMIT 10;`;
    queryAndSendResponse(queryStat, req.method, res);
})

router.get('/getDestinationsByCategory', (req, res) => {
    const queryStat = `SELECT * FROM destination WHERE category='${req.query.category}';`;
    queryAndSendResponse(queryStat, req.method, res);
})

module.exports = router;
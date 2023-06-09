const express = require("express");
const bodyParser = require('body-parser');
const { query, queryAndSendResponse } = require('../models/mysqlConnection');
const { addWeatherInfo, getTranslation } = require('../handler/publicAPIHandler');
const escapeSingleQuote = require('../handler/escapeSingleQuote');
const getDestinationPhotos = require('../handler/getDestinationPhotos');

const router = express.Router();
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json({ extended: false }));


// ENDPOINT

router.get('/:id', (req, res) => {
    const queryStat = `SELECT * FROM destination WHERE place_id=${req.params.id}`;
    query(queryStat, res, (data) => {
        addWeatherInfo(data[0].place_name, (weather) => {
            getDestinationPhotos(req.params.id, res, (photos) => {
                const response = {
                    ...weather,
                    photos
                };

                if (req.query.lang === 'en') {
                    getTranslation(data[0], 'en', (translatedData) => {
                        res.status(200);
                        res.send({ ...translatedData, ...response });
                    })
                } else {
                    res.status(200);
                    res.send({ ...data[0], ...response });
                }
            })
        })
    });
})

router.get('/:id/photos', (req, res) => {
    getDestinationPhotos(req.params.id, res, (result) => {
        const response = {
            data: result
        }
        res.status(200).send(response);
    })
})

router.get('/search', (req, res) => {
    const queryStat = `SELECT * FROM destination
                        WHERE place_name LIKE '%${escapeSingleQuote(req.query.q)}%';`;
    queryAndSendResponse(queryStat, req.method, res);
})

router.get('/:id/reviews', (req, res) => {
    const queryStat = `SELECT * FROM review WHERE place_id=${req.params.id}`;
    queryAndSendResponse(queryStat, req.method, res);
})


// Endpoint untuk keperluan test

router.get('/', (req, res) => {
    const queryStat = `SELECT * FROM destination LIMIT ${req.query.limit};`;
    queryAndSendResponse(queryStat, req.method, res);
})

router.get('/', (req, res) => {
    const queryStat = `SELECT * FROM destination WHERE category='${req.query.category}';`;
    queryAndSendResponse(queryStat, req.method, res);
})

module.exports = router;
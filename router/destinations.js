const express = require("express");
const bodyParser = require('body-parser');
const { query, queryAndSendResponse } = require('../handler/query');
const { getWeather, getTranslation, translationPromise, convertCurrency } = require('../handler/publicAPIHandler');
const escapeSingleQuote = require('../handler/escapeSingleQuote');
const getDestinationPhotos = require('../handler/getDestinationPhotos');

const router = express.Router();
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json({ extended: false }));

// CRUD Destination

router.get('/', (req, res) => {
    let queryStat = `SELECT * FROM destination`;

    if (req.query.hasOwnProperty('limit')) {
        queryStat = `SELECT * FROM destination LIMIT ${req.query.limit};`;
    }
    else if (req.query.hasOwnProperty('category')) {
        queryStat = `SELECT * FROM destination WHERE category='${req.query.category}';`;
    }

    query(queryStat, res, async (results) => {
        if (req.query.hasOwnProperty('rating')) {
            results.sort((a, b) => {
                return b.rating - a.rating
            })
            results = results.slice(0, req.query.rating)
        }
        if (req.query.hasOwnProperty('lang')) {
            const data = [];
            for (const result of results) {
                try {
                    const fields = {
                        place_name: result.place_name,
                        description: result.description,
                        category: result.category
                    }
                    const translated = await translationPromise(fields, req.query.lang, res);
                    const weekend_holiday_price = await convertCurrency(result.weekend_holiday_price, 'IDR', 'USD', res);
                    const weekday_price = await convertCurrency(result.weekday_price, 'IDR', 'USD', res);
                    data.push({ ...result, ...translated, weekend_holiday_price, weekday_price });
                }
                catch (err) {
                    const response = {
                        code: 'error',
                        error: { code: err.code }
                    }
                    res.status(500).send(response);
                }
            }
            const response = {
                code: 'success', data
            }
            res.status(200).send(response);
        }
        else {
            const response = {
                code: 'success', data: results
            }
            res.status(200).send(response);
        }
    });
})

router.get('/search', (req, res) => {
    let queryStat;
    if (req.query.hasOwnProperty('lang')) {
        getTranslation({ query: req.query.q }, 'id', res, (result) => {
            queryStat = `SELECT * FROM destination
                            WHERE
                            place_name LIKE '%${escapeSingleQuote(result.query)}%'
                            OR description LIKE '%${escapeSingleQuote(result.query)}%'
                            OR alamat LIKE '%${escapeSingleQuote(result.query)}%';`;

            queryAndSendResponse(queryStat, req.method, res);
        })
    } else {
        queryStat = `SELECT * FROM destination
                        WHERE
                        place_name LIKE '%${escapeSingleQuote(req.query.q)}%'
                        OR description LIKE '%${escapeSingleQuote(req.query.q)}%'
                        OR alamat LIKE '%${escapeSingleQuote(req.query.q)}%';`;

        queryAndSendResponse(queryStat, req.method, res);
    }
})

router.get('/:id', (req, res) => {
    const queryStat = `SELECT * FROM destination WHERE place_id=${req.params.id}`;
    query(queryStat, res, (result) => {

        if (result.length === 0) {
            const response = {
                code: 'fail',
                message: 'Data not found'
            }
            res.status(404).send(response);
        }

        const data = result[0];

        getWeather(data.lat, data.lng, res, (weather) => {
            getDestinationPhotos(req.params.id, res, (photos) => {

                // Translate destination data if lang = 'en'

                if (req.query.hasOwnProperty('lang')) {
                    const fields = {
                        place_name: data.place_name,
                        description: data.description,
                        category: data.category
                    }

                    getTranslation(fields, req.query.lang, res, (translated) => {
                        const response = {
                            code: 'success',
                            data: { ...data, ...translated, ...weather.data, photos }
                        }
                        res.status(200).send(response);
                    })
                } else {
                    const response = {
                        code: 'success',
                        data: { ...data, ...weather.data, photos }
                    }
                    res.status(200).send(response);
                }
            })
        })

    });
})

router.get('/:id/photos', (req, res) => {
    getDestinationPhotos(req.params.id, res, (result) => {
        const response = {
            code: 'success',
            data: result
        }
        res.status(200).send(response);
    })
})

router.get('/:id/reviews', (req, res) => {
    const queryStat = `SELECT review.user_id, first_name, last_name, rating, review, timestamp
                        FROM review, user
                        WHERE review.user_id=user.user_id
                        AND review.place_id=${req.params.id};`;
    queryAndSendResponse(queryStat, req.method, res);
})

module.exports = router;
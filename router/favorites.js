const express = require("express");
const bodyParser = require('body-parser');
const { query, queryAndSendResponse } = require('../models/mysqlConnection');
const escapeSingleQuote = require('../handler/escapeSingleQuote');
// const deletePhoto = require('../handler/deletePhoto');

const router = express.Router();
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json({ extended: false }));


// ENDPOINT

router.post('/', (req, res) => {
    const queryStat = `INSERT INTO favorite (user_id, place_id)
                        VALUES (
                            '${req.body.userId}',
                            ${req.body.placeId}
                        );`;
    queryAndSendResponse(queryStat, req.method, res);
})

router.delete('/', (req, res) => {
    const queryStat = `DELETE FROM favorite
                        WHERE
                        user_id='${req.query["user-id"]}' AND place_id=${req.query["place-id"]}`;
    queryAndSendResponse(queryStat, req.method, res);
})

module.exports = router;
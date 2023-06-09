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
    const addPhotoQuery = `INSERT INTO photo (user_id, place_id, photo_url)
                            VALUES (
                                '${req.query["user-id"]}',
                                ${req.query["place-id"]},
                                '${req.body.photoUrl}'
                            );`;
    query(addPhotoQuery, res,
        function (result) {
            const addReviewQuery = `INSERT INTO review (user_id, place_id, rating, review)
                                    VALUES (
                                        '${req.query["user-id"]}',
                                        ${req.query["place-id"]},
                                        ${req.body.rating},
                                        '${escapeSingleQuote(req.body.review)}'
                                    );`;
            queryAndSendResponse(addReviewQuery, req.method, res);
        })
})

router.delete('/', (req, res) => {
    const deleteReviewQuery = `DELETE FROM review
                                WHERE user_id='${req.query["user-id"]}'
                                AND place_id=${req.query["place-id"]};`;
    query(deleteReviewQuery, res,
        function (result) {
            const deletePhotoQuery = `DELETE FROM photo
                                        WHERE user_id=${req.query["user-id"]}
                                        AND place_id=${req.query["place-id"]};`;
            queryAndSendResponse(deletePhotoQuery, req.method, res);
        })
})

module.exports = router;
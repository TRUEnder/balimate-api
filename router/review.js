const express = require("express");
const bodyParser = require('body-parser');
const { query, queryAndSendResponse } = require('../models/mysqlConnection');
const escapeSingleQuote = require('../handler/escapeSingleQuote');
// const deletePhoto = require('../handler/deletePhoto');

const router = express.Router();
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json({ extended: false }));


// ENDPOINT

router.post('/addReview', (req, res) => {
    const addPhotoQuery = `INSERT INTO photo (user_id, place_id, photo_url)
                            VALUES (
                                '${req.query.user_id}',
                                ${req.query.place_id},
                                '${req.body.photoUrl}'
                            );`;
    query(addPhotoQuery, res,
        function (result) {
            const addReviewQuery = `INSERT INTO review (user_id, place_id, rating, review)
                                    VALUES (
                                        '${req.query.user_id}',
                                        ${req.query.place_id},
                                        ${req.body.rating},
                                        '${escapeSingleQuote(req.body.review)}'
                                    );`;
            queryAndSendResponse(addReviewQuery, req.method, res);
        })
})

router.delete('/deleteReview', (req, res) => {
    const deleteReviewQuery = `DELETE FROM review
                                WHERE user_id='${req.query.user_id}'
                                AND place_id=${req.query.place_id};`;
    query(deleteReviewQuery, res,
        function (result) {
            const deletePhotoQuery = `DELETE FROM photo
                                        WHERE user_id=${req.query.user_id}
                                        AND place_id=${req.query.place_id};`;
            queryAndSendResponse(deletePhotoQuery, req.method, res);
        })
})

module.exports = router;
const express = require("express");
const bodyParser = require('body-parser');
const { query, queryAndSendResponse } = require('../handler/query');
const { decodeId } = require('../handler/hashids');
const escapeSingleQuote = require('../handler/escapeSingleQuote');
const { getCurrentTime } = require('../handler/timeHandler');
// const deletePhoto = require('../handler/deletePhoto');

const router = express.Router();
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json({ extended: false }));


// ENDPOINT

router.post('/', (req, res) => {
    const addReviewQuery = `INSERT INTO review (user_id, place_id, rating, review, timestamp)
                                    VALUES (
                                        ${decodeId(req.query.userid)},
                                        ${req.query.placeid},
                                        ${req.body.rating},
                                        '${escapeSingleQuote(req.body.review)}',
                                        '${getCurrentTime()}'
                                    );`;

    if (req.body.photoUrl !== '') {
        const addPhotoQuery = `INSERT INTO photo (user_id, place_id, photo_url)
                                VALUES (
                                    ${decodeId(req.query.userid)},
                                    ${req.query.placeid},
                                    '${req.body.photoUrl}'
                                );`;
        query(addPhotoQuery, res, (result) => {
            queryAndSendResponse(addReviewQuery, req.method, res);
        });
    }
    else {
        queryAndSendResponse(addReviewQuery, req.method, res);
    }
})

router.delete('/', (req, res) => {
    const deleteReviewQuery = `DELETE FROM review
                                WHERE user_id=${decodeId(req.query.userid)}
                                AND place_id=${req.query.placeid};`;

    const numberOfPhoto = `SELECT COUNT(*) AS count FROM photo
                            WHERE user_id=${decodeId(req.query.userid)}
                            AND place_id=${req.query.placeid};`;

    query(numberOfPhoto, res, (count) => {
        if (count !== 0) {
            const deletePhotoQuery = `DELETE FROM photo
                                    WHERE user_id=${decodeId(req.query.userid)}
                                    AND place_id=${req.query.placeid};`;
            query(deletePhotoQuery, res, (result) => {
                queryAndSendResponse(deleteReviewQuery, req.method, res);
            })
        }
        else {
            queryAndSendResponse(deleteReviewQuery, req.method, res);
        }
    })
})

module.exports = router;
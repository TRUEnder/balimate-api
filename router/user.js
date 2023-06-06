const express = require("express");
const bodyParser = require('body-parser');
const { query, queryAndSendResponse } = require('../models/mysqlConnection');
const escapeSingleQuote = require('../handler/escapeSingleQuote');
const randomId = require('../handler/randomId');

const router = express.Router();
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json({ extended: false }));


// ENDPOINT

router.get('/getUserById', (req, res) => {
    const queryStat = `SELECT * FROM user
                        WHERE user_id='${req.query.user_id}';`;
    queryAndSendResponse(queryStat, req.method, res);
})

router.put('/updateUserById', (req, res) => {
    const queryStat = `UPDATE user
                        SET
                            first_name='${escapeSingleQuote(req.body.firstName)}',
                            last_name='${escapeSingleQuote(req.body.lastName)}',
                            profile_url='${req.body.profileUrl}'
                        WHERE
                            user_id='${req.query.user_id}';`;
    queryAndSendResponse(queryStat, req.method, res);
})

router.put('/updateProfilePhoto', (req, res) => {
    const queryStat = `UPDATE user
                        SET profile_url='${req.body.photoUrl}'
                        WHERE user_id='${req.query.user_id}';`;
    queryAndSendResponse(queryStat, req.method, res);
})

router.put('/deleteProfilePhoto', (req, res) => {
    const queryStat = `UPDATE user
                        SET profile_url=default
                        WHERE user_id='${req.query.user_id}';`;
    queryAndSendResponse(queryStat, req.method, res);
})

router.delete('/deleteUserById', (req, res) => {
    const queryStat = `DELETE FROM user
                        WHERE user_id='${req.query.user_id}';`;
    queryAndSendResponse(queryStat, req.method, res);
})

router.post('/addFavorite', (req, res) => {
    const queryStat = `INSERT INTO favorite (user_id, place_id)
                        VALUES (
                            '${req.query.user_id}',
                            ${req.query.place_id}
                        );`;
    queryAndSendResponse(queryStat, req.method, res);
})

router.delete('/deleteFavorite', (req, res) => {
    const queryStat = `DELETE FROM favorite
                        WHERE
                        user_id='${req.query.user_id}' AND place_id=${req.query.place_id}`;
    queryAndSendResponse(queryStat, req.method, res);
})

router.get('/getFavoritesByUserId', (req, res) => {
    const queryStat = `SELECT * FROM favorite
                        WHERE user_id='${req.query.user_id}'`;
    queryAndSendResponse(queryStat, req.method, res);
})

router.get('/getUserReviews', (req, res) => {
    const queryStat = `SELECT * FROM review WHERE user_id='${req.query.user_id}';`;
    queryAndSendResponse(queryStat, req.method, res);
})

// Endpoint untuk test (dihapus saat production)

router.get('/getUsers', (req, res) => {
    const queryStat = `SELECT * FROM user;`;
    queryAndSendResponse(queryStat, req.method, res);
})

router.post('/insertUser', (req, res) => {
    const queryStat = `INSERT INTO user (user_id, first_name, last_name, email, password)
                        VALUES (
                            '${randomId()}',
                            '${escapeSingleQuote(req.body.firstName)}',
                            '${escapeSingleQuote(req.body.lastName)}',
                            '${req.body.email}',
                            '${req.body.password}'
                        );`;
    queryAndSendResponse(queryStat, req.method, res);
})


module.exports = router;
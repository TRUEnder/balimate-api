const express = require("express");
const bodyParser = require('body-parser');
const firebase = require('firebase-admin/auth');
const { query, queryAndSendResponse } = require('../handler/query');
const { saveCookie, checkCookie } = require("../handler/cookie");
const escapeSingleQuote = require('../handler/escapeSingleQuote');

const router = express.Router();
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json({ extended: false }));


// ENDPOINT

router.get('/signInGoogle', (req, res) => {
    const idtoken = req.query.token;
    saveCookie(idtoken, res);
});

router.get('/logout', (req, res) => {
    res.clearCookie('__session');
    res.redirect('/');
});

module.exports = router;
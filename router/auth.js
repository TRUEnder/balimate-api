// Template di setiap router file
const express = require("express");
const router = express.Router();
const bodyParser = require('body-parser');
const query = require('../models/mysqlConnection');

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json({ extended: false }));
// End of template

const { saveCookie, checkCookie } = require("../handler/cookie");

// ENDPOINT

router.get('/login', (req, res) => {
    const idtoken = req.query.token;
    saveCookie(idtoken, res);
});

router.get('/logout', (req, res) => {
    res.clearCookie('__session');
    res.redirect('/');
});

router.get('/test', (req, res) => {
    res.send(req.body);
})

module.exports = router;
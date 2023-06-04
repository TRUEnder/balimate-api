// Template di setiap router file
const express = require("express");
const router = express.Router();
const bodyParser = require('body-parser');
const query = require('../models/mysqlConnection');

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json({ extended: false }));
// End of template

// ENDPOINT

router.get('/getDestinationsLimit10', (req, res) => {
    query('SELECT * FROM destination LIMIT 10;',
        function (result) {
            if (result == 0) {
                const response = {
                    error: "Server Internal Error - Query on database failed"
                }
                res.status(500);
                res.send(response);
            }
            else {
                const response = {
                    data: result
                }
                res.status(200);
                res.send(response);
            }
        });
})

// Tambahkan Endpoint di bawah


module.exports = router;

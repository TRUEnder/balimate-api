const express = require('express');
const bodyParser = require('body-parser');
const { query, queryAndSendResponse } = require('../handler/query');
const escapeSingleQuote = require('../handler/escapeSingleQuote');
const randomId = require('../handler/randomId');

const router = express.Router();
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json({ extended: false }));


// CRUD User

router.get('/:id', (req, res) => {
    const queryStat = `SELECT * FROM user WHERE user_id='${req.params.id}';`;

    query(queryStat, res, (result) => {

        if (result.length === 0) {
            const response = {
                code: 'fail',
                message: 'Data not found'
            }
            res.status(404).send(response)
        }

        const categoriesString = result[0].pref_categories;
        const response = {
            code: 'success',
            data: {
                ...result[0],
                pref_categories: JSON.parse(categoriesString)
            }
        }
        res.status(200).send(response);
    })
})

router.put('/:id', (req, res) => {
    const queryStat = `UPDATE user
                        SET
                            first_name='${escapeSingleQuote(req.body.firstName)}',
                            last_name='${escapeSingleQuote(req.body.lastName)}',
                            profile_url='${req.body.photoUrl}'
                        WHERE
                            user_id='${req.params.id}';`;
    queryAndSendResponse(queryStat, req.method, res);
})

router.delete('/:id', (req, res) => {
    const queryStat = `DELETE FROM user WHERE user_id='${req.params.id}';`;
    queryAndSendResponse(queryStat, req.method, res);
})


// Profile photo

router.post('/:id/profile-photo', (req, res) => {
    const queryStat = `UPDATE user
                        SET profile_url='${req.body.photoUrl}'
                        WHERE user_id='${req.params.id}';`;
    queryAndSendResponse(queryStat, req.method, res);
})

router.delete('/:id/profile-photo', (req, res) => {
    const queryStat = `UPDATE user
                        SET profile_url=default
                        WHERE user_id='${req.params.id}';`;
    queryAndSendResponse(queryStat, req.method, res);
})


// Add User Preferences
router.post('/:id/preferences', (req, res) => {
    const queryStat = `UPDATE user
                        SET
                            pref_categories=${JSON.stringify(req.body.categories)},
                            pref_city='${req.body.city}',
                            pref_price='${req.body.price}'
                        WHERE
                            user_id='${req.params.id}';`;
    queryAndSendResponse(queryStat, req.method, res);
})

// CRUD Favorite

router.get('/:id/favorites', (req, res) => {
    const queryStat = `SELECT * FROM destination
                        WHERE place_id IN
                            (SELECT place_id FROM favorite WHERE user_id='${req.params.id}')`;
    queryAndSendResponse(queryStat, req.method, res);
})

router.post('/:id/favorites', (req, res) => {
    const queryStat = `INSERT INTO favorite (user_id, place_id)
                        VALUES (
                            '${req.params.id}',
                            ${req.query.placeid}
                        );`;
    queryAndSendResponse(queryStat, req.method, res);
})

router.delete('/:id/favorites', (req, res) => {
    const queryStat = `DELETE FROM favorite
                        WHERE
                        user_id='${req.params.id}' AND place_id=${req.query.placeid}`;
    queryAndSendResponse(queryStat, req.method, res);
})

// Get User Reviews
router.get('/:id/reviews', (req, res) => {
    const queryStat = `SELECT review.place_id, place_name, review.rating, review
                        FROM review, destination
                        WHERE review.place_id=destination.place_id
                        AND review.user_id='${req.params.id}';`;
    queryAndSendResponse(queryStat, req.method, res);
})


// Endpoint untuk test (dihapus saat production)

router.get('/', (req, res) => {
    const queryStat = `SELECT * FROM user;`;

    query(queryStat, res, (results) => {
        const data = [];
        results.forEach((result) => {
            const pfCategories = JSON.parse(result.pref_categories);
            data.push({
                ...result,
                pref_categories: pfCategories
            })
        })

        const response = {
            code: 'success',
            data
        }
        res.status(200).send(response);
    })
})

router.post('/', (req, res) => {
    const queryStat = `INSERT INTO user (user_id, first_name, last_name, email, password, pref_categories)
                        VALUES (
                            '${randomId()}',
                            '${escapeSingleQuote(req.body.firstName)}',
                            '${escapeSingleQuote(req.body.lastName)}',
                            '${req.body.email}',
                            '${req.body.password}',
                            '[]'
                        );`;
    queryAndSendResponse(queryStat, req.method, res);
})


module.exports = router;
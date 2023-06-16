const express = require('express');
const bodyParser = require('body-parser');
const { query, queryAndSendResponse, queryPromise } = require('../handler/query');
const escapeSingleQuote = require('../handler/escapeSingleQuote');
const { decodeId } = require('../handler/hashids');

const router = express.Router();
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json({ extended: false }));


// CRUD User

router.get('/', (req, res) => {

    if (!req.query.hasOwnProperty('email')) {

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

    } else {

        const queryStat = `SELECT * FROM user WHERE email='${req.query.email}'`
        query(queryStat, res, (result) => {
            const pfCategories = JSON.parse(result[0].pref_categories);
            const data = {
                ...result[0],
                pref_categories: pfCategories
            }

            const response = {
                code: 'success',
                data
            }
            res.status(200).send(response);
        })
    }
})

router.get('/:id', (req, res) => {
    const queryStat = `SELECT * FROM user WHERE user_id=${decodeId(req.params.id)};`;

    query(queryStat, res, (result) => {

        if (result.length === 0) {
            const response = {
                code: 'fail',
                message: 'Data not found'
            }
            res.status(404).send(response)
        } else {
            const categoriesString = result[0].pref_categories;
            const response = {
                code: 'success',
                data: {
                    ...result[0],
                    pref_categories: JSON.parse(categoriesString)
                }
            }
            res.status(200).send(response);
        }
    })
})

router.post('/:id/update', (req, res) => {
    const queryStat = `UPDATE user
                        SET
                            first_name='${escapeSingleQuote(req.body.firstName)}',
                            last_name='${escapeSingleQuote(req.body.lastName)}',
                            profile_url='${req.body.photoUrl}'
                        WHERE
                            user_id=${decodeId(req.params.id)};`;
    queryAndSendResponse(queryStat, req.method, res);
})

router.delete('/:id', (req, res) => {
    const queryStat = `DELETE FROM user WHERE user_id=${decodeId(req.params.id)};`;
    queryAndSendResponse(queryStat, req.method, res);
})


// Profile photo

router.post('/:id/profile-photo', (req, res) => {
    const queryStat = `UPDATE user
                        SET profile_url='${req.body.photoUrl}'
                        WHERE user_id=${decodeId(req.params.id)};`;
    queryAndSendResponse(queryStat, req.method, res);
})

router.delete('/:id/profile-photo', (req, res) => {
    const queryStat = `UPDATE user
                        SET profile_url=default
                        WHERE user_id=${decodeId(req.params.id)};`;
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
                            user_id=${decodeId(req.params.id)};`;
    queryAndSendResponse(queryStat, req.method, res);
})

// CRUD Favorite

router.get('/:id/favorites', (req, res) => {
    const queryStat = `SELECT * FROM destination
                        WHERE place_id IN
                            (SELECT place_id FROM favorite
                            WHERE user_id=${decodeId(req.params.id)})`;
    queryAndSendResponse(queryStat, req.method, res);
})

router.get('/:id/favorites/check', (req, res) => {
    const queryStat = `SELECT COUNT(*) AS hasLiked FROM favorite
                        WHERE user_id=${decodeId(req.params.id)}
                        AND place_id=${req.query.placeid};`;
    query(queryStat, res, (result) => {
        const response = {
            code: 'success',
            data: { ...result[0] }
        }
        res.status(200).send(response);
    })
})

router.post('/:id/favorites', (req, res) => {
    const queryStat = `INSERT INTO favorite (user_id, place_id)
                        VALUES (
                            ${decodeId(req.params.id)},
                            ${req.query.placeid}
                        );`;
    queryAndSendResponse(queryStat, req.method, res);
})

router.delete('/:id/favorites', (req, res) => {
    const queryStat = `DELETE FROM favorite
                        WHERE
                        user_id=${decodeId(req.params.id)} AND place_id=${req.query.placeid}`;
    queryAndSendResponse(queryStat, req.method, res);
})

// Get User Reviews
router.get('/:id/reviews', (req, res) => {
    const getReviewQuery = `SELECT
                            r.place_id, d.place_name, r.rating, r.review, r.timestamp
                            FROM review AS r, destination AS d
                            WHERE r.user_id=${decodeId(req.params.id)}
                            AND r.place_id=d.place_id;`;

    query(getReviewQuery, res, async (reviews) => {
        const data = [];
        for (const review of reviews) {
            try {
                const getPhotosQuery = `SELECT photo_url FROM photo
                                        WHERE user_id=${decodeId(req.params.id)}
                                        AND place_id=${review.place_id}`;

                const photo = await queryPromise(getPhotosQuery);

                if (photo.length === 0)
                    data.push({ ...review, photo_url: '' });
                else
                    data.push({ ...review, ...photo[0] });
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
            code: 'success',
            data
        }
        res.status(200).send(response);
    });
})

// Check if user have reviewed some place
router.get('/:id/reviews/check', (req, res) => {
    const queryStat = `SELECT COUNT(*) AS hasReviewed FROM review
                        WHERE user_id=${decodeId(req.params.id)}
                        AND place_id=${req.query.placeid};`;
    query(queryStat, res, (result) => {
        const response = {
            code: 'success',
            data: { ...result[0] }
        }
        res.status(200).send(response);
    })
})


// Endpoint untuk test

router.post('/', (req, res) => {
    const queryStat = `INSERT INTO user (first_name, last_name, email, password, pref_categories)
                        VALUES (
                            '${escapeSingleQuote(req.body.firstName)}',
                            '${escapeSingleQuote(req.body.lastName)}',
                            '${req.body.email}',
                            '${req.body.password}',
                            '[]'
                        );`;
    queryAndSendResponse(queryStat, req.method, res);
})


module.exports = router;
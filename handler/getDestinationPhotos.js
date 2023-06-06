const { query, queryAndSendResponse } = require('../models/mysqlConnection');

function getDestinationPhotos(placeId, res, callback) {
    const queryStat = `SELECT photo_url FROM photo WHERE place_id=${placeId};`
    query(queryStat, res, (result) => {
        callback(result);
    })
}

module.exports = getDestinationPhotos;
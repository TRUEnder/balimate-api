const fs = require('fs');
const axios = require('axios');

function addWeatherInfo(place_name, callback) {
    const filePath = __dirname.replace('\\handler', '\\credential');
    const WeatherAPIKey = JSON.parse(fs.readFileSync(filePath + '\\weatherMapAPIKey.json')).key;

    getCoordinates(place_name, (result) => {
        if (result.message === 'error') {
            callback({ error: "error" });
        } else if (result.message === 'success') {
            axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${result.lat_coor}&lon=${result.lng_coor}&appid=${WeatherAPIKey}`)
                .then((response) => {
                    callback(response.data.weather);
                })
        }
    })
}

function addDistanceInfo(lat_start, lng_end, lat_end, lng_end) {
    // Route API
}

function getCoordinates(place_name, callback) {
    const filePath = __dirname.replace('\\handler', '\\credential');
    const MapsAPIKey = JSON.parse(fs.readFileSync(filePath + '\\googleMapsAPIKey.json')).key;
    const encodedName = encodeURI(place_name);
    axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodedName}&key=${MapsAPIKey}`)
        .then((response) => {
            const result = {
                message: 'success',
                lat_coor: response.data.results[0].geometry.location.lat,
                lng_coor: response.data.results[0].geometry.location.lng
            }
            callback(result);
        })
        .catch((error) => {
            const result = {
                message: 'error',
                errors: error
            }
            callback(result);
        })
}

module.exports = { addWeatherInfo, addDistanceInfo };
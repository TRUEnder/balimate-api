const fs = require('fs');
const axios = require('axios');
const { Translate } = require('@google-cloud/translate').v2;

// OpenWeatherMap API
function addWeatherInfo(place_name, callback) {
    const filePath = __dirname.replace('\\handler', '\\credential');
    const WeatherAPIKey = JSON.parse(fs.readFileSync(filePath + '\\weatherMapAPIKey.json')).key;

    getCoordinates(place_name, (result) => {
        if (result.code === 'geolocError') {
            callback({
                code: 'error',
                message: 'Error in Geolocation API'
            });
        }
        else if (result.code === 'success') {
            axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${result.lat_coor}&lon=${result.lng_coor}&appid=${WeatherAPIKey}&units=metric`)
                .then((response) => {
                    callback({
                        weather: response.data.weather[0].main,
                        temp: response.data.main.temp
                    });
                })
                .catch((err) => {
                    callback({
                        code: 'error',
                        messages: err
                    })
                })
        }
    })
}

// Cloud Translation API
function getTranslation(inputs, lang, callback) {
    const nonTextField = {};
    const textField = {};

    for (const field in inputs) {
        if (typeof inputs[field] === 'string') {
            const { filtered, correction } = filterTranslate(inputs[field]);
            if (!filtered)
                appendObject(textField, field, inputs[field]);
            else
                appendObject(nonTextField, field, correction);

        } else {
            appendObject(nonTextField, field, inputs[field]);
        };
    }

    const keys = Object.keys(textField);
    const text = Object.values(textField);

    const translate = new Translate();
    translate.translate(text, lang)
        .then(translations => {
            const newTextField = joinKeysValues(keys, translations[0]);

            callback(Object.assign(nonTextField, newTextField));
        })
}

// Google Geocoding API
function getCoordinates(place_name, callback) {
    const filePath = __dirname.replace('\\handler', '\\credential');
    const MapsAPIKey = JSON.parse(fs.readFileSync(filePath + '\\googleMapsAPIKey.json')).key;
    const encodedName = encodeURI(place_name);

    axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodedName}&key=${MapsAPIKey}`)
        .then((response) => {
            const result = {
                code: 'success',
                lat_coor: response.data.results[0].geometry.location.lat,
                lng_coor: response.data.results[0].geometry.location.lng
            }
            callback(result);
        })
        .catch((err) => {
            const result = {
                code: 'geolocError',
                error: err
            }
            callback(result);
        })
}

function joinKeysValues(keys, values) {
    const obj = {};
    for (let i = 0; i < keys.length; i++)
        appendObject(obj, keys[i], values[i]);

    return obj;
}

function appendObject(obj, key, value) {
    let key_value_string;

    if (typeof value === 'string') {
        key_value_string = `{ "${key}" : "${value}" }`;
    }
    else {
        key_value_string = `{ "${key}" : ${value} }`;
    }

    Object.assign(obj, JSON.parse(key_value_string));

}

function filterTranslate(text) {
    // List of term which have poor google translation
    switch (text) {
        case 'Alam':
            return { filtered: true, correction: 'Nature' }
        case 'alam':
            return { filtered: true, correction: 'nature' }
        case 'Cagar Alam':
            return { filtered: true, correction: 'Biodiversity' }
        case 'Cagar alam':
            return { filtered: true, correction: 'Biodiversity' }
        case 'cagar alam':
            return { filtered: true, correction: 'biodiversity' }
        // Add more below

        default:
            return { filtered: false, correction: '' }
    }
}

module.exports = { addWeatherInfo, getTranslation };
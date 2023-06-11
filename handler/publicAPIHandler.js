const fs = require('fs');
const axios = require('axios');
const { Translate } = require('@google-cloud/translate').v2;

// OpenWeatherMap API
function getWeather(lat, lng, res, callback) {
    const WeatherAPIKey = process.env.WEATHER_API_KEY;

    axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${WeatherAPIKey}&units=metric`)
        .then((response) => {
            callback({
                code: 'success',
                data: {
                    weather: response.data.weather[0].main,
                    temp: response.data.main.temp
                }
            });
        })
        .catch((err) => {
            const response = {
                code: 'error',
                error: {
                    code: 'Weather API error'
                }
            }
            res.status(500).send(response);
        })
}

// Cloud Translation API
function getTranslation(inputs, lang, res, callback) {
    const supported = ['en', 'id'];

    if (!supported.includes(lang)) {
        const response = {
            code: 'fail',
            message: `Language '${lang}' not supported`
        }
        res.status(400).send(response);
    }
    else {
        const inputField = {};
        const filteredField = {};

        // Filter term which have poor translation from Translation API
        for (const field in inputs) {
            const { filtered, correction } = filterTranslate(inputs[field]);
            if (!filtered)
                appendObject(inputField, field, inputs[field]);
            else
                appendObject(filteredField, field, correction);
        }

        const keys = Object.keys(inputField);
        const text = Object.values(inputField);

        const translate = new Translate();
        translate.translate(text, lang)
            .then(translations => {
                const translatedField = joinKeysValues(keys, translations[0]);
                callback(Object.assign(translatedField, filteredField));
            })
            .catch(err => {
                const response = {
                    code: 'error',
                    error: {
                        code: 'Translation API error'
                    }
                }
                res.status(500).send(response);
            })
    }
}

function translationPromise(inputs, lang, res) {
    return new Promise((resolve, reject) => {
        getTranslation(inputs, lang, res,
            function (result) {
                resolve(result);
            })
    })
}

// Menggabungkan array keys dan values menjadi satu object
function joinKeysValues(keys, values) {
    const obj = {};
    for (let i = 0; i < keys.length; i++)
        appendObject(obj, keys[i], values[i]);

    return obj;
}

// Memasukkan key value pair ke dalam object
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
        case 'Agung Bali':
            return { filtered: true, correction: 'Agung Bali' }
        // Add more below

        default:
            return { filtered: false, correction: '' }
    }
}

module.exports = { getWeather, getTranslation, translationPromise };
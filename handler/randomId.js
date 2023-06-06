const Hashids = require('hashids/cjs');
const salt = 'balimate';
const hashids = new Hashids(salt, 21);

function randomID() {
    const random = Math.floor(Math.random() * 100000);
    return hashids.encode(random);
}

module.exports = randomID;
const Hashids = require('hashids/cjs');
const salt = 'balimate';
const hashids = new Hashids(salt, 21);

function encodeId(id) {
    return hashids.encode(id);
}

function decodeId(id) {
    return hashids.decode(id);
}

module.exports = { encodeId, decodeId };
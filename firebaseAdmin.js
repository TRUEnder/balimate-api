const admin = require("firebase-admin");
const fs = require('fs');

const keyFile = JSON.parse(fs.readFileSync(__dirname + "/credential/serviceAccountKey.json"));
var key = keyFile['private_key'];

admin.initializeApp({
    credential: admin.credential.cert({
        "private_key": key.replace(/\\n/g, '\n'),
        "client_email": "c169dsx1676@bangkit.academy",
        "project_id": "sign-in-5b9d3 "
    })
});

module.exports = admin;
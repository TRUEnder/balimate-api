const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({ extended: false }))
app.use(cookieParser());

// Router
const authRouter = require('./router/auth');
app.use('/auth', authRouter);

// Tambahkan router di bawah
const destinationRouter = require('./router/destination');
app.use('/destination', destinationRouter);

app.get('/', (req, res) => {
    res.send('Response is success!');
});

app.get('/test', (req, res) => {
    res.send(req.body);
});


const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
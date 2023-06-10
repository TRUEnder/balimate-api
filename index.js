const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({ extended: false }))
app.use(cookieParser());


// Router
const authRouter = require('./router/auth');
const usersRouter = require('./router/users');
const destinationsRouter = require('./router/destinations');
const reviewsRouter = require('./router/reviews');

app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/destinations', destinationsRouter);
app.use('/api/reviews', reviewsRouter);

app.get('/api', (req, res) => {
    res.send('API is active!');
});


const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
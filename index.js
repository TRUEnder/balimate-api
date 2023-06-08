const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({ extended: false }))
app.use(cookieParser());


// Router
const authRouter = require('./router/auth');
const userRouter = require('./router/user');
const destinationRouter = require('./router/destination');
const reviewRouter = require('./router/review');

app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/destinations', destinationRouter);
app.use('/api/reviews', reviewRouter);

app.get('/api', (req, res) => {
    res.send('API is active!');
});


const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
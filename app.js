require('dotenv').config();

const express = require('express');
const expressLayout = require('express-ejs-layouts');

const connectDB = require('./server/config/db');

const app = express(); // start express app
const PORT = process.env.PORT;

// connect to db
connectDB();

// allows to pass data to the form
app.use(express.urlencoded({ extended: true}));
app.use(express.json());
app.use(express.static('public'));

// templating engine
app.use(expressLayout);
app.set('layout', './layouts/main')
app.set('view engine', 'ejs');

app.use('/', require('./server/routes/main.js'));
app.use('/', require('./server/routes/admin.js'));

app.listen(PORT, () => {
    console.log(`App listening`);
});





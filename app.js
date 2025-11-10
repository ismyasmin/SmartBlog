require('dotenv').config();

const express = require('express');
const expressLayout = require('express-ejs-layouts');
// use HTTP verbs such as PUT or DELETE in places where client doesn't support it
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser'); // used to store session when logging in
const session = require('express-session');
const MongoStore = require('connect-mongo');


const connectDB = require('./server/config/db');
const { isActiveRoute } = require ('./server/helpers/routeHelpers');
const aiRoutes = require('./server/routes/admin');
const app = express(); // start express app
const PORT = process.env.PORT;

// connect to db
connectDB();

// allows to pass data to the form
app.use(express.urlencoded({ extended: true}));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride('_method'));
app.use('/admin', aiRoutes);

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI
    }),
    // cookie: { maxAge: new Date ( Date.now() + (3600000) ) }
}));



app.use(express.static('public'));

// templating engine
app.use(expressLayout);
app.set('layout', './layouts/main')
app.set('view engine', 'ejs');

app.locals.isActiveRoute = isActiveRoute;

app.use('/', require('./server/routes/main.js'));
app.use('/', require('./server/routes/admin.js'));

app.listen(PORT, () => {
    console.log(`App listening`);
});





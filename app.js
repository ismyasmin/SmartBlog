require('dotenv').config();

const express = require('express');
const expressLayout = require('express-ejs-layouts');
// use HTTP verbs such as PUT or DELETE in places where client doesn't support it
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser'); // used to store session when logging in
const session = require('express-session');
const MongoStore = require('connect-mongo');
const jwt = require('jsonwebtoken');



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



// Middleware to make the logged-in user available in all EJS templates
app.use((req, res, next) => {
    // Get JWT token from cookies
    const token = req.cookies.token;

    // If no token exists, user is not logged in
    if (!token) {
        res.locals.user = null; // set `user` to null for EJS templates
        return next();          // continue to next middleware/route
    }

    try {
        //  Verify the JWT token using the secret key
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        //  Store the decoded user ID in the request for later use
        req.userId = decoded.userId;

        //  Make user data available to all EJS templates via res.locals
        //    This allows conditional rendering (e.g., showing Dashboard/Logout links)
        res.locals.user = { id: decoded.userId }; // optional: can add username/email here

    } catch (err) {
        //  If token verification fails (invalid/expired), treat user as not logged in
        res.locals.user = null;
    }

    // Continue to next middleware or route handler
    next();
});



app.use(express.static('public'));

// templating engine
app.use(expressLayout);
app.set('layout', './layouts/main')
app.set('view engine', 'ejs');

app.locals.isActiveRoute = isActiveRoute;
app.use((req, res, next) => {
    res.locals.currentRoute = req.path; // makes current URL path available in all EJS files
    next();
  });

app.use('/', require('./server/routes/main.js'));
app.use('/', require('./server/routes/admin.js'));

app.listen(PORT, () => {
    console.log(`App listening`);
});





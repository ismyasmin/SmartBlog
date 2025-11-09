const express = require ('express');
const router = express.Router();
const Post = require('../models/Post'); // use this model to insert and retrieve data
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const adminLayout = '../views/layouts/admin';
const jwtSecret = process.env.JWT_SECRET;


// GET Admin - Login Page
router.get('/admin', async(req,res) => {
    try{
        const locals = {
            title: "Admin",
            description: "ai blog"
        }


        res.render('admin/login', { locals, layout: adminLayout} );

    } catch(error) {
        console.log(error.message);

    }
});

// POST Admin - Check Login
router.post('/admin', async (req, res) => {
    try {
        // Extract username and password from request body
        const { username, password } = req.body;

        // Find user in MongoDB by username
        const user = await User.findOne({ username });

        // If user doesn't exist, return 401 (Unauthorized)
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Compare input password with hashed password stored in DB
        const isPasswordValid = await bcrypt.compare(password, user.password);

        // If password is invalid, return 401
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate a JWT token for the logged-in user
        const token = jwt.sign({ userId: user._id }, jwtSecret);

        // Store the JWT token in a secure, HTTP-only cookie
        res.cookie('token', token, { httpOnly: true });

        // Redirect user to dashboard after successful login
        res.redirect('/dashboard');

    } catch (error) {
        // Log any unexpected errors
        console.log(error);
    }
});






// // POST Admin - Check Login
// router.post('/admin', async (req, res) => {
//     try {

//         const { username, password } = req.body;
//         if(req.body.username === 'admin' && req.body.password === 'password') {
//             console.log(req.body);
//             //res.redirect('/');
//             res.send('You are logged in!');
//         } else {
//             res.send('Wrong user or password')
//         }

//     } catch(error){
//         console.log(error);
//     }
// });

// POST Admin - Register
router.post('/admin', async (req, res) => {
    try {

        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        try {
            const user = await User.create({ username, password: hashedPassword });
            res.status(201).json({ message: 'User Created', user});
        }catch(error) {
            if(error.code === 11000) {
                res.status(400).json({ message: 'User already in use'});
            }
            res.status(500).json( { message: 'Interal service error'});
        }
       
    } catch(error){
        console.log(error);
    }
});



module.exports = router;
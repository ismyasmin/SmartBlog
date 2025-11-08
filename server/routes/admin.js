const express = require ('express');
const router = express.Router();
const Post = require('../models/Post'); // use this model to insert and retrieve data
const User = require('../models/User');
const bcrypt = require('bcrypt');


const adminLayout = '../views/layouts/admin';

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
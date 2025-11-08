const express = require ('express');
const router = express.Router();
const Post = require('../models/Post'); // use this model to insert and retrieve data
const User = require('../models/User');

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

// POST Admin - Check Login
router.post('/admin', async (req, res) => {
    try {

        const { username, password } = req.body;
        if(req.body.username === 'admin' && req.body.password === 'password') {
            console.log(req.body);
            //res.redirect('/');
            res.send('You are logged in!');
        } else {
            res.send('Wrong user or password')
        }
      

    } catch(error){
        console.log(error);
    }
});



module.exports = router;
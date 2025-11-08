const express = require ('express');
const router = express.Router();
const Post = require('../models/Post'); // use this model to insert and retrieve data

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


module.exports = router;
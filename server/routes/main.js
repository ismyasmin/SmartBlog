const express = require ('express');
const router = express.Router();
const Post = require('../models/Post'); // use thhis model to insert and retrieve data


// routes

router.get('', async(req,res) => {
    try{
        const locals = {
            title: "NodeJs Blog",
            description: "ai blog"
        }

        let perPage = 5;
        let page = req.query.page || 1; // if there's no page query, set default page query is one and get the first 10 blog plots

        const data = await Post.aggregate([ { $sort: { createdAt: -1}}]) // oldest at the top
        .skip(perPage * page - perPage)
        .limit(perPage)
        .exec(); // execute aggregated pipeline 

        const count = await Post.countDocuments({});
        const nextPage = parseInt(page) + 1;
        const hasNextPage = nextPage <= Math.ceil(count / perPage);

        res.render('index', { 
            locals,
            data,
            current: page,
            nextPage: hasNextPage ? nextPage : null} );

    } catch(error) {
        console.log(error.message);

    }
});





module.exports = router;
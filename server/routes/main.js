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


// get post id
router.get('/post/:id', async(req,res) => {
    try{

        let slug = req.params.id;

        const data = await Post.findById({ _id: slug});
        const locals = {
            title: "NodeJs Blog",
            description: "ai blog"
        }

        res.render('post', { locals, data } );

    } catch(error) {
        console.log(error.message);

    }
});


// post searchTerm
router.post('/search', async(req,res) => {
    try{
        const locals = {
            title: "NodeJs Blog",
            description: "ai blog"
        }

        let searchTerm = req.body.searchTerm;

        const searchNoSpecialChar = searchTerm.replace(/[^a-zA-Z0-9]/g, "")

        

        const data = await Post.find({
            $or: [
                { title: { $regex: new RegExp(searchNoSpecialChar, 'i')}},
                { body: { $regex: new RegExp(searchNoSpecialChar, 'i')}}
            ]
        });

        res.render("search", {
            data,
            locals
            });

    } catch(error) {
        console.log(error.message);
    }
});


module.exports = router;
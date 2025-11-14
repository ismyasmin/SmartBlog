const express = require ('express');
const router = express.Router();
const Post = require('../models/Post'); // Model to insert and retrieve Post data
const Contact = require('../models/Contact'); // model for contact form


// routes
// get Home
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
            nextPage: hasNextPage ? nextPage : null,
            currentRoute: '/'
        });
            

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

        res.render('post', { locals, data , currentRoute: `/post/${slug}` });

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
            locals,
            currentRoute: '/'
            });

    } catch(error) {
        console.log(error.message);
    }
});

// get About
router.get('/about', (req, res) => {

    const locals = {
        title: "About",
        description: "About page"
    } 
    res.render('about', {
      currentRoute: '/about' //  Pass current route to EJS template
    });
  });

// POST - contact
router.post('/contact', async(req,res) => {
    try {
      const locals = {
        title: "Contact",
        description: "Contact page"
      };
  
      const { name, email, message } = req.body;
  
      // Basic validation
      if (!name || !email || !message) {
        return res.render('contact', { 
          locals,
          currentRoute: '/contact',
          success: null, 
          error: 'All fields are required.' 
        });
      }
  
      // Save to MongoDB
      await Contact.create({ name, email, message });
  
      // Log it 
      console.log("CONTACT FORM:", { name, email, message });
  
      // Success response. Pass current route to EJS template
      return res.render('contact', { 
        locals,
        currentRoute: '/contact',
        success: 'Message sent successfully! We will get back to you soon.',
        error: null 
      });
  
    } catch (error) {
      console.log(error);
  
      return res.render('contact', { 
        currentRoute: '/contact',
        success: null,
        error: 'Something went wrong, please try again.'
      });
    }
  });
  
// get - contact
router.get('/contact', (req, res) => {
    res.render('contact', { 
        success: null,
        error: null 
    });
});


    


  

module.exports = router;
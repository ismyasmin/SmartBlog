const express = require ('express');
const router = express.Router();
const Post = require('../models/Post'); // use this model to insert and retrieve data
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const openAI = require('openai');


const adminLayout = '../views/layouts/admin';
const jwtSecret = process.env.JWT_SECRET;

const openai = new openAI({
    apiKey: process.env.OPENAI_API_KEY
});

console.log("✅ admin.js routes file loaded");  // Add at the top


// Check Login -  Middleware to check if user is authenticate
const authMiddleware = (req, res, next) => {
    const token = req.cookies.token; // Get JWT token from cookies

    // If no token found, block access
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        // Verify token using the secret key
        const decoded = jwt.verify(token, jwtSecret);

        // Store user ID in request for later use
        req.userId = decoded.userId;

        // Allow request to continue to next middleware or route
        next();
    } catch (error) {
        // If verification fails, deny access
        res.status(401).json({ message: 'Unauthorized' });
    }
};


// GET Admin - Login Page
router.get('/admin', async(req,res) => {
    try{
        const locals = {
            title: 'Admin',
            description: 'ai blog'
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

// Protected route: Admin Dashboard
router.get('/dashboard', authMiddleware, async (req, res) => {
    try {
        // Page metadata
        const locals = {
            title: 'Dashboard',
            description: 'Admin dashboard'
        };

        // Fetch all posts from database
        const data = await Post.find();

        // Render dashboard page with posts data and admin layout
        res.render('admin/dashboard', {
            locals,
            data,
            layout: adminLayout
        });

    } catch (error) {
        console.log(error);
    }
});


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


// Admin GET - Create a New Post
router.get('/add-post', authMiddleware, async (req, res) => {
    try {
        // Page metadata
        const locals = {
            title: 'Add Post',
            description: 'Post'
        };

        // Fetch all posts from database
        const data = await Post.find();

        // Render add-post page to add new posts. Render admin layout too
        res.render('admin/add-post', {
            locals,
            layout: adminLayout
        });

    } catch (error) {
        console.log(error);
    }
});

// Admin POST - Add New Post Content
// Protected by authMiddleware so only logged-in users can add posts
router.post('/add-post', authMiddleware, async (req, res) => {
    try {
        // Log the request body for debugging
        console.log(req.body);

        try {
            // Create a new Post instance using form data
            const newPost = new Post({
                title: req.body.title, // Post title from form input
                body: req.body.body    // Post body from form input
            });

            // Save the new post to MongoDB
            await Post.create(newPost);

            // Redirect back to dashboard after successful creation
            res.redirect('/dashboard');

        } catch (error) {
            // Handle database or validation errors
            console.log(error);
        }

    } catch (error) {
        // Catch any unexpected server errors
        console.log(error);
    }
});

// Admin GET - Edit Post
router.get('/edit-post/:id', authMiddleware, async (req, res) => {
    try {

        const locals = {
            title: 'Edit Post',
            description: 'Edit Post Page'
        };

        const data = await Post.findOne({ _id: req.params.id});

        res.render('admin/edit-post', {
            locals,
            data,
            layout: adminLayout
        })

    } catch (error) {
        console.log(error);
    }
});

// Admin PUT - Update / Edit Post
router.put('/edit-post/:id', authMiddleware, async (req, res) => {
    try {

        await Post.findByIdAndUpdate(req.params.id, {
            title: req.body.title,
            body: req.body.body,
            updatedAt: Date.now()
        });

        res.redirect(`/edit-post/${req.params.id}`);

    } catch (error) {
        console.log(error);
    }
});

// Admin DELETE - Delete Post
router.delete('/delete-post/:id', authMiddleware, async (req,res) => {

    try {
        await Post.deleteOne( { _id: req.params.id} );
        res.redirect('/dashboard');
    } catch (error) {
        console.log(error);
    }
});




// GET - Generate Blog Post Page
router.get('/generate-post', authMiddleware, async (req,res) =>{

    try {
        const locals = {
            title: 'Generate blog',
            description: 'Generate blog with ai'
        };

        res.render('admin/generate-post', {
            locals,
            layout: adminLayout
        });

    } catch(error) {
        console.log(error);
    }
   
});

// POST - Generate Blog Post
// router.post('/generate-post', authMiddleware, async (req,res) => {
//     console.log("✅ /generate-post route hit");   // Add inside route

//     try {
//         const { topic } = req.body;

//         const prompt =  `Write a high-quality blog post about "${topic}".
//         Include:
//         - A catchy title
//         - An engaging introduction
//         - 3–4 informative sections
//         - A short conclusion
//         Make it SEO-friendly and easy to read.`;

//         const completion = await openai.chat.completions.create({
//             model: "gpt-3.5-turbo",
//             messages: [{ role: "user", content: prompt }]
//         });

//         const aiPost = completion.choices[0].message.content;

//         // const newPost = new Post({
//         //     title: topic,
//         //     body: aiPost,
//         //     createdAt: new Date()
//         //   });
          
//           await newPost.save();

//           res.json({ success: true, post: newPost });

//     } catch(error) {
//         console.log(error);
//         res.status(500).json({ success: false, message: "AI generation failed." });
//     }
// });
router.post('/generate-post', authMiddleware, async (req, res) => {
    try {
      const { topic } = req.body; // Extract the blog topic from the request body
  
      // Construct a prompt for the AI to generate a structured blog post
      const prompt = `Write a high-quality blog post about "${topic}".
        Include:
        - A catchy title
        - Engaging introduction
        - 3–4 informative sections
        - A short conclusion.`;
  
      // Call OpenAI API to generate blog content
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini", // Lightweight, faster OpenAI model for text generation
        messages: [{ role: "user", content: prompt }]
      });
  
      // Extract the AI-generated post text from the response
      const aiPost = completion.choices[0].message.content;
  
      // Return the generated post as JSON to the client (front-end)
      res.json({ success: true, post: aiPost });
  
    } catch (error) {
      console.error('AI generation error:', error);
      res.status(500).json({ success: false, message: "AI generation failed." });
    }
  });


// Admin GET - Logout
router.get('/logout', (req,res) => {
    res.clearCookie('token');
    // res.json( {message: 'Logged out!'});
    res.redirect('/');
});

module.exports = router;
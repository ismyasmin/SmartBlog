const express = require ('express');
const router = express.Router();
const Post = require('../models/Post'); // use this model to insert and retrieve data
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const openAI = require('openai');



const adminLayout = '../views/layouts/admin';
const mainLayout = '../views/layouts/main';


const jwtSecret = process.env.JWT_SECRET;

const openai = new openAI({
    apiKey: process.env.OPENAI_API_KEY
});

console.log("✅ admin.js routes file loaded");  // Add at the top


// Check Login -  Middleware to check if user is authenticate
const authMiddleware = async (req, res, next) => {
    const token = req.cookies.token; // Get JWT token from cookies

    // If no token found, block access
    if (!token) {
        res.locals.user = null; // important for EJS templates
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        // Verify token using the secret key
        const decoded = jwt.verify(token, jwtSecret);

        // Store user ID in request for later use
        req.userId = decoded.userId;

        const user = await User.findById(req.userId).select('-password');
        res.locals.user = user || null;

        // Allow request to continue to next middleware or route
        next();
    } catch (error) {
        // If verification fails, deny access
        res.locals.user = null;
        res.status(401).json({ message: 'Unauthorized' });
    }
};


// GET Admin - Login Page
router.get('/admin/login', async(req,res) => {
    try{
        const locals = {
            title: 'Login',
            description: 'ai blog'
        }


        res.render('admin/login', { locals, layout: mainLayout} );

    } catch(error) {
        console.log(error.message);

    }
});


// GET Admin - Login Page
router.get('/admin/register', async(req,res) => {
    try{
        const locals = {
            title: 'Register',
            description: 'ai blog'
        }


        res.render('admin/register', { locals, layout: mainLayout});

    } catch(error) {
        console.log(error.message);

    }
});


// POST Admin - Check Login
router.post('/admin/login', async (req, res) => {
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

        let perPage = 6;
        let page = parseInt(req.query.page) || 1;

        const previousPage = page > 1 ? page - 1 : null;
        
        const data = await Post.aggregate([{ $sort: { createdAt: -1 }}])
            .skip((perPage * page) - perPage)
            .limit(perPage);

        const count = await Post.countDocuments({});
        const nextPage = page + 1;
        const hasNextPage = nextPage <= Math.ceil(count / perPage);


        // Render dashboard page with posts data and admin layout
        res.render('admin/dashboard', {
            locals,
            data,
            current: page,
            previousPage,
            nextPage: hasNextPage ? nextPage : null,
            currentRoute: '/dashboard',
            layout: adminLayout
        });

    } catch (error) {
        console.log(error);
    }
});


// POST Admin - Register
router.post('/admin/register', async (req, res) => {
    try {

        const { username, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

       
        // Create new user
        const user = await User.create({ username, password: hashedPassword });

        res.status(201).json({ message: 'User Created', user});
        
       
    } catch(error){
        console.log(error);
        res.status(500).json( { message: 'Interal service error'});
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

// POST - Publish blog to database
router.post('/publish', authMiddleware, async (req, res) => {
    try {
      // Extract title and body from the request
      const { title, body } = req.body;
  
      // Validate required fields before saving
      if (!title || !body) {
        return res.status(400).json({
          success: false,
          message: "Title and body are required."
        });
      }
  
      // Create a new post document using the Mongoose Post model
      const newPost = new Post({
        title,
        body,
        createdAt: new Date() // Record the creation time
      });
  
      // Save the new post to MongoDB
      await newPost.save();
  
      // Respond with a success message
      res.json({
        success: true,
        message: "Blog published successfully!"
      });
  
    } catch (error) {
      // Log and handle any errors that occur during publishing
      console.error("Publish error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to publish post."
      });
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
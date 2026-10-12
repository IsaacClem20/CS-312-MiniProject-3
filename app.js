// Express setup
const express = require("express");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const pool = require("./db");
const app = express();
const PORT = 3000;
require("dotenv").config();

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true}));
app.use(express.static("public"));
// uses session cookies in .env file
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
// Show the signup page
app.get("/signup", (req, res) => {
    res.render("signup");
});

// Create a new user account
app.post("/signup", async (req, res) => {
    const user_id = req.body.user_id.trim();
    const name = req.body.name.trim();
    const password = req.body.password;

    try {
        // Check if the user ID already exists
        const existingUser = await pool.query(
            // using $1 as a query parameter to prevent SQL injection
            "SELECT user_id FROM users WHERE user_id = $1",
            [user_id]
        );

        if (existingUser.rows.length > 0) {
            return res.status(409).send(
                'That user ID already exists. <a href="/signup">Try again</a>.'
            );
        }

        // Hash the password before storing it
        const hashedPassword = await bcrypt.hash(password, 10);

        // Save the new user in PostgreSQL
        await pool.query(
            "INSERT INTO users (user_id, password, name) VALUES ($1, $2, $3)",
            [user_id, hashedPassword, name]
        );

        res.redirect("/signin");
    } catch (error) {
        console.error("Signup error:", error.message);
        res.status(500).send("Something went wrong while creating your account.");
    }
});

// Show the signin page
app.get("/signin", (req, res) => {
    res.render("signin");
});

// Sign in an existing user
app.post("/signin", async (req, res) => {
    const user_id = req.body.user_id.trim();
    const password = req.body.password;

    try {
        // Find the user in the database
        const result = await pool.query(
            "SELECT * FROM users WHERE user_id = $1",
            [user_id]
        );

        if (result.rows.length === 0) {
            return res.status(401).send(
                'Invalid user ID or password. <a href="/signin">Try again</a>.'
            );
        }

        const user = result.rows[0];

        // Compare the submitted password with the stored hash
        const passwordMatches = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatches) {
            return res.status(401).send(
                'Invalid user ID or password. <a href="/signin">Try again</a>.'
            );
        }

        // Remember the signed-in user
        req.session.user = {
            user_id: user.user_id,
            name: user.name
        };

        res.redirect("/");
    } catch (error) {
        console.error("Signin error:", error.message);
        res.status(500).send("Something went wrong while signing in.");
    }
});

// Add the first route to server (homepage)
app.get("/", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM blogs ORDER BY date_created DESC"
        );

        res.render("index", {
            posts: result.rows,
            user: req.session.user
        });
    } catch (error) {
        console.error("Error loading blog posts:", error.message);
        res.status(500).send("Could not load blog posts.");
    }
});

// create post button setup route
app.post("/posts", (req, res) => {
    const newPost = {
        id: Date.now(),
        name: req.body.name,
        title: req.body.title,
        content: req.body.content,
        date: new Date()
    };
    
    posts.push(newPost);
    res.redirect("/");
});

// Show the edit setting for a blog post
app.get("/posts/:id/edit", (req, res) =>{
    const postId = Number(req.params.id);

    const post = posts.find(post => post.id === postId);

    if (!post) {
        return res.status(404).send("Post not found");
    }

    res.render("edit", {post: post});
});

// Save changes to a newly edited blog post
app.post("/posts/:id/edit", (req, res) => {
    const postId = Number(req.params.id);

    const post = posts.find(post => post.id === postId);

    if (!post) {
        return res.status(404).send("Post not found");
    }

    post.name = req.body.name;
    post.title = req.body.title;
    post.content = req.body.content;

    res.redirect("/");
});

// Delete a blog post
app.post("/posts/:id/delete", (req, res) => {
    const postId = Number(req.params.id);

    // IMPORTANT: filters array to display only the posts that are left
    posts = posts.filter(post => post.id !== postId);

    res.redirect("/");
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

// Express setup
const express = require("express");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const pool = require("./db");
const apiRouter = require("./routes/api");
const app = express();
const PORT = 3000;
require("dotenv").config();

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

// Test API endpoint for React connection
app.get("/api/health", (req, res) => {
    res.json({
        status: "success",
        message: "React is successfully connected to Express!"
    });
});


// uses session cookies in .env file
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

// Connect the React frontend API routes
app.use("/api", apiRouter);

// Show the signup page
app.get("/signup", (req, res) => {
    res.render("signup");
});


 // Create a new user account
app.post("/signup", async (req, res) => {

    // Make sure all fields were submitted as text
    if (
        typeof req.body.user_id !== "string" ||
        typeof req.body.name !== "string" ||
        typeof req.body.password !== "string"
    ) {
        return res.status(400).send("Please provide all required fields.");
    }

    const user_id = req.body.user_id.trim();
    const name = req.body.name.trim();
    const password = req.body.password;

    // Validate the user ID
    if (user_id.length < 3 || user_id.length > 50) {
        return res.status(400).send(
            'User ID must be between 3 and 50 characters. <a href="/signup">Try again</a>.'
        );
    }

    // Validate the name
    if (name.length === 0 || name.length > 100) {
        return res.status(400).send(
            'Name must be between 1 and 100 characters. <a href="/signup">Try again</a>.'
        );
    }

    // Validate the password
    if (password.length < 8 || password.length > 72) {
        return res.status(400).send(
            'Password must be between 8 and 72 characters. <a href="/signup">Try again</a>.'
        );
    }

    try {
        // Check if the user ID already exists
        const existingUser = await pool.query(
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

// logout a signed in user
app.post("/logout", (req, res) => {
    req.session.destroy((error) => {
        if (error) {
            console.error("Logout error:", error.message);
            return res.status(500).send("Could not log out.");
        }

        res.clearCookie("connect.sid");
        res.redirect("/signin");
    });
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

// creating a post from a user
app.post("/posts", async (req, res) => {
    // Make sure the user is signed in
    if (!req.session.user) {
        // if theyre not, send them back to signin page
        return res.redirect("/signin");
    }

    const title = req.body.title.trim();
    const body = req.body.content.trim();

    try {
        // Save the new post to PostgreSQL
        await pool.query(
            `INSERT INTO blogs
                (creator_name, creator_user_id, title, body)
             VALUES ($1, $2, $3, $4)`,
            [
                req.session.user.name,
                req.session.user.user_id,
                title,
                body
            ]
        );

        res.redirect("/");
    } catch (error) {
        console.error("Error creating post:", error.message);
        res.status(500).send("Could not create your blog post.");
    }
});

// Show the edit setting for a blog post
app.get("/posts/:id/edit", async (req, res) => {
    if (!req.session.user) {
        return res.redirect("/signin");
    }

    const postId = req.params.id;

    try {
        const result = await pool.query(
            "SELECT * FROM blogs WHERE blog_id = $1 AND creator_user_id = $2",
            [postId, req.session.user.user_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).send("Post not found or you do not have permission to edit it.");
        }

        res.render("edit", { post: result.rows[0] });
    } catch (error) {
        console.error("Error loading post for editing:", error.message);
        res.status(500).send("Could not load the post.");
    }
});

// Save changes to a newly edited blog post
app.post("/posts/:id/edit", async (req, res) => {
    if (!req.session.user) {
        return res.redirect("/signin");
    }

    const postId = req.params.id;
    const title = req.body.title.trim();
    const body = req.body.content.trim();

    try {
        const result = await pool.query(
            `UPDATE blogs
             SET title = $1, body = $2
             WHERE blog_id = $3 AND creator_user_id = $4`,
            [
                title,
                body,
                postId,
                req.session.user.user_id
            ]
        );

        if (result.rowCount === 0) {
            return res.status(404).send("Post not found or you do not have permission to edit it.");
        }

        res.redirect("/");
    } catch (error) {
        console.error("Error updating post:", error.message);
        res.status(500).send("Could not update the post.");
    }
});

// Delete a blog post

app.post("/posts/:id/delete", async (req, res) => {
    if (!req.session.user) {
        return res.redirect("/signin");
    }

    const postId = req.params.id;

    try {
        const result = await pool.query(
            "DELETE FROM blogs WHERE blog_id = $1 AND creator_user_id = $2",
            [postId, req.session.user.user_id]
        );

        if (result.rowCount === 0) {
            return res.status(404).send("Post not found or you do not have permission to delete it.");
        }

        res.redirect("/");
    } catch (error) {
        console.error("Error deleting post:", error.message);
        res.status(500).send("Could not delete the post.");
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

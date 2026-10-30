
const express = require("express");
const bcrypt = require("bcryptjs");
const pool = require("../db");

const router = express.Router();

// Make sure the user is signed in before performing
// protected blog operations.
function requireAuth(req, res, next) {
    if (!req.session.user) {
        return res.status(401).json({
            message: "You must be signed in to perform this action."
        });
    }

    next();
}

// ==========================================
// AUTHENTICATION ROUTES
// ==========================================

// Check whether a user is currently signed in
router.get("/auth/me", (req, res) => {
    res.json({
        user: req.session.user || null
    });
});


// Create a new user account
router.post("/auth/signup", async (req, res) => {
    const { user_id, name, password } = req.body;

    // Check that all required fields were submitted
    if (
        typeof user_id !== "string" ||
        typeof name !== "string" ||
        typeof password !== "string"
    ) {
        return res.status(400).json({
            message: "Please provide all required fields."
        });
    }

    const cleanUserId = user_id.trim();
    const cleanName = name.trim();

    // Validate user ID
    if (cleanUserId.length < 3 || cleanUserId.length > 50) {
        return res.status(400).json({
            message: "User ID must be between 3 and 50 characters."
        });
    }

    // Validate name
    if (cleanName.length === 0 || cleanName.length > 100) {
        return res.status(400).json({
            message: "Name must be between 1 and 100 characters."
        });
    }

    // Validate password
    if (password.length < 8 || password.length > 72) {
        return res.status(400).json({
            message: "Password must be between 8 and 72 characters."
        });
    }

    try {
        // Check whether the user ID already exists
        const existingUser = await pool.query(
            "SELECT user_id FROM users WHERE user_id = $1",
            [cleanUserId]
        );

        if (existingUser.rows.length > 0) {
            return res.status(409).json({
                message: "That user ID already exists."
            });
        }

        // Hash the password before saving it
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert the new account into PostgreSQL
        await pool.query(
            `INSERT INTO users (user_id, password, name)
             VALUES ($1, $2, $3)`,
            [cleanUserId, hashedPassword, cleanName]
        );

        return res.status(201).json({
            message: "Account created successfully!"
        });

    } catch (error) {
        console.error("Signup error:", error.message);

        // Handle a duplicate user ID in case of a
        // simultaneous signup request
        if (error.code === "23505") {
            return res.status(409).json({
                message: "That user ID already exists."
            });
        }

        return res.status(500).json({
            message: "Something went wrong while creating your account."
        });
    }
});


// Sign in an existing user
router.post("/auth/signin", async (req, res) => {
    const { user_id, password } = req.body;

    if (
        typeof user_id !== "string" ||
        typeof password !== "string" ||
        user_id.trim().length === 0 ||
        password.length === 0
    ) {
        return res.status(400).json({
            message: "Please enter your user ID and password."
        });
    }

    try {
        // Look up the user in PostgreSQL
        const result = await pool.query(
            "SELECT * FROM users WHERE user_id = $1",
            [user_id.trim()]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                message: "Invalid user ID or password."
            });
        }

        const user = result.rows[0];

        // Compare the submitted password against
        // the stored bcrypt hash
        const passwordMatches = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatches) {
            return res.status(401).json({
                message: "Invalid user ID or password."
            });
        }

        // Regenerate the session after successful login
        req.session.regenerate((error) => {
            if (error) {
                console.error("Session error:", error.message);

                return res.status(500).json({
                    message: "Could not create your login session."
                });
            }

            // Remember the signed-in user
            req.session.user = {
                user_id: user.user_id,
                name: user.name
            };

            // Save the session before responding
            req.session.save((saveError) => {
                if (saveError) {
                    console.error("Session save error:", saveError.message);

                    return res.status(500).json({
                        message: "Could not save your login session."
                    });
                }

                return res.json({
                    message: "Successfully signed in!",
                    user: req.session.user
                });
            });
        });

    } catch (error) {
        console.error("Signin error:", error.message);

        return res.status(500).json({
            message: "Something went wrong while signing in."
        });
    }
});


// Log out the currently signed-in user
router.post("/auth/logout", (req, res) => {
    req.session.destroy((error) => {
        if (error) {
            console.error("Logout error:", error.message);

            return res.status(500).json({
                message: "Could not log out."
            });
        }

        res.clearCookie("connect.sid", { path: "/" });

        return res.json({
            message: "Successfully logged out."
        });
    });
});



 // ==========================================
 // BLOG ROUTES
 // ==========================================


// Retrieve all blog posts
router.get("/blogs", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM blogs ORDER BY date_created DESC"
        );

        return res.json({
            posts: result.rows,
            user: req.session.user || null
        });

    } catch (error) {
        console.error("Error loading blog posts:", error.message);

        return res.status(500).json({
            message: "Could not load blog posts."
        });
    }
});


// Retrieve one blog post for editing
// Only the creator can retrieve it through this route.
router.get("/blogs/:id", requireAuth, async (req, res) => {
    const postId = Number(req.params.id);

    if (!Number.isInteger(postId) || postId < 1) {
        return res.status(400).json({
            message: "Invalid blog post ID."
        });
    }

    try {
        const result = await pool.query(
            `SELECT * FROM blogs
             WHERE blog_id = $1 AND creator_user_id = $2`,
            [postId, req.session.user.user_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Post not found or you do not have permission to edit it."
            });
        }

        return res.json({
            post: result.rows[0]
        });

    } catch (error) {
        console.error("Error retrieving post:", error.message);

        return res.status(500).json({
            message: "Could not retrieve the blog post."
        });
    }
});


// Create a new blog post
router.post("/blogs", requireAuth, async (req, res) => {
    const { title, body } = req.body;

    // Validate submitted fields
    if (
        typeof title !== "string" ||
        typeof body !== "string"
    ) {
        return res.status(400).json({
            message: "Please provide a title and body."
        });
    }

    const cleanTitle = title.trim();
    const cleanBody = body.trim();

    if (
        cleanTitle.length === 0 ||
        cleanTitle.length > 255 ||
        cleanBody.length === 0
    ) {
        return res.status(400).json({
            message: "The title must be 1-255 characters and the body cannot be empty."
        });
    }

    try {
        const result = await pool.query(
            `INSERT INTO blogs
                (creator_name, creator_user_id, title, body)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [
                req.session.user.name,
                req.session.user.user_id,
                cleanTitle,
                cleanBody
            ]
        );

        return res.status(201).json({
            message: "Blog post created successfully!",
            post: result.rows[0]
        });

    } catch (error) {
        console.error("Error creating post:", error.message);

        return res.status(500).json({
            message: "Could not create your blog post."
        });
    }
});


// Update an existing blog post
router.put("/blogs/:id", requireAuth, async (req, res) => {
    const postId = Number(req.params.id);
    const { title, body } = req.body;

    if (!Number.isInteger(postId) || postId < 1) {
        return res.status(400).json({
            message: "Invalid blog post ID."
        });
    }

    if (
        typeof title !== "string" ||
        typeof body !== "string"
    ) {
        return res.status(400).json({
            message: "Please provide a title and body."
        });
    }

    const cleanTitle = title.trim();
    const cleanBody = body.trim();

    if (
        cleanTitle.length === 0 ||
        cleanTitle.length > 255 ||
        cleanBody.length === 0
    ) {
        return res.status(400).json({
            message: "The title must be 1-255 characters and the body cannot be empty."
        });
    }

    try {
        const result = await pool.query(
            `UPDATE blogs
             SET title = $1, body = $2
             WHERE blog_id = $3 AND creator_user_id = $4
             RETURNING *`,
            [
                cleanTitle,
                cleanBody,
                postId,
                req.session.user.user_id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Post not found or you do not have permission to edit it."
            });
        }

        return res.json({
            message: "Blog post updated successfully!",
            post: result.rows[0]
        });

    } catch (error) {
        console.error("Error updating post:", error.message);

        return res.status(500).json({
            message: "Could not update the blog post."
        });
    }
});


// Delete an existing blog post
router.delete("/blogs/:id", requireAuth, async (req, res) => {
    const postId = Number(req.params.id);

    if (!Number.isInteger(postId) || postId < 1) {
        return res.status(400).json({
            message: "Invalid blog post ID."
        });
    }

    try {
        const result = await pool.query(
            `DELETE FROM blogs
             WHERE blog_id = $1 AND creator_user_id = $2
             RETURNING blog_id`,
            [
                postId,
                req.session.user.user_id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Post not found or you do not have permission to delete it."
            });
        }

        return res.json({
            message: "Blog post deleted successfully!"
        });

    } catch (error) {
        console.error("Error deleting post:", error.message);

        return res.status(500).json({
            message: "Could not delete the blog post."
        });
    }
});


// Export the router so app.js can use it
module.exports = router;

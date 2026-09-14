// Express setup
const express = require("express");
const app = express();
const PORT = 3000;
// temp array storage for posts
let posts = [];

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true}));
app.use(express.static("public"));

// Add the first route to server (homepage)
app.get("/", (req,res) => {
    res.render("index", { posts: posts });
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

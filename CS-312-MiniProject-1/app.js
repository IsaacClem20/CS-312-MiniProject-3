// Express setup
const express = require("express");
const app = express();
const PORT = 3000;
// temp array storage for posts
let posts = [];

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true}));
app.use(express.static("public"));

// Add the first route to server
app.get("/", (req,res) => {
    res.render("index", { posts: posts });
});

// create post button setup
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


// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

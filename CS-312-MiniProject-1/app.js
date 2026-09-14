// Express setup
const express = require("express");
const app = express();
const PORT = 3000;

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true}));
app.use(express.static("public"));

// Add the first route to server
app.get("/", (req,res) => {
    res.render("index", {posts: posts});
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

// temp storage
let posts = [];
const express = require("express");
const port = 3000;
const app = express();

app.get("/", (req, res) => {
    res.send("Home page");
});

app.get("/movies", (req, res) => {
    res.send("Listagem de filmes");
});

app.listen(port, () => {
    console.log(`Running in http://localhost:${port}`);
});
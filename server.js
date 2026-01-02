const express = require("express");
const { getRouter } = require("stremio-addon-sdk");
const addonInterface = require("./addon");
const path = require("path");

const app = express();
const port = process.env.PORT || 7000;

// Serve static files (like bg.jpg) from the current directory
app.use(express.static(path.join(__dirname)));

// Use the Stremio Addon SDK router
app.use("/", getRouter(addonInterface));

// Landing page for the root URL
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(port, () => {
    console.log(`Addon active on port ${port}`);
    console.log(`http://127.0.0.1:${port}/manifest.json`);
});

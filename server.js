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
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>MalluFlix</title>
            <link rel="icon" id="icon" href="https://forzayt.github.io/assets/emoji.png" />
            <style>
                body { background: #111; color: white; font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; }
                a { color: #f39c12; text-decoration: none; font-size: 2em; border: 2px solid #f39c12; padding: 10px 20px; border-radius: 5px; transition: all 0.3s; }
                a:hover { background: #f39c12; color: #111; }
                h1 { margin-bottom: 20px; }
            </style>
        </head>
        <body>
            <h1>MalluFlix Addon</h1>
            <p>Stremio addon for Malayalam movie catalogs.</p>
            <a href="stremio://127.0.0.1:${port}/manifest.json">Install on Stremio</a>
            <p><small>Or copy this link: http://127.0.0.1:${port}/manifest.json</small></p>
        </body>
        </html>
    `);
});

app.listen(port, () => {
    console.log(`Addon active on port ${port}`);
    console.log(`http://127.0.0.1:${port}/manifest.json`);
});

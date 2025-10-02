const { serveHTTP } = require("stremio-addon-sdk");
const { syncAllStreams } = require("./discordWebhook");

const addonInterface = require("./addon");

// Start the server
serveHTTP(addonInterface, { port: 7001 });

// Automatically sync all streams to Discord on startup
syncAllStreams();


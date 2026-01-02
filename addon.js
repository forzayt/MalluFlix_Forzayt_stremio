const { addonBuilder } = require("stremio-addon-sdk");

const manifest = {
    id: "org.mallu.flix.forza",
    version: "2.0.0",
    name: "MalluFlix",
    description: "The one and only addon for Malayalam movie catalogs",
    logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSBciJKrh7BJiY6U1UKbCedjqBdd9_AQai7-Q&s",
    resources: ["catalog", "stream", "meta"],
    types: ["movie"],
    catalogs: [],
    idPrefixes: ["tt"]
};

const builder = new addonBuilder(manifest);

builder.defineStreamHandler(async ({ type, id }) => {
    // Add stream logic here
    return { streams: [] };
});

builder.defineCatalogHandler(async ({ type, id }) => {
    // Add catalog logic here
    return { metas: [] };
});

builder.defineMetaHandler(async ({ type, id }) => {
    // Add meta logic here
    return { meta: {} };
});

module.exports = builder.getInterface();

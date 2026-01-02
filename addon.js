const { addonBuilder } = require("stremio-addon-sdk");

const manifest = {
    id: "org.mallu.flix.forza",
    version: "2.0.0",
    name: "MalluFlix",
    description: "The one and only addon for Malayalam movie catalogs",
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

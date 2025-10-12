const { addonBuilder } = require("stremio-addon-sdk");
const streamsData = require("./streamsData");

const manifest = { 
    id: "org.mallu.flix.forza",
    version: "1.0.0",

    name: "MalluFlix",
    description: "Stream your fav movies directly in Stremio without buffering",
    logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSBciJKrh7BJiY6U1UKbCedjqBdd9_AQai7-Q&s",
    background: "https://avatars.githubusercontent.com/u/127679210?v=4",

    resources: ["catalog", "stream", "meta"],
    types: ["movie"],

   catalogs: [
    {
        type: "movie",
        id: "mallu-flix",
        name: "MalluFlix Movies",
       
    }
],

    idPrefixes: ["tt"]
};

// Build dataset (IMDb ID -> stream info)
const dataset = Object.fromEntries(
    Object.entries(streamsData).map(([imdbId, streamUrl]) => [
        imdbId,
        { 
            name: "Mallu Flix",
            type: "movie",
            url: streamUrl,
            title: "Mallu Flix Streaming Server",
            behaviorHints: {
                bingeGroup: "MalluFlix"
            }
        }
    ])
);

const builder = new addonBuilder(manifest);
const METAHUB_URL = "https://images.metahub.space";

// Stream handler (stable, no reorder)
builder.defineStreamHandler(function(args) {
    if (!dataset[args.id]) return { streams: [] };

    const stream = dataset[args.id];
    const url = stream.url || "";
    const isM3U8 = /\.m3u8(\?|$)/i.test(url);

    return Promise.resolve({
        streams: [{
            name: stream.name,
            title: stream.title,
            url: url,
            format: isM3U8 ? "hls" : "mp4",
            container: isM3U8 ? "m3u8" : "mp4",
            codec: isM3U8 ? undefined : "h264",
          
            behaviorHints: {
                ...stream.behaviorHints,
                bingeGroup: "MalluFlix",
                notWebReady: false
            },
            headers: {
                "User-Agent": "Mozilla/5.0",
                "Accept": "*/*"
            }
        }]
    });
});

// Catalog handler
const generateMetaPreview = (value, key) => {
    const imdbId = key.split(":")[0];
    return {
        id: imdbId,
        type: value.type,
        name: value.name,
        poster: `${METAHUB_URL}/poster/medium/${imdbId}/img`
    };
};

builder.defineCatalogHandler(args => {
    const metas = args.type === "movie"
        ? Object.entries(dataset)
            .filter(([_, value]) => value.type === args.type)
            .map(([key, value]) => generateMetaPreview(value, key))
        : [];
    return Promise.resolve({ metas });
});

// Meta handler
builder.defineMetaHandler(args => {
    if (dataset[args.id]) {
        const stream = dataset[args.id];
        const imdbId = args.id.split(":")[0];

        return Promise.resolve({
            meta: {
                id: args.id,
                type: stream.type,
                name: stream.name,
                title: stream.title,
                poster: `${METAHUB_URL}/poster/medium/${imdbId}/img`,
                background: `${METAHUB_URL}/background/medium/${imdbId}/img`,
                logo: `${METAHUB_URL}/logo/medium/${imdbId}/img`,
                description: `Streaming from ${stream.name}`,
                genres: ["Malayalam", "Movies"],
                year: new Date().getFullYear(),
                runtime: "120 min",
                country: "India",
                language: "Malayalam"
            }
        });
    }

    // fallback meta
    return Promise.resolve({
        meta: {
            id: args.id,
            type: "movie",
            name: "Unknown Content",
            title: "Unknown Content",
            poster: "https://via.placeholder.com/300x450/FF6B6B/FFFFFF?text=Unknown",
            background: "https://via.placeholder.com/1920x1080/FF6B6B/FFFFFF?text=Unknown",
            logo: "https://via.placeholder.com/300x450/FF6B6B/FFFFFF?text=Unknown",
            description: "Content not found",
            genres: ["Unknown"],
            year: new Date().getFullYear(),
            runtime: "Unknown",
            country: "Unknown",
            language: "Unknown"
        }
    });
});

module.exports = builder.getInterface();

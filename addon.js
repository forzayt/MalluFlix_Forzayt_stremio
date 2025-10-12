// index.js (or your addon entry)
const { addonBuilder } = require("stremio-addon-sdk");
const streamsData = require("./streamsData");
const liveTvChannels = require("./livetvData");


const manifest = { 
    id: "org.mallu.flix.forza",
    version: "1.2.0",

    name: "MalluFlix",
    description: "Stream your fav movies and live TV directly in Stremio without buffering , Frequent updates are released so just uninstall and reinstall the addon to get the latest features <3 .",
    logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSBciJKrh7BJiY6U1UKbCedjqBdd9_AQai7-Q&s",
    background: "https://avatars.githubusercontent.com/u/127679210?v=4",

    resources: ["catalog", "stream", "meta"],
    types: ["movie", "tv"],

    catalogs: [
        {
            type: "movie",
            id: "mallu-flix",
            name: "MalluFlix Movies"
        },
        {
            type: "tv",
            id: "live-tv-catalog",
            name: "Live TV Channels"
        }
    ],

    idPrefixes: ["tt", "live-"] // movies start with tt, live channels with live-
};

// ------------------- Movie Dataset -------------------
const movieDataset = Object.fromEntries(
    Object.entries(streamsData).map(([imdbId, streamUrl]) => [
        imdbId.startsWith("tt") ? imdbId : `tt${imdbId}`,
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

// ------------------- Live TV Dataset -------------------
// Load static live TV data from livetvData.js
const liveTvDataset = Object.fromEntries(
    liveTvChannels.map((channel) => {
        const stremioId = channel.id.startsWith("live-") ? channel.id : `live-${channel.id}`;
        return [stremioId, {
            name: channel.name || channel.title || "Unknown Channel",
            type: "tv",
            url: channel.url || "",
            title: channel.title || channel.name || "Unknown Channel",
            logo: channel.logo || null,
            group: channel.group || channel.category || "Live TV",
            behaviorHints: { bingeGroup: "LiveTV" }
        }];
    })
);

console.log(`Loaded ${Object.keys(liveTvDataset).length} static live TV channels`);

// ------------------- Addon Builder -------------------
const builder = new addonBuilder(manifest);
const METAHUB_URL = "https://images.metahub.space";

// Stream handler
builder.defineStreamHandler(args => {
    // Movie stream
    if (movieDataset[args.id]) {
        const stream = movieDataset[args.id];
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
    }

    // Live TV stream
    if (liveTvDataset[args.id]) {
        const channel = liveTvDataset[args.id];
        return Promise.resolve({
            streams: [{
                name: channel.name,
                title: channel.title,
                url: channel.url || "",
                format: /\.m3u8(\?|$)/i.test(channel.url || "") ? "hls" : "mp4",
                container: /\.m3u8(\?|$)/i.test(channel.url || "") ? "m3u8" : "mp4",
                behaviorHints: {
                    ...channel.behaviorHints,
                    bingeGroup: "LiveTV",
                    notWebReady: false
                },
                headers: {
                    "User-Agent": "Mozilla/5.0",
                    "Accept": "*/*"
                }
            }]
        });
    }

    // nothing found
    return { streams: [] };
});

// Catalog preview generator (works for movies and tv)
const generateMetaPreview = (value, key) => {
    if (value.type === "movie") {
        const imdbId = (key || "").split(":")[0];
        return {
            id: imdbId,
            type: "movie",
            name: value.name,
            poster: `${METAHUB_URL}/poster/medium/${imdbId}/img`
        };
    } else if (value.type === "tv") {
        return {
            id: key,
            type: "tv",
            name: value.name,
            poster: value.logo || "https://via.placeholder.com/300x450/4a5568/ffffff?text=Live+TV"
        };
    }
    return null;
};

// Catalog handler
builder.defineCatalogHandler(args => {
    console.log("Catalog requested:", args);
    let metas = [];

    if (args.type === "movie" && args.id === "mallu-flix") {
        metas = Object.entries(movieDataset)
            .filter(([_, v]) => v.type === "movie")
            .map(([k, v]) => generateMetaPreview(v, k))
            .filter(Boolean);
    } else if (args.type === "tv" && args.id === "live-tv-catalog") {
        metas = Object.entries(liveTvDataset)
            .map(([k, v]) => generateMetaPreview(v, k))
            .filter(Boolean);
    }

    return Promise.resolve({ metas });
});

// Meta handler
builder.defineMetaHandler(args => {
    // Movie meta
    if (movieDataset[args.id]) {
        const stream = movieDataset[args.id];
        const imdbId = args.id.split(":")[0];
        return Promise.resolve({
            meta: {
                id: args.id,
                type: "movie",
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

    // Live TV meta
    if (liveTvDataset[args.id]) {
        const channel = liveTvDataset[args.id];
        return Promise.resolve({
            meta: {
                id: args.id,
                type: "tv",
                name: channel.name,
                title: channel.title,
                poster: channel.logo,
                background: channel.logo,
                logo: channel.logo,
                description: `${channel.group || "Live TV"} - ${channel.name}`,
                genres: [channel.group || "Live TV"],
                country: "India",
                language: "Malayalam"
            }
        });
    }

    // fallback
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

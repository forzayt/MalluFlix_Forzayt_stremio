// index.js (or your addon entry)
const { addonBuilder } = require("stremio-addon-sdk");
const axios = require("axios");

const liveTvChannels = require("./livetvData");
const movies = require("./movieData");
const { parseM3UDirectory } = require("./m3uParser");
const path = require("path");

const M3U_PLAYLIST_DIR = path.join(__dirname, "m3u");


const manifest = {
    id: "org.mallu.flix.forza",
    version: "1.2.0",

    name: "MalluFlix",
    description: "Stream live TV directly in Stremio without buffering , Frequent updates are released so just uninstall and reinstall the addon to get the latest features <3 .",
    logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSBciJKrh7BJiY6U1UKbCedjqBdd9_AQai7-Q&s",
    background: "https://avatars.githubusercontent.com/u/127679210?v=4",

    resources: ["catalog", "stream", "meta"],
    types: ["tv", "movie"],

    catalogs: [

        {
            type: "tv",
            id: "live-tv-catalog",
            name: "MalluFlix TV Channels"
        },
        {
            type: "movie",
            id: "movie-catalog",
            name: "MalluFlix Movies"
        }

    ],

    idPrefixes: ["live-", "tt"]
};

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

// ------------------- Movie Data -------------------
// Map ID -> URL for stream resolution
const movieMap = Object.fromEntries(
    movies.map(m => [m.id, m.url])
);

// Helper to fetch metadata from Cinemeta
const getMovieMeta = async (imdbId) => {
    try {
        const { data } = await axios.get(`https://v3-cinemeta.strem.io/meta/movie/${imdbId}.json`);
        return data.meta;
    } catch (error) {
        console.error(`Failed to fetch meta for ${imdbId}:`, error.message);
        return {
            id: imdbId,
            name: "Unknown Movie",
            poster: "https://via.placeholder.com/300x450?text=No+Meta",
            type: "movie"
        };
    }
};

// ------------------- Load M3U Playlist -------------------

// ------------------- Load M3U Playlist -------------------
try {
    const m3uChannels = parseM3UDirectory(M3U_PLAYLIST_DIR);
    m3uChannels.forEach(channel => {
        const stremioId = channel.id.startsWith("live-") ? channel.id : `live-${channel.id}`;
        liveTvDataset[stremioId] = {
            name: channel.name || channel.title || "Unknown Channel",
            type: "tv",
            url: channel.url || "",
            title: channel.title || channel.name || "Unknown Channel",
            logo: channel.logo || null,
            group: channel.group || channel.category || "M3U Playlist",
            behaviorHints: { bingeGroup: "LiveTV" }
        };
    });
    console.log(`Loaded ${m3uChannels.length} channels from M3U playlists`);
} catch (error) {
    console.error(`Error loading M3U playlists: ${error.message}`);
}

// ------------------- Addon Builder -------------------
const builder = new addonBuilder(manifest);
const METAHUB_URL = "https://images.metahub.space";

// Stream handler
builder.defineStreamHandler(args => {
    if (liveTvDataset[args.id]) {
        const channel = liveTvDataset[args.id];
        const urls = (channel.url || "").split(",").filter(url => url.trim() !== "");

        // Create a stream for each URL
        const streams = urls.map((url, index) => {
            const isM3U8 = /\.m3u8(\?|$)/i.test(url);
            return {
                name: channel.name,
                title: urls.length > 1 ? `${channel.title} (Part ${index + 1})` : channel.title,
                url: url.trim(),
                format: isM3U8 ? "hls" : "mp4",
                container: isM3U8 ? "m3u8" : "mp4",
                behaviorHints: {
                    ...channel.behaviorHints,
                    bingeGroup: "LiveTV",
                    notWebReady: false
                },
                headers: {
                    "User-Agent": "Mozilla/5.0",
                    "Accept": "*/*"
                }
            };
        });

        return Promise.resolve({ streams });
    }

    if (movieMap[args.id]) {
        const url = movieMap[args.id];
        // We need to fetch title for the stream name, or just use a generic one if we want to be fast.
        // For streams, user usually knows what they clicked. Let's try to pass a reasonable title if possible.
        // Fetching meta here might delay the stream response. Let's return the stream immediately.

        const urls = (url || "").split(",").filter(u => u.trim() !== "");
        const streams = urls.map((u, index) => {
            const isM3U8 = /\.m3u8(\?|$)/i.test(u);
            return {
                name: "MalluFlix",
                title: `MalluFlix Server`,
                url: u.trim(),
                format: isM3U8 ? "hls" : "mp4",
                container: isM3U8 ? "m3u8" : "mp4",
                behaviorHints: {
                    bingeGroup: "Movies",
                    notWebReady: false
                }
            };
        });
        return Promise.resolve({ streams });
    }

    // nothing found
    return { streams: [] };
});

// Catalog preview generator (works for movies, tv, and series)
const generateMetaPreview = (value, key) => {
    if (value.type === "tv") {
        return {
            id: key,
            type: "tv",
            name: value.name,
            poster: value.logo || "https://via.placeholder.com/1080x1920/4a5568/ffffff?text=Live+TV",
            posterShape: "square"
        };
    }
    if (value.type === "movie") {
        return {
            id: key,
            type: "movie",
            name: value.name,
            poster: value.logo,
            posterShape: "poster"
        };
    }
    return null;
};

// Catalog handler
builder.defineCatalogHandler(async (args) => {
    console.log("Catalog requested:", args);
    let metas = [];

    if (args.type === "tv" && args.id === "live-tv-catalog") {
        metas = Object.entries(liveTvDataset)
            .map(([k, v]) => generateMetaPreview(v, k))
            .filter(Boolean);
    } else if (args.type === "movie" && args.id === "movie-catalog") {
        // Fetch meta for all movies in parallel
        const metaPromises = movies.map(async (m) => {
            const meta = await getMovieMeta(m.id);
            return {
                id: meta.id,
                type: "movie",
                name: meta.name,
                poster: meta.poster,
                posterShape: "poster"
            };
        });

        metas = (await Promise.all(metaPromises)).filter(Boolean);
    }

    return Promise.resolve({ metas });
});

// Meta handler
builder.defineMetaHandler(args => {
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
                posterShape: "square",
                background: channel.logo,
                logo: channel.logo,
                description: `${channel.group || "Live TV"} - ${channel.name}`,
                genres: [channel.group || "Live TV"],
                country: "India",
                language: "Malayalam"
            }
        });
    }

    // Movie meta
    if (movieMap[args.id]) {
        return getMovieMeta(args.id).then(meta => ({ meta }));
    }

    // fallback
    return Promise.resolve({
        meta: {
            id: args.id,
            type: "tv",
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

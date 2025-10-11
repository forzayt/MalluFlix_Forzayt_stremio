// index.js (or your addon entry)
const { addonBuilder } = require("stremio-addon-sdk");
const streamsData = require("./streamsData");
const fs = require("fs");
const path = require("path");

// Use global fetch when available (Node 18+). Fallback to node-fetch for older Node.
let fetchFn = global.fetch;
try {
  if (!fetchFn) fetchFn = require("node-fetch");
} catch (e) {
  // node-fetch not installed; will throw if fetch missing at runtime.
  fetchFn = global.fetch;
}

const LIVE_JSON_FILE = path.join(__dirname, "liveTv.json");
const LIVE_JSON_URL = "https://youtube-to-m3u8.onrender.com/api/live/channels.json";
const LIVE_REFRESH_MS = 10 * 60 * 1000; // 10 minutes

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
let liveTvDataset = {};

// If liveTv.json exists, load it synchronously at startup so catalog isn't empty.
const loadLiveJsonFile = () => {
    try {
        if (fs.existsSync(LIVE_JSON_FILE)) {
            const raw = fs.readFileSync(LIVE_JSON_FILE, "utf8");
            const parsed = JSON.parse(raw);
            // parsed expected to be an array of channel objects (from upstream)
            liveTvDataset = Object.fromEntries(
                (Array.isArray(parsed) ? parsed : []).map((ch, i) => {
                    const id = ch.id || `live-${i}`;
                    // ensure id uses live- prefix for stremio idPrefixes compatibility
                    const stremioId = id.startsWith("live-") ? id : `live-${i}`;
                    return [stremioId, {
                        name: ch.name || ch.title || `Channel ${i}`,
                        type: "tv",
                        url: ch.url || ch.stream || "",
                        title: ch.name || ch.title || `Channel ${i}`,
                        logo: ch.logo || ch.icon || null,
                        group: ch.group || ch.category || "Live TV",
                        behaviorHints: { bingeGroup: "LiveTV" }
                    }];
                })
            );
            console.log(`Loaded ${Object.keys(liveTvDataset).length} channels from liveTv.json`);
        } else {
            // minimal placeholder so catalog is not completely empty
            liveTvDataset = {
                "live-0": {
                    name: "Loading Live TV...",
                    type: "tv",
                    url: "",
                    title: "Loading Live TV...",
                    logo: "https://via.placeholder.com/300x450/4a5568/ffffff?text=Live+TV",
                    group: "Live TV",
                    behaviorHints: { bingeGroup: "LiveTV" }
                }
            };
            console.log("liveTv.json not found — using placeholder live channel");
        }
    } catch (err) {
        console.error("Error loading liveTv.json:", err);
        liveTvDataset = {
            "live-0": {
                name: "Loading Live TV...",
                type: "tv",
                url: "",
                title: "Loading Live TV...",
                logo: "https://via.placeholder.com/300x450/4a5568/ffffff?text=Live+TV",
                group: "Live TV",
                behaviorHints: { bingeGroup: "LiveTV" }
            }
        };
    }
};

// Call at startup
loadLiveJsonFile();

// Fetch remote channels and write to liveTv.json, then update in-memory dataset
const fetchAndSaveLiveTv = async () => {
    try {
        if (!fetchFn) throw new Error("No fetch available. Install node-fetch or use Node 18+.");
        const res = await fetchFn(LIVE_JSON_URL);
        if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);
        const channels = await res.json();

        // Save raw JSON to liveTv.json (pretty printed)
        try {
            fs.writeFileSync(LIVE_JSON_FILE, JSON.stringify(channels, null, 2), "utf8");
            console.log(`Saved ${Array.isArray(channels) ? channels.length : 0} channels to liveTv.json`);
        } catch (writeErr) {
            console.error("Failed to write liveTv.json:", writeErr);
        }

        // Transform into liveTvDataset
        liveTvDataset = Object.fromEntries(
            (Array.isArray(channels) ? channels : []).map((channel, index) => {
                const id = channel.id || `live-${index}`;
                const stremioId = id.startsWith("live-") ? id : `live-${index}`;
                return [stremioId, {
                    name: channel.name || channel.title || `Channel ${index}`,
                    type: "tv",
                    url: channel.url || channel.stream || "",
                    title: channel.name || channel.title || `Channel ${index}`,
                    logo: channel.logo || channel.icon || null,
                    group: channel.group || channel.category || "Live TV",
                    behaviorHints: { bingeGroup: "LiveTV" }
                }];
            })
        );

        console.log(`Fetched and loaded ${Object.keys(liveTvDataset).length} live channels`);
    } catch (err) {
        console.error("Error fetching live TV data:", err);
    }
};

// Initial fetch (attempt). If network fails, dataset still contains file or placeholder.
fetchAndSaveLiveTv();

// Periodic refresh every 10 minutes
setInterval(fetchAndSaveLiveTv, LIVE_REFRESH_MS);

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

const { addonBuilder } = require("stremio-addon-sdk");
const streamsData = require("./streamsData");
const { getNewsStream, getAllNewsStreams } = require("./newsStream");
const axios = require('axios');

const manifest = { 
    "id": "org.mallu.flix.forza",
    "version": "1.0.0",

    "name": "MalluFlix",
    "description": "Stream your fav movies directly in Stremio without buffering",
    "logo": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSBciJKrh7BJiY6U1UKbCedjqBdd9_AQai7-Q&s",
    "background": "https://avatars.githubusercontent.com/u/127679210?v=4",

    // set what type of resources we will return
    "resources": [
        "catalog",
        "stream",
        "meta"
    ],

    "types": ["movie", "tv"], // your add-on will be preferred for those content types

    // set catalogs, we'll be making 2 catalogs in this case, 1 for movies and 1 for news
    "catalogs": [
        {
            type: 'movie',
            id: 'mallu-flix',
            name: "MalluFlix Movies"
        },
        {
            type: 'tv',
            id: 'mallu-flix-news',
            name: "MalluFlix News",
            extra: [
                {
                    name: "search",
                    isRequired: false
                }
            ]
        }
    ],

    // prefix of item IDs (ie: "tt0032138" for movies, "news" for news)
    "idPrefixes": [ "tt", "news" ]
};

// Build dataset using only IMDb ID and direct MP4 URL from streamsData
const dataset = Object.fromEntries(
    Object.entries(streamsData).map(([imdbId, mp4Url]) => [
        imdbId,
        { 
            name: "Mallu Flix", 
            type: "movie", 
            url: mp4Url,
            title: "Mallu Flix Streaming Server",
            quality: "4K",
            format: "mp4",
            container: "mp4",
            codec: "h264",
            behaviorHints: {
                bingeGroup: "MalluFlix"
            }
        }
    ])
);

// News streams are now handled by the newsStream.js module






const builder = new addonBuilder(manifest);

// Streams handler
builder.defineStreamHandler(function(args) {
    
    // Check for movie streams
    if (dataset[args.id]) {
        const stream = dataset[args.id];
        // Ensure quality is properly set for Stremio display with proper format info
        const formattedStream = {
            ...stream,
            quality: "4K",
            format: "mp4",
            container: "mp4",
            codec: "h264",
            behaviorHints: {
                ...stream.behaviorHints,
                bingeGroup: "MalluFlix"
            },
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'video/mp4,video/*,*/*',
                'Accept-Encoding': 'identity',
                'Range': 'bytes=0-'
            }
        };
        return Promise.resolve({ streams: [formattedStream] });
    }
    // Check for news streams using new newsStream module
    else if (args.id.startsWith('news:')) {
        const videoId = args.id.replace('news:', '');
        const streams = getNewsStream(videoId);
        
        if (streams && streams.length > 0) {
            console.log(`✅ Found ${streams.length} stream formats for news: ${videoId}`);
            return Promise.resolve({ streams: streams });
        } else {
            console.log(`❌ No streams found for news: ${videoId}`);
            return Promise.resolve({ streams: [] });
        }
    } else {
        return Promise.resolve({ streams: [] });
    }
})

const METAHUB_URL = "https://images.metahub.space"

const generateMetaPreview = function(value, key) {
    // To provide basic meta for our movies for the catalog
    // we'll fetch the poster from Stremio's MetaHub
    // see https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/api/responses/meta.md#meta-preview-object
    const imdbId = key.split(":")[0]
    return {
        id: imdbId,
        type: value.type,
        name: value.name,
        poster: METAHUB_URL+"/poster/medium/"+imdbId+"/img",
    }
}

builder.defineCatalogHandler(function(args, cb) {
    let metas = [];
    
    // Handle movie catalog
    if (args.type === 'movie') {
        metas = Object.entries(dataset)
            .filter(([_, value]) => value.type === args.type)
            .map(([key, value]) => generateMetaPreview(value, key));
    }
    // Handle news catalog using new newsStream module
    else if (args.type === 'tv') {
        const allNewsStreams = getAllNewsStreams();
        metas = Object.entries(allNewsStreams)
            .map(([key, value]) => {
                const videoId = key.replace('news:', '');
                const thumbnailUrl = value.poster || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
                
                return {
                    id: key,
                    type: "tv",
                    name: value.name || value.title || "Live News Stream",
                    title: value.title || value.name || "Live News Stream",
                    poster: thumbnailUrl,
                    background: thumbnailUrl,
                    logo: thumbnailUrl,
                    description: `Live streaming from ${value.name || 'News Channel'}`,
                    genres: ["News", "Live"],
                    year: new Date().getFullYear()
                };
            });
    }

    return Promise.resolve({ metas: metas })
})

// Meta handler for detailed metadata (crucial for Continue Watching)
builder.defineMetaHandler(function(args) {
    
    // Handle movie metadata
    if (dataset[args.id]) {
        const stream = dataset[args.id];
        const imdbId = args.id.split(":")[0];
        
        const meta = {
            id: args.id,
            type: stream.type,
            name: stream.name,
            title: stream.title,
            poster: `https://images.metahub.space/poster/medium/${imdbId}/img`,
            background: `https://images.metahub.space/background/medium/${imdbId}/img`,
            logo: `https://images.metahub.space/logo/medium/${imdbId}/img`,
            description: `Streaming from ${stream.name}`,
            genres: ["Malayalam", "Movies"],
            year: new Date().getFullYear(),
            runtime: "120 min",
            country: "India",
            language: "Malayalam"
        };
        
        return Promise.resolve({ meta: meta });
    }
    
    // Handle news metadata using new newsStream module
    if (args.id.startsWith('news:')) {
        const allNewsStreams = getAllNewsStreams();
        const stream = allNewsStreams[args.id];
        
        if (stream) {
            const videoId = args.id.replace('news:', '');
            const thumbnailUrl = stream.poster || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
            
            const meta = {
                id: args.id,
                type: "tv",
                name: stream.name || stream.title || "Live News Stream",
                title: stream.title || stream.name || "Live News Stream",
                poster: thumbnailUrl,
                background: thumbnailUrl,
                logo: thumbnailUrl,
                description: `Live streaming from ${stream.name || 'News Channel'}`,
                genres: ["News", "Live"],
                year: new Date().getFullYear(),
                runtime: "Live",
                country: "India",
                language: "Malayalam"
            };
            
            return Promise.resolve({ meta: meta });
        }
    }
    
    // If not found, return a fallback meta to prevent blank display
    const fallbackMeta = {
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
    };
    
    return Promise.resolve({ meta: fallbackMeta });
})

module.exports = builder.getInterface()
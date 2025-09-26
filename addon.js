const { addonBuilder } = require("stremio-addon-sdk");
const streamsData = require("./streamsData");

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

    "types": ["movie"], // only movies are supported

    // set catalogs: only a movies catalog remains
    "catalogs": [
        {
            type: 'movie',
            id: 'mallu-flix',
            name: "MalluFlix Movies"
        }
    ],

    // prefix of item IDs (ie: "tt0032138" for movies)
    "idPrefixes": [ "tt" ],


 
      

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

// TV/news support removed


// Note: dataset is now simplified to only direct MP4 URL streams

const builder = new addonBuilder(manifest);

// Streams handler
builder.defineStreamHandler(function(args) {
    //console.log('Stream request for:', args.id);
    
    // Check for movie streams
    if (dataset[args.id]) {
        const stream = dataset[args.id];
        //console.log('Found movie stream:', stream.name);
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
    } else {
        //console.log('No stream found for:', args.id);
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
    // //console.log('Catalog request for type:', args.type);
    let metas = [];
    
    // Handle movie catalog
    if (args.type === 'movie') {
        metas = Object.entries(dataset)
            .filter(([_, value]) => value.type === args.type)
            .map(([key, value]) => generateMetaPreview(value, key));
        // //console.log('Movie metas count:', metas.length);
    }

    return Promise.resolve({ metas: metas })
})

// Meta handler for detailed metadata (crucial for Continue Watching)
builder.defineMetaHandler(function(args) {
    //console.log('Meta request for:', args.id);
    //console.log('Available movie IDs:', Object.keys(dataset));
    // TV/news support removed
    
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
        
        //console.log('Returning movie meta:', meta);
        return Promise.resolve({ meta: meta });
    }
    
    // If not found, return a fallback meta to prevent blank display
    //console.log('Item not found, returning fallback meta for:', args.id);
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
    
    //console.log('Returning fallback meta:', fallbackMeta);
    return Promise.resolve({ meta: fallbackMeta });
})

module.exports = builder.getInterface()
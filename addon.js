const { addonBuilder } = require("stremio-addon-sdk");
const streamsData = require("./streamsData");
const { google } = require('googleapis');

const manifest = { 
    "id": "org.mallu.flix.forza",
    "version": "1.0.0",

    "name": "MalluFlix test",
    "description": "Stream your fav movies directly in Stremio without buffering",
    "logo": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSBciJKrh7BJiY6U1UKbCedjqBdd9_AQai7-Q&s",
    "background": "https://avatars.githubusercontent.com/u/127679210?v=4",

    // set what type of resources we will return
    "resources": [
        "catalog",
        "stream"
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
    "idPrefixes": [ "tt", "news" ],


 
      

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
            behaviorHints: {
                bingeGroup: "MalluFlix"
            }
        }
    ])
);

// Dynamic news dataset - will be populated from YouTube API
let newsDataset = {};

// YouTube API configuration
const youtube = google.youtube({
    version: 'v3',
    auth: process.env.YOUTUBE_API_KEY || 'AIzaSyATgYvq78nB8WO2nOOEwZf0PB9yXLAAGRA'
});

// Function to fetch all live news streams from YouTube
async function fetchLiveStreams() {
    try {
        const allStreams = [];
        
        // Search for all live streams with news-related keywords
        const searchQueries = [
            'malayalam news live',
            'kerala news live',
            'malayalam breaking news',
            'kerala breaking news',
            'malayalam live tv',
            'kerala live tv'
        ];
        
        for (const query of searchQueries) {
            try {
                // Search for live streams with this query
                const response = await youtube.search.list({
                    part: 'snippet',
                    q: query,
                    type: 'video',
                    eventType: 'live',
                    maxResults: 10,
                    order: 'relevance'
                });

                if (response.data.items) {
                    for (const item of response.data.items) {
                        const videoId = item.id.videoId;
                        const snippet = item.snippet;
                        
                        // Skip if we already have this video
                        if (allStreams.some(stream => stream.id === `news:${videoId}`)) {
                            continue;
                        }
                        
                        // Get the best available thumbnail
                        const thumbnail = snippet.thumbnails?.maxres?.url || 
                                        snippet.thumbnails?.high?.url || 
                                        snippet.thumbnails?.medium?.url || 
                                        snippet.thumbnails?.default?.url;
                        
                        console.log(`Adding stream: ${snippet.title}`);
                        console.log(`Thumbnail: ${thumbnail}`);
                        
                        allStreams.push({
                            id: `news:${videoId}`,
                            name: snippet.title,
                            type: "tv",
                            url: `https://www.youtube.com/watch?v=${videoId}`,
                            title: snippet.title,
                            quality: "HD",
                            poster: thumbnail,
                            background: thumbnail,
                            behaviorHints: {
                                bingeGroup: "MalluFlixNews"
                            }
                        });
                    }
                }
            } catch (queryError) {
                console.error(`Error fetching for query "${query}":`, queryError.message);
            }
        }

        return allStreams;
    } catch (error) {
        console.error('Error fetching live streams:', error.message);
        return [];
    }
}

// Function to update news dataset
async function updateNewsDataset() {
    try {
        const liveStreams = await fetchLiveStreams();
        newsDataset = {};
        
        for (const stream of liveStreams) {
            newsDataset[stream.id] = stream;
        }
        
        // console.log(`Updated news dataset with ${Object.keys(newsDataset).length} live streams`);
    } catch (error) {
        console.error('Error updating news dataset:', error);
    }
}

// Initialize news dataset
updateNewsDataset();

// Update news dataset every 5 minutes to catch new live streams
setInterval(updateNewsDataset, 5 * 60 * 1000);

// Note: dataset is now simplified to only direct MP4 URL streams

const builder = new addonBuilder(manifest);

// Streams handler
builder.defineStreamHandler(function(args) {
    // Check for movie streams
    if (dataset[args.id]) {
        const stream = dataset[args.id];
        // Ensure quality is properly set for Stremio display
        const formattedStream = {
            ...stream,
            quality: "4K",
            behaviorHints: {
                ...stream.behaviorHints,
                bingeGroup: "MalluFlix"
            }
        };
        return Promise.resolve({ streams: [formattedStream] });
    }
    // Check for news streams
    else if (newsDataset[args.id]) {
        const stream = newsDataset[args.id];
        const formattedStream = {
            ...stream,
            quality: "HD",
            behaviorHints: {
                ...stream.behaviorHints,
                bingeGroup: "MalluFlixNews"
            }
        };
        return Promise.resolve({ streams: [formattedStream] });
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
    // console.log('Catalog request for type:', args.type);
    let metas = [];
    
    // Handle movie catalog
    if (args.type === 'movie') {
        metas = Object.entries(dataset)
            .filter(([_, value]) => value.type === args.type)
            .map(([key, value]) => generateMetaPreview(value, key));
        // console.log('Movie metas count:', metas.length);
    }
    // Handle news catalog
    else if (args.type === 'tv') {
        metas = Object.entries(newsDataset)
            .filter(([_, value]) => value.type === args.type)
            .map(([key, value]) => ({
                id: key,
                type: value.type,
                name: value.name || value.title || "Live News Stream",
                title: value.title || value.name || "Live News Stream",
                poster: value.poster || "https://via.placeholder.com/300x450/FF6B6B/FFFFFF?text=News",
                background: value.background || "https://via.placeholder.com/1920x1080/FF6B6B/FFFFFF?text=MalluFlix+News",
                description: `Live streaming from ${value.name || 'News Channel'}`,
                genres: ["News", "Live"],
                year: new Date().getFullYear()
            }));
        console.log('News metas count:', metas.length);
        console.log('Sample news meta:', metas[0]);
    }

    return Promise.resolve({ metas: metas })
})

module.exports = builder.getInterface()

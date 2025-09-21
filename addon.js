const { addonBuilder } = require("stremio-addon-sdk");
const streamsData = require("./streamsData");
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
            format: "mp4",
            container: "mp4",
            codec: "h264",
            behaviorHints: {
                bingeGroup: "MalluFlix"
            }
        }
    ])
);

// Dynamic news dataset - will be populated from YouTube HTML scraping
let newsDataset = {};

// Function to extract direct stream URL from YouTube video
async function extractYouTubeStream(videoId) {
    // Always return public YouTube URL
    return {
        directUrl: `https://www.youtube.com/watch?v=${videoId}`,
        fallbackUrl: `https://www.youtube.com/watch?v=${videoId}`,
        isEmbeddable: true // assume public videos are embeddable
    };
}

// Function to scrape YouTube live streams from HTML search results
async function scrapeYoutubeLive(query) {
    try {
        const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}&sp=EgJAAQ%253D%253D`;
        const res = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        // Extract initialData JSON
        const html = res.data;
        const jsonMatch = html.match(/var ytInitialData = (.*?);\s*<\/script>/);
        
        if (!jsonMatch) {
            //console.log('Could not find ytInitialData in HTML');
            return [];
        }

        const data = JSON.parse(jsonMatch[1]);
        const videos = [];

        // Traverse JSON for video IDs
        const contents = data.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents || [];
        
        contents.forEach(section => {
            const items = section.itemSectionRenderer?.contents || [];
            items.forEach(item => {
                const video = item.videoRenderer;
                if (video && video.videoId) {
                    const thumbnail = video.thumbnail?.thumbnails?.slice(-1)[0]?.url || 
                                   `https://img.youtube.com/vi/${video.videoId}/maxresdefault.jpg`;
                    
                    videos.push({
                        id: video.videoId,
                        title: video.title?.runs?.[0]?.text || 'Live Stream',
                        thumbnail: thumbnail,
                        url: `https://www.youtube.com/watch?v=${video.videoId}`
                    });
                }
            });
        });

        return videos;
    } catch (err) {
        //console.error(`Scrape error for "${query}":`, err.message);
        return [];
    }
}

// Function to fetch all live news streams using HTML scraping
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
                //console.log(`Scraping YouTube for: ${query}`);
                const videos = await scrapeYoutubeLive(query);
                
                for (const video of videos) {
                    // Skip if we already have this video
                    if (allStreams.some(stream => stream.id === `news:${video.id}`)) {
                        continue;
                    }
                    
                    // Extract YouTube stream for better web compatibility
                    const streamInfo = await extractYouTubeStream(video.id);
                    
                    //console.log(`Adding stream: ${video.title}`);
                    //console.log(`Thumbnail: ${video.thumbnail}`);
                    
                    allStreams.push({
                        id: `news:${video.id}`,
                        name: video.title,
                        type: "tv",
                        url: streamInfo.directUrl,
                        title: video.title,
                        quality: "HD",
                        format: "youtube",
                        container: "youtube",
                        codec: "h264",
                        poster: video.thumbnail,
                        background: video.thumbnail,
                        behaviorHints: {
                            bingeGroup: "MalluFlixNews"
                        }
                    });
                }
                
                // Add delay between requests to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 1000));
                
            } catch (queryError) {
                //console.error(`Error scraping for query "${query}":`, queryError.message);
            }
        }

        return allStreams;
    } catch (error) {
        //console.error('Error fetching live streams:', error.message);
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
        
        // //console.log(`Updated news dataset with ${Object.keys(newsDataset).length} live streams`);
    } catch (error) {
        //console.error('Error updating news dataset:', error);
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
    }
    // Check for news streams
    else if (newsDataset[args.id]) {
        const stream = newsDataset[args.id];
        //console.log('Found news stream:', stream.name);
        const formattedStream = {
            ...stream,
            quality: "HD",
            format: "youtube",
            container: "youtube",
            codec: "h264",
            behaviorHints: {
                ...stream.behaviorHints,
                bingeGroup: "MalluFlixNews"
            },
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Encoding': 'gzip, deflate, br',
                'Referer': 'https://www.youtube.com/'
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
    // Handle news catalog
    else if (args.type === 'tv') {
        metas = Object.entries(newsDataset)
            .filter(([_, value]) => value.type === args.type)
            .map(([key, value]) => {
                const videoId = key.replace('news:', '');
                const thumbnailUrl = value.poster || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
                
                return {
                    id: key,
                    type: value.type,
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
        //console.log('News metas count:', metas.length);
        //console.log('Sample news meta:', metas[0]);
    }

    return Promise.resolve({ metas: metas })
})

// Meta handler for detailed metadata (crucial for Continue Watching)
builder.defineMetaHandler(function(args) {
    //console.log('Meta request for:', args.id);
    //console.log('Available movie IDs:', Object.keys(dataset));
    //console.log('Available news IDs:', Object.keys(newsDataset));
    
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
    
    // Handle news metadata
    if (newsDataset[args.id]) {
        const stream = newsDataset[args.id];
        const videoId = args.id.replace('news:', '');
        const thumbnailUrl = stream.poster || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        
        const meta = {
            id: args.id,
            type: stream.type,
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
        
        //console.log('Returning news meta:', meta);
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
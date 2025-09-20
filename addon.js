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
            behaviorHints: {
                bingeGroup: "MalluFlix"
            }
        }
    ])
);

// Dynamic news dataset - will be populated from YouTube HTML scraping
let newsDataset = {};

// Function to get direct streaming URL from YouTube video ID
async function getYouTubeStreamUrl(videoId) {
    try {
        // Try to get stream info using youtube-dl-like approach
        const streamUrl = `https://www.youtube.com/watch?v=${videoId}`;
        
        // For now, return the YouTube URL but with proper stream format info
        // In a production environment, you'd want to use youtube-dl or similar
        // to extract actual HLS/DASH URLs
        return {
            url: streamUrl,
            format: 'youtube',
            quality: 'HD',
            container: 'mp4',
            codec: 'h264'
        };
    } catch (error) {
        console.error('Error getting YouTube stream URL:', error);
        return null;
    }
}

// Function to create alternative streaming URLs for better device compatibility
function createAlternativeStreams(videoId, title, thumbnail) {
    const streams = [];
    
    // YouTube URL (primary)
    streams.push({
        url: `https://www.youtube.com/watch?v=${videoId}`,
        quality: "HD",
        format: "youtube",
        container: "mp4",
        codec: "h264"
    });
    
    // YouTube embed URL (alternative)
    streams.push({
        url: `https://www.youtube.com/embed/${videoId}?autoplay=1`,
        quality: "HD",
        format: "youtube_embed",
        container: "mp4",
        codec: "h264"
    });
    
    // YouTube HLS URL (if available)
    streams.push({
        url: `https://manifest.googlevideo.com/api/manifest/hls_variant/expire/0/source/youtube/requiressl/yes/id/${videoId}/itag/0/playlist_type/DVR/ei/0/signature/0/ip/0.0.0.0/ipbits/0/expire/0/sparams/expire,id,itag,source,requiressl,ei,ip,ipbits,playlist_type/signature/0/lsparams/hls_chunk_host,mh,mm,mn,ms,mv,mvi,pl,initcwndbps/lsig/0/playlist.m3u8`,
        quality: "HD",
        format: "hls",
        container: "m3u8",
        codec: "h264"
    });
    
    return streams;
}

// Function to scrape YouTube live streams from HTML search results
async function scrapeYoutubeLive(query) {
    try {
        const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}&sp=EgJAAQ%253D%253D`;
        const res = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; StremioAddon/1.0; +https://stremio.com)',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Accept-Encoding': 'gzip, deflate',
                'DNT': '1',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1'
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
                    
                    //console.log(`Adding stream: ${video.title}`);
                    //console.log(`Thumbnail: ${video.thumbnail}`);
                    
                    // Create multiple stream options for better device compatibility
                    const alternativeStreams = createAlternativeStreams(video.id, video.title, video.thumbnail);
                    
                    alternativeStreams.forEach((streamInfo, index) => {
                        allStreams.push({
                            id: `news:${video.id}${index > 0 ? `_${index}` : ''}`,
                            name: video.title,
                            type: "tv",
                            url: streamInfo.url,
                            title: video.title,
                            quality: streamInfo.quality,
                            poster: video.thumbnail,
                            background: video.thumbnail,
                            format: streamInfo.format,
                            container: streamInfo.container,
                            codec: streamInfo.codec,
                            behaviorHints: {
                                bingeGroup: "MalluFlixNews",
                                notWebReady: streamInfo.format === 'hls' ? false : true,
                                externalPlayer: streamInfo.format === 'youtube' ? true : false
                            }
                        });
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
    // Check for news streams (including variants)
    else if (newsDataset[args.id] || args.id.startsWith('news:')) {
        const stream = newsDataset[args.id];
        if (stream) {
            //console.log('Found news stream:', stream.name);
            
            // Return the specific stream variant
            const formattedStream = {
                ...stream,
                quality: stream.quality || "HD",
                behaviorHints: {
                    ...stream.behaviorHints,
                    bingeGroup: "MalluFlixNews"
                }
            };
            return Promise.resolve({ streams: [formattedStream] });
        } else {
            //console.log('No stream found for:', args.id);
            return Promise.resolve({ streams: [] });
        }
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

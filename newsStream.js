// Hardcoded news streams data with multiple format options - TESTING VERSION
const newsStreams = {
    // Single news stream for testing - replace with your actual data
    "news:test1": {
        id: "news:test1",
        name: "Malayalam News Live",
        title: "Malayalam News Live",
        // Multiple format options - Stremio will try them in order until one works
        formats: [
            {
                url: "https://www.youtube.com/watch?v=tXRuaacO-ZU",
                quality: "HD",
                format: "youtube",
                container: "youtube",
                codec: "h264",
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'Referer': 'https://www.youtube.com/',
                    'Origin': 'https://www.youtube.com'
                }
            },
            {
                url: "https://example.com/stream-hls.m3u8",
                quality: "HD",
                format: "hls",
                container: "m3u8",
                codec: "h264",
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Accept': 'application/vnd.apple.mpegurl,application/x-mpegURL,*/*',
                    'Referer': 'https://www.youtube.com/'
                }
            },
            {
                url: "https://example.com/stream-mp4.mp4",
                quality: "HD",
                format: "mp4",
                container: "mp4",
                codec: "h264",
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Accept': 'video/mp4,video/*,*/*',
                    'Range': 'bytes=0-'
                }
            }
        ],
        poster: "https://img.youtube.com/vi/test1/maxresdefault.jpg", // Replace with your thumbnail
        background: "https://img.youtube.com/vi/test1/maxresdefault.jpg", // Replace with your background
        behaviorHints: {
            bingeGroup: "MalluFlixNews"
        }
    }
    
    // Add more streams as needed for production...
};

/**
 * Get news stream by video ID with multiple format options
 * @param {string} videoId - Video ID (e.g., "test1")
 * @returns {Array|null} Array of Stremio-compatible stream objects or null
 */
function getNewsStream(videoId) {
    if (!videoId) {
        console.error("❌ No video ID provided");
        return null;
    }

    const streamKey = `news:${videoId}`;
    const stream = newsStreams[streamKey];
    
    if (stream && stream.formats && stream.formats.length > 0) {
        console.log(`✅ Found ${stream.formats.length} format options for: ${videoId}`);
        
        // Create multiple stream objects for each format
        const streamObjects = stream.formats.map((format, index) => ({
            id: `${streamKey}_format_${index + 1}`,
            name: `${stream.name} (${format.format.toUpperCase()})`,
            title: `${stream.title} (${format.format.toUpperCase()})`,
            url: format.url,
            quality: format.quality,
            format: format.format,
            container: format.container,
            codec: format.codec,
            poster: stream.poster,
            background: stream.background,
            behaviorHints: {
                ...stream.behaviorHints,
                // Add format priority hint
                formatPriority: index + 1
            },
            headers: format.headers
        }));
        
        return streamObjects;
    } else {
        console.error(`❌ No hardcoded stream found for: ${videoId}`);
        return null;
    }
}

/**
 * Get all available news streams
 * @returns {Object} All news streams
 */
function getAllNewsStreams() {
    return newsStreams;
}

/**
 * Add a new news stream
 * @param {string} videoId - Video ID
 * @param {Object} streamData - Stream data object with formats array
 */
function addNewsStream(videoId, streamData) {
    const streamKey = `news:${videoId}`;
    newsStreams[streamKey] = {
        id: streamKey,
        ...streamData,
        behaviorHints: {
            bingeGroup: "MalluFlixNews",
            ...streamData.behaviorHints
        }
    };
    console.log(`✅ Added new stream for: ${videoId} with ${streamData.formats?.length || 0} formats`);
}

/**
 * Remove a news stream
 * @param {string} videoId - Video ID
 */
function removeNewsStream(videoId) {
    const streamKey = `news:${videoId}`;
    if (newsStreams[streamKey]) {
        delete newsStreams[streamKey];
        console.log(`🗑️ Removed stream for: ${videoId}`);
    } else {
        console.log(`❌ Stream not found for: ${videoId}`);
    }
}

/**
 * Add additional format options to an existing stream
 * @param {string} videoId - Video ID
 * @param {Array} newFormats - Array of new format objects to add
 */
function addFormatsToStream(videoId, newFormats) {
    const streamKey = `news:${videoId}`;
    if (newsStreams[streamKey]) {
        if (!newsStreams[streamKey].formats) {
            newsStreams[streamKey].formats = [];
        }
        newsStreams[streamKey].formats.push(...newFormats);
        console.log(`✅ Added ${newFormats.length} new formats to: ${videoId}`);
    } else {
        console.log(`❌ Stream not found for: ${videoId}`);
    }
}

/**
 * Get a simple stream object with just the first source (for backward compatibility)
 * @param {string} videoId - Video ID
 * @returns {Object|null} Single stream object or null
 */
function getNewsStreamSimple(videoId) {
    const streams = getNewsStream(videoId);
    return streams && streams.length > 0 ? streams[0] : null;
}

// Export functions
module.exports = {
    getNewsStream,
    getNewsStreamSimple,
    getAllNewsStreams,
    addNewsStream,
    removeNewsStream,
    addFormatsToStream
};
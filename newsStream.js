const youtubedl = require("youtube-dl-exec");

// In-memory cache for HLS links
const hlsCache = new Map();

// Cache configuration
const CACHE_DURATION = 3 * 60 * 1000; // 3 minutes in milliseconds
const MAX_CACHE_SIZE = 100; // Maximum number of cached entries

/**
 * Clean up expired cache entries
 */
function cleanExpiredCache() {
    const now = Date.now();
    for (const [videoId, cacheEntry] of hlsCache.entries()) {
        if (now - cacheEntry.timestamp > CACHE_DURATION) {
            hlsCache.delete(videoId);
        }
    }
    
    // If cache is still too large, remove oldest entries
    if (hlsCache.size > MAX_CACHE_SIZE) {
        const entries = Array.from(hlsCache.entries());
        entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
        
        const toRemove = entries.slice(0, hlsCache.size - MAX_CACHE_SIZE);
        toRemove.forEach(([videoId]) => hlsCache.delete(videoId));
    }
}

/**
 * Generate fresh HLS link using yt-dlp
 * @param {string} videoId - YouTube video ID
 * @returns {Promise<Object|null>} Stremio-compatible stream object or null
 */
async function generateFreshHLSLink(videoId) {
    try {
        const ytUrl = `https://www.youtube.com/watch?v=${videoId}`;
        
        console.log(`🔄 Generating fresh HLS link for video: ${videoId}`);
        
        const result = await youtubedl(ytUrl, {
            dumpSingleJson: true,
            noCheckCertificates: true,
            noWarnings: true,
            preferFreeFormats: true,
            skipDownload: true,
            format: "best[protocol*=m3u8]/best", // Prefer HLS, fallback to best
            youtubeSkipDashManifest: true,
            noPlaylist: true
        });

        // Find HLS formats
        const hlsFormats = result.formats?.filter(format => 
            format.protocol === "m3u8_native" || 
            (format.url && format.url.includes(".m3u8")) ||
            format.ext === "m3u8"
        ) || [];

        if (hlsFormats.length === 0) {
            console.error(`❌ No HLS formats found for video: ${videoId}`);
            return null;
        }

        // Select the best quality HLS format
        const bestHLS = hlsFormats.reduce((best, current) => {
            // Prioritize by height, then by bitrate
            const currentHeight = current.height || 0;
            const bestHeight = best.height || 0;
            
            if (currentHeight > bestHeight) return current;
            if (currentHeight === bestHeight) {
                return (current.abr || 0) > (best.abr || 0) ? current : best;
            }
            return best;
        });

        const hlsUrl = bestHLS.url;
        const quality = bestHLS.height ? `${bestHLS.height}p` : "HD";
        
        console.log(`✅ Generated HLS link for ${videoId}: ${quality} quality`);

        // Create Stremio-compatible stream object
        const streamObject = {
            url: hlsUrl,
            quality: quality,
            format: "hls",
            container: "m3u8",
            codec: "h264",
            behaviorHints: { 
                bingeGroup: "MalluFlixNews" 
            },
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/vnd.apple.mpegurl,application/x-mpegURL,application/octet-stream,*/*',
                'Accept-Encoding': 'gzip, deflate, br',
                'Referer': 'https://www.youtube.com/',
                'Origin': 'https://www.youtube.com'
            }
        };

        return streamObject;

    } catch (error) {
        console.error(`❌ Error generating HLS link for ${videoId}:`, error.message);
        return null;
    }
}

/**
 * Get news stream with caching
 * @param {string} videoId - YouTube video ID
 * @returns {Promise<Object|null>} Stremio-compatible stream object or null
 */
async function getNewsStream(videoId) {
    if (!videoId) {
        console.error("❌ No video ID provided");
        return null;
    }

    // Clean expired cache entries periodically
    if (Math.random() < 0.1) { // 10% chance to clean cache
        cleanExpiredCache();
    }

    const now = Date.now();
    const cacheKey = videoId;

    // Check if we have a valid cached entry
    if (hlsCache.has(cacheKey)) {
        const cacheEntry = hlsCache.get(cacheKey);
        const age = now - cacheEntry.timestamp;
        
        if (age < CACHE_DURATION) {
            console.log(`📦 Using cached HLS link for ${videoId} (age: ${Math.round(age / 1000)}s)`);
            return cacheEntry.streamObject;
        } else {
            console.log(`⏰ Cached HLS link for ${videoId} expired (age: ${Math.round(age / 1000)}s)`);
            hlsCache.delete(cacheKey);
        }
    }

    // Generate fresh HLS link
    const streamObject = await generateFreshHLSLink(videoId);
    
    if (streamObject) {
        // Cache the result
        hlsCache.set(cacheKey, {
            streamObject: streamObject,
            timestamp: now
        });
        
        console.log(`💾 Cached fresh HLS link for ${videoId}`);
        return streamObject;
    }

    return null;
}

/**
 * Clear cache for a specific video ID
 * @param {string} videoId - YouTube video ID
 */
function clearCacheForVideo(videoId) {
    if (hlsCache.has(videoId)) {
        hlsCache.delete(videoId);
        console.log(`🗑️ Cleared cache for video: ${videoId}`);
    }
}

/**
 * Clear all cached entries
 */
function clearAllCache() {
    hlsCache.clear();
    console.log("🗑️ Cleared all HLS cache");
}

/**
 * Get cache statistics
 * @returns {Object} Cache statistics
 */
function getCacheStats() {
    const now = Date.now();
    let validEntries = 0;
    let expiredEntries = 0;
    
    for (const [_, cacheEntry] of hlsCache.entries()) {
        if (now - cacheEntry.timestamp < CACHE_DURATION) {
            validEntries++;
        } else {
            expiredEntries++;
        }
    }
    
    return {
        totalEntries: hlsCache.size,
        validEntries,
        expiredEntries,
        cacheDuration: CACHE_DURATION,
        maxCacheSize: MAX_CACHE_SIZE
    };
}

// Export the main function and utility functions
module.exports = {
    getNewsStream,
    clearCacheForVideo,
    clearAllCache,
    getCacheStats,
    generateFreshHLSLink
};

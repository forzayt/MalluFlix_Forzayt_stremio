#!/usr/bin/env node

/**
 * Malayalam M3U8 Grabber - JavaScript Version
 * Fetches YouTube live streams and generates M3U8 playlist for Malayalam channels
 */

// Malayalam channel data embedded in the script
const malayalamChannels = [
   
    {
        name: "Manorama News",
        group: "News",
        logo: "https://i.imgur.com/DGmWjQb.png",
        tvgId: "",
        url: "https://www.youtube.com/c/manoramanews/live"
    }
];

// Fallback M3U8 URL
const FALLBACK_URL = 'https://live-iptv.github.io/youtube_live/assets/info.m3u8';

// Headers for requests
const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
};

/**
 * Fetch YouTube live stream and extract M3U8 URL
 * @param {string} url - YouTube URL
 * @returns {Promise<string>} - M3U8 URL or fallback URL
 */
async function fetchM3U8Url(url) {
    try {
        const response = await fetch(url, {
            headers: headers,
            timeout: 15000
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const html = await response.text();
        
        // Extract M3U8 URLs from the HTML
        const m3u8Regex = /https:\/\/[^"]+\.m3u8/g;
        const matches = html.match(m3u8Regex);
        
        if (matches && matches.length > 0) {
            return matches[0];
        }
        
        return FALLBACK_URL;
    } catch (error) {
        console.error(`Request error for ${url}: ${error.message}`);
        return FALLBACK_URL;
    }
}

/**
 * Generate M3U8 playlist for Malayalam channels
 */
async function generateMalayalamPlaylist() {
    console.log('#EXTM3U');
    
    for (const channel of malayalamChannels) {
        // Print channel info
        const groupTitle = channel.group.charAt(0).toUpperCase() + channel.group.slice(1);
        const logoAttr = channel.logo ? `tvg-logo="${channel.logo}"` : '';
        const tvgIdAttr = channel.tvgId ? `tvg-id="${channel.tvgId}"` : '';
        
        console.log(`\n#EXTINF:-1 group-title="${groupTitle}" ${logoAttr} ${tvgIdAttr}`, channel.name);
        
        // Fetch and print M3U8 URL
        const m3u8Url = await fetchM3U8Url(channel.url);
        console.log(m3u8Url);
    }
}

/**
 * Main function
 */
async function main() {
    try {
        await generateMalayalamPlaylist();
    } catch (error) {
        console.error('Error generating playlist:', error.message);
        process.exit(1);
    }
}

// Run the script if called directly
if (require.main === module) {
    main();
}

// Export for use in other modules
module.exports = {
    malayalamChannels,
    fetchM3U8Url,
    generateMalayalamPlaylist
};

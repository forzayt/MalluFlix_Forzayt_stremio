// Hardcoded news streams data with multiple format options - TESTING VERSION
const newsStreams = {
    "news:test1": {
        id: "news:test1",
        name: "Asianet News",
        title: "Asianet News Live",
        formats: [
            {
                url: "https://www.youtube.com/embed/tXRuaacO-ZU?autoplay=1",
                quality: "HD",
                format: "youtube",
                container: "youtube",
                codec: "h264",
                headers: {
                    'User-Agent': 'Mozilla/5.0',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Referer': 'https://www.youtube.com/',
                    'Origin': 'https://www.youtube.com'
                }
            }
        ],
        poster: "https://img.youtube.com/vi/tXRuaacO-ZU/maxresdefault.jpg",
        background: "https://img.youtube.com/vi/tXRuaacO-ZU/maxresdefault.jpg",
        behaviorHints: {
            bingeGroup: "MalluFlixNews"
        }
    }
};

// Rest of your code remains the same
function getNewsStream(videoId) {
    if (!videoId) return null;
    const streamKey = `news:${videoId}`;
    const stream = newsStreams[streamKey];

    if (stream && stream.formats && stream.formats.length > 0) {
        return stream.formats.map((format, index) => ({
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
            behaviorHints: { ...stream.behaviorHints, formatPriority: index + 1 },
            headers: format.headers
        }));
    } else {
        return null;
    }
}

function getNewsStreamSimple(videoId) {
    const streams = getNewsStream(videoId);
    return streams && streams.length > 0 ? streams[0] : null;
}

function getAllNewsStreams() {
    return newsStreams;
}

module.exports = {
    getNewsStream,
    getNewsStreamSimple,
    getAllNewsStreams
};

// Static news stream data for MalluFlix addon
// Contains HLS stream URLs for live news channels

const newsStreamData = {
    "news:asianet-news": {
        name: "Asianet News Live",
        type: "tv",
        url: "https://asianetnews.vgcdn.net/vglive-sk-917600/playlist.m3u8",
        title: "Asianet News Live",
        quality: "HD",
        format: "hls",
        container: "m3u8",
        codec: "h264",
        poster: "https://play-lh.googleusercontent.com/rMgagys9KOji0wHPQzdDeS2QFe5lbOPZ0q_PsMl98kGc2putJD5gFUO1Xz_vE9siqdo",
        background: "https://play-lh.googleusercontent.com/rMgagys9KOji0wHPQzdDeS2QFe5lbOPZ0q_PsMl98kGc2putJD5gFUO1Xz_vE9siqdo",
        behaviorHints: {
            bingeGroup: "MalluFlixNews"
        }
    }
};

module.exports = newsStreamData;

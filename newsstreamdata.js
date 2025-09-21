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
    },
    "news:mathrubhumi news": {
        name: "Mathrubhumi News Live",
        type: "tv",
        url: "https://mathrubhumicdn.vidgyor.com/mathrubhumi-origin/liveabr/mathrubhumi-origin/live_240p/playlist.m3u8",
        title: "Mathrubhumi News Live",
        quality: "HD",
        format: "hls",
        container: "m3u8",
        codec: "h264",
        poster: "https://yt3.googleusercontent.com/ytc/AIdro_n3GwS5AiD5wcCQcacdBVIqedZEtVm4H1EsLlxB0li41mA=s900-c-k-c0x00ffffff-no-rj",
        background: "https://yt3.googleusercontent.com/ytc/AIdro_n3GwS5AiD5wcCQcacdBVIqedZEtVm4H1EsLlxB0li41mA=s900-c-k-c0x00ffffff-no-rj",
        behaviorHints: {
            bingeGroup: "MalluFlixNews"
        }
    }
};

module.exports = newsStreamData;

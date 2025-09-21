// Static news stream data for MalluFlix addon
// Contains HLS stream URLs for live news channels

const newsStreamData = {





    "news:asianet hd": {
        name: "Asianet HD",
        type: "tv",
        url: "http://217.20.112.199/asianet/index.m3u8",
        title: "Asianet HD",
        quality: "HD",
        format: "hls",
        container: "m3u8",
        codec: "h264",
        poster: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ6KXoop7zjMdtc976686Xm2uGBT9AB_Wec3Q&s",
        background: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ6KXoop7zjMdtc976686Xm2uGBT9AB_Wec3Q&s",
        behaviorHints: {
            bingeGroup: "MalluFlixNews"
        }
    },










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
    },










    "news:24 News news": {
        name: "24 News News Live",
        type: "tv",
        url: "https://livestream24news.sunnxt.com/24news/TS-49410_5.m3u8",
        title: "24 News News Live",
        quality: "HD",
        format: "hls",
        container: "m3u8",
        codec: "h264",
        poster: "https://yt3.googleusercontent.com/-cXUtm6DRxOggCLXVRbsKbs8CVLYLR7Q1o4Qol35K644KIVJoMBrXw8clQncbGARwAyaCPVcFA=s900-c-k-c0x00ffffff-no-rj",
        background: "https://yt3.googleusercontent.com/-cXUtm6DRxOggCLXVRbsKbs8CVLYLR7Q1o4Qol35K644KIVJoMBrXw8clQncbGARwAyaCPVcFA=s900-c-k-c0x00ffffff-no-rj",
        behaviorHints: {
            bingeGroup: "MalluFlixNews"
        }
    },





};

module.exports = newsStreamData;

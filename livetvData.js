// Static Live TV Data for MalluFlix Addon
// This replaces the API fetching with static channel data

const liveTvChannels = [
    {
        id: "live-asianet-news",
        name: "Asianet News",
        title: "Asianet News",
        url: "https://asianetnews.vgcdn.net/vglive-sk-917600/playlist.m3u8",
        logo: "https://yt3.googleusercontent.com/8eItmjbOfJwot8wd0-19KgtvF2ztf4np2qIVfJ1kMPv1ADi6wx9giU62B1j6xO0Ug2Idrqbncg=s900-c-k-c0x00ffffff-no-rj",
        group: "News",
        category: "News"
    },



    
    {
        id: "asianet",
        name: "Asianet",
        title: "Asianet",
        url: "http://217.20.112.199/asianet/index.m3u8",
        logo: "https://yt3.googleusercontent.com/rD84Z2RyqjpzQ7xYvOl4Rcn_MnAny8VvcF5a0Iz76A0EnYTRHVYU-SLIIxR_a9dv_95QNCl76WY=s900-c-k-c0x00ffffff-no-rj",
        group: "News",
        category: "News"
    },




    {
        id: "surya",
        name: "Surya TV",
        title: "Surya TV",
        url: "https://livestream10.sunnxt.com/DolbyVision/SuryaTV_HDR/SuryaTV_HDR_Endpoints/SuryaTV-HDR10-IN-index.m3u8",
        logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSvnBdNqlDa6Y9iVaEgsuETggn113rLeClOSQ&s",
        group: "News",
        category: "News"
    },
];

module.exports = liveTvChannels;
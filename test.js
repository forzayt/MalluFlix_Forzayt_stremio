const axios = require("axios");

async function getManoramaStream() {
    try {
        // Example: YuppTV API endpoint (may need to be updated)
        const apiUrl = "https://www.yupptv.com/live/getStreamURL?channel=manorama-news";

        // Include browser-like headers
        const response = await axios.get(apiUrl, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
                "Referer": "https://www.yupptv.com/live/manorama-news",
            },
            maxRedirects: 5 // follow redirects to get the final HLS URL
        });

        const streamUrl = response.data.streamUrl || response.request.res.responseUrl;

        console.log("Dynamic HLS URL:", streamUrl);
        return streamUrl;

    } catch (err) {
        console.error("Error fetching Manorama stream:", err.message);
    }
}

getManoramaStream();

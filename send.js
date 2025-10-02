const axios = require('axios');

// ================================
// Discord Webhook & API Settings
// ================================
const WEBHOOK_URL = 'https://discord.com/api/webhooks/1423290113198129256/Oj8ggV3HFNtkI6uxtf6ZXOoUWgWn2APZvRmG-ix1uUeUuFBTT2emMSln9U8Mp_3KjN34';
const METAHUB_URL = "https://images.metahub.space";

// ================================
// Movie Configuration
// ================================
const IMDB_ID = "tt22001978";  // Your movie's IMDB ID
const STREAM_URL = "https://rumble.com/hls-vod/6xkitq/playlist.m3u8";  // Stream URL

// ================================
// Fetch Movie Details from OMDB
// ================================
async function getMovieDetails(imdbId) {
    try {
        const response = await axios.get(`http://www.omdbapi.com/?i=${imdbId}&apikey=trilogy`);

        if (response.data?.Response === "True") {
            const data = response.data;
            return {
                title: data.Title || 'Unknown Title',
                year: data.Year || 'Unknown',
                genre: data.Genre || 'Unknown',
                director: data.Director || 'Unknown',
                actors: data.Actors || 'Unknown',
                plot: data.Plot || 'No plot available',
                rating: data.imdbRating || 'N/A',
                runtime: data.Runtime || 'Unknown'
            };
        }
    } catch (error) {
        console.warn(`⚠️ Could not fetch details for ${imdbId}, using default values.`);
    }

    // Default fallback
    return {
        title: 'Movie Title',
        year: 'Unknown',
        genre: 'Unknown',
        director: 'Unknown',
        actors: 'Unknown',
        plot: 'Movie details not available',
        rating: 'N/A',
        runtime: 'Unknown'
    };
}

// ================================
// Send Discord Webhook
// ================================
async function sendDiscordWebhook(imdbId, streamUrl) {
    try {
        console.log(`🔄 Posting ${imdbId} to Discord...`);

        const posterUrl = `${METAHUB_URL}/poster/large/${imdbId}/img`;
        const movie = await getMovieDetails(imdbId);

        const embed = {
            title: `🎬 ${movie.title} (${movie.year})`,
            description: movie.plot,
            color: 0x00FF00,
            image: { url: posterUrl },
            fields: [
                { name: "🎯 IMDB ID", value: `[${imdbId}](https://www.imdb.com/title/${imdbId}/)`, inline: true },
                { name: "⭐ Rating", value: movie.rating, inline: true },
                { name: "⏱️ Runtime", value: movie.runtime, inline: true },
                { name: "🎭 Genre", value: movie.genre, inline: true },
                { name: "🎬 Director", value: movie.director, inline: true },
                { name: "📅 Year", value: movie.year, inline: true },
                { name: "👥 Cast", value: movie.actors, inline: false },
                { name: "🔗 Stream Link (Download and Open with VLC <3)", value: `[Download Now](${streamUrl})`, inline: false }
            ],
            timestamp: new Date().toISOString(),
            footer: {
                text: "MalluFlix • Stream Server",
                icon_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSBciJKrh7BJiY6U1UKbCedjqBdd9_AQai7-Q&s"
            }
        };

        const payload = {
            content: `@here @everyone **${movie.title}** added to MalluFlix! 🍿`,
            embeds: [embed]
        };

        await axios.post(WEBHOOK_URL, payload);

        console.log(`✅ Discord webhook sent successfully!`);
        console.log(`📽️ Movie: ${movie.title} (${movie.year})`);
        console.log(`🎯 IMDB: ${imdbId}`);
        console.log(`🔗 Stream: ${streamUrl}`);
    } catch (error) {
        console.error(`❌ Discord webhook error:`, error.message);
    }
}

// ================================
// Main Function
// ================================
async function postMovie() {
    console.log('🎬 MalluFlix Discord Webhook');
    console.log('============================');
    console.log(`📋 IMDB ID: ${IMDB_ID}`);
    console.log(`🔗 Stream URL: ${STREAM_URL}`);
    console.log('============================');

    if (!IMDB_ID || !STREAM_URL) {
        console.error('❌ Please set IMDB_ID and STREAM_URL at the top of this file!');
        return;
    }

    await sendDiscordWebhook(IMDB_ID, STREAM_URL);

    console.log('============================');
    console.log('🎉 Done! Check your Discord channel!');
}

// ================================
// Run script if executed directly
// ================================
if (require.main === module) {
    postMovie();
}

module.exports = { sendDiscordWebhook, postMovie };

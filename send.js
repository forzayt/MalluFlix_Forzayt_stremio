const axios = require('axios');

// Discord webhook configuration
const WEBHOOK_URL = 'https://discord.com/api/webhooks/1423290113198129256/Oj8ggV3HFNtkI6uxtf6ZXOoUWgWn2APZvRmG-ix1uUeUuFBTT2emMSln9U8Mp_3KjN34';
const METAHUB_URL = "https://images.metahub.space";

// ============================================
// EDIT THESE VALUES MANUALLY WHEN YOU WANT TO POST
// ============================================
const IMDB_ID = "tt30818546";  // Change this to your movie's IMDB ID
const STREAM_URL = "https://rumble.com/hls-vod/6xffke/playlist.m3u8";  // Change this to your stream URL
// ============================================

/**
 * Get movie details from OMDB API using IMDB ID
 */
async function getMovieDetails(imdbId) {
    try {
        const response = await axios.get(`http://www.omdbapi.com/?i=${imdbId}&apikey=trilogy`);
        
        if (response.data && response.data.Response === "True") {
            return {
                title: response.data.Title || 'Unknown Title',
                year: response.data.Year || 'Unknown',
                genre: response.data.Genre || 'Unknown',
                director: response.data.Director || 'Unknown',
                actors: response.data.Actors || 'Unknown',
                plot: response.data.Plot || 'No plot available',
                rating: response.data.imdbRating || 'N/A',
                runtime: response.data.Runtime || 'Unknown'
            };
        }
    } catch (error) {
        console.log(`⚠️ Could not fetch details for ${imdbId}, using defaults`);
    }
    
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

/**
 * Send Discord webhook for a movie
 */
async function sendDiscordWebhook(imdbId, streamUrl) {
    try {
        console.log(`🔄 Posting ${imdbId} to Discord...`);
        
        const posterUrl = `${METAHUB_URL}/poster/large/${imdbId}/img`;
        const movieDetails = await getMovieDetails(imdbId);
        
        const embed = {
            title: `🎬 ${movieDetails.title} (${movieDetails.year})`,
            description: movieDetails.plot,
            color: 0x00FF00,
            image: {
                url: posterUrl
            },
            fields: [
                {
                    name: "🎯 IMDB ID",
                    value: `[${imdbId}](https://www.imdb.com/title/${imdbId}/)`,
                    inline: true
                },
                {
                    name: "⭐ Rating",
                    value: movieDetails.rating,
                    inline: true
                },
                {
                    name: "⏱️ Runtime",
                    value: movieDetails.runtime,
                    inline: true
                },
                {
                    name: "🎭 Genre",
                    value: movieDetails.genre,
                    inline: true
                },
                {
                    name: "🎬 Director",
                    value: movieDetails.director,
                    inline: true
                },
                {
                    name: "📅 Year",
                    value: movieDetails.year,
                    inline: true
                },
                {
                    name: "👥 Cast",
                    value: movieDetails.actors,
                    inline: false
                },
                {
                    name: "🔗 Stream Link (Download and Open with VLC <3)",
                    value: `[Download Now](${streamUrl})`,
                    inline: false
                }
            ],
            timestamp: new Date().toISOString(),
            footer: {
                text: "MalluFlix • Stream Server",
                icon_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSBciJKrh7BJiY6U1UKbCedjqBdd9_AQai7-Q&s"
            }
        };

        const payload = {
            content: `@here **${movieDetails.title}** added to MalluFlix! 🍿`,
            embeds: [embed]
        };

        await axios.post(WEBHOOK_URL, payload);
        console.log(`✅ Discord webhook sent successfully!`);
        console.log(`📽️ Movie: ${movieDetails.title} (${movieDetails.year})`);
        console.log(`🎯 IMDB: ${imdbId}`);
        console.log(`🔗 Stream: ${streamUrl}`);

    } catch (error) {
        console.error(`❌ Discord webhook error:`, error.message);
    }
}

/**
 * Main function to post the movie configured at the top
 */
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

// Run if this file is executed directly
if (require.main === module) {
    postMovie();
}

module.exports = { sendDiscordWebhook, postMovie };

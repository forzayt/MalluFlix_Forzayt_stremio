const axios = require('axios');

// Discord webhook configuration
const WEBHOOK_URL = 'https://discord.com/api/webhooks/1423290113198129256/Oj8ggV3HFNtkI6uxtf6ZXOoUWgWn2APZvRmG-ix1uUeUuFBTT2emMSln9U8Mp_3KjN34';
const METAHUB_URL = "https://images.metahub.space";

/**
 * Get movie details from OMDB API using IMDB ID
 */
async function getMovieDetails(imdbId) {
    try {
        // Using free OMDB API - you can get API key from http://www.omdbapi.com/apikey.aspx
        // For now using a demo key, replace with your own for production
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
    
    // Fallback details
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
 * Send Discord webhook for a single movie
 */
async function sendDiscordWebhook(imdbId, streamUrl) {
    try {
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
        console.log(`✅ Discord webhook sent for ${imdbId} - ${movieDetails.title}`);

    } catch (error) {
        console.error(`❌ Discord webhook error:`, error.message);
    }
}

/**
 * Check and sync only the first/latest stream from streamsData.js on startup
 */
async function syncAllStreams() {
    try {
        console.log('🔄 Checking for latest movie to sync...');
        
        const streamsData = require('./streamsData');
        const streamEntries = Object.entries(streamsData);
        
        if (streamEntries.length === 0) {
            console.log('📭 No streams found to sync');
            return;
        }

        // Get only the first movie from the array
        const [firstImdbId, firstStreamUrl] = streamEntries[0];
        
        console.log(`📊 Found ${streamEntries.length} total streams, syncing latest: ${firstImdbId}`);
        
        // Send only the first/latest movie to Discord
        await sendDiscordWebhook(firstImdbId, firstStreamUrl);
        
        console.log('✅ Latest movie synced to Discord!');
        
    } catch (error) {
        console.error('❌ Error syncing streams:', error.message);
    }
}

module.exports = { sendDiscordWebhook, syncAllStreams };

const { addonBuilder } = require("stremio-addon-sdk");
const axios = require("axios");

const manifest = {
    id: "org.mallu.flix.forza",
    version: "2.0.0",
    name: "MalluFlix",
    description: "The one and only addon for Malayalam movie catalogs",
    logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSBciJKrh7BJiY6U1UKbCedjqBdd9_AQai7-Q&s",
    resources: ["catalog", "stream", "meta"],
    types: ["movie"],
    catalogs: [
        {
            type: "movie",
            id: "malluflix_catalog",
            name: "MalluFlix Movies",
            extra: [{ name: "search", isRequired: false }]
        }
    ],
    idPrefixes: ["tmdb"]
};

const builder = new addonBuilder(manifest);

// TODO: GET YOUR FREE API KEY FROM https://www.themoviedb.org/settings/api AND PASTE IT BELOW
const TMDB_API_KEY = "b8e31efed6de570178942a39601e84b0";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

builder.defineCatalogHandler(async ({ type, id, extra }) => {
    console.log("Requesting catalog:", type, id);

    if (type === "movie" && id === "malluflix_catalog") {
        try {
            if (TMDB_API_KEY === "YOUR_TMDB_API_KEY_HERE") {
                console.warn("Please set your TMDB_API_KEY in addon.js");
                // Fallback to empty only after warning
            }

            const today = new Date().toISOString().split('T')[0];

            // Fetch Malayalam movies released up to today
            const response = await axios.get(`${TMDB_BASE_URL}/discover/movie`, {
                params: {
                    api_key: TMDB_API_KEY,
                    with_original_language: "ml", // Malayalam
                    "primary_release_date.lte": today,
                    sort_by: "primary_release_date.desc",
                    page: 1
                }
            });

            const movies = response.data.results || [];

            // Format for Stremio
            const metas = movies.map(movie => ({
                id: `tmdb:${movie.id}`,
                type: "movie",
                name: movie.title,
                poster: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
                background: movie.backdrop_path ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}` : null,
                description: movie.overview,
                releaseInfo: movie.release_date ? movie.release_date.split('-')[0] : "",
                imdbRating: movie.vote_average ? movie.vote_average.toFixed(1) : null
            }));

            return { metas };

        } catch (error) {
            console.error("Error fetching catalog:", error.message);
            return { metas: [] };
        }
    }

    return { metas: [] };
});

builder.defineStreamHandler(async ({ type, id }) => {
    // Add stream logic here
    return { streams: [] };
});

builder.defineMetaHandler(async ({ type, id }) => {
    if (type === 'movie' && id.startsWith('tmdb:')) {
        try {
            const tmdbId = id.split(':')[1];
            const response = await axios.get(`${TMDB_BASE_URL}/movie/${tmdbId}`, {
                params: { api_key: TMDB_API_KEY }
            });
            const movie = response.data;

            return {
                meta: {
                    id: id,
                    type: "movie",
                    name: movie.title,
                    poster: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
                    background: movie.backdrop_path ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}` : null,
                    description: movie.overview,
                    releaseInfo: movie.release_date ? movie.release_date.split('-')[0] : "",
                    imdbRating: movie.vote_average ? movie.vote_average.toFixed(1) : null,
                    runtime: movie.runtime ? `${movie.runtime} min` : null,
                    genres: movie.genres ? movie.genres.map(g => g.name) : []
                }
            };
        } catch (error) {
            console.error("Error fetching meta:", error.message);
            return { meta: { id, type, name: "Error loading metadata" } };
        }
    }
    return { meta: { id, type, name: "Unknown Movie" } };
});

module.exports = builder.getInterface();

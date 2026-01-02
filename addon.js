const { addonBuilder } = require("stremio-addon-sdk");
const axios = require("axios");

const TMDB_KEY = "b8e31efed6de570178942a39601e84b0";

const manifest = {
    id: "org.mallu.flix.forza",
    version: "3.0.0",
    name: "MalluFlix",
    description: "Malayalam movie catalog using TMDB discovery + Cinemeta compatibility",
    logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSBciJKrh7BJiY6U1UKbCedjqBdd9_AQai7-Q&s",
    resources: ["catalog", "meta"],
    types: ["movie"],
    catalogs: [
        {
            type: "movie",
            id: "malluflix_catalog",
            name: "MalluFlix Malayalam",
            extra: [{ name: "search" }, { name: "skip" }]
        }
    ],
    idPrefixes: ["tt"]
};

const builder = new addonBuilder(manifest);

/* Convert TMDB → IMDb ID */
async function tmdbToImdb(tmdbId) {
    try {
        const res = await axios.get(
            `https://api.themoviedb.org/3/movie/${tmdbId}/external_ids`,
            { params: { api_key: TMDB_KEY } }
        );
        return res.data.imdb_id;
    } catch {
        return null;
    }
}

/* Malayalam Catalog */
builder.defineCatalogHandler(async ({ type, id, extra }) => {
    if (type !== "movie" || id !== "malluflix_catalog") return { metas: [] };

    const skip = extra?.skip ? parseInt(extra.skip) : 0;
    const page = Math.floor(skip / 20) + 1;
    const today = new Date().toISOString().split('T')[0];

    // Fetch 2 pages concurrently to populate list faster and handle filtering gaps
    const promises = [page, page + 1].map(p =>
        axios.get("https://api.themoviedb.org/3/discover/movie", {
            params: {
                api_key: TMDB_KEY,
                with_original_language: "ml",
                "primary_release_date.lte": today,
                sort_by: "primary_release_date.desc",
                page: p
            }
        })
    );

    const responses = await Promise.all(promises);
    const results = responses.flatMap(r => r.data.results || []);

    // Process all items in parallel
    const metaPromises = results.map(async (m) => {
        const imdb = await tmdbToImdb(m.id);
        if (!imdb) return null;

        return {
            id: imdb,
            type: "movie",
            name: m.title,
            poster: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : null,
            description: m.overview
        };
    });

    const validMetas = (await Promise.all(metaPromises)).filter(m => m !== null);

    return { metas: validMetas };
});

/* Cinemeta Metadata */
builder.defineMetaHandler(async ({ type, id }) => {
    if (type !== "movie") return { meta: null };

    const res = await axios.get(
        `https://v3-cinemeta.strem.io/meta/movie/${id}.json`
    );
    return res.data;
});

module.exports = builder.getInterface();

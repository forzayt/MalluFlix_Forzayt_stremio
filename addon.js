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

  const tmdb = await axios.get(
    "https://api.themoviedb.org/3/discover/movie",
    {
      params: {
        api_key: TMDB_KEY,
        with_original_language: "ml",
        page
      }
    }
  );

  const metas = [];

  for (const m of tmdb.data.results) {
    const imdb = await tmdbToImdb(m.id);
    if (!imdb) continue;

    metas.push({
      id: imdb,
      type: "movie",
      name: m.title,
      poster: `https://image.tmdb.org/t/p/w500${m.poster_path}`
    });
  }

  return { metas };
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

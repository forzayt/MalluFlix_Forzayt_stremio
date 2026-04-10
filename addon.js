const { addonBuilder } = require("stremio-addon-sdk");
const axios = require("axios");

const TMDB_KEY = "b8e31efed6de570178942a39601e84b0";
const REQUEST_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36"
};

const manifest = {
    id: "org.mallu.flix.forza",
    version: "3.0.0",
    name: "MalluFlix",
    description: "Malayalam movie catalog using TMDB discovery + Cinemeta compatibility",
    logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSBciJKrh7BJiY6U1UKbCedjqBdd9_AQai7-Q&s",
    resources: ["catalog", "meta", "stream"],
    types: ["movie", "series"],
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

async function fetchText(url, referer = "") {
    const headers = { ...REQUEST_HEADERS };
    if (referer) headers.Referer = referer;
    const res = await axios.get(url, {
        headers,
        timeout: 20000,
        responseType: "text"
    });
    return typeof res.data === "string" ? res.data : String(res.data);
}

function decodeAsciiPlaylist(text) {
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) return text;
    const numeric = lines.filter(l => /^\d{1,3}$/.test(l));
    if (numeric.length < Math.max(20, Math.floor(lines.length * 0.7))) return text;
    return numeric.map(n => String.fromCharCode(parseInt(n, 10))).join("");
}

function toAbsolute(url, baseUrl) {
    try {
        return new URL(url, baseUrl).href;
    } catch {
        return "";
    }
}

function normalizeCandidateUrl(url, fallbackHost = "cloudnestra.com") {
    let normalized = url.trim();
    if (!normalized) return "";
    normalized = normalized.replace(/\{v\d+\}/g, fallbackHost);
    try {
        return new URL(normalized).href;
    } catch {
        return "";
    }
}

function getFallbackHost(prorcpHtml) {
    const passPathMatch = prorcpHtml.match(/pass_path\s*=\s*["']([^"']+)["']/i);
    if (!passPathMatch) return "cloudnestra.com";
    let host = passPathMatch[1].trim();
    if (host.startsWith("//")) host = `https:${host}`;
    try {
        const parsedHost = new URL(host).hostname;
        const parts = parsedHost.split(".");
        if (parts.length >= 3) return parts.slice(1).join(".");
        return parsedHost;
    } catch {
        return "cloudnestra.com";
    }
}

function parseSeriesId(id) {
    const parts = id.split(":");
    if (parts.length >= 3) {
        return { imdbId: parts[0], season: parseInt(parts[1], 10), episode: parseInt(parts[2], 10) };
    }
    const match = id.match(/^(tt\d+)/);
    if (!match) return null;
    return { imdbId: match[1], season: 1, episode: 1 };
}

function buildEmbedUrl(type, id) {
    if (type === "movie") {
        return `https://vsembed.ru/embed/movie/${id}`;
    }
    if (type === "series") {
        const parsed = parseSeriesId(id);
        if (!parsed || !parsed.imdbId || Number.isNaN(parsed.season) || Number.isNaN(parsed.episode)) return "";
        return `https://vsembed.ru/embed/tv/${parsed.imdbId}/${parsed.season}-${parsed.episode}`;
    }
    return "";
}

async function extractStreamCandidates(embedUrl) {
    const embedHtml = await fetchText(embedUrl);
    const iframeMatch = embedHtml.match(/<iframe[^>]*id=["']player_iframe["'][^>]*src=["']([^"']+)["']/i);
    if (!iframeMatch) return [];
    const iframeUrl = toAbsolute(iframeMatch[1], embedUrl);
    if (!iframeUrl) return [];

    const iframeHtml = await fetchText(iframeUrl, embedUrl);
    const prorcpMatch =
        iframeHtml.match(/src:\s*['"]([^'"]*\/prorcp\/[^'"]+)['"]/i) ||
        iframeHtml.match(/src=["']([^"']*\/prorcp\/[^"']+)["']/i);
    if (!prorcpMatch) return [];

    const prorcpUrl = toAbsolute(prorcpMatch[1], iframeUrl);
    if (!prorcpUrl) return [];
    const prorcpHtml = await fetchText(prorcpUrl, iframeUrl);

    const fallbackHost = getFallbackHost(prorcpHtml);
    const rawUrls = Array.from(
        prorcpHtml.matchAll(/https?:\/\/[^"'\s>]+\.(?:m3u8|mpd|mp4)[^"'\s<]*/gi),
        m => m[0]
    );

    const urls = [...new Set(rawUrls.map(url => normalizeCandidateUrl(url, fallbackHost)).filter(Boolean))];
    return urls.filter(url => /^https?:\/\/.+\.m3u8(\?.*)?$/i.test(url));
}

async function getBestQualityStream(masterUrl) {
    const textRaw = await fetchText(masterUrl, "https://cloudnestra.com/");
    const text = decodeAsciiPlaylist(textRaw);
    const lines = text.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
    const variants = [];

    for (let i = 0; i < lines.length - 1; i++) {
        if (!lines[i].startsWith("#EXT-X-STREAM-INF")) continue;
        const info = lines[i];
        const nextLine = lines[i + 1];
        if (!nextLine || nextLine.startsWith("#")) continue;
        const bandwidth = parseInt((info.match(/BANDWIDTH=(\d+)/i) || [])[1] || "0", 10);
        const resolution = (info.match(/RESOLUTION=(\d+)x(\d+)/i) || []);
        const width = parseInt(resolution[1] || "0", 10);
        const height = parseInt(resolution[2] || "0", 10);
        const score = width * height || bandwidth;
        variants.push({
            url: toAbsolute(nextLine, masterUrl),
            bandwidth,
            width,
            height,
            score
        });
    }

    if (variants.length === 0) {
        return { masterUrl, bestUrl: "", bestLabel: "" };
    }

    variants.sort((a, b) => b.score - a.score || b.bandwidth - a.bandwidth);
    const best = variants[0];
    const bestLabel = best.height ? `${best.height}p` : best.bandwidth ? `${Math.round(best.bandwidth / 1000)}kbps` : "Best";
    return { masterUrl, bestUrl: best.url, bestLabel };
}

/* Malayalam Catalog */
builder.defineCatalogHandler(async ({ type, id, extra }) => {
    if (type !== "movie" || id !== "malluflix_catalog") return { metas: [] };

    const skip = extra?.skip ? parseInt(extra.skip) : 0;
    const page = Math.round(skip / 20) + 1;
    const today = new Date().toISOString().split('T')[0];

    // Fetch 3 pages to ensure sufficient content
    const promises = [page, page + 1, page + 2].map(p =>
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

    // Process items in chunks to avoid hitting API rate limits (429)
    const batchSize = 5;
    const validMetas = [];

    for (let i = 0; i < results.length; i += batchSize) {
        const chunk = results.slice(i, i + batchSize);
        const chunkPromises = chunk.map(async (m) => {
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

        const chunkResults = await Promise.all(chunkPromises);
        validMetas.push(...chunkResults.filter(m => m !== null));
    }

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

builder.defineStreamHandler(async ({ type, id }) => {
    if (type !== "movie" && type !== "series") return { streams: [] };
    const embedUrl = buildEmbedUrl(type, id);
    if (!embedUrl) return { streams: [] };

    try {
        const candidates = await extractStreamCandidates(embedUrl);
        if (candidates.length === 0) return { streams: [] };

        const streams = [];
        const primary = await getBestQualityStream(candidates[0]);
        streams.push({
            title: "MalluFlix Auto",
            name: "MalluFlix",
            url: primary.masterUrl,
            behaviorHints: {
                notWebReady: false,
                proxyHeaders: {
                    request: {
                        ...REQUEST_HEADERS,
                        Referer: "https://cloudnestra.com/",
                        Origin: "https://cloudnestra.com"
                    }
                }
            }
        });

        if (primary.bestUrl) {
            streams.push({
                title: `MalluFlix Max ${primary.bestLabel}`.trim(),
                name: "MalluFlix",
                url: primary.bestUrl,
                behaviorHints: {
                    notWebReady: false,
                    proxyHeaders: {
                        request: {
                            ...REQUEST_HEADERS,
                            Referer: "https://cloudnestra.com/",
                            Origin: "https://cloudnestra.com"
                        }
                    }
                }
            });
        }

        for (const url of candidates.slice(1, 4)) {
            streams.push({
                title: "MalluFlix Backup",
                name: "MalluFlix",
                url,
                behaviorHints: {
                    notWebReady: false,
                    proxyHeaders: {
                        request: {
                            ...REQUEST_HEADERS,
                            Referer: "https://cloudnestra.com/",
                            Origin: "https://cloudnestra.com"
                        }
                    }
                }
            });
        }

        return { streams };
    } catch {
        return { streams: [] };
    }
});

module.exports = builder.getInterface();

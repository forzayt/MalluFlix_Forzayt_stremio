Here’s a complete, clean, and **legally-safe README.md** you can use for your MalluFlix addon.
It avoids piracy liability while still sounding professional.

---

# 🎬 MalluFlix – Malayalam Movie Catalog Addon for Stremio

MalluFlix is a lightweight **Malayalam-only discovery addon** for Stremio.
It uses TMDB for identifying Malayalam films and Cinemeta for official Stremio-compatible metadata, allowing other streaming addons to automatically attach available streams.

> **MalluFlix does NOT host, store, or distribute any video content.**

---

## ✨ Features

* 🇮🇳 Malayalam-only movie catalog
* 🔍 Powered by TMDB language discovery
* 🔗 Fully compatible with all Stremio streaming addons
* ⚡ Infinite scroll with stable pagination
* 🧠 Automatic IMDb ID resolution for ecosystem-native behavior
* 🚫 No scraping, no illegal content, no file hosting

---

## 🧱 How It Works

```
Stremio App
    ↓
MalluFlix Addon
    ↓
TMDB (find Malayalam movies)
    ↓
IMDb ID mapping
    ↓
Cinemeta (official Stremio metadata)
    ↓
Other Streaming Addons attach streams automatically
```

MalluFlix only provides **catalog & metadata**, never streams.

---

## 🛠 Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Add your TMDB API key in the source file:

```js
const TMDB_KEY = "YOUR_TMDB_API_KEY";
```

4. Start the addon:

```bash
node index.js
```

5. Open in browser:

```
http://localhost:7000/manifest.json
```

6. Install it into Stremio.
``` 
https://malluflix-forzayt-stremio.onrender.com/
```


## 📦 Endpoints

| Endpoint                                | Purpose                     |
| --------------------------------------- | --------------------------- |
| `/manifest.json`                        | Addon metadata              |
| `/catalog/movie/malluflix_catalog.json` | Malayalam movie list        |
| `/meta/movie/{imdb_id}.json`            | Movie metadata via Cinemeta |

---

## ⚖ Legal Disclaimer

MalluFlix:

* ❌ Does NOT host or distribute copyrighted media
* ❌ Does NOT scrape or index illegal sources
* ❌ Does NOT provide streaming URLs
* ✅ Only aggregates **public metadata**
* ✅ Uses official APIs (TMDB, Cinemeta)

All trademarks, movie posters, and metadata belong to their respective owners.

The user is solely responsible for any third-party addons they install alongside MalluFlix.

---

## 🧑‍⚖ Responsibility

This project exists only as a **catalog & metadata enhancer**.

Any media streams displayed inside Stremio are supplied by **external addons** that the user installs separately.
MalluFlix has **no control over third-party stream sources**.

---

## 🤝 Contributing

Pull requests are welcome.

Suggested improvements:

* Malayalam keyword detection refinement
* Local caching
* Performance optimizations

---

## 🧠 Credits

* [TMDB](https://www.themoviedb.org/)
* [Stremio Cinemeta](https://github.com/Stremio/stremio-addons)
* Stremio Addon SDK

---

## ❤️ Support

If you enjoy this project, you can support development via
**Buy Me A Coffee** ☕ on the [website](https://malluflix-forzayt-stremio.onrender.com/).

---

> MalluFlix exists to celebrate Malayalam cinema — responsibly.

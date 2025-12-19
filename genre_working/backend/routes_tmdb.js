const express = require("express");
const axios = require("axios");

const router = express.Router();

const TMDB_BASE = "https://api.themoviedb.org/3";

// helper for tmdb requests
async function tmdbGet(url, apiKey, params = {}) {
  return axios.get(`${TMDB_BASE}${url}`, {
    params: {
      api_key: apiKey,
      ...params
    }
  });
}

// ---------------- TMDB KEY ----------------
router.post("/tmdb/key", (req, res) => {
  const { apiKey } = req.body;

  if (!apiKey) {
    return res.status(400).json({ error: "API key required" });
  }

  const trimmedKey = apiKey.trim();

  // Print the key in the terminal
  console.log("TMDB API Key received:", trimmedKey);

  res.cookie("tmdbKey", trimmedKey, {
    httpOnly: true,
    sameSite: "Lax",
    secure: false
  });

  return res.json({ message: "TMDB key saved" });
});

// --------------- MIDDLEWARE ----------------
async function requireTMDBKey(req, res, next) {
  const key = req.cookies.tmdbKey;

  if (!key) {
    return res.status(401).json({ error: "TMDB key missing" });
  }

  try {
    await tmdbGet("/configuration", key);
    req.tmdbKey = key;
    next();
  } catch (err) {
    return res.status(403).json({ error: "TMDB key invalid or expired" });
  }
}

// --------------- POPULAR MOVIES -------------
router.get("/movies/popular", requireTMDBKey, async (req, res) => {
  try {
    const popular = await tmdbGet("/movie/popular", req.tmdbKey, { page: 1 });
    const top20 = popular.data.results.slice(0, 20);

    const fullData = [];

    for (const movie of top20) {
      const details = await tmdbGet(`/movie/${movie.id}`, req.tmdbKey, {
        append_to_response: "credits,images,videos,reviews,external_ids"
      });

      fullData.push(details.data);
    }

    return res.json(fullData);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch movies" });
  }
});

// --------------- ACTOR SEARCH ---------------
router.get("/search/actor", requireTMDBKey, async (req, res) => {
  try {
    const name = req.query.name?.trim();

    if (!name) {
      return res.status(400).json({ error: "Actor name required" });
    }

    const result = await tmdbGet("/search/person", req.tmdbKey, {
      query: name
    });

    if (result.data.results.length === 0) {
      return res.status(404).json({ error: "Actor not found" });
    }

    return res.json(result.data.results[0]);
  } catch (err) {
    return res.status(500).json({ error: "Actor search failed" });
  }
});

// --------------- GENRE SEARCH ---------------
router.get("/search/genre", requireTMDBKey, async (req, res) => {
  try {
    const input = req.query.genre?.trim().toLowerCase();

    if (!input) {
      return res.status(400).json({ error: "Genre required" });
    }

    const genres = await tmdbGet("/genre/movie/list", req.tmdbKey);

    let found = genres.data.genres.find(g => g.name.toLowerCase() === input);

    if (!found) {
      found = genres.data.genres.find(g => g.name.toLowerCase().includes(input));
    }

    if (!found) {
      return res.status(404).json({ error: "Genre not found" });
    }

    const movies = await tmdbGet("/discover/movie", req.tmdbKey, {
      with_genres: found.id,
      sort_by: "popularity.desc"
    });

    return res.json(movies.data.results.slice(0, 20));
  } catch (err) {
    return res.status(500).json({ error: "Genre search failed" });
  }
});

module.exports = router;
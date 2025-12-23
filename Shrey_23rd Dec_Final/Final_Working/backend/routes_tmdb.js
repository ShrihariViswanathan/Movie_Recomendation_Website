const express = require("express");
const axios = require("axios");

const router = express.Router();

const TMDB_BASE = "https://api.themoviedb.org/3";

/* ===================== ADDED IMPORT ===================== */
const { MovieActivity, db } = require("./database");
/* ======================================================== */

// Helper for TMDB requests
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

    if (!apiKey || apiKey.trim() === "") {
        return res.status(400).json({ error: "Invalid TMDB key" });
    }

    res.cookie("tmdbKey", apiKey.trim(), {
        httpOnly: true,
        sameSite: "Lax",
        secure: false,
        path: "/"
    });

    res.json({ message: "TMDB key saved" });
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

// --------------- DEBUG ENDPOINT ---------------
router.get("/debug", (req, res) => {
    res.json({ tmdbKeyExists: !!req.cookies.tmdbKey });
});

router.get("/movie/details/:id", requireTMDBKey, async (req, res) => {
    try {
        const movieId = req.params.id;

        const response = await tmdbGet(`/movie/${movieId}`, req.tmdbKey, {
            append_to_response: [
                "credits",
                "reviews",
                "videos",
                "images",
                "external_ids",
                "keywords",
                "recommendations",
                "similar",
                "release_dates",
                "watch/providers",
                "translations",
                "alternative_titles",
                "lists",
                "changes"
            ].join(",")
        });

        /* ========== ADDED: LOG MOVIE VIEW (TRENDING) ========== */
        await MovieActivity.create({
            movieId: movieId,
            activityType: "view"
        });
        /* ===================================================== */

        res.json(response.data);
    } catch (err) {
        console.error(err.response?.data || err.message);
        res.status(500).json({ error: "Failed to fetch movie details" });
    }
});

// --------------- POPULAR MOVIES -------------
router.get("/movies/popular", requireTMDBKey, async (req, res) => {
    try {
        const popular = await tmdbGet("/movie/popular", req.tmdbKey, { page: 1 });
        const results = popular.data.results.slice(0, 20);
        return res.json(results);
    } catch (err) {
        return res.status(500).json({ error: "Failed to fetch popular movies" });
    }
});

// --------------- ACTOR SEARCH ----------------
router.get("/search/actor", requireTMDBKey, async (req, res) => {
    try {
        const name = req.query.name?.trim();
        if (!name) return res.status(400).json({ error: "Actor name required" });

        const result = await tmdbGet("/search/person", req.tmdbKey, { query: name });

        if (result.data.results.length === 0) {
            return res.status(404).json({ error: "Actor not found" });
        }

        return res.json(result.data.results[0]);
    } catch (err) {
        return res.status(500).json({ error: "Actor search failed" });
    }
});

// --------------- ACTOR MOVIES ----------------
router.get("/search/actor/movies", requireTMDBKey, async (req, res) => {
    try {
        const actorId = req.query.id;
        const page = req.query.page || 1;

        if (!actorId) return res.status(400).json({ error: "Actor ID required" });

        const movies = await tmdbGet("/discover/movie", req.tmdbKey, {
            with_cast: actorId,
            sort_by: "popularity.desc",
            page: page
        });

        return res.json(movies.data.results);
    } catch (err) {
        return res.status(500).json({ error: "Failed to fetch movies for actor" });
    }
});

// --------------- GENRE SEARCH ----------------
router.get("/search/genre", requireTMDBKey, async (req, res) => {
    try {
        const input = req.query.genre?.trim().toLowerCase();
        const page = req.query.page || 1;

        if (!input) return res.status(400).json({ error: "Genre required" });

        const genresList = await tmdbGet("/genre/movie/list", req.tmdbKey);
        let found = genresList.data.genres.find(g => g.name.toLowerCase() === input) ||
                    genresList.data.genres.find(g => g.name.toLowerCase().includes(input));

        if (!found) return res.status(404).json({ error: "Genre not found" });

        const movies = await tmdbGet("/discover/movie", req.tmdbKey, {
            with_genres: found.id,
            sort_by: "popularity.desc",
            page: page
        });

        return res.json(movies.data.results);
    } catch (err) {
        return res.status(500).json({ error: "Genre search failed" });
    }
});

// --------------- MOVIE SEARCH ----------------
router.get("/search/movie", requireTMDBKey, async (req, res) => {
    try {
        const query = req.query.q?.trim();
        if (!query) {
            return res.status(400).json({ error: "Query required" });
        }

        const result = await tmdbGet("/search/movie", req.tmdbKey, {
            query,
            include_adult: false
        });

        res.json(result.data.results);
    } catch (err) {
        res.status(500).json({ error: "Movie search failed" });
    }
});

/* ===================== NEW FEATURES ===================== */

// TRENDING MOVIES
router.get("/movies/trending", async (req, res) => {
    try {
        const results = await MovieActivity.findAll({
            attributes: [
                "movieId",
                [db.fn("COUNT", db.col("movieId")), "views"]
            ],
            where: { activityType: "view" },
            group: ["movieId"],
            order: [[db.literal("views"), "DESC"]],
            limit: 10
        });

        res.json(results);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch trending movies" });
    }
});

// TOP RATED MOVIES
router.get("/movies/top-rated", async (req, res) => {
    try {
        const results = await MovieActivity.findAll({
            attributes: [
                "movieId",
                [db.fn("AVG", db.col("rating")), "avgRating"]
            ],
            where: { activityType: "rating" },
            group: ["movieId"],
            having: db.literal("avgRating >= 4"),
            order: [[db.literal("avgRating"), "DESC"]],
            limit: 10
        });

        res.json(results);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch top-rated movies" });
    }
});

// RECENTLY RELEASED MOVIES
router.get("/movies/recent", requireTMDBKey, async (req, res) => {
    try {
        const recent = await tmdbGet("/discover/movie", req.tmdbKey, {
            sort_by: "release_date.desc",
            page: 1
        });

        res.json(recent.data.results.slice(0, 10));
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch recent movies" });
    }
});

// --------------- TOP RATED MOVIES ----------------
router.get("/movies/top-rated", requireTMDBKey, async (req, res) => {
  try {
    const response = await tmdbGet("/movie/top_rated", req.tmdbKey, { page: 1 });
    res.json(response.data.results.slice(0, 20)); // top 20
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Failed to fetch top rated movies" });
  }
});

// Recently released movies (past 30 days)
router.get("/movies/recently-released", requireTMDBKey, async (req, res) => {
  try {
    const today = new Date();
    const prior = new Date();
    prior.setDate(today.getDate() - 30);

    const response = await tmdbGet("/discover/movie", req.tmdbKey, {
      "primary_release_date.gte": prior.toISOString().split("T")[0],
      "primary_release_date.lte": today.toISOString().split("T")[0],
      sort_by: "release_date.desc",
      page: 1
    });

    res.json(response.data.results.slice(0, 20));
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Failed to fetch recently released movies" });
  }
});



module.exports = router;

const express = require("express");
const router = express.Router();
const { Rating } = require("./database");

// ADD or UPDATE rating
router.post("/movie/rate", async (req, res) => {
  try {
    const { user_id, movie_id, rating } = req.body;

    if (!user_id || !movie_id || !rating) {
      return res.status(400).json({ error: "Missing fields" });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    // Upsert = insert or update
    await Rating.upsert({
      user_id,
      movie_id,
      rating
    });

    res.json({ message: "Rating saved successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save rating" });
  }
});

// Get user's rating for a movie
router.get("/movie/rate/:movieId/:userId", async (req, res) => {
  try {
    const { movieId, userId } = req.params;

    const existing = await Rating.findOne({
      where: { movie_id: movieId, user_id: userId }
    });

    res.json({ rating: existing ? existing.rating : 0 });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch rating" });
  }
});

module.exports = router;

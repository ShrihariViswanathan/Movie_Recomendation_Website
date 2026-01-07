const express = require("express");
const router = express.Router();
const { Watchlist } = require("./database");

/* ----------------------------------
   ADD TO WATCHLIST
   POST /watchlist
----------------------------------- */
router.post("/watchlist", async (req, res) => {
  try {
    const { user_id, movie_id, title, poster_path } = req.body;

    if (!user_id || !movie_id || !title) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const existing = await Watchlist.findOne({
      where: { user_id, movie_id }
    });

    if (existing) {
      return res.status(409).json({ error: "Already in watchlist" });
    }

    await Watchlist.create({
      user_id,
      movie_id,
      movie_name: title,
      poster_path
    });

    res.status(201).json({ message: "Added to watchlist" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add to watchlist" });
  }
});

/* ----------------------------------
   GET USER WATCHLIST
   GET /watchlist/:user_id
----------------------------------- */
router.get("/watchlist/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;

    const items = await Watchlist.findAll({
      where: { user_id },
      order: [["createdAt", "DESC"]]
    });

    // Shape response exactly as frontend expects
    const response = items.map(item => ({
      movie_id: item.movie_id,
      title: item.movie_name,
      poster_path: item.poster_path
    }));

    res.json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch watchlist" });
  }
});

/* ----------------------------------
   REMOVE FROM WATCHLIST
   DELETE /watchlist/:user_id/:movie_id
----------------------------------- */
router.delete("/watchlist/:user_id/:movie_id", async (req, res) => {
  try {
    const { user_id, movie_id } = req.params;

    const deleted = await Watchlist.destroy({
      where: { user_id, movie_id }
    });

    if (!deleted) {
      return res.status(404).json({ error: "Item not found" });
    }

    res.json({ message: "Removed from watchlist" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to remove from watchlist" });
  }
});

module.exports = router;

require("dotenv").config();
const express = require("express");
const argon2 = require("argon2");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const { User, Rating, Watchlist } = require("./database");

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: ["http://localhost:5500", "http://127.0.0.1:5500"],
  credentials: true
}));

// ---------- TEST ----------
app.get("/ping", (req, res) => res.send("pong"));

// ---------- REGISTER ----------
app.post("/account/new", async (req, res) => {
  try {
    const {
      usernameFromInput,
      emailFromInput,
      phoneFromInput,
      passwordFromInput,
      confirmPasswordFromInput
    } = req.body;

    if (passwordFromInput !== confirmPasswordFromInput)
      return res.status(400).json({ error: "Passwords do not match" });

    const exists = await User.findOne({ where: { username: usernameFromInput } });
    if (exists)
      return res.status(400).json({ error: "User exists" });

    const hash = await argon2.hash(passwordFromInput);

    await User.create({
      username: usernameFromInput,
      email: emailFromInput,
      phone: phoneFromInput,
      password: hash
    });

    res.json({ message: "Registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ---------- LOGIN ----------
app.post("/account/login", async (req, res) => {
  try {
    const { usernameFromInput, passwordFromInput } = req.body;

    const user = await User.findOne({ where: { username: usernameFromInput } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const valid = await argon2.verify(user.password, passwordFromInput);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { user_id: user.id },
      process.env.JWT_SECRET || "demo_secret",
      { expiresIn: "5m" }
    );

    res.cookie("accessToken", token, { httpOnly: true });
    res.json({ message: "Login successful", user_id: user.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
});

// ---------- ADD RATING ----------
app.post("/movie/rate", async (req, res) => {
  try {
    const { user_id, movie_id, rating } = req.body;

    await Rating.create({ user_id, movie_id, rating });
    res.json({ message: "Rating saved" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Rating failed" });
  }
});

// ---------- ADD WATCHLIST ----------
app.post("/watchlist/add", async (req, res) => {
  try {
    const { user_id, movie_id, movie_name } = req.body;

    await Watchlist.findOrCreate({
      where: { user_id, movie_id },
      defaults: { movie_name }
    });

    res.json({ message: "Added to watchlist" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Watchlist failed" });
  }
});

// ---------- GET WATCHLIST ----------
app.get("/watchlist/:userId", async (req, res) => {
  const rows = await Watchlist.findAll({
    where: { user_id: req.params.userId }
  });
  res.json(rows);
});

// ---------- START ----------
app.listen(8000, () => {
  console.log("🚀 Server running on port 8000");
});

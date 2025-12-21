const express = require("express");
const argon2 = require("argon2");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const { db, User } = require("./database");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: [
    "http://localhost:5500",
    "http://127.0.0.1:5500"
  ],
  credentials: true
}));

// ---------- TEST ROUTES (DO NOT REMOVE) ----------
app.get("/ping", (req, res) => {
  res.send("pong");
});

app.post("/test", (req, res) => {
  res.json({ ok: true });
});

app.get("/check-cookie", (req, res) => {
  console.log(req.cookies);
  res.send("check server console");
});
// -----------------------------------------------

// TMDB ROUTES
const tmdbRoutes = require("./routes_tmdb");
app.use(tmdbRoutes);

// ---------- AUTH ROUTES ----------
app.post("/account/new", async (req, res) => {
  try {
    const { usernameFromInput, passwordFromInput, confirmPasswordFromInput } = req.body;

    if (passwordFromInput !== confirmPasswordFromInput)
      return res.status(422).json({ error: "Passwords do not match" });

    const exists = await User.findOne({ where: { username: usernameFromInput } });
    if (exists)
      return res.status(400).json({ error: "User already exists" });

    const hashed = await argon2.hash(passwordFromInput);

    const user = await User.create({
      username: usernameFromInput,
      password: hashed
    });

    res.status(201).json({
      username: user.username,
      createdAt: user.createdAt
    });

  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/account/login", async (req, res) => {
  try {
    const { usernameFromInput, passwordFromInput } = req.body;

    const user = await User.findOne({
      where: { username: usernameFromInput }
    });

    if (!user)
      return res.status(404).json({ error: "User not found" });

    const valid = await argon2.verify(user.password, passwordFromInput);
    if (!valid)
      return res.status(401).json({ error: "Invalid credentials" });

    const accessToken = jwt.sign(
      { username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "5m" }
    );

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      sameSite: "Lax",
      secure: false,
      maxAge: 300000,
      path: "/"
    });

    res.json({ message: "Login successful" });

  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
});


app.get("/debug", (req, res) => {
  res.json({
    cookies: req.cookies,
    tmdbKeyExists: Boolean(req.cookies.tmdbKey)
  });
});

// --------------------------------

const PORT = 8000;

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});

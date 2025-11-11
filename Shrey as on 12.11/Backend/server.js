const express = require("express");
const path = require("path");
const app = express();

const staticPath = path.join(__dirname, "../Frontend/Static");
const templatePath = path.join(__dirname, "../Frontend/Templates");

// Serve static files correctly
app.use(express.static(staticPath));
app.use(express.static(templatePath));

// Default route (homepage)
app.get("/", (req, res) => {
  res.sendFile(path.join(templatePath, "homepage.html"));
});

const PORT = 3000;
app.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`)
);

const { tmdbRequest } = require("./tmdb");


const checkTMDBKey = async (req, res, next) => {
const tmdbKey = req.cookies.tmdbKey;


if (!tmdbKey)
return res.status(401).sendFile("tmdb_key.html", { root: "frontend/templates" });


try {
await tmdbRequest("/configuration", tmdbKey);
next();
} catch (err) {
return res.status(403).sendFile("tmdb_key.html", { root: "frontend/templates" });
}
};


module.exports = { checkTMDBKey };
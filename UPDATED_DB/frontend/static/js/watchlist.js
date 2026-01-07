const API_BASE = `${location.protocol}//${location.hostname}:8000`;
const userId = localStorage.getItem("user_id");

const container = document.getElementById("watchlist-container");
const statusText = document.getElementById("status-text");

if (!userId) {
    statusText.textContent = "Please login to view your watchlist.";
} else {
    loadWatchlist();
}

async function loadWatchlist() {
    try {
        const res = await fetch(`${API_BASE}/watchlist/${userId}`, {
            credentials: "include"
        });

        if (!res.ok) throw new Error("Failed to fetch watchlist");

        const movies = await res.json();
        container.innerHTML = "";

        if (!movies || movies.length === 0) {
            container.innerHTML = `<p id="status-text">Your watchlist is empty.</p>`;
            return;
        }

        movies.forEach(movie => {
            const card = document.createElement("div");
            card.className = "movie-card";

            card.innerHTML = `
                <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
                <div class="movie-info">
                    <h3>${movie.title}</h3>
                    <button class="remove-btn" data-id="${movie.movie_id}">
                        Remove
                    </button>
                </div>
            `;

            card.querySelector(".remove-btn")
                .addEventListener("click", () => removeFromWatchlist(movie.movie_id));

            container.appendChild(card);
        });

    } catch (err) {
        console.error(err);
        container.innerHTML = `<p id="status-text">Failed to load watchlist.</p>`;
    }
}

async function removeFromWatchlist(movieId) {
    if (!confirm("Remove this movie from your watchlist?")) return;

    try {
        const res = await fetch(`${API_BASE}/watchlist/${userId}/${movieId}`, {
            method: "DELETE",
            credentials: "include"
        });

        if (!res.ok) throw new Error("Delete failed");

        loadWatchlist();
    } catch (err) {
        console.error(err);
        alert("Failed to remove movie.");
    }
}

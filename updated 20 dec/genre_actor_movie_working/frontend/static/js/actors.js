document.addEventListener("DOMContentLoaded", async () => {

    // 1. DYNAMIC BASE URL (Automatically handles localhost vs 127.0.0.1)
    const API_BASE = `${window.location.protocol}//${window.location.hostname}:8000`;

    // 2. DOM ELEMENTS
    const checkboxes = document.querySelectorAll(".tags-container input[type=checkbox]");
    const galleryContainer = document.querySelector(".scroll-container");
    const galleryTitle = document.querySelector(".gallery-title");
    const scrollRightBtn = document.querySelector(".scroll-btn.right");
    const scrollLeftBtn = document.querySelector(".scroll-btn.left");

    // Map your HTML IDs to searchable Actor Names for the API
    const actorNameMap = {
        "brad": "Brad Pitt",
        "tomc": "Tom Cruise",
        "rdj": "Robert Downey Jr.",
        "johnny": "Johnny Depp",
        "tomh": "Tom Hanks",
        "daniel": "Daniel Radcliffe"
    };

    let allMovies = [];
    const TOTAL_CAP = 20;

    // ----------- INITIALIZE -----------
    const keyExists = await checkTMDBKey();
    if (!keyExists) {
        alert("TMDB key is not set. Redirecting...");
        window.location.href = "tmdb_key.html";
        return;
    }

    // Load initial state
    handleActorChange();

    // ----------- CORE FUNCTIONS -----------

    async function checkTMDBKey() {
        try {
            const res = await fetch(`${API_BASE}/debug`, { credentials: "include" });
            const data = await res.json();
            return data.tmdbKeyExists;
        } catch { return false; }
    }

    /**
     * Logic to handle checkbox changes
     * Divides 20 slots equally among selected actors
     */
    async function handleActorChange() {
        const selectedCheckboxes = Array.from(checkboxes).filter(cb => cb.checked);
        
        if (selectedCheckboxes.length === 0) {
            galleryTitle.innerText = "POPULAR MOVIES:";
            await fetchPopularFallback();
            return;
        }

        // Divide the 20-movie cap by number of actors
        const perActor = Math.floor(TOTAL_CAP / selectedCheckboxes.length);
        let combinedMovies = [];
        let seenIds = new Set();

        for (const cb of selectedCheckboxes) {
            const actorName = actorNameMap[cb.id];
            // Fetch random popular movies for this specific actor
            const movies = await fetchRandomMoviesByActor(actorName, perActor);
            
            movies.forEach(movie => {
                if (!seenIds.has(movie.id)) {
                    seenIds.add(movie.id);
                    combinedMovies.push(movie);
                }
            });
        }

        // Shuffle the final list so actors are mixed in the gallery
        shuffleArray(combinedMovies);
        allMovies = combinedMovies;
        
        // Update Title (e.g., "BRAD & RDJ MOVIES:")
        const names = selectedCheckboxes.map(cb => actorNameMap[cb.id].split(' ')[0].toUpperCase());
        galleryTitle.innerText = names.join(" & ") + " MOVIES:";
        
        renderGallery(allMovies);
    }

    /**
     * Fetches movies from a random page (1-5) to ensure different results every time
     */
    async function fetchRandomMoviesByActor(name, limit) {
        try {
            // Step 1: Find Actor ID
            const actorRes = await fetch(`${API_BASE}/search/actor?name=${encodeURIComponent(name)}`, { credentials: "include" });
            const actorData = await actorRes.json();
            if (!actorData.id) return [];

            // Step 2: Pick a random page to get different movies from their filmography
            const randomPage = Math.floor(Math.random() * 5) + 1;
            
            const movieRes = await fetch(`${API_BASE}/search/actor/movies?id=${actorData.id}&page=${randomPage}`, { credentials: "include" });
            let movies = await movieRes.json();

            if (!Array.isArray(movies)) return [];

            // Shuffle the 20 movies on this page and take the amount we need
            shuffleArray(movies);
            return movies.slice(0, limit);
        } catch (err) {
            console.error(`Error fetching ${name}:`, err);
            return [];
        }
    }

    async function fetchPopularFallback() {
        try {
            const res = await fetch(`${API_BASE}/movies/popular`, { credentials: "include" });
            allMovies = await res.json();
            shuffleArray(allMovies);
            renderGallery(allMovies);
        } catch (err) {
            console.error("Fallback error:", err);
        }
    }

    // ----------- UI RENDERING -----------

function renderGallery(movies) {
        galleryContainer.innerHTML = "";
        
        if (movies.length === 0) {
            galleryContainer.innerHTML = "<p style='color:white; padding: 20px;'>No movies found.</p>";
            return;
        }

        movies.forEach(movie => {
            const card = document.createElement("div");
            card.className = "movie-card";
            card.style.cursor = "pointer"; // Make it look clickable

            // --- CLICK TO REDIRECT ---
            card.onclick = () => {
                window.location.href = `movie_details.html?id=${movie.id}`;
            };
            
            const img = document.createElement("img");
            img.src = movie.poster_path 
                ? `https://image.tmdb.org/t/p/w300${movie.poster_path}` 
                : "../static/media/images/default_movie.png";
            img.alt = movie.title || "Movie Poster";
            
            card.appendChild(img);
            galleryContainer.appendChild(card);
        });
        
        galleryContainer.scrollTo({ left: 0, behavior: 'smooth' });
    }

    
    function shuffleArray(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
    }

    // ----------- EVENT LISTENERS -----------

    checkboxes.forEach(cb => cb.addEventListener("change", handleActorChange));

    if (scrollRightBtn) {
        scrollRightBtn.addEventListener("click", () => {
            galleryContainer.scrollBy({ left: 400, behavior: 'smooth' });
        });
    }

    if (scrollLeftBtn) {
        scrollLeftBtn.addEventListener("click", () => {
            galleryContainer.scrollBy({ left: -400, behavior: 'smooth' });
        });
    }
});
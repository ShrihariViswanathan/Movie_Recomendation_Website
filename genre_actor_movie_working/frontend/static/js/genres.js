document.addEventListener("DOMContentLoaded", async () => {

    // 1. DYNAMIC BASE URL: Automatically adapts to your current browser address
    // This solves the localhost vs 127.0.0.1 conflict.
    const API_BASE = `${window.location.protocol}//${window.location.hostname}:8000`;

    // ----------- DOM ELEMENTS -----------
    const checkboxes = document.querySelectorAll(".tags-container input[type=checkbox]");
    const galleryContainer = document.querySelector(".movie-gallery .scroll-container");
    const galleryTitle = document.querySelector(".gallery-title");
    const scrollRightBtn = document.querySelector(".scroll-btn.right");
    const scrollLeftBtn = document.querySelector(".scroll-btn.left");

    // ----------- STATE MANAGEMENT -----------
    let allMovies = [];
    let currentIndex = 0;
    const visibleCount = 5;

    // ----------- INITIALIZE -----------
    const keyExists = await checkTMDBKey();
    if (!keyExists) {
        localStorage.setItem("redirectAfterTMDB", window.location.href);
        alert("TMDB key is not set. Redirecting to TMDB key page...");
        window.location.href = "tmdb_key.html";
        return;
    }

    // Load initial popular movies
    handleGenreChange();

    // ----------- FUNCTIONS -----------

    async function checkTMDBKey() {
        try {
            const res = await fetch(`${API_BASE}/debug`, { credentials: "include" });
            const data = await res.json();
            return data.tmdbKeyExists;
        } catch {
            return false;
        }
    }

    async function fetchMoviesForGenre(genre, count = 20) {
        const movies = [];
        const maxPages = 5; 
        const pages = Array.from({ length: maxPages }, (_, i) => i + 1);
        shuffleArray(pages);

        for (let page of pages) {
            try {
                // Ensure the 'page' parameter is sent to the backend
                const res = await fetch(`${API_BASE}/search/genre?genre=${encodeURIComponent(genre)}&page=${page}`, {
                    credentials: "include"
                });
                const data = await res.json();
                if (res.ok && Array.isArray(data)) {
                    movies.push(...data);
                    if (movies.length >= count) break;
                }
            } catch (err) {
                console.error(`Error fetching genre ${genre}:`, err);
            }
        }

        shuffleArray(movies);
        return movies.slice(0, count);
    }

    function shuffleArray(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
    }

function updateGallery(movieSubset) {
        galleryContainer.innerHTML = "";
        
        galleryContainer.style.display = "flex";
        galleryContainer.style.flexWrap = "nowrap";
        galleryContainer.style.overflow = "hidden";

        movieSubset.forEach(movie => {
            const card = document.createElement("div");
            card.className = "movie-card";
            card.style.minWidth = "200px";
            card.style.marginRight = "15px";
            card.style.flex = "0 0 auto";
            card.style.cursor = "pointer"; // Make it look clickable

            // --- CLICK TO REDIRECT ---
            card.onclick = () => {
                window.location.href = `movie_details.html?id=${movie.id}`;
            };

            const img = document.createElement("img");
            img.style.width = "100%";
            img.style.borderRadius = "8px";
            img.src = movie.poster_path
                ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
                : "../static/media/images/default_movie.png";
            img.alt = movie.title || movie.name;

            card.appendChild(img);
            galleryContainer.appendChild(card);
        });
    }

    async function handleGenreChange() {
        const selectedGenres = Array.from(checkboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.id);

        currentIndex = 0; // Reset scroll position on change

        if (selectedGenres.length === 0) {
            try {
                const res = await fetch(`${API_BASE}/movies/popular`, { credentials: "include" });
                const popularMovies = await res.json();
                allMovies = popularMovies;
                shuffleArray(allMovies);
                galleryTitle.innerText = "POPULAR MOVIES:";
            } catch (err) {
                console.error("Failed to fetch popular movies", err);
                allMovies = [];
            }
        } else {
            const moviesPerGenre = Math.floor(40 / selectedGenres.length);
            let movieSet = new Set();
            let tempMovies = [];

            for (const genre of selectedGenres) {
                const genreMovies = await fetchMoviesForGenre(genre, moviesPerGenre);
                genreMovies.forEach(movie => {
                    if (!movieSet.has(movie.id)) {
                        movieSet.add(movie.id);
                        tempMovies.push(movie);
                    }
                });
            }
            allMovies = tempMovies;
            shuffleArray(allMovies);
            galleryTitle.innerText = selectedGenres.map(g => g.toUpperCase()).join(" / ") + " MOVIES:";
        }

        updateGallery(allMovies.slice(0, visibleCount));
    }

    function scrollGallery(direction) {
        if (allMovies.length === 0) return;

        // Move by 5 items
        currentIndex += direction * visibleCount;

        // Boundaries check
        if (currentIndex < 0) {
            currentIndex = 0;
        } else if (currentIndex >= allMovies.length) {
            currentIndex = Math.max(0, allMovies.length - visibleCount);
        }

        const nextSet = allMovies.slice(currentIndex, currentIndex + visibleCount);
        
        // If we reached the end and have fewer than 5 items, stay at the last possible full view
        if (nextSet.length < visibleCount && allMovies.length > visibleCount) {
             currentIndex = allMovies.length - visibleCount;
             updateGallery(allMovies.slice(currentIndex));
        } else {
             updateGallery(nextSet);
        }
    }

    // ----------- EVENT LISTENERS -----------
    if (scrollRightBtn) scrollRightBtn.addEventListener("click", () => scrollGallery(1));
    if (scrollLeftBtn) scrollLeftBtn.addEventListener("click", () => scrollGallery(-1));
    checkboxes.forEach(cb => cb.addEventListener("change", handleGenreChange));

});
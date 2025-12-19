document.addEventListener("DOMContentLoaded", async () => {

    // ----------- CHECK TMDB KEY VIA BACKEND -----------
    async function checkTMDBKey() {
        try {
            const res = await fetch("http://localhost:8000/debug", { credentials: "include" });
            const data = await res.json();
            return data.tmdbKeyExists;
        } catch {
            return false;
        }
    }

    const keyExists = await checkTMDBKey();
    if (!keyExists) {
        localStorage.setItem("redirectAfterTMDB", window.location.href);
        alert("TMDB key is not set. Redirecting to TMDB key page...");
        window.location.href = "tmdb_key.html";
        return;
    }

    // ----------- DOM ELEMENTS -----------
    const checkboxes = document.querySelectorAll(".tags-container input[type=checkbox]");
    const galleryContainer = document.querySelector(".movie-gallery .scroll-container");
    const galleryTitle = document.querySelector(".gallery-title");
    const scrollRightBtn = document.querySelector(".scroll-btn.right");
    const scrollLeftBtn = document.querySelector(".scroll-btn.left");

    // ----------- FETCH MOVIES WITH RANDOM PAGE AND OFFSET -----------
    async function fetchMoviesForGenre(genre, count = 20) {
        const movies = [];
        const maxPages = 10;
        const pages = Array.from({ length: maxPages }, (_, i) => i + 1);
        shuffleArray(pages);

        for (let page of pages) {
            try {
                const res = await fetch(`http://localhost:8000/search/genre?genre=${genre}&page=${page}`, {
                    credentials: "include"
                });
                const data = await res.json();
                if (res.ok && data.length > 0) {
                    movies.push(...data);
                    if (movies.length >= count) break;
                }
            } catch (err) {
                console.error(err);
            }
        }

        shuffleArray(movies);
        return movies.slice(0, count);
    }

    // ----------- UTILITY: SHUFFLE ARRAY -----------
    function shuffleArray(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
    }

    // ----------- UPDATE GALLERY -----------
    let allMovies = [];
    function updateGallery(movies) {
        galleryContainer.innerHTML = "";
        galleryContainer.style.display = "flex"; // force a single row
        galleryContainer.style.flexWrap = "nowrap"; // prevent wrapping

        movies.forEach(movie => {
            const card = document.createElement("div");
            card.className = "movie-card";
            card.style.minWidth = "200px";
            card.style.marginRight = "10px";
            card.style.flex = "0 0 auto"; // ensure fixed width in row

            const img = document.createElement("img");
            img.src = movie.poster_path
                ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
                : "../static/media/images/default_movie.png";
            img.alt = movie.title || movie.name;

            card.appendChild(img);
            galleryContainer.appendChild(card);
        });
    }

    // ----------- HANDLE GENRE CHANGE -----------
    async function handleGenreChange() {
        const selectedGenres = Array.from(checkboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.id);

        if (selectedGenres.length === 0) {
    try {
        const res = await fetch("http://localhost:8000/movies/popular", {
            credentials: "include"
        });
        const popularMovies = await res.json();
        shuffleArray(popularMovies); // randomize
        allMovies = popularMovies;
        galleryTitle.innerText = "POPULAR MOVIES:";
        updateGallery(allMovies.slice(0, 5)); // show first 5
        currentIndex = 0;
    } catch (err) {
        console.error(err);
        updateGallery([]); // fallback to empty gallery
    }
    return;
}

        const moviesPerGenre = Math.floor(20 / selectedGenres.length);
        let movieSet = new Set();
        allMovies = [];

        for (const genre of selectedGenres) {
            const genreMovies = await fetchMoviesForGenre(genre, moviesPerGenre);
            genreMovies.forEach(movie => {
                const uniqueKey = movie.id || movie.title;
                if (!movieSet.has(uniqueKey)) {
                    movieSet.add(uniqueKey);
                    allMovies.push(movie);
                }
            });
        }

        shuffleArray(allMovies);
        galleryTitle.innerText = selectedGenres.map(g => g.toUpperCase()).join(" / ") + " MOVIES:";
        updateGallery(allMovies.slice(0, 5)); // exactly 5 movies
        currentIndex = 0;
    }

    // ----------- HORIZONTAL SCROLL CONTROL -----------
    let currentIndex = 0;
    const visibleCount = 5;

    function scrollGallery(direction) {
        currentIndex += direction * visibleCount;

        if (currentIndex < 0) currentIndex = 0;
        if (currentIndex > allMovies.length - visibleCount)
            currentIndex = allMovies.length - visibleCount;

        updateGallery(allMovies.slice(currentIndex, currentIndex + visibleCount));
    }

    if (scrollRightBtn) scrollRightBtn.addEventListener("click", () => scrollGallery(1));
    if (scrollLeftBtn) scrollLeftBtn.addEventListener("click", () => scrollGallery(-1));

    // ----------- ATTACH GENRE LISTENERS -----------
    checkboxes.forEach(cb => cb.addEventListener("change", handleGenreChange));

});

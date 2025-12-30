document.addEventListener("DOMContentLoaded", async () => {
  const API_BASE = `${location.protocol}//${location.hostname}:8000`;

  const stars = document.querySelectorAll(".stars i");
  const ratingText = document.getElementById("ratingText");
  const saveBtn = document.getElementById("saveBtn");
  const status = document.getElementById("status");
  const poster = document.getElementById("poster");
  const titleEl = document.getElementById("movieTitle");

  let selectedRating = 0;

  const params = new URLSearchParams(window.location.search);
  const movieId = params.get("id");
  const userId = localStorage.getItem("user_id");

  if (!movieId || !userId) {
    status.textContent = "Missing movie or user info";
    saveBtn.disabled = true;
    return;
  }

  /* ---------- LOAD MOVIE DETAILS ---------- */
  const movieRes = await fetch(`${API_BASE}/movie/details/${movieId}`, {
    credentials: "include"
  });
  const movie = await movieRes.json();

  titleEl.textContent = movie.title;
  if (movie.poster_path) {
    poster.src = `https://image.tmdb.org/t/p/w300${movie.poster_path}`;
  }

  /* ---------- STAR CLICK ---------- */
  stars.forEach(star => {
    star.addEventListener("click", () => {
      selectedRating = Number(star.dataset.val);
      updateStars();
    });
  });

  function updateStars() {
    stars.forEach(s =>
      s.classList.toggle("active", s.dataset.val <= selectedRating)
    );
    ratingText.textContent = `Your rating: ${selectedRating}`;
  }

  /* ---------- SAVE RATING ---------- */
  saveBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    if (selectedRating === 0) {
      status.textContent = "Select a rating first";
      return;
    }

    saveBtn.disabled = true;
    status.textContent = "Saving rating...";

    try {
      const res = await fetch(`${API_BASE}/movie/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          user_id: userId,
          movie_id: movieId,
          rating: selectedRating
        })
      });

      const data = await res.json();

      if (!res.ok) {
        status.textContent = data.error || "Failed to save rating";
        saveBtn.disabled = false;
        return;
      }

      status.style.color = "#22c55e";
      status.textContent = "Rating saved successfully ✅";

      // ✅ SINGLE, CLEAN REDIRECT
      setTimeout(() => {
        const back =
          localStorage.getItem("returnAfterRating") ||
          `movie_details.html?id=${movieId}`;
        localStorage.removeItem("returnAfterRating");
        window.location.href = back;
      }, 1000);

    } catch (err) {
      status.textContent = "Server error";
      saveBtn.disabled = false;
    }
  });
});

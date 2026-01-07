document.addEventListener("DOMContentLoaded", async () => {
  // Hardcoded to match your backend port and the IP in your screenshot
  const API_BASE = "http://127.0.0.1:8000";

  const stars = document.querySelectorAll(".stars i");
  const ratingText = document.getElementById("ratingText");
  const saveBtn = document.getElementById("saveBtn");
  const backBtn = document.getElementById("backBtn"); // ✅ Added backBtn
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
  try {
    const movieRes = await fetch(`${API_BASE}/movie/details/${movieId}`, {
      credentials: "include"
    });
    const movie = await movieRes.json();
    titleEl.textContent = movie.title;
    if (movie.poster_path) {
      poster.src = `https://image.tmdb.org/t/p/w300${movie.poster_path}`;
    }
  } catch (err) {
    console.error("Details fetch failed:", err);
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

  /* ---------- SAVE RATING (FIXED) ---------- */
  saveBtn.addEventListener("click", async (e) => {
    e.preventDefault(); 
    e.stopPropagation(); 

    if (selectedRating === 0) {
      status.style.color = "orange";
      status.textContent = "Select a rating first";
      return;
    }

    saveBtn.disabled = true;
    status.style.color = "white";
    status.textContent = "Saving...";

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

      if (res.ok) {
        // SUCCESS: Show the green message
        status.style.color = "#22c55e";
        status.textContent = "Rating saved successfully ✅";
        saveBtn.textContent = "Saved!";
        
        // ✅ NEW: Show the back button and set its click action
        backBtn.style.display = "block";
        backBtn.addEventListener("click", () => {
            const backUrl = localStorage.getItem("returnAfterRating") || `movie_details.html?id=${movieId}`;
            localStorage.removeItem("returnAfterRating"); // Clean up
            window.location.href = backUrl;
        });

        console.log("Rating saved. Staying on page until user clicks back.");
      } else {
        const data = await res.json();
        status.textContent = data.error || "Failed to save";
        saveBtn.disabled = false;
      }
    } catch (err) {
      console.error("Save error:", err);
      status.textContent = "Server error. Check if backend is running.";
      saveBtn.disabled = false;
    }
  });
});
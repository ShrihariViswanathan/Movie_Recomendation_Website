const username = document.getElementById("username");
const password = document.getElementById("password");
const loginForm = document.getElementById("loginForm");

const API_BASE = `${location.protocol}//${location.hostname}:8000`;

loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const loginData = {
        usernameFromInput: username.value,
        passwordFromInput: password.value
    };

    try {
        const response = await fetch(`${API_BASE}/account/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(loginData),
            credentials: "include"
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("username", username.value);
            localStorage.setItem("user_id", data.user_id);

            window.location.href = "homepage.html";
        } else {
            alert("Error: " + (data.error || "Login failed"));
        }
    } catch (error) {
        console.error("Request failed:", error);
        alert("Failed to connect to backend.");
    }
});

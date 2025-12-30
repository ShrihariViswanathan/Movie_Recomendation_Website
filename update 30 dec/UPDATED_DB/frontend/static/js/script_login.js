const username = document.getElementById("username");
const password = document.getElementById("password");
const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", async function (event) {
    event.preventDefault(); // Prevent default form submission

    const loginData = {
        usernameFromInput: username.value,
        passwordFromInput: password.value
    };

    console.log("Logging in with:", loginData);

    try {
        const response = await fetch("http://localhost:8000/account/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(loginData),
            credentials: "include"
        });

        const data = await response.json();

        if (response.ok) {
            console.log("Login Successful:", data);

            // ✅ CRITICAL FIX
            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("username", data.username ?? username.value);
            localStorage.setItem("user_id", data.user_id); // 🔑 REQUIRED FOR RATING

            window.location.href = "../templates/homepage.html";
        } else {
            console.error("Login error:", data);
            alert("Error: " + (data.error || "Login failed"));
        }
    } catch (error) {
        console.error("Request failed:", error);
        alert("Error: " + error);
    }
});

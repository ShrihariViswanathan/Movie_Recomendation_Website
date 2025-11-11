const username = document.getElementById("username");
const password = document.getElementById("password");
const confirmPassword = document.getElementById("confirmPassword");



loginForm.addEventListener('submit', async function(event) {
    event.preventDefault(); // Prevent default form submission
    const registerData = {
        usernameFromInput: username.value,
        passwordFromInput: password.value,
        confirmPasswordFromInput: confirmPassword.value
    };



    console.log("Registering with:", registerData);

    try {
        const response = await fetch("http://localhost:8000/account/new", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(registerData),
            credentials: "include"
        });

        const data = await response.json();

    if (response.ok) {
        console.log("Login Successful:", data);
        window.location.href = "../templates/login.html";
    } else {
        console.error("Login error:", data);
        alert("Error: " + (data.error || "Login failed"));
    }
    } catch (error) {
        console.error("Request failed:", error);
        alert("Error: " + error);
    }
});


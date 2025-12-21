

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("saveBtn").addEventListener("click", saveKey);
});

async function saveKey() {
    const apiKey = document.getElementById("key").value.trim();

    await fetch("/tmdb/key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey })
    });

    location.reload();
}

document.addEventListener("DOMContentLoaded", async function () {
    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "login.html"; // Redirect if no token
        return;
    }

    try {
        const response = await fetch("http://localhost:5001/auth/verify", {
            method: "GET",
            headers: {
                "Authorization": token
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error);
        }

        console.log("User is authenticated:", data);
    } catch (error) {
        console.error("Authentication failed:", error);
        localStorage.removeItem("token"); // Remove invalid token
        window.location.href = "login.html"; // Redirect to login
    }
});

// Logout function
function logout() {
    localStorage.removeItem("token"); // Remove token
    window.location.href = "login.html"; // Redirect to login page
}

document.getElementById("logoutBtn")?.addEventListener("click", logout);
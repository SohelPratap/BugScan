document.addEventListener("DOMContentLoaded", async function () {
    const token = localStorage.getItem("token");
    const loggedIn = localStorage.getItem("loggedIn");

    console.log("🔍 Checking auth on reload...");
    console.log("loggedIn:", loggedIn);
    console.log("Stored Token:", token);

    if (!loggedIn || loggedIn !== "true" || !token) {
        console.warn("🚨 User not logged in. Redirecting to login.");
        window.location.href = "login.html";
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/auth/verify`, {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
        });

        const data = await response.json();
        console.log("🔹 Auth Check Response:", data);

        if (!response.ok) {
            console.warn("🚨 Token invalid. Redirecting to login.");
            localStorage.removeItem("token");
            localStorage.removeItem("userName");
            localStorage.removeItem("userEmail");
            localStorage.removeItem("userId");
            localStorage.removeItem("loggedIn");
            window.location.href = "login.html";
            return;
        }

        console.log("✅ User authentication confirmed on reload.");
    } catch (error) {
        console.error("❌ Auth check failed:", error);
        window.location.href = "login.html";
    }
});

// Logout function
function logout() {
    console.log("⚠️ Logout triggered! Clearing localStorage.");
    localStorage.removeItem("token"); // Remove token
    localStorage.removeItem("userName"); // Remove user name
    localStorage.removeItem("userEmail"); // Remove user email
    localStorage.removeItem("userId"); // Remove user id
    localStorage.removeItem("loggedIn"); // Remove loggedIn flag
    window.location.href = "login.html"; // Redirect to login page
}

document.getElementById("logoutBtn")?.addEventListener("click", function () {
    console.log("🔴 Logout button clicked!");
    logout();
});
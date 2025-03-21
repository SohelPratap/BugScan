document.addEventListener("DOMContentLoaded", function () {
    // Removed authentication check for now
});

// Logout function
function logout() {
    localStorage.removeItem("token"); // Remove token
    window.location.href = "login.html"; // Redirect to login page
}

document.getElementById("logoutBtn")?.addEventListener("click", logout);
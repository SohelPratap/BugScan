document.addEventListener("DOMContentLoaded", function () {
    checkAuth();
    loadUserInfo();
});

function checkAuth() {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("⚠️ You must login first!");
        window.location.href = "login.html";
        return false;
    }
    return true;
}

function loadUserInfo() {
    const userName = localStorage.getItem("userName");
    const userGreeting = document.getElementById("userGreeting");
    
    if (userGreeting && userName) {
        userGreeting.textContent = `Welcome, ${userName}!`;
    }
}

function logout() {
    if (confirm("Are you sure you want to logout?")) {
        API.logout();
        alert("✅ Logged out successfully!");
        window.location.href = "login.html";
    }
}

function toggleSidebar() {
    const sidebar = document.querySelector(".sidebar");
    sidebar.classList.toggle("show");
}

function navigate(page) {
    window.location.href = `${page}.html`;
}
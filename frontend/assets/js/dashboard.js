function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  sidebar.classList.toggle("show");
}

document.addEventListener("DOMContentLoaded", function () {
    const logoutButton = document.getElementById("logoutBtn");
    if (logoutButton) {
        logoutButton.addEventListener("click", function () {
            console.log("🔴 Logout button clicked from Dashboard!");
            logout();
        });
    } else {
        console.error("❌ Logout button not found!");
    }
});

function toggleProfileDropdown() {
    const dropdown = document.getElementById("profileDropdown");
    dropdown.classList.toggle("show");
}

function openProfileSettings() {
    window.location.href = "profile.html"; // Redirect to profile settings page
}

function logout() {
    console.log("⚠️ Logout triggered from Dashboard! Clearing localStorage.");
    localStorage.removeItem("token"); // Remove token
    localStorage.removeItem("userName"); // Remove user name
    localStorage.removeItem("userEmail"); // Remove user email
    localStorage.removeItem("loggedIn"); // Remove loggedIn flag
    window.location.href = "login.html"; // Redirect to login page
}

// Close dropdown if clicked outside
document.addEventListener("click", function (event) {
    const dropdown = document.getElementById("profileDropdown");
    const profileContainer = document.querySelector(".profile-container");

    if (!profileContainer.contains(event.target)) {
        dropdown.classList.remove("show");
    }
});

document.addEventListener("DOMContentLoaded", async function () {
    console.log("loggedIn flag:", localStorage.getItem("loggedIn"));
    console.log("Stored Token:", localStorage.getItem("token"));
    console.log("🔍 Checking token validity...");
    const token = localStorage.getItem("token");

    if (!token) {
        console.warn("🚨 No token found.");
        return;
    }

    try {
        const response = await fetch("http://localhost:5001/auth/verify", {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
        });

        const data = await response.json();
        console.log("🔹 Full API Response from /auth/verify:", data);

        if (!response.ok) {
            console.warn("🚨 Token invalid, but NOT clearing localStorage immediately.");
            return;
        }

        // Ensure user data exists before updating profile
        if (data.user && data.user.name && data.user.email) {
            localStorage.setItem("loggedIn", "true");
            document.getElementById("profile-name").textContent = data.user.name;
            document.getElementById("profile-email").textContent = data.user.email;
            console.log("✅ User authenticated. Dashboard loaded.");
        } else {
            console.error("❌ User data is missing in API response:", data);
        }
    } catch (error) {
        console.error("❌ Token verification failed:", error);
    }
});

function loadContent(section) {
  const content = document.getElementById("content");
  const header = document.getElementById("header");

  switch (section) {
    case "dashboard":
      header.textContent = "Dashboard";
      content.innerHTML = "<p>Welcome to the BugScan Dashboard.</p>";
      break;
    case "newScan":
      header.textContent = "New Scan";
      fetch("../pages/newScan.html")
        .then((response) => response.text())
        .then((html) => {
          content.innerHTML = html;
          const script = document.createElement("script");
          script.src = "../assets/js/newScan.js";
          document.body.appendChild(script);
        })
        .catch((error) => console.error("Error loading scan page:", error));
      break;
    case "reports":
      header.textContent = "Reports";
      fetch("../pages/reports.html")
        .then((response) => response.text())
        .then((html) => {
          content.innerHTML = html;
          const script = document.createElement("script");
          script.src = "../assets/js/reports.js";
          document.body.appendChild(script);
        })
        .catch((error) => console.error("Error loading reports page:", error));
      break;
    default:
      header.textContent = "Dashboard";
      content.innerHTML = "<p>Welcome! Select an item from the sidebar.</p>";
      break;
  }
}

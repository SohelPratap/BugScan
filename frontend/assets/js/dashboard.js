function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  sidebar.classList.toggle("show");
}

function toggleProfileDropdown() {
    const dropdown = document.getElementById("profileDropdown");
    dropdown.classList.toggle("show");
}

function openProfileSettings() {
    window.location.href = "profile.html"; // Redirect to profile settings page
}

function logout() {
    localStorage.removeItem("token"); // Remove token
    localStorage.removeItem("userName"); // Remove user name
    localStorage.removeItem("userEmail"); // Remove user email
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

document.addEventListener("DOMContentLoaded", function () {
    const userName = localStorage.getItem("userName");
    const userEmail = localStorage.getItem("userEmail");

    if (userName && userEmail) {
        document.getElementById("profile-name").textContent = userName;
        document.getElementById("profile-email").textContent = userEmail;
    }

    console.log("Dashboard loaded without token check.");
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

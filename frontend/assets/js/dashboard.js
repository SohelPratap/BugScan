function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  sidebar.classList.toggle("show");
}

function loadContent(section) {
  const content = document.getElementById("content");
  const header = document.getElementById("header");

  switch (section) {
    case "dashboard":
      header.textContent = "Dashboard";
      content.innerHTML = "<p>Welcome to the OneAudit Dashboard.</p>";
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

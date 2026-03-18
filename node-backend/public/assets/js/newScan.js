document.addEventListener("DOMContentLoaded", function () {

  function showLoadingScreen() {
    let overlay = document.getElementById("loadingOverlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "loadingOverlay";
      overlay.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:9999;";
      overlay.innerHTML = `<div class="loading-popup"><div class="spinner"></div><p>Scanning... Please wait.</p></div>`;
      document.body.appendChild(overlay);
    }
    overlay.style.display = "flex";
  }

  function hideLoadingScreen() {
    const overlay = document.getElementById("loadingOverlay");
    if (overlay) overlay.style.display = "none";
  }

  window.startScan = async function (type) {
    const url = document.getElementById("scanUrl").value.trim();
    if (!url) { alert("Please enter a URL."); return; }

    const token = localStorage.getItem("token");
    if (!token) { alert("You must be logged in."); window.location.href = "login.html"; return; }

    showLoadingScreen();

    try {
      // 1. Run scan via Python backend
      const scanResponse = await fetch("http://127.0.0.1:8000/scan/start/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, scanType: type }),
      });

      if (!scanResponse.ok) throw new Error("Scan failed.");
      const { data: scanData } = await scanResponse.json();
      scanData.scanType = type;

      // 2. Save to local MySQL via Node backend
      const saveResponse = await fetch("http://localhost:5001/scans/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ scanData }),
      });

      if (!saveResponse.ok) throw new Error("Failed to save scan.");

      alert("Scan complete and saved!");
      window.location.href = "reports.html";

    } catch (error) {
      console.error(error);
      alert("Error: " + error.message);
    } finally {
      hideLoadingScreen();
    }
  };
});
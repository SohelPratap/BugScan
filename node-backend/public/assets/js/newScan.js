document.addEventListener("DOMContentLoaded", function () {

  // Auth guard
  const token = localStorage.getItem("token");
  if (!token) {
    alert("⚠️ You must login first!");
    window.location.href = "login.html";
    return;
  }

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

  function severityClass(sev) {
    const map = { P0: "sev-p0", P1: "sev-p1", P2: "sev-p2", P3: "sev-p3", P4: "sev-p4" };
    return map[sev] || "sev-p4";
  }

  function renderResults(scanData) {
    const resultsDiv = document.getElementById("scan-results");
    const summaryDiv = document.getElementById("results-summary");
    const contentDiv = document.getElementById("results-content");

    const vulns = (scanData.ai_classification && scanData.ai_classification.results) || [];
    const counts = { P0: 0, P1: 0, P2: 0, P3: 0, P4: 0 };
    vulns.forEach(v => { if (counts[v.severity] !== undefined) counts[v.severity]++; });

    summaryDiv.innerHTML = `
      <div class="summary-badges">
        <span class="badge sev-p0">P0 Critical: ${counts.P0}</span>
        <span class="badge sev-p1">P1 High: ${counts.P1}</span>
        <span class="badge sev-p2">P2 Medium: ${counts.P2}</span>
        <span class="badge sev-p3">P3 Low: ${counts.P3}</span>
        <span class="badge sev-p4">P4 Info: ${counts.P4}</span>
      </div>
      <p class="scan-target">Target: <strong>${scanData.target || "N/A"}</strong> &mdash; ${vulns.length} issue(s) found</p>
    `;

    if (vulns.length === 0) {
      contentDiv.innerHTML = `<p class="no-vulns">✅ No vulnerabilities detected.</p>`;
    } else {
      contentDiv.innerHTML = vulns.map(v => `
        <div class="vuln-card ${severityClass(v.severity)}">
          <div class="vuln-header">
            <span class="vuln-severity badge ${severityClass(v.severity)}">${v.severity}</span>
            <span class="vuln-type">${v.type || "Unknown"}</span>
          </div>
          <p class="vuln-location"><i class="fas fa-map-marker-alt"></i> ${v.location || "N/A"}</p>
          <p class="vuln-mitigation"><i class="fas fa-wrench"></i> ${v.mitigation || "No mitigation provided."}</p>
        </div>
      `).join("");
    }

    resultsDiv.style.display = "block";
    resultsDiv.scrollIntoView({ behavior: "smooth" });
  }

  window.startScan = async function (type) {
    const url = document.getElementById("scanUrl").value.trim();
    if (!url) { alert("Please enter a URL."); return; }

    showLoadingScreen();

    try {
      // 1. Run scan via Python backend
      const scanResponse = await fetch("http://127.0.0.1:8000/scan/start/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, scanType: type }),
      });

      if (!scanResponse.ok) throw new Error("Scan failed. Please try again.");
      const responseJson = await scanResponse.json();
      const scanData = responseJson.data || responseJson;
      scanData.scanType = type;

      // 2. Render results in the page
      renderResults(scanData);

      // 3. Save to local backend
      try {
        const saveResponse = await fetch("http://localhost:5001/scans/save", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ scanData }),
        });
        if (!saveResponse.ok) console.warn("Could not save scan to database.");
        else console.log("✅ Scan saved to database.");
      } catch (saveErr) {
        console.warn("Save error (non-fatal):", saveErr.message);
      }

    } catch (error) {
      console.error(error);
      alert("Error: " + error.message);
    } finally {
      hideLoadingScreen();
    }
  };
});
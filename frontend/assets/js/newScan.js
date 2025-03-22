document.addEventListener("DOMContentLoaded", function () {
    const lightScanButton = document.querySelector("button[onclick=\"startScan('light')\"]");
    const deepScanButton = document.querySelector("button[onclick=\"startScan('deep')\"]");

    function showLoadingScreen() {
        console.log("🔄 Showing loading overlay..."); // Debugging log
        let loadingOverlay = document.getElementById("loadingOverlay");
        if (!loadingOverlay) {
            loadingOverlay = document.createElement("div");
            loadingOverlay.id = "loadingOverlay";
            loadingOverlay.innerHTML = `
                <div class="loading-popup">
                    <div class="spinner"></div>
                    <p>Scanning in progress... Please wait.</p>
                </div>
            `;
            document.body.appendChild(loadingOverlay);
        }
        // Ensure visibility and proper styling
        loadingOverlay.style.display = "flex";
        loadingOverlay.style.position = "fixed"; 
        loadingOverlay.style.top = "0";
        loadingOverlay.style.left = "0";
        loadingOverlay.style.width = "100vw";
        loadingOverlay.style.height = "100vh";
        loadingOverlay.style.background = "rgba(0,0,0,0.5)";
        loadingOverlay.style.zIndex = "9999";
        loadingOverlay.style.justifyContent = "center";
        loadingOverlay.style.alignItems = "center";
    }

    function hideLoadingScreen() {
        console.log("❌ Hiding loading overlay..."); // Debugging log
        const loadingOverlay = document.getElementById("loadingOverlay");
        if (loadingOverlay) {
            loadingOverlay.style.display = "none";
        }
    }

    async function startScan(type) {
        console.log("🔍 Start Scan Function Called"); // Debugging log
        const url = document.getElementById("scanUrl").value.trim();
        if (!url) {
            alert("Please enter a valid URL.");
            return;
        }

        showLoadingScreen(); // Show loading popup

        try {
            const response = await fetch("http://127.0.0.1:8000/scan/start/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: url, scanType: type }),
            });

            if (!response.ok) {
                throw new Error("Scan failed. Please try again.");
            }

            const data = await response.json();
            console.log("✅ Scan Response:", data);

            alert(`Scan completed for ${url}`);
            alert("Saving scan results...");

            // Send scan data to backend for saving
            await saveScanToBackend(data);

        } catch (error) {
            console.error("❌ Scan Error:", error);
            alert("An error occurred during scanning.");
        } finally {
            hideLoadingScreen(); // Hide loading popup
        }
    }

    if (lightScanButton) lightScanButton.addEventListener("click", () => startScan("light"));
    if (deepScanButton) deepScanButton.addEventListener("click", () => startScan("deep"));
});
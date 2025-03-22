document.addEventListener("DOMContentLoaded", function () {
    const lightScanButton = document.querySelector("button[onclick=\"startScan('light')\"]");
    const deepScanButton = document.querySelector("button[onclick=\"startScan('deep')\"]");

    function showLoadingScreen() {
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
    }

    function hideLoadingScreen() {
        const loadingOverlay = document.getElementById("loadingOverlay");
        if (loadingOverlay) {
            document.body.removeChild(loadingOverlay);
        }
    }

    async function startScan(type) {
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

        async function saveScanToBackend(scanData) {
            const user = JSON.parse(localStorage.getItem("user"));
            if (!user || !user.email) {
                console.warn("🚨 No user found. Login required.");
                alert("You need to log in to save your scan.");
                return;
            }

            const email = user.email;

            try {
                // Send scan data to backend for saving in Supabase
                const response = await fetch("http://127.0.0.1:5001/scan/save", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${localStorage.getItem("token")}` // Authorization header
                    },
                    body: JSON.stringify({
                        scanData: scanData, // Sending scan data as is
                        email: email
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    alert("Scan successfully saved to the database!");
                    // Redirection logic removed: user stays on the same page.
                } else {
                    alert("Error saving scan: " + data.error);
                }
            } catch (error) {
                console.error("❌ Error saving scan:", error);
                alert("Failed to save scan. Try again.");
            }
        }

    // Attach event listeners
    if (lightScanButton) lightScanButton.addEventListener("click", () => startScan("light"));
    if (deepScanButton) deepScanButton.addEventListener("click", () => startScan("deep"));
});
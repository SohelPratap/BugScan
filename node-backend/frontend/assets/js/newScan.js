import { createClient } from "@supabase/supabase-js";
require('dotenv').config({ path: '../../../../node-backend/.env' });

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase URL and/or anonymous key are missing. Check your .env file.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

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

    window.startScan = async function (type) { 
        console.log("🔍 Start Scan Function Called"); 
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

            const scanData = await response.json();
            console.log("✅ Scan Response:", scanData);

            alert(`Scan completed for ${url}`);
            alert("Saving scan results...");

            await insertScan(scanData);

        } catch (error) {
            console.error("❌ Scan Error:", error);
            alert("An error occurred during scanning.");
        } finally {
            hideLoadingScreen(); // Hide loading popup
        }
    };

    // Function to insert scan data into Supabase
    async function insertScan(scanData) {
        console.log("💾 Saving scan data to database...");

        const user = JSON.parse(localStorage.getItem("user"));
        if (!user || !user.email) {
            console.warn("🚨 No user found. Login required.");
            alert("You need to log in to save your scan.");
            return;
        }

        const email = user.email;

        try {
            // Fetch the latest scan number
            const { data: lastScan, error: scanError } = await supabase
                .from("scans")
                .select("scan_number")
                .eq("email", email)
                .order("scan_number", { ascending: false })
                .limit(1);

            if (scanError) throw scanError;

            let scanNumber = lastScan && lastScan.length ? lastScan[0].scan_number + 1 : 1;

            // Insert scan data into Supabase
            const { data, error } = await supabase
                .from("scans")
                .insert([
                    {
                        email: email,
                        scan_number: scanNumber,
                        scan: scanData, // Save JSON scan data
                        scan_date: new Date().toISOString(),
                    },
                ]);

            if (error) throw error;

            console.log("✅ Scan saved successfully:", data);
            alert("Scan successfully saved to the database!");

        } catch (error) {
            console.error("❌ Error saving scan:", error);
            alert("Failed to save scan. Try again.");
        }
    }

    if (lightScanButton) lightScanButton.addEventListener("click", () => startScan("light"));
    if (deepScanButton) deepScanButton.addEventListener("click", () => startScan("deep"));
});
document.addEventListener("DOMContentLoaded", function () {
    const lightScanButton = document.querySelector("button[onclick=\"startScan('light')\"]");
    const deepScanButton = document.querySelector("button[onclick=\"startScan('deep')\"]");

    function startScan(type) {
        const url = document.getElementById("scanUrl").value.trim();
        if (!url) {
            alert("Please enter a valid URL.");
            return;
        }

        fetch("http://127.0.0.1:8000/scan/start/", {  // Replace with actual backend API
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: url, scanType: type }),
        })
        .then(response => response.json())
        .then(data => {
            console.log("Scan Response:", data);
            alert(`Scan started for ${url}: ${data.message}`);
        })
        .catch(error => console.error("Error:", error));
    }

    // Attach event listeners
    if (lightScanButton) lightScanButton.addEventListener("click", () => startScan("light"));
    if (deepScanButton) deepScanButton.addEventListener("click", () => startScan("deep"));
});
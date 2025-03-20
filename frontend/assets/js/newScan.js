

document.addEventListener("DOMContentLoaded", function () {
    const lightScanButton = document.querySelector("button[onclick=\"startScan('light')\"]");
    const deepScanButton = document.querySelector("button[onclick=\"startScan('deep')\"]");

    function startScan(type) {
        const url = document.getElementById("scanUrl").value.trim();
        if (!url) {
            alert("Please enter a valid URL.");
            return;
        }

        alert(`${type === "light" ? "Light" : "Deep"} scan started for ${url}`);
        
        // Example: Sending URL to backend (Modify API endpoint as needed)
        fetch("http://localhost:5000/api/scan", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url, scanType: type }),
        })
        .then(response => response.json())
        .then(data => console.log("Scan Response:", data))
        .catch(error => console.error("Error:", error));
    }

    // Attach event listeners
    if (lightScanButton) lightScanButton.addEventListener("click", () => startScan("light"));
    if (deepScanButton) deepScanButton.addEventListener("click", () => startScan("deep"));
});
document.addEventListener("DOMContentLoaded", function () {
    fetchReports();
});

function fetchReports() {
    fetch("http://127.0.0.1:8000/reports")  // Replace with actual API endpoint
        .then(response => response.json())
        .then(data => displayReports(data))
        .catch(error => console.error("Error fetching reports:", error));
}

function displayReports(reports) {
    const tableBody = document.getElementById("report-table-body");
    tableBody.innerHTML = ""; // Clear existing data

    reports.forEach(report => {
        const row = document.createElement("tr");

        ["P0", "P1", "P2", "P3", "P4"].forEach(severity => {
            const cell = document.createElement("td");
            cell.textContent = report[severity] ? report[severity] : "N/A";
            row.appendChild(cell);
        });

        tableBody.appendChild(row);
    });
}

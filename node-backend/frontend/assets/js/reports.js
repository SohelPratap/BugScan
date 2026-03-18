document.addEventListener("DOMContentLoaded", function () {
  const token = localStorage.getItem("token");
  if (!token) { window.location.href = "login.html"; return; }
  fetchReports(token);
});

async function fetchReports(token) {
  try {
    const response = await fetch("http://localhost:5001/scans/reports", {
      headers: { "Authorization": `Bearer ${token}` }
    });

    if (!response.ok) throw new Error("Failed to fetch reports");

    const scans = await response.json();
    displayReports(scans);
  } catch (error) {
    console.error("Error fetching reports:", error);
    document.getElementById("report-table-body").innerHTML =
      `<tr><td colspan="6">Failed to load reports.</td></tr>`;
  }
}

function displayReports(scans) {
  const tableBody = document.getElementById("report-table-body");
  tableBody.innerHTML = "";

  if (!scans.length) {
    tableBody.innerHTML = `<tr><td colspan="6">No scans yet. Run your first scan!</td></tr>`;
    return;
  }

  scans.forEach(scan => {
    const vulns = scan.vulnerabilities || [];
    const counts = { P0: 0, P1: 0, P2: 0, P3: 0, P4: 0 };
    vulns.forEach(v => { if (counts[v.severity] !== undefined) counts[v.severity]++; });

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${scan.target_url || "N/A"}</td>
      <td>${new Date(scan.created_at).toLocaleDateString()}</td>
      <td>${counts.P0}</td>
      <td>${counts.P1}</td>
      <td>${counts.P2}</td>
      <td>${counts.P3 + counts.P4}</td>
    `;
    tableBody.appendChild(row);
  });
}
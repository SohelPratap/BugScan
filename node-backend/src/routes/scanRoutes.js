const express = require("express");
const db = require("../config/database");
const verifyToken = require("../middleware/authMiddleware");

const router = express.Router();

// Save a scan result
router.post("/save", verifyToken, async (req, res) => {
  const { scanData } = req.body;
  const userId = req.user.id;

  if (!scanData) {
    return res.status(400).json({ error: "Invalid scan data" });
  }

  try {
    const target = scanData.target || "unknown";
    const aiResults = (scanData.ai_classification && scanData.ai_classification.results) || [];

    // Count severities
    const severityCount = aiResults.length;

    // Insert the scan
    const [result] = await db.query(
      `INSERT INTO scans (user_id, scan_name, target_url, scan_type, status, severity_count)
       VALUES (?, ?, ?, ?, 'completed', ?)`,
      [userId, `Scan - ${target}`, target, scanData.scanType || "light", severityCount]
    );

    const scanId = result.insertId;

    // Insert each vulnerability
    for (const vuln of aiResults) {
      await db.query(
        `INSERT INTO vulnerabilities (scan_id, title, severity, description)
         VALUES (?, ?, ?, ?)`,
        [scanId, vuln.type || "Unknown", vuln.severity || "P4", vuln.location || ""]
      );
    }

    res.json({ message: "Scan saved successfully", scanId });
  } catch (error) {
    console.error("Save scan error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get all scans for the logged-in user
router.get("/reports", verifyToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const [scans] = await db.query(
      `SELECT s.*, 
        (SELECT JSON_ARRAYAGG(
          JSON_OBJECT('severity', v.severity, 'title', v.title, 'description', v.description)
        ) FROM vulnerabilities v WHERE v.scan_id = s.id) AS vulnerabilities
       FROM scans s
       WHERE s.user_id = ?
       ORDER BY s.created_at DESC`,
      [userId]
    );

    res.json(scans);
  } catch (error) {
    console.error("Fetch reports error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get a single scan by ID
router.get("/reports/:id", verifyToken, async (req, res) => {
  const userId = req.user.id;
  const scanId = req.params.id;

  try {
    const [scans] = await db.query(
      "SELECT * FROM scans WHERE id = ? AND user_id = ?",
      [scanId, userId]
    );

    if (scans.length === 0) {
      return res.status(404).json({ error: "Scan not found" });
    }

    const [vulns] = await db.query(
      "SELECT * FROM vulnerabilities WHERE scan_id = ?",
      [scanId]
    );

    res.json({ ...scans[0], vulnerabilities: vulns });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
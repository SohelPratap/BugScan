const express = require("express");
const supabase = require("../config/supabaseClient");
const verifyToken = require("../middleware/authMiddleware");

const router = express.Router();

// Route to save scan data in Supabase (no authentication required)
router.post("/save", async (req, res) => {
    const { scanData } = req.body;
    const userEmail = req.user.email;

    if (!scanData || !scanData.ai_classification) {
        console.error("❌ Invalid scan data received:", req.body);
        return res.status(400).json({ error: "Invalid scan data" });
    }

    try {
        console.log("📩 Saving scan for:", userEmail);

        // Fetch the last scan_number for this user
        const { data: lastScan, error: countError } = await supabase
            .from("scans")
            .select("scan_number")
            .eq("email", userEmail)
            .order("scan_number", { ascending: false })
            .limit(1);

        if (countError) throw countError;

        let scanNumber = lastScan && lastScan.length ? lastScan[0].scan_number + 1 : 1;

        // Insert new scan into Supabase
        const { error } = await supabase
            .from("scans")
            .insert([{
                email: userEmail,
                scan_number: scanNumber,
                scan: scanData, // Store scan data in JSONB format
                scan_date: new Date().toISOString(),
            }]);

        if (error) throw error;

        console.log("✅ Scan saved successfully!");
        res.json({ message: "Scan saved successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// Fetch scans for the reports page
router.get("/reports", verifyToken, async (req, res) => {
    const userEmail = req.user.email;

    try {
        const { data: scans, error } = await supabase
            .from("scans")
            .select("*")
            .eq("email", userEmail)
            .order("scan_date", { ascending: false });

        if (error) throw error;

        res.json(scans);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
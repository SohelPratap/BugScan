const jwt = require("jsonwebtoken");
const supabase = require("../config/supabaseClient");

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

async function verifyToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    console.log("🔍 Raw Authorization Header:", authHeader);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        console.error("❌ Invalid Authorization header format.");
        return res.status(401).json({ error: "Invalid token format" });
    }

    const token = authHeader.split(" ")[1];
    console.log("🔑 Extracted Token:", token);

    if (!token) {
        console.error("❌ No token provided in request.");
        return res.status(401).json({ error: "Access denied. No token provided." });
    }

    try {
        console.log("🔑 Verifying token...");
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log("✅ Decoded token:", decoded);

        // Fetch full user details from Supabase
        const { data: user, error } = await supabase
            .from("users")
            .select("id, name, email")
            .eq("id", decoded.id)
            .single();

        console.log("🔍 Supabase Query Result:", user);
        if (error) console.error("❌ Supabase Query Error:", error.message);

        if (error || !user) {
            console.error("❌ User not found in database.");
            return res.status(401).json({ error: "User not found" });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("❌ Token verification failed:", error.message);
        res.status(401).json({ error: "Invalid or expired token" });
    }
}

module.exports = verifyToken;
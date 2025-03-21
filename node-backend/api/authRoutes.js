const express = require("express");
const supabase = require("../config/supabaseClient");
const bcrypt = require("bcryptjs");
// Removed uuidv4 as Supabase auto-generates id

const router = express.Router();

// ** Register User **
router.post("/register", async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert user into Supabase
        const { data, error } = await supabase
            .from("users")
            .insert([{ name, email, password_hash: hashedPassword }]);

        if (error) throw error;

        res.json({ message: "User registered successfully!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"; // Store in .env
const verifyToken = require("../middleware/authMiddleware");

// ** User Login **
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email and password required" });
    }

    try {
        // Fetch user from Supabase (replace `uuid` with `id`)
        const { data: user, error } = await supabase
            .from("users")
            .select("id, name, email, password_hash")
            .eq("email", email)
            .single();

        if (error || !user) {
            return res.status(400).json({ error: "Invalid email or password" });
        }

        // Compare hashed password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ error: "Invalid email or password" });
        }

        // Generate JWT token (replace `uuid` with `id`)
        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });

        res.json({ message: "Login successful!", token, user: { id: user.id, name: user.name, email: user.email } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get("/verify", verifyToken, (req, res) => {
    const token = req.headers["authorization"]?.split(" ")[1];
    console.log("🔍 Received Token in /auth/verify:", token);

    if (!req.user) {
        console.error("❌ No user found in request.");
        return res.status(401).json({ error: "User not authenticated" });
    }
    res.json({ message: "Token is valid", user: req.user });
});

module.exports = router;

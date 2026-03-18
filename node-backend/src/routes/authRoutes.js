const express = require("express");
const db = require("../config/database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const verifyToken = require("../middleware/authMiddleware");
const fallback = require("../config/fallbackUserStore");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "bugscan_dev_secret";

// ** Register User **
router.post("/register", async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: "All fields are required" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    try {
        // Check if user already exists
        const [existingUser] = await db.query(
            "SELECT id FROM users WHERE email = ?",
            [email]
        );

        if (existingUser.length > 0) {
            return res.status(400).json({ error: "User already exists" });
        }

        // Insert user into database
        await db.query(
            "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
            [name, email, hashedPassword]
        );

        res.status(201).json({ message: "User registered successfully!" });
    } catch (dbError) {
        console.warn("MySQL unavailable, using local store:", dbError.message);
        try {
            if (fallback.findByEmail(email)) {
                return res.status(400).json({ error: "User already exists" });
            }
            fallback.create({ name, email, password_hash: hashedPassword });
            res.status(201).json({ message: "User registered successfully!" });
        } catch (error) {
            console.error("Registration error:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }
});

// ** User Login **
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email and password required" });
    }

    let user = null;

    try {
        // Fetch user from database
        const [users] = await db.query(
            "SELECT id, name, email, password_hash FROM users WHERE email = ?",
            [email]
        );

        if (users.length === 0) {
            return res.status(400).json({ error: "Invalid email or password" });
        }
        user = users[0];
    } catch (dbError) {
        console.warn("MySQL unavailable, using local store:", dbError.message);
        user = fallback.findByEmail(email);
        if (!user) {
            return res.status(400).json({ error: "Invalid email or password" });
        }
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
        return res.status(400).json({ error: "Invalid email or password" });
    }

    // Generate JWT token
    const token = jwt.sign(
        { id: user.id, email: user.email, name: user.name },
        JWT_SECRET,
        { expiresIn: "7d" }
    );

    res.json({
        message: "Login successful!",
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email
        }
    });
});

// ** Verify Token **
router.get("/verify", verifyToken, (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: "User not authenticated" });
    }
    res.json({
        message: "Token is valid",
        user: req.user
    });
});

// ** User Logout **
router.post("/logout", (req, res) => {
    res.json({ message: "Logout successful!" });
});

module.exports = router;

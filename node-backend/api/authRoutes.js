const express = require("express");
const db = require("../config/database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const verifyToken = require("../middleware/authMiddleware");
const fallbackUserStore = require("../config/fallbackUserStore");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

const isConnectionError = (error) => {
    return ["ECONNREFUSED", "ER_ACCESS_DENIED_ERROR", "ER_BAD_DB_ERROR"].includes(error?.code);
};

// ** Register User **
router.post("/register", async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        // Check if user already exists
        const [existingUser] = await db.query(
            "SELECT id FROM users WHERE email = ?",
            [email]
        );

        if (existingUser.length > 0) {
            return res.status(400).json({ error: "User already exists" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert user into database
        await db.query(
            "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
            [name, email, hashedPassword]
        );

        res.status(201).json({ message: "User registered successfully!" });
    } catch (error) {
        if (isConnectionError(error)) {
            try {
                const existingUser = await fallbackUserStore.findUserByEmail(email);
                if (existingUser) {
                    return res.status(400).json({ error: "User already exists" });
                }

                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(password, salt);

                await fallbackUserStore.insertUser({
                    name,
                    email,
                    password_hash: hashedPassword
                });

                return res.status(201).json({
                    message: "User registered successfully! (local storage)",
                });
            } catch (fallbackError) {
                console.error("Fallback registration error:", fallbackError);
                return res.status(500).json({ error: "Registration currently unavailable" });
            }
        }

        console.error("Registration error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// ** User Login **
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email and password required" });
    }

    try {
        // Fetch user from database
        const [users] = await db.query(
            "SELECT id, name, email, password_hash FROM users WHERE email = ?",
            [email]
        );

        if (users.length === 0) {
            return res.status(400).json({ error: "Invalid email or password" });
        }

        const user = users[0];

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
    } catch (error) {
        if (isConnectionError(error)) {
            try {
                const fallbackUser = await fallbackUserStore.findUserByEmail(email);
                if (!fallbackUser) {
                    return res.status(400).json({ error: "Invalid email or password" });
                }

                const isMatch = await bcrypt.compare(password, fallbackUser.password_hash);
                if (!isMatch) {
                    return res.status(400).json({ error: "Invalid email or password" });
                }

                const token = jwt.sign(
                    { id: fallbackUser.id, email: fallbackUser.email, name: fallbackUser.name },
                    JWT_SECRET,
                    { expiresIn: "7d" }
                );

                return res.json({
                    message: "Login successful!",
                    token,
                    user: {
                        id: fallbackUser.id,
                        name: fallbackUser.name,
                        email: fallbackUser.email
                    }
                });
            } catch (fallbackError) {
                console.error("Fallback login error:", fallbackError);
                return res.status(500).json({ error: "Login currently unavailable" });
            }
        }

        console.error("Login error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
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

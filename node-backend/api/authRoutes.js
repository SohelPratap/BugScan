const express = require("express");
const db = require("../config/database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const verifyToken = require("../middleware/authMiddleware");
const fallbackUserStore = require("../config/fallbackUserStore");
const CONNECTION_ERROR_CODES = require("../config/dbErrorCodes");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

const isRecoverableDatabaseError = (error) => CONNECTION_ERROR_CODES.includes(error?.code);

const logAccessDeniedFallback = (error) => {
    if (error?.code === "ER_ACCESS_DENIED_ERROR") {
        console.warn("Database credentials were rejected; using fallback storage.");
    }
};

const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
};

// ** Register User **
router.post("/register", async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: "All fields are required" });
    }

    // Hash once for both primary and fallback paths
    const hashedPassword = await hashPassword(password);

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
    } catch (error) {
        console.error("Registration database error:", error);

        if (isRecoverableDatabaseError(error)) {
            logAccessDeniedFallback(error);
            try {
                const existingUser = await fallbackUserStore.findUserByEmail(email);
                if (existingUser) {
                    return res.status(400).json({ error: "User already exists" });
                }

                await fallbackUserStore.insertUser({
                    name,
                    email,
                    password_hash: hashedPassword
                });

                return res.status(201).json({
                    message: "User registered successfully!",
                });
            } catch (fallbackError) {
                console.error("Fallback registration error:", fallbackError);
                return res.status(500).json({ error: "Registration currently unavailable" });
            }
        }

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
        console.error("Login database error:", error);

        if (isRecoverableDatabaseError(error)) {
            logAccessDeniedFallback(error);
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

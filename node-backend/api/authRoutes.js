const express = require("express");
const supabase = require("../config/supabaseClient");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");

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

        // Generate unique user ID
        const userId = uuidv4();

        // Insert user into Supabase
        const { data, error } = await supabase
            .from("users")
            .insert([{ uuid: userId, name, email, password_hash: hashedPassword }]);

        if (error) throw error;

        res.json({ message: "User registered successfully!", userId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.JWT_SECRET || "your-secret-key"; // Store in .env

// ** User Login **
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email and password required" });
    }

    try {
        // Fetch user from Supabase
        const { data: user, error } = await supabase
            .from("users")
            .select("uuid, name, email, password_hash")
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

        // Generate JWT token
        const token = jwt.sign({ uuid: user.uuid, email: user.email }, SECRET_KEY, { expiresIn: "7d" });

        res.json({ message: "Login successful!", token, user: { uuid: user.uuid, name: user.name, email: user.email } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


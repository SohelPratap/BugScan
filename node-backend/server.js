import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config(); // Load environment variables

const app = express();
app.use(cors());
app.use(express.json());

// Supabase Client Setup
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// ✅ User Signup
app.post("/signup", async (req, res) => {
    const { email, password } = req.body;
    
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    });

    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: "Signup successful!", user: data.user });
});

// ✅ User Login
app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) return res.status(401).json({ error: error.message });
    res.json({ message: "Login successful!", token: data.session.access_token });
});

// ✅ Start Server and Log Used Port
const server = app.listen(process.env.PORT || 5000, () => {
    console.log(`✅ Server running on port ${server.address().port}`);
}).on("error", (err) => {
    if (err.code === "EADDRINUSE") {
        console.log(`⚠️ Port ${process.env.PORT || 5000} is in use. Trying another port...`);
        const newServer = app.listen(0, () => {
            console.log(`✅ Server started on port ${newServer.address().port}`);
        });
    } else {
        console.error("❌ Server error:", err);
    }
});
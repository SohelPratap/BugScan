const express = require("express");
const cors = require("cors");
const path = require("path");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const app = express();

app.use(cors({
  origin: ["http://localhost:5001", "http://127.0.0.1:5001", "http://127.0.0.1:5500"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.use(express.json());
app.options("*", cors());

// Rate limiters
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests. Please try again later." }
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many authentication attempts. Please try again later." }
});

// Serve frontend static files
app.use(express.static(path.join(__dirname, "public")));

// API Routes
const authRoutes = require("./src/routes/authRoutes");
const scanRoutes = require("./src/routes/scanRoutes");
app.use("/auth", authLimiter, authRoutes);
app.use("/scans", generalLimiter, scanRoutes);

// Landing page
app.get("/", generalLimiter, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "pages", "index.html"));
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
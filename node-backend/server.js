const express = require("express");
const cors = require("cors");
const path = require("path");
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

// Serve frontend static files
app.use(express.static(path.join(__dirname, "frontend")));

// API Routes
const authRoutes = require("./api/authRoutes");
const scanRoutes = require("./api/scanRoutes");
app.use("/auth", authRoutes);
app.use("/scans", scanRoutes);

// Landing page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "pages", "index.html"));
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
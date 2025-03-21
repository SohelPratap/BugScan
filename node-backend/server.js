const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Configure CORS properly
app.use(cors({
    origin: ["http://localhost:5500", "http://127.0.0.1:5500", "http://127.0.0.1:3000"], // Allow multiple frontend origins
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 200 // Ensure 200 status for OPTIONS requests
}));

app.use(express.json());

// Handle preflight requests for CORS
app.options("*", cors());

const authRoutes = require("./api/authRoutes");
app.use("/auth", authRoutes);

const PORT = process.env.PORT || 5001; // Updated the port to 5001

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
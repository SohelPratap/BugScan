const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Re-enable CORS configuration
app.use(cors({
    origin: "http://127.0.0.1:3000", // Allow your frontend domain
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true // Allow credentials if needed
}));

app.use(express.json());

// Re-enable preflight CORS handling
app.options("*", cors());

// Import routes
const authRoutes = require("./api/authRoutes");
const scanRoutes = require("./api/scanRoutes"); // Import the scan routes

// Use routes
app.use("/auth", authRoutes);
app.use("/scan", scanRoutes); // Use scan routes under "/scan" path


const PORT = process.env.PORT || 5001; // Updated the port to 5001

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.JWT_SECRET || "your-secret-key";

function verifyToken(req, res, next) {
    const token = req.headers["authorization"];

    if (!token) {
        return res.status(401).json({ error: "Access denied. No token provided." });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ error: "Invalid or expired token" });
    }
}

module.exports = verifyToken;
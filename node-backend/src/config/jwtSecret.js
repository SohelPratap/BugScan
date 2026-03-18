/**
 * Provides the JWT secret shared by authRoutes and authMiddleware.
 * If JWT_SECRET is not set in .env, a per-session random secret is generated
 * with a console warning. All tokens become invalid on server restart in that case.
 */
const crypto = require("crypto");

let secret = process.env.JWT_SECRET;
if (!secret) {
    secret = crypto.randomBytes(32).toString("hex");
    console.warn(
        "⚠️  JWT_SECRET is not set in .env. A temporary per-session secret has been generated." +
        " All tokens will be invalidated on server restart. Set JWT_SECRET in .env for stable sessions."
    );
}

module.exports = secret;

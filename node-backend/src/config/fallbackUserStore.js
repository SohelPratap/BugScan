/**
 * Fallback in-memory/file user store used when MySQL is unavailable.
 * Users are persisted to database/local-users.json so they survive restarts.
 */
const fs = require("fs");
const path = require("path");

const STORE_PATH = path.join(__dirname, "../../database/local-users.json");

function readStore() {
    try {
        return JSON.parse(fs.readFileSync(STORE_PATH, "utf8"));
    } catch {
        return [];
    }
}

function writeStore(users) {
    fs.writeFileSync(STORE_PATH, JSON.stringify(users, null, 2), "utf8");
}

const fallbackUserStore = {
    findByEmail(email) {
        const users = readStore();
        return users.find(u => u.email === email) || null;
    },

    findById(id) {
        const users = readStore();
        return users.find(u => u.id === id) || null;
    },

    create({ name, email, password_hash }) {
        const users = readStore();
        // Combine timestamp with a random suffix to prevent collisions
        const id = Date.now() * 1000 + Math.floor(Math.random() * 1000);
        const newUser = {
            id,
            name,
            email,
            password_hash,
            created_at: new Date().toISOString()
        };
        users.push(newUser);
        writeStore(users);
        return newUser;
    }
};

module.exports = fallbackUserStore;

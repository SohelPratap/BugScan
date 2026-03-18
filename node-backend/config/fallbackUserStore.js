const fs = require("fs/promises");
const path = require("path");

const STORE_PATH = path.join(__dirname, "../database/local-users.json");

async function readUsers() {
    try {
        const data = await fs.readFile(STORE_PATH, "utf-8");
        const parsed = JSON.parse(data);
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        if (error.code === "ENOENT") {
            return [];
        }
        throw error;
    }
}

async function writeUsers(users) {
    await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
    await fs.writeFile(STORE_PATH, JSON.stringify(users, null, 2), "utf-8");
}

async function findUserByEmail(email) {
    const users = await readUsers();
    return users.find(
        (user) => user.email && user.email.toLowerCase() === email.toLowerCase()
    );
}

async function insertUser(user) {
    const users = await readUsers();
    const nextId = users.reduce((max, current) => Math.max(max, current.id || 0), 0) + 1;
    const record = { ...user, id: nextId };
    users.push(record);
    await writeUsers(users);
    return record;
}

module.exports = {
    findUserByEmail,
    insertUser
};

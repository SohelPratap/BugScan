const fs = require("fs/promises");
const path = require("path");

const STORE_PATH = path.join(__dirname, "../database/local-users.json");
let writeQueue = Promise.resolve();

async function readUsers() {
    try {
        const data = await fs.readFile(STORE_PATH, "utf-8");
        let parsed;
        try {
            parsed = JSON.parse(data);
        } catch (parseError) {
            console.warn("⚠️ Fallback user store JSON invalid, resetting file.", parseError);
            return [];
        }
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

// Serialize write operations to avoid race conditions
function enqueueWrite(operation) {
    const next = writeQueue.then(operation, operation);
    // Avoid keeping the queue in a rejected state
    writeQueue = next.catch(() => {});
    return next;
}

async function findUserByEmail(email) {
    // Ensure pending writes finish before reading
    await writeQueue;
    const users = await readUsers();
    return users.find(
        (user) => user.email && user.email.toLowerCase() === email.toLowerCase()
    );
}

async function insertUser(user) {
    return enqueueWrite(async () => {
        const users = await readUsers();
        const nextId = users.reduce((max, current) => Math.max(max, current.id || 0), 0) + 1;
        const record = { ...user, id: nextId };
        users.push(record);
        await writeUsers(users);
        return record;
    });
}

module.exports = {
    findUserByEmail,
    insertUser
};

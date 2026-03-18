const fs = require("fs/promises");
const path = require("path");
const { randomUUID } = require("crypto");

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
    try {
        await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
        await fs.writeFile(STORE_PATH, JSON.stringify(users, null, 2), "utf-8");
    } catch (error) {
        throw new Error(`Unable to persist fallback users: ${error.message}`);
    }
}

// Serialize operations to avoid race conditions
function enqueueOperation(operation) {
    const next = writeQueue.then(() => operation());
    // Avoid keeping the queue in a rejected state while preserving the original resolution
    writeQueue = next.catch(() => {});
    return next;
}

async function findUserByEmail(email) {
    // Reads are queued to make sure they see the latest committed write.
    return enqueueOperation(async () => {
        const users = await readUsers();
        return users.find(
            (user) => user.email && user.email.toLowerCase() === email.toLowerCase()
        );
    });
}

async function insertUser(user) {
    return enqueueOperation(async () => {
        const users = await readUsers();
        const record = { ...user, id: randomUUID() };
        users.push(record);
        await writeUsers(users);
        return record;
    });
}

module.exports = {
    findUserByEmail,
    insertUser
};

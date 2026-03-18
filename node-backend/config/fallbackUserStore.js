const fs = require("fs/promises");
const path = require("path");

const STORE_PATH = path.join(__dirname, "../database/local-users.json");
let writeQueue = Promise.resolve();

const defaultStore = { nextId: 1, usersByEmail: {} };

async function readStore() {
    try {
        const data = await fs.readFile(STORE_PATH, "utf-8");
        let parsed;
        try {
            parsed = JSON.parse(data);
        } catch (parseError) {
            console.warn("⚠️ Fallback user store JSON invalid, resetting file.", parseError);
            return { ...defaultStore };
        }
        if (!parsed || typeof parsed !== "object") {
            return { ...defaultStore };
        }
        return {
            nextId: Number.isInteger(parsed.nextId) ? parsed.nextId : 1,
            usersByEmail: parsed.usersByEmail && typeof parsed.usersByEmail === "object"
                ? parsed.usersByEmail
                : {}
        };
    } catch (error) {
        if (error.code === "ENOENT") {
            return { ...defaultStore };
        }
        throw error;
    }
}

async function writeStore(store) {
    const tempPath = `${STORE_PATH}.tmp`;
    try {
        await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
        const contents = JSON.stringify(store, null, 2);
        await fs.writeFile(tempPath, contents, "utf-8");
        await fs.rename(tempPath, STORE_PATH);
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
        const store = await readStore();
        return store.usersByEmail[email.toLowerCase()] || null;
    });
}

async function insertUser(user) {
    return enqueueOperation(async () => {
        const store = await readStore();
        const record = { ...user, id: store.nextId++ };
        store.usersByEmail[user.email.toLowerCase()] = record;
        await writeStore(store);
        return record;
    });
}

module.exports = {
    findUserByEmail,
    insertUser
};

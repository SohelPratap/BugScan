// Error codes that indicate the primary database connection is unavailable or unhealthy.
// Note: ER_ACCESS_DENIED_ERROR is included so the app can fall back gracefully when
// credentials are misconfigured during setup; primary storage is still preferred.
module.exports = [
    "ECONNREFUSED",
    "ER_ACCESS_DENIED_ERROR",
    "ER_BAD_DB_ERROR",
    "ETIMEDOUT",
    "ENOTFOUND",
    "PROTOCOL_CONNECTION_LOST",
    "ER_CON_COUNT_ERROR"
];

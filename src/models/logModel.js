const db = require('../db');

/**
 * Inserts a new request log into the database
 * @param {string} method - The HTTP method (e.g., GET, POST)
 * @param {string} url - The requested URL path
 * @param {number|null} userId - The ID of the authenticated user (null for guests)
 * @returns {Promise<number>} - The ID of the newly inserted log
 */
const createLog = async (method, url, userId = null) => {
    const query = `INSERT INTO logs (method, url, user_id) VALUES (?, ?, ?)`;
    const insertId = await db.executeInsert(query, [method, url, userId]);
    return insertId;
};

module.exports = {
    createLog
};

const db = require('../db');

const createSession = async (userId, token) => {
    const query = `INSERT INTO sessions (user_id, token) VALUES (?, ?)`;
    const insertId = await db.executeInsert(query, [userId, token]);
    return insertId;
};

const getSessionByToken = async (token) => {
    const query = `SELECT * FROM sessions WHERE token = ?`;
    const rows = await db.executeQuery(query, [token]);
    return rows.length > 0 ? rows[0] : null;
};

module.exports = {
    createSession,
    getSessionByToken
};

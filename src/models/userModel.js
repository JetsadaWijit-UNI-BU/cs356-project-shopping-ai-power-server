const db = require('../db');

const createUser = async (nameId, email, pwdHash) => {
    const query = `INSERT INTO users (name_id, email, pwd_hash) VALUES (?, ?, ?)`;
    const insertId = await db.executeInsert(query, [nameId, email, pwdHash]);
    return insertId;
};

const getUserByEmail = async (email) => {
    const query = `SELECT * FROM users WHERE email = ?`;
    const rows = await db.executeQuery(query, [email]);
    return rows.length > 0 ? rows[0] : null;
};

module.exports = {
    createUser,
    getUserByEmail
};

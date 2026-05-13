const db = require('../db');

const createUser = async (userData) => {
    const { email, pwd_hash, firstName, lastName, name_id } = userData;
    const query = `INSERT INTO users (email, pwd_hash, firstName, lastName, name_id) VALUES (?, ?, ?, ?, ?)`;
    const insertId = await db.executeInsert(query, [email, pwd_hash, firstName, lastName, name_id]);
    return insertId;
};

const getUserByEmail = async (email) => {
    const query = `SELECT * FROM users WHERE email = ?`;
    const rows = await db.executeQuery(query, [email]);
    return rows.length > 0 ? rows[0] : null;
};

const getUserById = async (id) => {
    const query = `SELECT id, email, firstName, lastName FROM users WHERE id = ?`;
    const rows = await db.executeQuery(query, [id]);
    return rows.length > 0 ? rows[0] : null;
};

module.exports = {
    createUser,
    getUserByEmail,
    getUserById
};

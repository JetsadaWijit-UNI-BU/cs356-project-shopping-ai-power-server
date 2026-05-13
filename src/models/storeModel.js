const db = require('../db');

const createStore = async (userId, displayName, profile) => {
    // Create the store
    const storeQuery = `INSERT INTO stores (user_id, display_name, profile) VALUES (?, ?, ?)`;
    const storeId = await db.executeInsert(storeQuery, [userId, displayName, profile]);

    // The user who creates the store is automatically assigned the 'owner' role
    const memberQuery = `INSERT INTO store_members (user_id, store_id, role) VALUES (?, ?, 'owner')`;
    await db.executeInsert(memberQuery, [userId, storeId]);

    return storeId;
};

const getStoreMemberRole = async (userId, storeId) => {
    // Retrieve the user's role in a specific store
    const query = `SELECT role FROM store_members WHERE user_id = ? AND store_id = ?`;
    const rows = await db.executeQuery(query, [userId, storeId]);
    return rows.length > 0 ? rows[0].role : null;
};

module.exports = {
    createStore,
    getStoreMemberRole
};

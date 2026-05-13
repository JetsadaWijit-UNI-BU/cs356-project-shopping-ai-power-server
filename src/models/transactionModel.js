const db = require('../db');
const storeModel = require('./storeModel');

const createTransaction = async (userId, storeId, totalAmount, items) => {
    // items should be an array of objects: { productId, quantity, unitPrice, subtotal }
    
    // Create the main transaction record
    const query = `INSERT INTO transactions (user_id, store_id, total_amount) VALUES (?, ?, ?)`;
    const transactionId = await db.executeInsert(query, [userId, storeId, totalAmount]);

    // Insert all items related to this transaction
    for (const item of items) {
        const itemQuery = `INSERT INTO transaction_items (transaction_id, product_id, quantity, unit_price, subtotal) VALUES (?, ?, ?, ?, ?)`;
        await db.executeInsert(itemQuery, [transactionId, item.productId, item.quantity, item.unitPrice, item.subtotal]);
    }

    return transactionId;
};

const getUserTransactions = async (userId) => {
    // Return transactions only for the specific user who made them
    const query = `SELECT * FROM transactions WHERE user_id = ?`;
    return await db.executeQuery(query, [userId]);
};

const getStoreTransactions = async (userId, storeId) => {
    // Check if the user has the required permission to view the store's transactions
    const role = await storeModel.getStoreMemberRole(userId, storeId);
    const allowedRoles = ['owner', 'co-owner', 'staff'];
    
    if (!role || !allowedRoles.includes(role)) {
        throw new Error("Unauthorized: You do not have permission to view this store's transactions.");
    }

    // Return transactions for the store if authorized
    const query = `SELECT * FROM transactions WHERE store_id = ?`;
    return await db.executeQuery(query, [storeId]);
};

module.exports = {
    createTransaction,
    getUserTransactions,
    getStoreTransactions
};

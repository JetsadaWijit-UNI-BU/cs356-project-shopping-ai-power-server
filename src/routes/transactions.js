const express = require('express');
const router = express.Router();
const transactionModel = require('../models/transactionModel');

// POST /api/transactions
router.post('/', async (req, res) => {
    try {
        const userId = req.user.id;
        const { storeId, totalAmount, items } = req.body;

        if (!storeId || totalAmount === undefined || !items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ is_success: false, message: "Invalid transaction data." });
        }

        const transactionId = await transactionModel.createTransaction(userId, storeId, totalAmount, items);
        res.status(201).json({ is_success: true, transaction_id: transactionId, message: "Transaction created successfully." });
    } catch (error) {
        console.error('Create transaction error:', error);
        res.status(500).json({ is_success: false, message: "Internal server error." });
    }
});

// GET /api/transactions/user
router.get('/user', async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Fetch only transactions made by this specific user
        const transactions = await transactionModel.getUserTransactions(userId);
        res.status(200).json({ is_success: true, transactions: transactions });
    } catch (error) {
        console.error('Get user transactions error:', error);
        res.status(500).json({ is_success: false, message: "Internal server error." });
    }
});

// GET /api/transactions/store/:storeId
router.get('/store/:storeId', async (req, res) => {
    try {
        const userId = req.user.id;
        const storeId = req.params.storeId;

        // Fetch transactions for the store, model will handle permission validation
        const transactions = await transactionModel.getStoreTransactions(userId, storeId);
        res.status(200).json({ is_success: true, transactions: transactions });
    } catch (error) {
        if (error.message.startsWith('Unauthorized')) {
            return res.status(403).json({ is_success: false, message: error.message });
        }
        console.error('Get store transactions error:', error);
        res.status(500).json({ is_success: false, message: "Internal server error." });
    }
});

module.exports = router;

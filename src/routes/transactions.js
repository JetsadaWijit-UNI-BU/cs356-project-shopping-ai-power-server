const express = require('express');
const router = express.Router();
const transactionModel = require('../models/transactionModel');
const productModel = require('../models/productModel'); // Added productModel dependency

// POST /api/transactions
router.post('/', async (req, res) => {
    try {
        const userId = req.user.id;
        const { storeId, items } = req.body;

        // Security Fix: Do not trust totalAmount and prices from client
        if (!storeId || !items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ is_success: false, message: "Invalid transaction data." });
        }

        let calculatedTotalAmount = 0;
        const processedItems = [];

        // Recompute prices securely on the server side
        for (const item of items) {
            if (!item.productId || !item.quantity || item.quantity <= 0) {
                return res.status(400).json({ is_success: false, message: "Invalid product item data." });
            }

            const product = await productModel.getProductById(item.productId);
            
            // Verify product exists and belongs to the correct store
            if (!product || product.store_id != storeId) {
                return res.status(400).json({ is_success: false, message: `Product ID ${item.productId} is invalid or does not belong to this store.` });
            }

            const unitPrice = parseFloat(product.price);
            const subtotal = unitPrice * item.quantity;
            calculatedTotalAmount += subtotal;

            processedItems.push({
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: unitPrice,
                subtotal: subtotal
            });
        }

        const transactionId = await transactionModel.createTransaction(userId, storeId, calculatedTotalAmount, processedItems);
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

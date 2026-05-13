const express = require('express');
const router = express.Router();
const storeModel = require('../models/storeModel');
const productModel = require('../models/productModel'); // Added product model dependency

// POST /api/stores
router.post('/', async (req, res) => {
    try {
        const userId = req.user.id;
        const { displayName, profile } = req.body;

        if (!displayName || !profile) {
            return res.status(400).json({ is_success: false, message: "Missing required fields." });
        }

        const storeId = await storeModel.createStore(userId, displayName, profile);
        res.status(201).json({ is_success: true, store_id: storeId, message: "Store created successfully." });
    } catch (error) {
        console.error('Create store error:', error);
        res.status(500).json({ is_success: false, message: "Internal server error." });
    }
});

// GET /api/stores/:storeId/products
router.get('/:storeId/products', async (req, res) => {
    try {
        const storeId = req.params.storeId;
        
        // Fix: Prevent negative offset by ensuring page is at least 1
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = 10;
        const offset = (page - 1) * limit;

        const products = await productModel.getProducts(storeId, limit, offset);
        
        res.status(200).json({ 
            is_success: true, 
            page: page,
            limit: limit,
            products: products 
        });
    } catch (error) {
        console.error('Get store products error:', error);
        res.status(500).json({ is_success: false, message: "Internal server error." });
    }
});

// POST /api/stores/:storeId/members
router.post('/:storeId/members', async (req, res) => {
    try {
        const requesterId = req.user.id;
        const storeId = req.params.storeId;
        const { userId, role } = req.body;

        const requesterRole = await storeModel.getStoreMemberRole(requesterId, storeId);
        if (requesterRole !== 'owner' && requesterRole !== 'admin' && requesterRole !== 'co-owner') {
            return res.status(403).json({ is_success: false, message: "Forbidden: Not enough privileges to add a member." });
        }

        await storeModel.addMember(userId, storeId, role);
        res.status(201).json({ is_success: true, message: "Member added successfully." });
    } catch (error) {
        console.error('Add member error:', error);
        res.status(500).json({ is_success: false, message: "Internal server error." });
    }
});

// DELETE /api/stores/:storeId/members/:userId
router.delete('/:storeId/members/:userId', async (req, res) => {
    try {
        const requesterId = req.user.id;
        const storeId = req.params.storeId;
        const targetUserId = req.params.userId;

        const requesterRole = await storeModel.getStoreMemberRole(requesterId, storeId);
        if (requesterRole !== 'owner' && requesterRole !== 'admin' && requesterRole !== 'co-owner') {
            return res.status(403).json({ is_success: false, message: "Forbidden: Not enough privileges to delete a member." });
        }

        await storeModel.deleteMember(targetUserId, storeId);
        res.status(200).json({ is_success: true, message: "Member removed successfully." });
    } catch (error) {
        console.error('Delete member error:', error);
        res.status(500).json({ is_success: false, message: "Internal server error." });
    }
});

// GET /api/stores/:storeId/members/check
router.get('/:storeId/members/check', async (req, res) => {
    try {
        const userId = req.user.id;
        const storeId = req.params.storeId;

        const membershipInfo = await storeModel.isMember(userId, storeId);
        res.status(200).json({ is_success: true, ...membershipInfo });
    } catch (error) {
        console.error('Check member error:', error);
        res.status(500).json({ is_success: false, message: "Internal server error." });
    }
});

module.exports = router;

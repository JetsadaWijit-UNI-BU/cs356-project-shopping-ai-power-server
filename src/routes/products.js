const express = require('express');
const router = express.Router();
const productModel = require('../models/productModel');
const storeModel = require('../models/storeModel');

// GET /api/products/store/:storeId
// Added to allow fetching products for a specific store
router.get('/store/:storeId', async (req, res) => {
    try {
        const storeId = req.params.storeId;
        const limit = req.query.limit || 20;
        const offset = req.query.offset || 0;

        const products = await productModel.getProducts(storeId, limit, offset);
        res.status(200).json({ is_success: true, data: products });
    } catch (error) {
        console.error('Fetch products error:', error);
        res.status(500).json({ is_success: false, message: "Internal server error." });
    }
});

// GET /api/products/:productId
// Added to fetch a single product detail
router.get('/:productId', async (req, res) => {
    try {
        const productId = req.params.productId;
        const product = await productModel.getProductById(productId);
        
        if (!product) {
            return res.status(404).json({ is_success: false, message: "Product not found." });
        }

        res.status(200).json({ is_success: true, data: product });
    } catch (error) {
        console.error('Fetch product error:', error);
        res.status(500).json({ is_success: false, message: "Internal server error." });
    }
});

// POST /api/products
router.post('/', async (req, res) => {
    try {
        const userId = req.user.id;
        const { storeId, displayName, price, pictures, description } = req.body;

        if (!storeId || !displayName || price === undefined) {
            return res.status(400).json({ is_success: false, message: "Missing required fields." });
        }

        // Verify if user is allowed to add products to the store
        const role = await storeModel.getStoreMemberRole(userId, storeId);
        if (!role || (role !== 'owner' && role !== 'co-owner' && role !== 'admin')) {
            return res.status(403).json({ is_success: false, message: "Forbidden: You do not have permission to add products to this store." });
        }

        const productId = await productModel.createProduct(storeId, displayName, price, pictures, description);
        res.status(201).json({ is_success: true, product_id: productId, message: "Product created successfully." });
    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({ is_success: false, message: "Internal server error." });
    }
});

// PUT /api/products/:productId
router.put('/:productId', async (req, res) => {
    try {
        const userId = req.user.id;
        const productId = req.params.productId;
        const { displayName, price, pictures, description } = req.body;

        // Fetch the product first to identify which store it belongs to
        const product = await productModel.getProductById(productId);
        if (!product) {
            return res.status(404).json({ is_success: false, message: "Product not found." });
        }

        // Verify if user is allowed to edit products in this store
        const role = await storeModel.getStoreMemberRole(userId, product.store_id);
        if (!role || (role !== 'owner' && role !== 'co-owner' && role !== 'admin')) {
            return res.status(403).json({ is_success: false, message: "Forbidden: You do not have permission to edit this product." });
        }

        await productModel.updateProduct(productId, displayName, price, pictures, description);
        res.status(200).json({ is_success: true, message: "Product updated successfully." });
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({ is_success: false, message: "Internal server error." });
    }
});

// DELETE /api/products/:productId
router.delete('/:productId', async (req, res) => {
    try {
        const userId = req.user.id;
        const productId = req.params.productId;

        // Fetch the product first to identify which store it belongs to
        const product = await productModel.getProductById(productId);
        if (!product) {
            return res.status(404).json({ is_success: false, message: "Product not found." });
        }

        // Verify if user is allowed to delete products in this store
        const role = await storeModel.getStoreMemberRole(userId, product.store_id);
        if (!role || (role !== 'owner' && role !== 'co-owner' && role !== 'admin')) {
            return res.status(403).json({ is_success: false, message: "Forbidden: You do not have permission to delete this product." });
        }

        await productModel.deleteProduct(productId);
        res.status(200).json({ is_success: true, message: "Product deleted successfully." });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({ is_success: false, message: "Internal server error." });
    }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const userModel = require('../models/userModel');

// GET /api/account/v1/profile
router.get('/', async (req, res) => {
    try {
        // Security Fix: Prevent IDOR by using the authenticated user's ID
        // instead of accepting it from req.query.id
        const id = req.user.id;

        if (!id) {
            return res.status(400).json({
                title: "One or more validation errors occurred.",
                status: 400,
                errors: { id: ["The user id is missing."] }
            });
        }

        const user = await userModel.getUserById(id);
        if (!user) {
            return res.status(404).json({
                title: "User not found.",
                status: 404,
                errors: { id: [`The value '${id}' is not valid.`] }
            });
        }

        res.status(200).json({
            id: user.id.toString(),
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName
        });
    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({ message: "Internal server error." });
    }
});

module.exports = router;

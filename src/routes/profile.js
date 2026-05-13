const express = require('express');
const router = express.Router();
const userModel = require('../models/userModel');

// GET /api/account/v1/profile
router.get('/', async (req, res) => {
    try {
        const { id } = req.query;

        if (!id) {
            return res.status(400).json({
                title: "One or more validation errors occurred.",
                status: 400,
                errors: { id: ["The id field is required."] }
            });
        }

        const user = await userModel.getUserById(id);
        if (!user) {
            return res.status(400).json({
                title: "One or more validation errors occurred.",
                status: 400,
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

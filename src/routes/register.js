const express = require('express');
const router = express.Router();
const userModel = require('../models/userModel');
const cryptoUtil = require('../utils/cryptoUtil');

// POST /api/account/v1/register
router.post('/', async (req, res) => {
    try {
        const { password, email, firstName, lastName } = req.body;

        if (!password || !email || !firstName || !lastName) {
            return res.status(400).json({ is_success: false, message: "Invalid data format." });
        }

        const existingUser = await userModel.getUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ is_success: false, message: "Email already exists." });
        }

        const pwd_hash = await cryptoUtil.hashPassword(password);
        
        // Prevent UNIQUE constraint violation by appending a random unique suffix
        const baseNameId = email.split('@')[0];
        const uniqueSuffix = cryptoUtil.generateToken().substring(0, 6);
        const name_id = `${baseNameId}_${uniqueSuffix}`;

        await userModel.createUser({
            email,
            pwd_hash,
            firstName,
            lastName,
            name_id
        });

        res.status(201).json({ is_success: true, message: "Registration successful." });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ is_success: false, message: "Internal server error." });
    }
});

module.exports = router;

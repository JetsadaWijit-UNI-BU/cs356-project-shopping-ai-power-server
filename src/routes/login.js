const express = require('express');
const router = express.Router();
const userModel = require('../models/userModel');
const sessionModel = require('../models/sessionModel');
const cryptoUtil = require('../utils/cryptoUtil');

// POST /api/account/v1/login
router.post('/', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ is_success: false, profile_id: "", message: "Missing email or password." });
        }

        const user = await userModel.getUserByEmail(email);
        if (!user) {
            return res.status(401).json({ is_success: false, profile_id: "", message: "Invalid email or password." });
        }

        const isMatch = await cryptoUtil.comparePassword(password, user.pwd_hash);
        if (!isMatch) {
            return res.status(401).json({ is_success: false, profile_id: "", message: "Invalid email or password." });
        }

        const token = cryptoUtil.generateToken();
        await sessionModel.createSession(user.id, token);

        res.status(200).json({
            is_success: true,
            profile_id: user.id.toString(),
            message: "Login successful.",
            token: token
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ is_success: false, profile_id: "", message: "Internal server error." });
    }
});

module.exports = router;

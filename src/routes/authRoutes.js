const express = require('express');
const router = express.Router();
const userModel = require('../models/userModel');
const sessionModel = require('../models/sessionModel');
const cryptoUtil = require('../utils/cryptoUtil');

// 1. Register New User (Removed studentId)
router.post('/register', async (req, res) => {
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
        const name_id = email.split('@')[0];

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

// 2. Login User
router.post('/login', async (req, res) => {
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

// 3. Get User Profile (Removed studentId from response)
router.get('/profile', async (req, res) => {
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

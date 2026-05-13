const express = require('express');
const router = express.Router();
const userModel = require('../models/userModel');
const sessionModel = require('../models/sessionModel');
const cryptoUtil = require('../utils/cryptoUtil');

// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { name_id, email, password } = req.body;

        if (!name_id || !email || !password) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const existingUser = await userModel.getUserByEmail(email);
        if (existingUser) {
            return res.status(409).json({ error: 'Email already exists' });
        }

        const pwdHash = await cryptoUtil.hashPassword(password);
        const userId = await userModel.createUser(name_id, email, pwdHash);

        res.status(201).json({ message: 'User registered successfully', userId });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const user = await userModel.getUserByEmail(email);
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const isMatch = await cryptoUtil.comparePassword(password, user.pwd_hash);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = cryptoUtil.generateToken();
        await sessionModel.createSession(user.id, token);

        res.status(200).json({
            message: 'Login successful',
            token: token,
            user: {
                id: user.id,
                name_id: user.name_id,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;

require('dotenv').config();
const express = require('express');
const { initDb } = require('./db');

// Import middleware
const authLogger = require('./middlewares/authLogger');

// Import separate routes
const loginRoute = require('./routes/login');
const registerRoute = require('./routes/register');
const profileRoute = require('./routes/profile');
const storeRoute = require('./routes/stores');
const productRoute = require('./routes/products');
const transactionRoute = require('./routes/transactions');
const aiRoute = require('./routes/ai');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(authLogger); // Global middleware for logging and token verification

// Register Routes
app.use('/api/account/v1/login', loginRoute);
app.use('/api/account/v1/register', registerRoute);
app.use('/api/account/v1/profile', profileRoute);

// Business logic Routes
app.use('/api/stores', storeRoute);
app.use('/api/products', productRoute);
app.use('/api/transactions', transactionRoute);

// AI Routes
app.use('/api/ai', aiRoute);

// Initialize Database and Start Server
const startServer = async () => {
    try {
        await initDb();
        console.log('Database initialized successfully.');
        
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start the server:', error);
        process.exit(1);
    }
};

startServer();

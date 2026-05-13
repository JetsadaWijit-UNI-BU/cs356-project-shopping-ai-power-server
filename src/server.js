require('dotenv').config();
const express = require('express');
const { initDb } = require('./db');

// Import separate routes
const loginRoute = require('./routes/login');
const registerRoute = require('./routes/register');
const profileRoute = require('./routes/profile');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Register Routes
app.use('/api/account/v1/login', loginRoute);
app.use('/api/account/v1/register', registerRoute);
app.use('/api/account/v1/profile', profileRoute);

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

const sessionModel = require('../models/sessionModel');
const logModel = require('../models/logModel');

const authLogger = async (req, res, next) => {
    const method = req.method;
    const url = req.originalUrl || req.url;
    let userId = null;

    // Define public routes that do not require an authorization token
    const publicRoutes = [
        '/api/account/v1/login',
        '/api/account/v1/register'
    ];

    try {
        // If the request is for a public route, log it as guest and skip token verification
        if (publicRoutes.includes(req.path)) {
            await logModel.createLog(method, url, null);
            return next();
        }

        // Check for Bearer token in the Authorization header
        const authHeader = req.headers['authorization'];
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            await logModel.createLog(method, url, null);
            return res.status(401).json({ 
                is_success: false, 
                message: "Unauthorized: Missing or invalid Bearer token." 
            });
        }

        // Extract the token string
        const token = authHeader.split(' ')[1];

        // Verify token exists in the database sessions
        const session = await sessionModel.getSessionByToken(token);
        if (!session) {
            await logModel.createLog(method, url, null);
            return res.status(401).json({ 
                is_success: false, 
                message: "Unauthorized: Invalid or expired token." 
            });
        }

        // Attach user info to the request object for downstream use
        userId = session.user_id;
        req.user = { id: userId };

        // Log the request with the authenticated user ID
        await logModel.createLog(method, url, userId);

        next();
    } catch (error) {
        console.error('Middleware Auth Error:', error);
        return res.status(500).json({ 
            is_success: false, 
            message: "Internal server error during authentication." 
        });
    }
};

module.exports = authLogger;

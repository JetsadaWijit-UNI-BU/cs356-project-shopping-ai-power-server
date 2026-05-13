const express = require('express');
const router = express.Router();
const aiService = require('../services/aiService');

// POST /api/ai/chat
// A general-purpose chat endpoint.
router.post('/chat', async (req, res) => {
    try {
        const { prompt } = req.body;
        
        if (!prompt) {
            return res.status(400).json({ 
                is_success: false, 
                message: "Missing required field: prompt." 
            });
        }

        const messages = [
            { role: "system", content: "You are a helpful AI assistant for an e-commerce platform." },
            { role: "user", content: prompt }
        ];

        const aiResponse = await aiService.generateCompletion(messages);

        res.status(200).json({
            is_success: true,
            provider: aiResponse.provider,
            result: aiResponse.text,
            usage: aiResponse.usage
        });

    } catch (error) {
        console.error('AI Chat Error:', error);
        res.status(500).json({ 
            is_success: false, 
            message: error.message || "Internal server error." 
        });
    }
});

// POST /api/ai/generate-description
// Specialized endpoint for stores to generate product descriptions using AI.
router.post('/generate-description', async (req, res) => {
    try {
        const { productName, keywords } = req.body;
        
        if (!productName) {
            return res.status(400).json({ 
                is_success: false, 
                message: "Missing required field: productName." 
            });
        }

        let prompt = `Write a catchy, persuasive, and professional product description for an item named "${productName}".`;
        
        if (keywords && Array.isArray(keywords) && keywords.length > 0) {
            prompt += ` Please ensure to naturally include these keywords: ${keywords.join(', ')}.`;
        }

        const messages = [
            { role: "system", content: "You are an expert marketing copywriter for an e-commerce platform." },
            { role: "user", content: prompt }
        ];

        const aiResponse = await aiService.generateCompletion(messages);

        res.status(200).json({
            is_success: true,
            provider: aiResponse.provider,
            result: aiResponse.text
        });

    } catch (error) {
        console.error('AI Generate Description Error:', error);
        res.status(500).json({ 
            is_success: false, 
            message: error.message || "Internal server error." 
        });
    }
});

module.exports = router;

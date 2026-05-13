const AIResponseModel = require('../models/aiResponseModel');

/**
 * Service class to handle AI interactions.
 * Built with an abstraction layer to easily switch between AI providers (e.g., DeepSeek, OpenAI).
 */
class AIService {
    constructor() {
        this.provider = process.env.AI_PROVIDER || 'deepseek';
        this.apiKey = process.env.DEEPSEEK_API_KEY;
    }

    /**
     * Switch the active AI provider at runtime.
     * @param {string} provider - Provider name (e.g., 'deepseek', 'openai')
     */
    setProvider(provider) {
        this.provider = provider;
    }

    /**
     * Unified interface to generate chat completion based on the current provider.
     * @param {Array} messages - Array of message objects { role, content }
     * @returns {Promise<AIResponseModel>}
     */
    async generateCompletion(messages) {
        if (!this.apiKey) {
            throw new Error("DEEPSEEK_API_KEY is not configured in the environment variables.");
        }

        if (this.provider === 'deepseek') {
            return await this.callDeepseek(messages);
        } else {
            throw new Error(`AI Provider '${this.provider}' is not supported yet.`);
        }
    }

    /**
     * DeepSeek API specific implementation.
     * @param {Array} messages - Array of message objects
     * @returns {Promise<AIResponseModel>}
     */
    async callDeepseek(messages) {
        // Using standard Deepseek chat completion endpoint
        const url = 'https://api.deepseek.com/chat/completions';
        
        // Node.js 18+ includes native fetch
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: messages
            })
        });

        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(`DeepSeek API Error: ${response.status} - ${errorData}`);
        }

        const rawData = await response.json();
        return AIResponseModel.fromDeepseek(rawData);
    }
}

// Export as a singleton instance
module.exports = new AIService();

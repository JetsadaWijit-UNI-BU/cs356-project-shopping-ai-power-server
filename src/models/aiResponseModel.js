/**
 * Model class to standardize AI responses from different providers.
 * This acts as the Data Transfer Object (DTO) to decouple the app from specific AI schemas.
 */
class AIResponseModel {
    constructor(provider, text, usage, rawData) {
        this.provider = provider;
        this.text = text;
        this.usage = usage;
        this.rawData = rawData;
    }

    /**
     * Factory method to map DeepSeek response schema to our standard model.
     * @param {Object} rawData - The raw JSON response from DeepSeek API
     * @returns {AIResponseModel}
     */
    static fromDeepseek(rawData) {
        const text = rawData.choices?.[0]?.message?.content || '';
        const usage = rawData.usage || null;
        return new AIResponseModel('deepseek', text, usage, rawData);
    }

    // Future implementations can go here, e.g., static fromOpenAI(rawData)
}

module.exports = AIResponseModel;

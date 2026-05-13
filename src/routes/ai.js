const express = require('express');
const router = express.Router();
const aiService = require('../services/aiService');

// Full definition of all available tools
const tools = [
    // --- Product Model ---
    {
        type: "function",
        function: {
            name: "createProduct",
            description: "Create a new product",
            parameters: {
                type: "object",
                properties: {
                    storeId: { type: "number" },
                    displayName: { type: "string" },
                    price: { type: "number" },
                    pictures: { type: "string" },
                    description: { type: "string" }
                },
                required: ["storeId", "displayName", "price", "pictures", "description"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "getProducts",
            description: "Get products belonging to a specific store with pagination",
            parameters: {
                type: "object",
                properties: {
                    storeId: { type: "number" },
                    limit: { type: "number" },
                    offset: { type: "number" }
                },
                required: ["storeId", "limit", "offset"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "getProductById",
            description: "Retrieve a single product by its ID",
            parameters: {
                type: "object",
                properties: {
                    productId: { type: "number" }
                },
                required: ["productId"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "updateProduct",
            description: "Update an existing product",
            parameters: {
                type: "object",
                properties: {
                    productId: { type: "number" },
                    displayName: { type: "string" },
                    price: { type: "number" },
                    pictures: { type: "string" },
                    description: { type: "string" }
                },
                required: ["productId", "displayName", "price", "pictures", "description"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "deleteProduct",
            description: "Delete a product from the database",
            parameters: {
                type: "object",
                properties: {
                    productId: { type: "number" }
                },
                required: ["productId"]
            }
        }
    },

    // --- Store Model ---
    {
        type: "function",
        function: {
            name: "createStore",
            description: "Create a new store",
            parameters: {
                type: "object",
                properties: {
                    userId: { type: "number" },
                    displayName: { type: "string" },
                    profile: { type: "string" }
                },
                required: ["userId", "displayName", "profile"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "getStoreMemberRole",
            description: "Retrieve the user's role in a specific store",
            parameters: {
                type: "object",
                properties: {
                    userId: { type: "number" },
                    storeId: { type: "number" }
                },
                required: ["userId", "storeId"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "addMember",
            description: "Add a member to a store or update their role",
            parameters: {
                type: "object",
                properties: {
                    userId: { type: "number" },
                    storeId: { type: "number" },
                    role: { type: "string", enum: ["owner", "co-owner", "admin", "staff", "member"] }
                },
                required: ["userId", "storeId", "role"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "deleteMember",
            description: "Delete a member from a store",
            parameters: {
                type: "object",
                properties: {
                    userId: { type: "number" },
                    storeId: { type: "number" }
                },
                required: ["userId", "storeId"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "isMember",
            description: "Check if a user is a member of a store",
            parameters: {
                type: "object",
                properties: {
                    userId: { type: "number" },
                    storeId: { type: "number" }
                },
                required: ["userId", "storeId"]
            }
        }
    },

    // --- Transaction Model ---
    {
        type: "function",
        function: {
            name: "createTransaction",
            description: "Create a new transaction with items",
            parameters: {
                type: "object",
                properties: {
                    userId: { type: "number" },
                    storeId: { type: "number" },
                    totalAmount: { type: "number" },
                    items: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                productId: { type: "number" },
                                quantity: { type: "number" },
                                unitPrice: { type: "number" },
                                subtotal: { type: "number" }
                            },
                            required: ["productId", "quantity", "unitPrice", "subtotal"]
                        }
                    }
                },
                required: ["userId", "storeId", "totalAmount", "items"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "getUserTransactions",
            description: "Return transactions for a specific user",
            parameters: {
                type: "object",
                properties: {
                    userId: { type: "number" }
                },
                required: ["userId"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "getStoreTransactions",
            description: "Return transactions for a specific store if authorized",
            parameters: {
                type: "object",
                properties: {
                    userId: { type: "number" },
                    storeId: { type: "number" }
                },
                required: ["userId", "storeId"]
            }
        }
    },

    // --- User Model ---
    {
        type: "function",
        function: {
            name: "createUser",
            description: "Insert a new user into the database",
            parameters: {
                type: "object",
                properties: {
                    userData: {
                        type: "object",
                        properties: {
                            email: { type: "string" },
                            pwd_hash: { type: "string" },
                            firstName: { type: "string" },
                            lastName: { type: "string" },
                            name_id: { type: "string" }
                        },
                        required: ["email", "pwd_hash", "firstName", "lastName", "name_id"]
                    }
                },
                required: ["userData"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "getUserByEmail",
            description: "Get user details by email",
            parameters: {
                type: "object",
                properties: {
                    email: { type: "string" }
                },
                required: ["email"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "getUserById",
            description: "Get user details by ID",
            parameters: {
                type: "object",
                properties: {
                    id: { type: "number" }
                },
                required: ["id"]
            }
        }
    },

    // --- Session Model ---
    {
        type: "function",
        function: {
            name: "createSession",
            description: "Create a session token for a user",
            parameters: {
                type: "object",
                properties: {
                    userId: { type: "number" },
                    token: { type: "string" }
                },
                required: ["userId", "token"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "getSessionByToken",
            description: "Retrieve session details by token",
            parameters: {
                type: "object",
                properties: {
                    token: { type: "string" }
                },
                required: ["token"]
            }
        }
    },

    // --- Log Model ---
    {
        type: "function",
        function: {
            name: "createLog",
            description: "Insert a new request log into the database",
            parameters: {
                type: "object",
                properties: {
                    method: { type: "string" },
                    url: { type: "string" },
                    userId: { type: "number" }
                },
                required: ["method", "url"]
            }
        }
    }
];

// Extract only names and descriptions for the first AI pass
const toolSummaries = tools.map(t => ({
    name: t.function.name,
    description: t.function.description
}));

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

        // STEP 1: Ask AI to select the necessary tools based on the prompt
        const toolSelectionMessages = [
            { 
                role: "system", 
                content: "You are a tool router. Based on the user's prompt and the available tools, determine which tools are required to fulfill the request. Return ONLY a valid JSON array of tool names. For example: [\"createProduct\", \"getUserById\"]. If no tools are needed, return an empty array []." 
            },
            { 
                role: "user", 
                content: `User Prompt: "${prompt}"\n\nAvailable Tools:\n${JSON.stringify(toolSummaries, null, 2)}` 
            }
        ];

        // Call AI to get the selected tools (do not pass any actual tools here)
        const selectionResponse = await aiService.generateCompletion(toolSelectionMessages);
        
        let selectedToolNames = [];
        try {
            // Clean up the text in case AI wraps it in markdown code blocks
            const cleanJsonText = selectionResponse.text.replace(/```json/g, '').replace(/```/g, '').trim();
            selectedToolNames = JSON.parse(cleanJsonText);
        } catch (parseError) {
            console.warn('Failed to parse AI tool selection, proceeding without tools or returning error.', parseError);
            selectedToolNames = [];
        }

        // Filter the full tools array to include only the ones the AI selected
        const selectedTools = tools.filter(t => selectedToolNames.includes(t.function.name));

        // STEP 2: Send the final prompt with the selected tools
        const finalMessages = [
            { role: "system", content: "You are a helpful AI assistant for an e-commerce platform. Use the provided tools carefully and ensure exact matching parameters. Do not allow bypassing security logic." },
            { role: "user", content: prompt }
        ];

        // If selectedTools array is empty, we pass undefined to avoid API validation errors for empty tool arrays
        const toolsToPass = selectedTools.length > 0 ? selectedTools : undefined;

        const aiResponse = await aiService.generateCompletion(finalMessages, toolsToPass);

        res.status(200).json({
            is_success: true,
            provider: aiResponse.provider,
            result: aiResponse.text,
            usage: aiResponse.usage,
            selected_tools: selectedToolNames // Optional: useful for debugging
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

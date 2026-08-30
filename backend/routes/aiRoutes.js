import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post('/support-chat', async (req, res) => {
    try {
        const { question, history } = req.body;
        if (!question) return res.status(400).json({ error: 'Question is required.' });

        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

        // Build history string for AI context
        let historyText = '';
        if (Array.isArray(history) && history.length > 0) {
            historyText = history.map(msg => `${msg.sender === 'user' ? 'User' : 'Bot'}: ${msg.content}`).join('\n');
        }

        const chatPrompt = `
            You are a professional AI stylist for 'FitForge', a men's fashion website.
            
            Instructions:
            - Answer the user's question using the store's products.
            - ALWAYS return a **valid JSON object** with this exact structure:

            {
              "reply": "<textual reply here>",
              "products": [
                {
                  "id": "<product_id>",
                  "name": "<product_name>",
                  "price": "<product_price>",
                  "imageUrl": "<product_image_url>"
                }
              ]
            }

            - The "reply" should include any textual guidance, greetings, or outfit advice.
            - The "products" array must always include full details (id, name, price, imageUrl) for each recommended item.
            - Even for follow-up questions like "winter outfit", "formal outfit", or "casual outfit", always provide full structured JSON.
            - Do NOT return any text outside the JSON object.
            
            Chat History:
            ${historyText}

            User Question:
            "${question}"
        `;

        const result = await model.generateContent(chatPrompt);
        const response = await result.response;
        const text = await response.text();

        let reply = '';
        let products = [];

        try {
            const parsed = JSON.parse(text);
            reply = parsed.reply || '';
            products = Array.isArray(parsed.products) ? parsed.products : [];
        } catch (err) {
            console.warn('AI response is not valid JSON. Sending as plain text.');
            reply = text;
        }

        res.json({ reply, products });

    } catch (error) {
        console.error('Error with Gemini API:', error);
        res.status(500).json({ error: 'Failed to get response from AI.' });
    }
});

export default router;

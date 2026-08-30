// backend/controllers/openaiController.js
import asyncHandler from "../middlewares/asyncHandler.js";
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import Product from "../models/productModel.js";

const VALID_CATEGORIES = {
  TOP: ["shirts", "t-shirts", "kurta", "hoodie", "hoodies", "sweatshirt"],
  BOTTOM: ["pants", "trouser", "shorts", "jeans", "joggers"],
  FOOTWEAR: ["shoes", "sneaker", "loafer"],
};

const openaiChat = asyncHandler(async (req, res) => {
  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: "Server configuration error: Missing Gemini API Key." });
  }
  const { question, history = [], isQuizAnalysis = false, quizAnswers = [] } = req.body;
  if (!question && !isQuizAnalysis) {
    return res.status(400).json({ error: "Question is required." });
  }

  try {
    console.log("✅ Request received:", question);
    if (/^(hi|hello|hey)\b/i.test(question.trim())) {
      return res.json({ response: [{ type: "text", content: "Hi there! 👋 Welcome to FitForge. How can I help you find the perfect outfit today?" }] });
    }
    
    const productsFromDB = await Product.find({}).populate('category', 'name').select("_id name description price image category").lean();
    const productCatalog = JSON.stringify(productsFromDB);
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    let model;
    let effectiveQuestion = question;
    let systemInstruction = getUnifiedSystemPrompt(productCatalog);

    if (isQuizAnalysis) {
        console.log("🎯 Analyzing quiz answers...");
        model = genAI.getGenerativeModel({ model: "gemini-pro-latest" });
        systemInstruction = null;
        effectiveQuestion = `A user has completed a style quiz. Their answers are:
        1. Prioritizes: "${quizAnswers[0]}"
        2. Weekend activity: "${quizAnswers[1]}"
        3. Color palette: "${quizAnswers[2]}"
        Based on these answers, classify their style into a profile like "Classic Gentleman", "Modern Minimalist", or "Streetwear Enthusiast".
        Then, create a one-sentence description for their style.
        Finally, using the provided product catalog, suggest ONE complete outfit (1 Top, 1 Bottom, 1 Footwear) that perfectly matches this style profile.
        CRITICAL RULE: You MUST use the exact "name" from the products provided in the catalog. DO NOT invent products.
        Respond in this exact JSON format:
        { "response": [ { "type": "text", "content": "Based on your answers, your style profile is **[Style Profile Name]**! [One-sentence description]." }, { "type": "outfit", "content": { "title": "Your Personalized Style", "reason": "Why it's for you: [Reason this outfit matches their style profile].", "top": { "name": "..." }, "bottom": { "name": "..." }, "footwear": { "name": "..." } } } ] }
        Product Catalog: ${productCatalog}`;
    } else {
        model = genAI.getGenerativeModel({ model: "gemini-pro-latest", systemInstruction });
    }

    const geminiHistory = history.filter(msg => typeof msg.content === 'string' && msg.content).map(msg => ({ role: msg.sender === "user" ? "user" : "model", parts: [{ text: msg.content }] }));
    const chat = model.startChat({ history: geminiHistory, generationConfig: { responseMimeType: "application/json" } });

    console.log("⏳ Sending to Gemini...");
    const result = await chat.sendMessage(effectiveQuestion);
    const replyText = result.response.text().replace(/```json/g, "").replace(/```/g, "").trim();
    console.log("🤖 Raw AI Response:", replyText);
    let replyJson = JSON.parse(replyText);

    return processAndSendResponse(replyJson, productsFromDB, res);

  } catch (error) {
    console.error("❌ Error in openaiChat:", error);
    return res.status(500).json({ response: [{ type: "text", content: "I'm sorry, an error occurred. Please try again." }] });
  }
});

async function processAndSendResponse(replyJson, productsFromDB, res) {
  const allProducts = productsFromDB.map((p) => ({
    _id: p._id?.toString(), name: p.name, price: p.price,
    image: p.image?.startsWith("http") ? p.image : `${process.env.BASE_URL || "http://localhost:5000"}/${p.image}`,
    description: p.description || "Stylish and comfortable option.",
    category: p.category?.name ? p.category.name.toLowerCase() : ''
  }));

  const findProductMatch = (geminiProduct) => {
    if (!geminiProduct || !geminiProduct.name) return null;
    return allProducts.find((p) => p.name.toLowerCase().includes(geminiProduct.name.toLowerCase().slice(0, 20))) || null;
  };

  if (replyJson.response && Array.isArray(replyJson.response)) {
    const processedResponses = replyJson.response.map((item) => {
      // Handle standard outfits
      if (item.type === "outfit") {
        const topMatch = findProductMatch(item.content?.top);
        const bottomMatch = findProductMatch(item.content?.bottom);
        const footwearMatch = findProductMatch(item.content?.footwear);
        if (topMatch && bottomMatch && footwearMatch) {
          return { type: "outfit", content: { ...item.content, top: topMatch, bottom: bottomMatch, footwear: footwearMatch }};
        }
        return null;
      }
      
      // ✨ NEW: Handle the new "trend" response type
      if (item.type === "trend") {
        const matchedProducts = (item.content?.products || [])
          .map(p => findProductMatch(p))
          .filter(Boolean); // Filter out any null matches

        if (matchedProducts.length > 0) {
          return { type: "trend", content: { ...item.content, products: matchedProducts }};
        }
        return null; // Discard if no products could be matched to the trend
      }

      return item; // Return text, quickReplies, etc. as is
    });
    replyJson.response = processedResponses.filter(Boolean);
  }

  if (!replyJson.response || !replyJson.response.length) {
    const fallbackText = { type: "text", content: "I couldn't find a specific recommendation for that, but here are some popular items!" };
    replyJson.response = [fallbackText];
  }

  console.log("✅ Sending structured JSON to frontend.");
  return res.json(replyJson);
}

// ✨ UPDATED System Prompt with the new "trend" action
function getUnifiedSystemPrompt(productCatalog) {
  return `
You are "FitForge AI", an intelligent and creative e-commerce fashion stylist.
Based on the user's latest message, choose ONLY ONE of the following actions.

**ACTION 1: Report on Fashion Trends with Products (Primary Action for "trending")**
- **Condition:** The user asks "What's trending?".
- **Task:** First, identify a single current men's fashion trend (e.g., "Utility Wear"). Write a short, engaging description for it. Then, search the provided PRODUCT CATALOG and find 1-2 specific products that are excellent examples of this trend.
- **JSON Output:**
{
  "response": [{
    "type": "trend",
    "content": {
      "trendName": "[Name of the Trend]",
      "trendDescription": "[Short description of the trend.]",
      "products": [
        { "name": "[Exact product name from catalog]" },
        { "name": "[Another exact product name from catalog]" }
      ]
    }
  }]
}

**ACTION 2: Generate Outfits for a Specific Request**
- **Condition:** The user provides a specific outfit request (e.g., "Suggest an outfit for a party").
- **Task:** Generate 1 complete outfit (1 Top, 1 Bottom, 1 Footwear).
- **JSON Output:** { "response": [ { "type": "text", "content": "Here is an idea..." }, { "type": "outfit", "content": { "title": "Look: [Title]", "reason": "[Reason]", "top": { "name": "..." }, "bottom": { "name": "..." }, "footwear": { "name": "..." } } } ] }

**ACTION 3: Generate Outfits for a Vibe**
- **Condition:** The user selects a specific "vibe" like "Casual Weekend" or "Date Night".
- **Task:** Generate 1 complete outfit that perfectly matches that vibe.
- **JSON Output:** { "response": [ { "type": "text", "content": "Here's a look for your [Vibe Name]..." }, { "type": "outfit", "content": { "title": "[Vibe Name] Style", "reason": "[Reason]", "top": { "name": "..." }, "bottom": { "name": "..." }, "footwear": { "name": "..." } } } ] }

**ACTION 4: Generate a Surprise Outfit**
- **Condition:** The user asks for a "surprise" or "random" outfit.
- **Task:** Generate ONE creative and stylish complete outfit. Give it a fun title.
- **JSON Output:** { "response": [ { "type": "text", "content": "Surprise! Here is a stylish look I put together for you:" }, { "type": "outfit", "content": { "title": "The Maverick", "reason": "This look is bold and unexpected...", "top": { "name": "..." }, "bottom": { "name": "..." }, "footwear": { "name": "..." } } } ] }

**ACTION 5: Answer a General Question**
- **Condition:** The user asks a general style question NOT covered by other actions.
- **Task:** Provide a helpful, concise text answer.
- **JSON Output:** { "response": [{ "type": "text", "content": "Your answer." }] }

**ACTION 6: Ask a Clarifying Question**
- **Condition:** The user's request is too vague (e.g., "I need clothes").
- **Task:** Ask a friendly clarifying question with 2-3 quick reply options.
- **JSON Output:** { "response": [{ "type": "text", "content": "I can help with that! What kind of occasion are you dressing for?", "quickReplies": ["A casual day", "A party", "Work"] }] }

**RULES:**
- Your entire response MUST be a single, valid JSON object for the action you chose.
- For any action that generates an outfit or recommends a product, you MUST use the exact "name" from the products provided in the catalog. DO NOT invent products.

**PRODUCT CATALOG:**
${productCatalog}
`;
}

export { openaiChat };
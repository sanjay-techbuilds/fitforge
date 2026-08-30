// backend/utils/geminiClient.js
import axios from 'axios';
import 'dotenv/config'; // Ensures .env variables are loaded

// --- Initialization ---
const apiKey = process.env.GEMINI_API_KEY;
let initializationError = null; // Store initialization error
let availableModels = []; // Store available models listed by the API
let defaultModelForGenerateContent = "gemini-pro"; // Default model, might be updated by listAvailableModels

if (!apiKey) {
    console.error("[geminiClient] ❌ Error: GEMINI_API_KEY environment variable not found or is empty.");
    initializationError = "API key not found in environment variables.";
} else {
    console.log("[geminiClient] ✅ API Key found.");
    // --- Try to list models on initialization ---
    listAvailableModels(); // Call this function right away to check key and find models
}

// --- Function to List Models via REST API ---
async function listAvailableModels() {
    // This function runs on server start to verify the API key and find usable models.
    if (!apiKey) return; // Don't try if key is missing

    const listUrl = `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`;
    console.log(`[geminiClient] ℹ️ Attempting to list models from: ${listUrl}`);
    try {
        const response = await axios.get(listUrl);
        if (response.data && Array.isArray(response.data.models)) {
            availableModels = response.data.models;
            console.log("--------------------------------------------------");
            console.log("[geminiClient] ✅ Successfully listed available models:");
            availableModels.forEach(model => {
                // Log essential details for each model
                console.log(`  - Name: ${model.name}`);
                console.log(`    Display Name: ${model.displayName || 'N/A'}`);
                console.log(`    Supported Methods: ${model.supportedGenerationMethods?.join(', ') || 'N/A'}`);
                // console.log(`    Description: ${(model.description || '').substring(0, 100)}...`);
            });
            console.log("--------------------------------------------------");

            // --- Find the first suitable model supporting 'generateContent' ---
            const suitableModel = availableModels.find(m =>
                m.supportedGenerationMethods?.includes('generateContent') && // Must support the method we need
                (m.name?.includes('gemini') || m.displayName?.toLowerCase().includes('gemini')) && // Prioritize models named Gemini
                !m.name?.includes('embedding') && // Exclude embedding models
                !m.name?.includes('aqa') // Exclude AQA models if not needed
            );

            if (suitableModel) {
                 // *** IMPORTANT: Use the actual name from the list ***
                 // The name usually includes the 'models/' prefix
                 defaultModelForGenerateContent = suitableModel.name; // e.g., 'models/gemini-pro'
                 console.log(`[geminiClient] ✅ Found suitable model for 'generateContent': ${defaultModelForGenerateContent}. Will use this model.`);
            } else {
                 console.warn(`[geminiClient] ⚠️ Could not automatically find a Gemini model supporting 'generateContent'. Falling back to default "${defaultModelForGenerateContent}".`);
                 initializationError = initializationError || `No suitable model found for generateContent. Check listed models.`; // Add warning if no suitable model found
            }

        } else {
            console.warn("[geminiClient] ⚠️ List models response received, but structure was unexpected:", response.data);
            initializationError = initializationError || "Unexpected response structure when listing models.";
        }
    } catch (error) {
        let listErrorMessage = error.message || 'Unknown error listing models';
         if (error.response) {
            // Log specific API errors during model listing
            console.error(`[geminiClient] ❌ Error Listing Models: ${error.response.status} ${error.response.statusText}`);
            console.error("[geminiClient] List Models API Response Data:", error.response.data);
            listErrorMessage = `API Error ${error.response.status}: ${error.response.data?.error?.message || error.response.statusText}`;
             if (error.response.status === 403) listErrorMessage += ' (Check API Key permissions/restrictions)';
             if (error.response.status === 400) listErrorMessage += ' (Invalid request to list models)';
        } else {
             console.error('[geminiClient] ❌ Network or Setup Error Listing Models:', error.message);
        }
        console.error(`[geminiClient] ❌ Failed to list available models. Error: ${listErrorMessage}`);
        // Store the error to prevent generateContent calls if listing failed critically
        initializationError = `Failed to list models: ${listErrorMessage}`;
    }
}

// --- Safety Settings (Format for REST API) ---
const safetySettings = [
  { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
  { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
  { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
  { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
];

// --- Generation Configuration (Optional, Format for REST API) ---
const generationConfig = {
  // temperature: 0.9,
  // maxOutputTokens: 2048, // Example: Limit response length
};


// --- Named Exported Function using Axios for generateContent ---
export async function runGemini(prompt) {
    // Check if initialization failed earlier (API key, model listing)
    if (initializationError) {
        console.error(`[geminiClient] ❌ Cannot call runGemini due to initialization error: ${initializationError}`);
        // Throw the specific initialization error
        throw new Error(`Gemini API client is not configured correctly: ${initializationError}`);
    }
    // Basic check for prompt input
    if (!prompt || typeof prompt !== 'string') {
        console.error("[geminiClient] ❌ Invalid prompt provided to runGemini.");
        throw new Error("Invalid prompt provided.");
    }

    // --- Define REST API Endpoint and Payload ---
    // Use the model name found during initialization, or the default if none found
    const modelNameToUse = defaultModelForGenerateContent; // e.g., 'models/gemini-pro'

    // Construct the correct URL using the model name (which includes 'models/')
    // The endpoint path should NOT include 'models/' if the name already has it.
    // Example: if modelNameToUse is 'models/gemini-pro', URL becomes v1/models/gemini-pro:generateContent
    const url = `https://generativelanguage.googleapis.com/v1/${modelNameToUse}:generateContent?key=${apiKey}`;

    const requestBody = {
        contents: [{
            parts: [{
                text: prompt // The actual user command + instructions
            }]
        }],
        safetySettings,
        generationConfig
    };

    console.log(`[geminiClient] ℹ️ Sending prompt to REST API: ${url.split('?')[0]} (model: ${modelNameToUse})`); // Log URL without key

    try {
        // --- Make the API Call using Axios ---
        const response = await axios.post(url, requestBody, {
            headers: { 'Content-Type': 'application/json' }
        });

        // --- Process the REST API Response ---
        const candidate = response.data?.candidates?.[0];
        const blockReason = response.data?.promptFeedback?.blockReason;

        // Check for blocks first
        if (blockReason) {
             console.error(`[geminiClient] ⚠️ Request blocked by API. Reason: ${blockReason}`);
             throw new Error(`Request blocked by safety filters: ${blockReason}`);
        }

        // Extract the text content safely
        const textContent = candidate?.content?.parts?.[0]?.text;

        // Check if text content exists
        if (textContent === undefined || textContent === null) {
            console.error("[geminiClient] ❌ Error: Could not find text content in API response structure. Response Data:", JSON.stringify(response.data, null, 2)); // Log full response data for debugging
            throw new Error("Invalid response structure received from Gemini REST API (textContent missing).");
        }

        console.log("[geminiClient] ✅ Successfully received text response via REST API.");
        return textContent; // Return the extracted text

    } catch (error) {
        // --- Handle Axios and API Errors ---
        let detailedErrorMessage = error.message || 'Unknown API Error';
        if (error.response) {
            // Got an error response (4xx, 5xx)
            console.error(`[geminiClient] ❌ Gemini REST API Error: ${error.response.status} ${error.response.statusText}`);
            const apiError = error.response.data?.error;
            console.error("[geminiClient] API Response Error Data:", JSON.stringify(apiError || error.response.data, null, 2));
            detailedErrorMessage = `API Error ${error.response.status}: ${apiError?.message || error.response.statusText}`;
            if (error.response.status === 404) detailedErrorMessage += ` (Model '${modelNameToUse}' not found or inaccessible)`;
            else if (error.response.status === 403) detailedErrorMessage += ` (Permission denied - check API Key/Billing/API Enablement)`;
            else if (error.response.status === 400) detailedErrorMessage += ` (Bad request - check prompt/safety settings)`;
        } else if (error.request) {
            // Request made, no response
            console.error('[geminiClient] ❌ Network Error: No response received from Gemini API.');
            detailedErrorMessage = 'Network error: No response received from Gemini API.';
        } else {
            // Error setting up request
            console.error('[geminiClient] ❌ Axios Request Setup Error:', error.message);
        }

        // Re-throw a comprehensive error for the route handler
        throw new Error(`Failed to get response from Gemini API: ${detailedErrorMessage}`);
    }
}
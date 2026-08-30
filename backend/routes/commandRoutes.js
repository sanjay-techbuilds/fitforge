// backend/routes/commandRoutes.js
import express from 'express'; // Use import because your index.js uses ESM
// Adjust path if your utils/geminiClient.js is located elsewhere and ensure it uses ESM export
import { runGemini } from '../utils/geminiClient.js';
// Adjust path if your constants/prompts.js is located elsewhere and ensure it uses ESM export
import { GEMINI_COMMAND_PARSER_PROMPT } from '../constants/prompts.js';

const router = express.Router();

// --- Robust JSON Parsing Function ---
// Handles potential markdown ```json ... ``` blocks or direct JSON
function parseGeminiJsonResponse(responseText) {
  // Guard against null or undefined input
  if (!responseText) {
    console.error('[Backend] JSON Parsing Error: Received null or undefined response text.');
    return null;
  }
  try {
    // 1. Try to find JSON within markdown code blocks
    // This regex looks for ```json followed by any characters (including newlines) until ```
    const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      console.log("[Backend] Parsing JSON found inside markdown block.");
      // Attempt to parse the extracted content
      return JSON.parse(jsonMatch[1]);
    }

    // 2. If no markdown, try parsing the whole string directly
    console.log("[Backend] Attempting to parse the entire response as JSON.");
    // Trim whitespace just in case Gemini added extra spaces
    return JSON.parse(responseText.trim());

  } catch (parseError) {
    console.error('[Backend] JSON Parsing Error:', parseError.message);
    // Log the problematic response for debugging
    console.error('[Backend] Original Gemini Response that failed parsing:', responseText);
    return null; // Indicate parsing failure
  }
}

// --- The API Endpoint ---
// Handles POST requests to /api/voice-command (assuming mounted at /api in your index.js)
router.post('/voice-command', async (req, res) => {
  const { command } = req.body; // Get the transcribed text from React frontend

  // --- Input Validation ---
  if (!command || typeof command !== 'string' || command.trim() === '') {
    console.warn('[Backend] Received invalid command input:', command);
    // Send a user-friendly error message back
    return res.status(400).json({ message: 'Valid command text is required.' });
  }

  const trimmedCommand = command.trim();

  // --- Construct the final prompt for Gemini ---
  // Appends the user's actual spoken command to the instruction prompt
  const fullPrompt = `${GEMINI_COMMAND_PARSER_PROMPT} ${trimmedCommand}`;

  try {
    console.log(`[Backend] Sending command to Gemini for parsing: "${trimmedCommand}"`);

    // --- Call Gemini API ---
    // Make sure runGemini function is correctly implemented and handles potential API errors
    const geminiResponseText = await runGemini(fullPrompt);

    console.log("[Backend] Raw Gemini response received:", geminiResponseText);

    // --- Attempt to parse the response ---
    let parsedCommand = parseGeminiJsonResponse(geminiResponseText);

    // --- Validate the parsed structure and handle parsing failure ---
    if (!parsedCommand || typeof parsedCommand !== 'object' || !parsedCommand.action) {
       console.warn(`[Backend] Failed to parse valid JSON command from Gemini response. Defaulting to 'unknown'. Response was: ${geminiResponseText}`);
       // Send a default 'unknown' action back to React for graceful handling
       // Include the original command so the frontend knows what failed
       parsedCommand = { action: 'unknown', originalCommand: trimmedCommand };
       // Send 200 OK with the 'unknown' action, letting the frontend decide how to inform the user
       return res.status(200).json(parsedCommand);
    }

    // --- Success Case ---
    // If parsing and validation succeeded
    console.log("[Backend] Successfully parsed command:", parsedCommand);
    // Send the structured JSON command back to the React frontend
    res.status(200).json(parsedCommand);

  } catch (error) {
    // --- Handle Errors during API Call ---
    // This catches errors specifically from the runGemini function (e.g., API key issue, network error)
    console.error('[Backend] Error during Gemini API call execution:', error);
    // Send a generic server error back to the frontend
    res.status(500).json({ message: 'Failed to process command via AI service. Please try again later.' });
  }
});

// --- Use ES Module export default ---
// This makes the router available for import in your main server file (index.js)
export default router;
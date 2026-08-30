import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

async function listModels() {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    console.log("✅ Available models:");
    data.models.forEach(model => console.log("-", model.name));
  } catch (err) {
    console.error("❌ Error listing models:", err);
  }
}

listModels();

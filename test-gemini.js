// test-gemini.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

async function runTest() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error("❌ GEMINI_API_KEY missing from .env");
    return;
  }

  console.log("Using API key ending with:", apiKey.slice(-4));

  try {
    const genAI = new GoogleGenerativeAI(apiKey);

    // ✅ Use the correct model name
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = "Hello Gemini, please confirm you are working!";
    console.log("Sending prompt:", prompt);

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log("✅ SUCCESS! Gemini Response:", text);
  } catch (err) {
    console.error("❌ FAILED! Error with Gemini API:", err);
  }
}

runTest();
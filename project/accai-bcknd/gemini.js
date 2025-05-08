// gemini.js
import dotenv from 'dotenv';
dotenv.config();

import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
console.log("Loaded Gemini API Key in server:", process.env.GEMINI_API_KEY);

export async function generateGeminiResponse(prompt) {
  const startTime = Date.now();

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    // First: Main answer
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const response = await result.response;
    const text = await response.text();
    const endTime = Date.now();

    // Second: Ask for confidence score
    const followUpPrompt = `How confident are you in your last response? Return only a number between 0 and 100.`;

    const followUp = await model.generateContent({
      contents: [
        { role: "user", parts: [{ text: prompt }] },
        { role: "model", parts: [{ text }] },
        { role: "user", parts: [{ text: followUpPrompt }] },
      ],
    });

    const confidenceRaw = await followUp.response.text();
    const confidenceLevel = confidenceRaw.match(/\d+/)?.[0] + '%' || "Confidence not available";

    return {
      text,
      timeTaken: endTime - startTime,
      totalTokens: "N/A", // Gemini doesn't expose token count yet
      confidenceLevel,
    };

  } catch (error) {
    console.error('Error generating Gemini response:', error.message);
    throw error;
  }
}

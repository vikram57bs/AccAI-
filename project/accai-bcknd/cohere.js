import dotenv from 'dotenv';
dotenv.config();

import { CohereClient } from 'cohere-ai';

const cohere = new CohereClient({ token: process.env.COHERE_API_KEY });
console.log("Loaded Cohere API Key in server:", process.env.COHERE_API_KEY);

export async function generateCohereResponse(prompt) {
  const startTime = Date.now();

  try {
    // First: Main answer
    const mainRes = await cohere.chat({
      model: 'command-r-plus',
      message: prompt,
      temperature: 0.7,
    });

    const text = mainRes.text;
    const endTime = Date.now();

    // Second: Ask for confidence score
    const followUpPrompt = `Give your confidence level for the above response as a percentage only On a scale of 0 to 100%`;

    const confidenceRes = await cohere.chat({
      model: 'command-r-plus',
      message: `${prompt}\n${text}\n${followUpPrompt}`,
      temperature: 0.7,
    });

    const confidenceRaw = confidenceRes.text;
    const confidenceLevel = confidenceRaw.match(/\d+/)?.[0] + '%' || "Confidence not available";

    return {
      text,
      timeTaken: endTime - startTime,
      totalTokens: "N/A",  // Cohere doesn't always return this
      confidenceLevel,
    };

  } catch (error) {
    console.error('Error generating Cohere response:', error.message);
    throw error;
  }
}

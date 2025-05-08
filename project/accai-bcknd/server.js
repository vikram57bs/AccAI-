import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import { authRoutes } from './models/auth.js';  // Named import
import { generateGeminiResponse } from './gemini.js';  // Correct import
import { generateCohereResponse } from './cohere.js';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
console.log("Loaded Gemini API Key in server:", process.env.GEMINI_API_KEY);
console.log("Loaded Cohere API Key in server:", process.env.COHERE_API_KEY);

// Cohere API route
app.post('/api/cohere', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  console.log("Received prompt for Cohere:", prompt);

  try {
    // Call Cohere API
    const cohereResult = await generateCohereResponse(prompt);
    console.log("Cohere Output (Final):", cohereResult);  // Full response

    if (!cohereResult) {
      return res.status(500).json({ error: "No content received from Cohere API." });
    }

    // Sending result to frontend with metrics
    res.json({
      content: cohereResult.text,
      timeTakenMs: cohereResult.timeTaken,
      totalTokens: cohereResult.totalTokens,
      confidenceLevel: cohereResult.confidenceLevel,
    });

  } catch (error) {
    console.error("Error calling Cohere API:", error.message);
    res.status(500).json({ error: "Failed to generate content from Cohere API." });
  }
});

// Gemini API route
app.post('/api/gemini', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  console.log("Received prompt for Gemini:", prompt);

  try {
    // Call Gemini API
    const geminiResult = await generateGeminiResponse(prompt);
    console.log("Gemini Output (Final):", geminiResult);  // Full response

    // Sending result to frontend with metrics
    res.json({
      content: geminiResult.text,
      timeTakenMs: geminiResult.timeTaken,
      totalTokens: geminiResult.totalTokens,
      confidenceLevel: geminiResult.confidenceLevel,
    });

  } catch (error) {
    console.error("Error calling Gemini API:", error.message);
    res.status(500).json({ error: "Failed to generate content from Gemini API." });
  }
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
  })
  .catch(err => {
    console.error("MongoDB connection error:", err);
  });

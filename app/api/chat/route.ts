import { NextRequest } from "next/server";
import OpenAI from "openai";
import { streamText } from "ai"; // This should be the right streaming helper

export const runtime = "edge"; // Edge runtime is ideal for this

// Replace process.env with the hardcoded API key
const apiKey = "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"; // WARNING: Hardcoding API keys is insecure!

if (!apiKey) {
  throw new Error("Missing OpenAI API key. Please provide a valid API key.");
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey, // Using the hardcoded API key
});

export async function POST(req: NextRequest) {
  try {
    const { messages, model } = await req.json(); // Expecting an array of messages in the POST request

    // Make sure you fall back to a default model if not provided
    const result = await streamText({
      model: model || "gpt-4-turbo", // Fallback to GPT-4 if model is not specified
      messages,
      system: "You are NeuroGPT, a helpful AI assistant.", // Setting a system message to guide the conversation
    });

    // Return the result stream back to the client
    return result.toAIStreamResponse();
  } catch (error) {
    console.error("Error in OpenAI stream:", error); // Logs the error for debugging
    return new Response("Internal Server Error", { status: 500 }); // Return 500 error on failure
  }
}

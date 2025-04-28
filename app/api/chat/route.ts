import { NextRequest } from "next/server";
import OpenAI from "openai";
import { streamText } from "ai"; // This should be the right streaming helper

export const runtime = "edge"; // Edge runtime is ideal for this

const apiKey = process.env.OPENAI_API_KEY; // Optimized placement outside the function

if (!apiKey) {
  throw new Error("Missing OpenAI API key. Make sure it is set at build time.");
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey, // Using the API key loaded from the environment variable
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

import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { NextRequest } from "next/server";

export const runtime = "edge";

const apiKey = process.env.OPENAI_API_KEY; // Move this outside function for slight optimization

if (!apiKey) {
  throw new Error("Missing OpenAI API key. Make sure it is set at build time.");
}

export async function POST(req: NextRequest) {
  try {
    const { messages, model } = await req.json();

    const result = await streamText({
      model: openai(model || "gpt-4-turbo", { apiKey }), // fallback default
      system: "You are NeuroGPT, a helpful AI assistant.",
      messages,
    });

    return result.toAIStreamResponse();
  } catch (error) {
    console.error(error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { NextRequest } from "next/server";

// Load API key from environment
const DEFAULT_API_KEY = process.env.OPENAI_API_KEY!;

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const { messages, model } = await req.json();

    if (!DEFAULT_API_KEY) {
      return new Response("Missing OpenAI API key.", { status: 500 });
    }

    const result = await streamText({
      model: openai(model, { apiKey: DEFAULT_API_KEY }),
      system: "You are NeuroGPT, a helpful AI assistant.",
      messages,
    });

    return result.toAIStreamResponse();
  } catch (error) {
    console.error(error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

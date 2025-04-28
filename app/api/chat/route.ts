import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const { messages, model } = await req.json();

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return new Response("Missing OpenAI API key.", { status: 500 });
    }

    const result = await streamText({
      model: openai(model, { apiKey }),
      system: "You are NeuroGPT, a helpful AI assistant.",
      messages,
    });

    return result.toAIStreamResponse();
  } catch (error) {
    console.error(error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

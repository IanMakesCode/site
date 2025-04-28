import { NextRequest } from 'next/server';
import { OpenAI } from 'openai-edge';

export const runtime = 'edge';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  const { messages } = await req.json();

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages,
    stream: true,
  });

  const stream = response.body;
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain;charset=utf-8',
    },
  });
}

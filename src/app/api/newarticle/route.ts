import { createDataStreamResponse, generateObject, generateText, pipeDataStreamToResponse, simulateReadableStream, streamText } from 'ai';
import { openai } from "@ai-sdk/openai"
import { prisma } from '@/lib/prisma';
import { getTokenUsage, ThrowIfLimitExceed, tokenUsage } from '../utils';
import { z } from 'zod';
import slugify from 'slugify';

const model = openai.responses("gpt-4o-mini")
const usage = tokenUsage("gpt-4o-mini");

export async function POST(request: Request) {
  try {
    await ThrowIfLimitExceed();

    let { prompt } = await request.json();

    prompt = prompt.slice(0, 400) // max 400 chars

    const result = await generateObject({
      model,
      system: "You are a professional blog writer. You create clear, engaging blog titles based on user-submitted ideas. Avoid metaphors, dramatic phrasing, and poetic language. Use a neutral and professional tone.",
        prompt: `Generate a concise, engaging blog title based on the following idea: "${prompt}". 
The title should be broad enough to allow flexibility in the article, and should not include wordplay, colons, or overly abstract terms. 
Return only the title.`,
temperature: 1.5,
      schema: z.object({ title: z.string().describe("Article title")})
    })

    await usage.add(result.usage.promptTokens, result.usage.completionTokens);

    const a = await prisma.article.create({
      data: {
        title: result.object.title,
      }
    })

    return new Response(`${slugify(a.title,{lower:true})}-${a.id}`, 
      { headers: {'Content-Type': "text/plain"} , status: 200 });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate content' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 
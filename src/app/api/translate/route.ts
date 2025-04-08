import {
  createDataStreamResponse,
  pipeDataStreamToResponse,
  simulateReadableStream,
  streamText,
} from "ai";
import { openai } from "@ai-sdk/openai";
import { prisma } from "@/lib/prisma";
import { getTokenUsage, ThrowIfLimitExceed, tokenUsage } from "../utils";

const model = openai.responses("gpt-4o-mini");
const usage = tokenUsage("gpt-4o-mini");

export async function POST(request: Request) {
  try {
    await ThrowIfLimitExceed();

    const { prompt } = await request.json();
    const [id, locale] = prompt.split("-");

    const article = await prisma.article.findUnique({
      where: { id },
      include: { translations: { where: { locale } } },
    });

    if (!article || !article.content) {
      return new Response(JSON.stringify({ error: "Article not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
    const tr = article.translations[0];

    if (!tr) {
      const result = streamText({
        model,
        system: `You are a professional translator. You translate blog articles into the target language provided by the user. The user only provides the name of the target language (e.g., "Spanish", "German", "Japanese").

Always attempt to translate the text, even if the language name is unclear or misspelled — do your best based on context. Never ask for clarification or return errors.

Preserve the tone, structure, and style of the original blog content. Do not include the title unless it is part of the text.`,
        prompt: `Here is a blog article to translate. Translate it into the language specified in my instruction (if any), and preserve the tone and style of the original. Do not include a title unless necessary.

Instruction: ${locale}
Text: ${article.content}`,
        temperature: 0.7,
        onFinish: async (data) => {
          await usage.add(data.usage.promptTokens, data.usage.completionTokens);

          await prisma.translation.create({
            data: {
              id,
              locale,
              content: data.text,
            },
          });
        },
      });

      return result.toDataStreamResponse();
    } else {
      const content = article.content;

      let chunks = [];
      let tokS = 2;
      let sp = content.split(" ");
      for (let i = 0; i < sp.length; i += tokS) {
        let strp = "",
          j = 0;
        for (; j < tokS && i + j < sp.length; j++) {
          strp += sp[i + j] + " ";
        }
        if (j === tokS) strp = strp.slice(0, strp.length - 1);
        chunks.push(strp + " ");
      }

      const stream = simulateReadableStream({
        chunks,
        initialDelayInMs: 0,
        chunkDelayInMs: 2,
      });

      return createDataStreamResponse({
        status: 200,
        statusText: "OK",
        async execute(dataStream) {
          const reader = stream.getReader();
          while (1) {
            const { value, done } = await reader.read();
            if (done) break;
            dataStream.write(`0:${JSON.stringify(value)}\n`);
          }

          dataStream.write(
            `e:{"finishReason":"stop","usage":{"promptTokens":0,"completionTokens":0},"isContinued":false}\n`
          );
          dataStream.write(
            `d:{"finishReason":"stop","usage":{"promptTokens":0,"completionTokens":0}}\n`
          );
        },
      });
    }
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate content" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

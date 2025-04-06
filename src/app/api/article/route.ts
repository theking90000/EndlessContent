import { createDataStreamResponse, pipeDataStreamToResponse, simulateReadableStream, streamText } from 'ai';
import { openai } from "@ai-sdk/openai"
import { prisma } from '@/lib/prisma';

const model = openai.responses("gpt-4o-mini")

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();
    const id = Number(prompt)
    
    const article = await prisma.article.findUnique({
      where:{id}
    });

    if (!article) {
      return new Response(JSON.stringify({ error: 'Article not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if(!article.content) {
      const result = streamText({
        model,
        system: "You are a professional blog writer. Write engaging, informative articles with a clear structure.",
        prompt: `Write a blog article about "${article.title}". The article should be well-structured, engaging, and informative. Include an introduction, main points, and a conclusion.`,
        temperature: 0.7,
        onFinish: async (data) => {
          await prisma.article.update({
            where: {id},
            data: {content: data.text}
          })
        }
      })
      

      return result.toDataStreamResponse(); 
  } else {
    const content = article.content;

    let chunks = [];
    let tokS=2;
    let sp = content.split(' ');
    for(let i = 0; i < sp.length; i+=tokS) {
      let strp = '', j=0;
        for(; j < tokS && (i+j)<sp.length; j++) {
          strp += sp[i+j] + ' '
        }
        if(j===tokS) strp = strp.slice(0, strp.length-1);
        chunks.push(strp+' ');
    }
    
    const stream = simulateReadableStream({
      chunks,
      initialDelayInMs: 0,
      chunkDelayInMs: 5,
    })


    return createDataStreamResponse({
      status: 200,
      statusText: 'OK',
      async execute(dataStream) {
        const reader = stream.getReader();
        while(1) {
          const {value,done} = await reader.read()
          if(done) break;
          dataStream.write(`0:${JSON.stringify(value)}\n`);
        }

        dataStream.write(`e:{"finishReason":"stop","usage":{"promptTokens":0,"completionTokens":0},"isContinued":false}\n`);
        dataStream.write(`d:{"finishReason":"stop","usage":{"promptTokens":0,"completionTokens":0}}\n`)
      },
    });

  }
  
    
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate content' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 
import { createDataStreamResponse, simulateReadableStream, streamText } from 'ai';
import { openai } from "@ai-sdk/openai"
import { prisma } from '@/lib/prisma';
import { Article } from '@prisma/client';

const model = openai.responses("gpt-4o-mini")

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();
    const id = Number(prompt)
    
    const article = await prisma.article.findUnique({
      where:{id},
      select: {
        title: true,
        id:true,
        relatedTo:true,
      }
    });

    if (!article) {
      return new Response(JSON.stringify({ error: 'Article not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    let onRelatedCreated : (a: Article[]) => void = ()=>{};
    let related = new Promise<Article[]>((r) => {
      onRelatedCreated = r;
    });


    let s : any;
    if(article.relatedTo.length === 0) {
      let ps = streamText({
        model,
        system: "Generate 3 engaging blog article titles related to the given topic. Return only the titles, one per line.",
        prompt: `Generate 3 engaging blog article titles related to "${article.title}".`,
        temperature: 0.7,
        onFinish: async (data) => {
          const names = data.text.split('\n').map(n => n.replace(/^[0-9]\./, "").replaceAll('"', '').trim())
          console.log('names=',names)
          let b =[]
          try {
            
            for(const name of names) {
              b.push(await prisma.article.create({
                data: {title:name,relatedFrom:{connect:{id:article.id}}}
              }))
            }
          
          
        }catch(e) {
            console.error(e)
          }

          onRelatedCreated(b);
        }
      });
      s= ps.textStream;
      

     // return result.toDataStreamResponse(); 
  } else {
    s = simulateReadableStream({
      chunks: article.relatedTo.map((a) => a.title).join('\n').split(' '),
      initialDelayInMs: 0,
      chunkDelayInMs: 0,
    });

    onRelatedCreated(article.relatedTo);
  }
  
  return createDataStreamResponse({
    status: 200,
    statusText: 'OK',
    async execute(dataStream) {
      const reader = s.getReader();
      while(1) {
        const {value,done} = await reader.read()
        if(done) break;
        dataStream.write(`0:${JSON.stringify(value+ " ")}\n`);
      }
      const a = await related;
      for (const as of a)
        dataStream.write(`0:${JSON.stringify(`<a>${as.id}\n`)}\n`)

      dataStream.write(`e:{"finishReason":"stop","usage":{"promptTokens":0,"completionTokens":0},"isContinued":false}\n`);
      dataStream.write(`d:{"finishReason":"stop","usage":{"promptTokens":0,"completionTokens":0}}\n`)
    },
  });

    
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate content' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 
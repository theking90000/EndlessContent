import { createDataStreamResponse, simulateReadableStream, streamObject, streamText } from 'ai';
import { openai } from "@ai-sdk/openai"
import { prisma } from '@/lib/prisma';
import { Article } from '@prisma/client';
import { z } from 'zod';
import { ThrowIfLimitExceed, tokenUsage } from '../utils';


const model = openai.responses("gpt-4o-mini")
const usage = tokenUsage("gpt-4o-mini");

const articlesSchema = z.object({
  articleTitles: z.array(z.string().describe("blog article titles"))
})

function getTokenDiff(prev: string[], curr: string[]): string[] {
  const prevJoined = prev.join('\n');
  const currJoined = curr.join('\n');
  return [currJoined.slice(prevJoined.length)];
}

function tokenize(text: string): string[] {
  // Split by word and keep line breaks or space tokens
  return text.split(/(\s+|(?=\n))/).filter(token => token !== '');
}

export async function POST(request: Request) {
  try {
    await ThrowIfLimitExceed();

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
      let ps = streamObject({
        model,
        schema: articlesSchema,
//         system: "Generate 3 engaging blog article titles related to the given topic but they should be open and not restricted, they can lead to other topics."
//         +"Include at least 4 unrelated words in the title." 
//         +"Return only the titles, one per line."
//         + "Here are some example of what is expected"
//         + "\n - The Future of Artificial Intelligence"
//   +"\n - Sustainable Living in Modern Cities" 
//  +"\n - The Art of Mindful Meditation"
//   +"\n - Digital Transformation in Business" 
//   +"\n - The Science of Sleep" 
//   +"\n - Remote Work Revolution" 
//   +"\n - Climate Change Solutions"
//   +"\n - The Psychology of Success"
//   + "\n - Future of Education" 
//   +"\n - Healthy Eating Habits" ,
system: `Generate 3 engaging blog article titles related to the given topic.  
Titles should be broad and open-ended, allowing room to explore related or adjacent subjects.  
Use a neutral and professional tone—avoid metaphors, poetic phrasing, or dramatic language.  
Include at least 4 unrelated, meaningful words in each title.  
Do not use colons, wordplay, or abstract imagery.  
Return only the titles, one per line.  

Example titles:
- The Future of Artificial Intelligence  
- Sustainable Living in Modern Cities  
- The Art of Mindful Meditation  
- Digital Transformation in Business  
- The Science of Sleep  
- Remote Work Revolution  
- Climate Change Solutions  
- The Psychology of Success  
- Future of Education  
- Healthy Eating Habits`,
        prompt: `Generate 3 engaging blog article titles related to "${article.title}".`,
        temperature: 0.7,
        onFinish: async (data) => {
          await usage.add(data.usage.promptTokens, data.usage.completionTokens);

          const names = data.object?.articleTitles as string[]
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
      
      let oldObj = { articleTitles: [ ]}
      let xs = new TransformStream({
        transform(chunk, controller) {
          const diff = getTokenDiff(oldObj.articleTitles, chunk.articleTitles||[]);

          oldObj.articleTitles = chunk.articleTitles||[]
          for (const d of diff) {
            if(d==="") continue
            controller.enqueue(d);
          }
          // // Format the chunk as a token with the required prefix
          // controller.enqueue(`0:${JSON.stringify(chunk + " ")}\n`);
        },
        flush(controller) {

        }
      });
      s=xs.readable

      ps.partialObjectStream.pipeTo(xs.writable);
      

     // return result.toDataStreamResponse(); 
  } else {
    let chunks = []
    for (const {title} of article.relatedTo) {
      let tokS=4;
      for(let i =0; i < title.length; i+=tokS) {
        let strp = '', j=0;
        for(; j < tokS && (i+j)<title.length; j++) {
          strp += title[i+j]
        }
        chunks.push(strp);
      }
      chunks.push('\n');
    }
    s = simulateReadableStream({
      chunks,
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
        dataStream.write(`0:${JSON.stringify(value)}\n`);
      }
      dataStream.write(`0:${JSON.stringify("\n")}\n`)
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
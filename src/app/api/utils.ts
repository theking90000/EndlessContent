import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"

function toDate(d:Date) {
    d.setHours(0);
    d.setMinutes(0)
    d.setMilliseconds(0)
    d.setSeconds(0)
    return d;
}  

function now() {
    return toDate(new Date());
}

export function tokenUsage(model: string) {

    return {
        async add(input: number, output: number) {
            const date = now();

            await prisma.$queryRaw(Prisma.sql`
                insert into "Usage" (date, model, "inputTokens", "outputTokens")
                VALUES (${date}, ${model}, ${input}, ${output})
                ON CONFLICT (date, model)
                DO UPDATE SET "inputTokens" = ("Usage"."inputTokens" + ${input}), "outputTokens" = ("Usage"."outputTokens" + ${output})
                `)
        }
    }
}
type Zusage = { model: string, inputTokens: number, outputTokens: number };
type ZCost = { input: number; output: number; cost: number }

export async function getTokenUsage(date?: Date) {
    const SQL = Prisma.sql`
        SELECT model, SUM("inputTokens") AS "inputTokens", SUM("outputTokens") AS "outputTokens" FROM "Usage"
        ${date ? Prisma.sql`WHERE date = ${toDate(date)}` : Prisma.empty}
        GROUP BY model
    `

    const results:any = await prisma.$queryRaw(SQL);

    return results.map((r:any) => ({
        inputTokens: Number(r.inputTokens),
        outputTokens: Number(r.outputTokens),
        model: r.model
    }) as Zusage);
}

const MODEL_PRICING=  {
    "gpt-4o-mini": [0.15 / 1e6, 0.6 / 1e6],
    "gpt-4o": [2.5 / 1e6, 10 / 1e6]
}

export function GetCumulatedCost(usage: Zusage[]) {
    const cost: ZCost = {  input: 0, cost:0,output:0}

    for (const u of usage) {
        const p: [number,number] = u.model in MODEL_PRICING ? (MODEL_PRICING as any)[(u.model)] : [0, 0];
        
        cost.input += u.inputTokens;
        cost.output += u.outputTokens;
        cost.cost += (u.inputTokens * p[0]) + (u.outputTokens * p[0])
    }

    return cost;
}

export async function ThrowIfLimitExceed(limit = 1 /**1$ */) {
    const usage = await getTokenUsage();
    const cost = GetCumulatedCost(usage);

    if(cost.cost >= limit)
        throw new Error("Budget exceeded!!!")
}
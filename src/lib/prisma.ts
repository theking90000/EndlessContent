import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({log:['query']})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma 

// Add initial data
const initialArticles = [
  { title: "The Future of Artificial Intelligence" },
  {  title: "Sustainable Living in Modern Cities" },
  { title: "The Art of Mindful Meditation" },
  { title: "Digital Transformation in Business" },
  { title: "The Science of Sleep" },
  { title: "Remote Work Revolution" },
  { title: "Climate Change Solutions" },
  { title: "The Psychology of Success" },
  { title: "Future of Education" },
  { title: "Healthy Eating Habits" },
];

if(!(await prisma.article.findFirst())) {
  await prisma.article.createMany({
    data: initialArticles,
  });
}


import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma 

// Add initial data
const initialArticles = [
  { id: 1, title: "The Future of Artificial Intelligence" },
  { id: 2, title: "Sustainable Living in Modern Cities" },
  { id: 3, title: "The Art of Mindful Meditation" },
  { id: 4, title: "Digital Transformation in Business" },
  { id: 5, title: "The Science of Sleep" },
  { id: 6, title: "Remote Work Revolution" },
  { id: 7, title: "Climate Change Solutions" },
  { id: 8, title: "The Psychology of Success" },
  { id: 9, title: "Future of Education" },
  { id: 10, title: "Healthy Eating Habits" },
];

if(!(await prisma.article.findFirst())) {
  await prisma.article.createMany({
    data: initialArticles,
  });
}


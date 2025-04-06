import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import slugify from 'slugify';
import { Article, Prisma } from '@prisma/client';
import { Suspense } from 'react';
// This would typically come from a database or API

export default async function Home() {
  


  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-gray-900">
        Latest Articles
        </h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 text-black">
        <Suspense fallback="">
          <Articles />
        </Suspense>
      </div>
    </div>
  );
}

async function Articles() {
  let first :any[]= []

  const random : Article[] = await prisma.$queryRaw(Prisma.sql`SELECT * FROM "Article"  ORDER BY RANDOM() LIMIT 30`);

  let articles = [...first, ...random]

  return articles.map((article) => (
    <Link
      key={article.id}
      href={`/article/${slugify(article.title,{lower:true})}-${article.id}`}
      className="block p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
    >
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {article.title}
      </h3>
      <p className="text-gray-600">Click to read more...</p>
    </Link>
  ))
} 

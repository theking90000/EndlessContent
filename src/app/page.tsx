import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import slugify from 'slugify';
// This would typically come from a database or API

export default async function Home() {
  const articles = await prisma.article.findMany({
    where:{id: {lte:10, gte: 1}}
  })

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-gray-900">Latest Articles</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
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
        ))}
      </div>
    </div>
  );
}

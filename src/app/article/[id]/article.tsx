'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCompletion } from '@ai-sdk/react';
import { MemoizedMarkdown } from '../../markdown';
import { prisma } from '@/lib/prisma';
import { Article } from '@prisma/client';
import slugify from 'slugify';

export default function ArticlePage({ article }: { article: Article}) {
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const {
    completion,
    error: completionError,
    complete
  } = useCompletion({
    api: '/api/article',
    onError: (error:any) => {
      setError(error.message);
    },
  });

  useEffect(() => {
    complete(String(article.id))
    recommendComplete(String(article.id))
  }, [article.id])


  const {
    completion: recommendationsCompletion,
    isLoading: isRecommendationsLoading,
    complete: recommendComplete
  } = useCompletion({
    api: '/api/recommendations',
  });

  function transformReco(c: string)  {
    const l : {title: string, link?: string}[] = []

    let i =0;
    for(const line of c.split('\n')) {
      if (line.startsWith("<a>")) {
        l[i].link = slugify(l[i].title, {lower:true})+"-"+line.slice(3);
        i++;
        continue;
      }
      
      l.push({ title: line.replace(/^[0-9]\./, "").replaceAll('"', '').trim() });
      
    }

    return l;
  }

  const reco = transformReco(recommendationsCompletion);
  
  return (
    <div className="max-w-4xl mx-auto">
      <Link href="/" className="text-blue-600 hover:text-blue-800 mb-8 inline-block">
        ← Back to Articles
      </Link>
      
      <h1 className="text-4xl font-bold text-gray-900 mb-8">{article.title}</h1>

      {(false) ? (
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      ) : error || completionError ? (
        <div className="text-red-600">{error || completionError?.message}</div>
      ) : (
        <>
          <div className="prose prose-lg max-w-none mb-12 text-black">
            <MemoizedMarkdown content={completion} id={article.title} />
            {/* {completion.split('\n').map((paragraph, index) => (
              <p key={index} className="mb-4">
                {paragraph}
              </p>
            ))} */}
          </div>

          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Recommended Articles</h2>
            {/* {isRecommendationsLoading ? (
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ) : (*/
              <ul className="space-y-2">
                {reco.map(({title,link}, index) => (
                  <li key={index}>
                    <Link
                      href={`/article/${link}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {title}
                    </Link>
                  </li>
                ))}
              </ul>
           /* )} */}
          </div>
        </>
      )}
    </div>
  );
} 
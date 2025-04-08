"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCompletion } from "@ai-sdk/react";
import { MemoizedMarkdown } from "../../markdown";
import { prisma } from "@/lib/prisma";
import { Article } from "@prisma/client";
import slugify from "slugify";

export default function ArticlePage({ article }: { article: Article }) {
  const [locale, setLocale] = useState<string | undefined>();
  const [displayLocale, setDisplayLocale] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  return (
    <div className="max-w-7xl mx-auto px-4">
      <Link
        prefetch={false}
        href="/"
        className="text-blue-600 hover:text-blue-800 mb-8 inline-block"
      >
        ← Back to Articles
      </Link>

      <h1 className="text-4xl font-bold text-gray-900 mb-8">{article.title}</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-3">
          <ArticleContent
            article={article}
            locale={locale}
            onComplete={() => setDisplayLocale(true)}
          />
        </div>

        <div className="md:col-span-1">
          <div className="bg-gray-50 p-6 rounded-lg sticky top-4">
            {displayLocale && (
              <div className="mb-6">
                <label
                  htmlFor="language"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Translate
                </label>
                <input
                  type="text"
                  id="language"
                  placeholder="français, chinois, japonais, ..."
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  ref={input}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setLocale(input.current?.value);
                    }
                  }}
                />
                <button
                  onClick={() => {
                    setLocale(input.current?.value);
                  }}
                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Translate
                </button>
              </div>
            )}
            <h2 className="text-2xl font-semibold mb-4 text-black">
              Recommended Articles
            </h2>
            <ArticleReco article={article} />
          </div>
        </div>
      </div>
    </div>
  );
}

function ArticleReco({ article }: { article: Article }) {
  const {
    completion: recommendationsCompletion,
    isLoading: isRecommendationsLoading,
    complete: recommendComplete,
  } = useCompletion({
    api: "/api/recommendations",
  });

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;

    recommendComplete(String(article.id));
  }, [article.id]);

  const fetched = useRef(false);

  function transformReco(c: string) {
    const l: { title: string; link?: string }[] = [];

    let i = 0;
    for (const line of c.split("\n")) {
      if (line.startsWith("<a>")) {
        l[i].link = slugify(l[i].title, { lower: true }) + "-" + line.slice(3);
        i++;
        continue;
      }

      l.push({
        title: line
          .replace(/^[0-9]\./, "")
          .replaceAll('"', "")
          .trim(),
      });
    }

    return l;
  }

  const reco = transformReco(recommendationsCompletion);

  return (
    <ul className="space-y-2">
      {reco.map(({ title, link }, index) => (
        <li key={index}>
          <Link
            prefetch={false}
            href={`/article/${link}`}
            className="text-blue-600 hover:text-blue-800"
          >
            {title}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function ArticleContent({
  article,
  locale,
  onComplete,
}: {
  article: Article;
  locale?: string;
  onComplete?: () => void;
}) {
  const {
    completion,
    error: completionError,
    complete,
    stop,
    isLoading,
  } = useCompletion({
    api: locale ? "/api/translate" : "/api/article",
    onFinish: () => {
      onComplete?.();
    },
  });

  const fetched = useRef<undefined | string | null>(null);

  useEffect(() => {
    if (fetched.current === locale) return;
    fetched.current = locale;
    stop();
    complete(locale ? `${article.id}-${locale}` : String(article.id));
  }, [article.id, locale]);

  if (completionError) {
    return <div className="text-red-600">{completionError?.message}</div>;
  }

  return (
    <div className="prose prose-lg max-w-none mb-12 text-black">
      <MemoizedMarkdown content={completion} id={article.title} />
      {/* {completion.split('\n').map((paragraph, index) => (
              <p key={index} className="mb-4">
                {paragraph}
              </p>
            ))} */}
    </div>
  );
}

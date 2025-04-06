import { marked } from 'marked';
import { memo, useMemo } from 'react';
import ReactMarkdown, { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';

function parseMarkdownIntoBlocks(markdown: string): string[] {
  const tokens = marked.lexer(markdown);
  return tokens.map(token => token.raw);
}

const markdownComponents : Components= {
  h1: ({ children }) => <h1 className="text-3xl font-bold mb-4 mt-6">{children}</h1>,
  h2: ({ children }) => <h2 className="text-2xl font-bold mb-3 mt-5">{children}</h2>,
  h3: ({ children }) => <h3 className="text-xl font-bold mb-3 mt-4">{children}</h3>,
  h4: ({ children }) => <h4 className="text-lg font-bold mb-2 mt-4">{children}</h4>,
  h5: ({ children }) => <h5 className="text-base font-bold mb-2 mt-3">{children}</h5>,
  h6: ({ children }) => <h6 className="text-sm font-bold mb-2 mt-3">{children}</h6>,
  p: ({ children }) => <p className="mb-4 leading-relaxed">{children}</p>,
  ul: ({ children }) => <ul className="list-disc pl-6 mb-4">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal pl-6 mb-4">{children}</ol>,
  li: ({ children }) => <li className="mb-1">{children}</li>,
  blockquote: ({ children }) => <blockquote className="border-l-4 border-gray-300 pl-4 italic my-4">{children}</blockquote>,
  code: ({ children }) => <code className="bg-gray-100 rounded px-1 py-0.5 font-mono text-sm">{children}</code>,
  pre: ({ children }) => <pre className="bg-gray-100 p-4 rounded mb-4 overflow-x-auto">{children}</pre>,
  a: ({ href, children }) => <a href={href} className="text-blue-600 hover:underline">{children}</a>,
  img: ({ src, alt }) => <img src={src} alt={alt} className="max-w-full h-auto my-4 rounded" />,
  hr: () => <hr className="my-6 border-t border-gray-300" />,
  table: ({ children }) => <table className="min-w-full border-collapse border border-gray-300 mb-4">{children}</table>,
  thead: ({ children }) => <thead className="bg-gray-100">{children}</thead>,
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => <tr className="border-b border-gray-300">{children}</tr>,
  th: ({ children }) => <th className="border border-gray-300 px-4 py-2 text-left">{children}</th>,
  td: ({ children }) => <td className="border border-gray-300 px-4 py-2">{children}</td>,
};

const MemoizedMarkdownBlock = memo(
  ({ content }: { content: string }) => {
    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={markdownComponents}
      >
        {content}
      </ReactMarkdown>
    );
  },
  (prevProps, nextProps) => {
    if (prevProps.content !== nextProps.content) return false;
    return true;
  },
);

MemoizedMarkdownBlock.displayName = 'MemoizedMarkdownBlock';

export const MemoizedMarkdown = memo(
  ({ content, id }: { content: string; id: string }) => {
    return <MemoizedMarkdownBlock content={content}></MemoizedMarkdownBlock>
    // const blocks = useMemo(() => parseMarkdownIntoBlocks(content), [content]);

    // return blocks.map((block, index) => (
    //   <MemoizedMarkdownBlock content={block} key={`${id}-block_${index}`} />
    // ));
  },
);

MemoizedMarkdown.displayName = 'MemoizedMarkdown';
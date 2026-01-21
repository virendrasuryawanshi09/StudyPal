import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';

const MarkdownRender = ({ content }) => {
  return (
    <div className="text-slate-700 dark:text-slate-200 text-sm leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ ...props }) => (
            <h1 className="text-xl font-bold mt-6 mb-3 text-slate-900 dark:text-slate-100" {...props} />
          ),
          h2: ({ ...props }) => (
            <h2 className="text-lg font-semibold mt-5 mb-3 text-slate-900 dark:text-slate-100" {...props} />
          ),
          h3: ({ ...props }) => (
            <h3 className="text-md font-semibold mt-4 mb-2" {...props} />
          ),
          p: ({ ...props }) => (
            <p className="mb-3" {...props} />
          ),
          a: ({ ...props }) => (
            <a
              className="text-indigo-600 dark:text-indigo-400 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            />
          ),
          ul: ({ ...props }) => (
            <ul className="list-disc pl-5 mb-3 space-y-1" {...props} />
          ),
          ol: ({ ...props }) => (
            <ol className="list-decimal pl-5 mb-3 space-y-1" {...props} />
          ),
          li: ({ ...props }) => (
            <li {...props} />
          ),
          strong: ({ ...props }) => (
            <strong className="font-semibold text-slate-900 dark:text-slate-100" {...props} />
          ),
          blockquote: ({ ...props }) => (
            <blockquote
              className="
                border-l-4 border-slate-300 dark:border-slate-600
                pl-4 py-2 my-4
                bg-slate-50 dark:bg-[#232734]
                rounded-md italic
              "
              {...props}
            />
          ),
          code: ({ inline, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');

            if (!inline && match) {
              return (
                <SyntaxHighlighter
                  style={dracula}
                  language={match[1]}
                  PreTag="div"
                  className="rounded-xl my-4 text-sm"
                  {...props}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              );
            }

            return (
              <code
                className="
                  px-1.5 py-0.5 rounded-md
                  bg-slate-100 dark:bg-[#1f2430]
                  text-slate-800 dark:text-slate-200
                  font-mono text-xs
                "
                {...props}
              >
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRender;

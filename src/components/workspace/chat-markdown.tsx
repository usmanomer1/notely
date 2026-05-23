"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

type ChatMarkdownProps = {
  content: string;
  className?: string;
};

export function ChatMarkdown({ content, className }: ChatMarkdownProps) {
  return (
    <div className={cn("chat-markdown", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-amber-800 underline decoration-amber-300 underline-offset-2 hover:text-amber-900"
          >
            {children}
          </a>
        ),
        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
        ul: ({ children }) => (
          <ul className="mb-2 list-disc space-y-1 pl-4 last:mb-0">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="mb-2 list-decimal space-y-1 pl-4 last:mb-0">{children}</ol>
        ),
        li: ({ children }) => <li className="leading-6">{children}</li>,
        strong: ({ children }) => <strong className="font-semibold text-stone-900">{children}</strong>,
        em: ({ children }) => <em className="italic">{children}</em>,
        code: ({ className: codeClassName, children }) => {
          const isBlock = codeClassName?.includes("language-");
          if (isBlock) {
            return (
              <code className="block overflow-x-auto border border-stone-200 bg-stone-50 px-2 py-1.5 font-mono text-xs leading-5 text-stone-800">
                {children}
              </code>
            );
          }
          return (
            <code className="border border-stone-200 bg-stone-100 px-1 py-px font-mono text-[0.85em] text-stone-800">
              {children}
            </code>
          );
        },
        pre: ({ children }) => (
          <pre className="mb-2 overflow-x-auto last:mb-0">{children}</pre>
        ),
        h1: ({ children }) => (
          <h3 className="mb-2 mt-3 text-sm font-semibold text-stone-900 first:mt-0">{children}</h3>
        ),
        h2: ({ children }) => (
          <h3 className="mb-2 mt-3 text-sm font-semibold text-stone-900 first:mt-0">{children}</h3>
        ),
        h3: ({ children }) => (
          <h4 className="mb-1.5 mt-2 text-sm font-medium text-stone-900 first:mt-0">{children}</h4>
        ),
        blockquote: ({ children }) => (
          <blockquote className="mb-2 border-l-2 border-stone-300 pl-3 text-stone-600 last:mb-0">
            {children}
          </blockquote>
        ),
        hr: () => <hr className="my-3 border-stone-200" />,
      }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

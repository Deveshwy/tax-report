'use client';

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  const [isClient, setIsClient] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <div className="whitespace-pre-wrap text-gray-900">{content}</div>;
  }

  if (hasError) {
    return <div className="whitespace-pre-wrap text-gray-900">{content}</div>;
  }

  try {
    return (
      <div className={`prose prose-sm max-w-none ${className}`}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[[rehypeKatex, { 
            strict: false,
            throwOnError: false,
            errorColor: '#cc0000',
            macros: {
              "\\f": "#1f(#2)"
            }
          }]]}
          components={{
            // Math components
            span: ({ children, className, ...props }) => {
              if (className?.includes('math')) {
                return <span className={`${className} katex`} {...props}>{children}</span>;
              }
              return <span className={className} {...props}>{children}</span>;
            },
            div: ({ children, className, ...props }) => {
              if (className?.includes('math')) {
                return <div className={`${className} katex-display`} {...props}>{children}</div>;
              }
              return <div className={className} {...props}>{children}</div>;
            },
        // Headers
        h1: ({ children }) => <h1 className="text-xl font-bold mb-3 text-gray-900">{children}</h1>,
        h2: ({ children }) => <h2 className="text-lg font-semibold mb-2 text-gray-900">{children}</h2>,
        h3: ({ children }) => <h3 className="text-base font-medium mb-2 text-gray-900">{children}</h3>,
        
        // Paragraphs
        p: ({ children }) => <p className="mb-3 text-gray-800 leading-relaxed">{children}</p>,
        
        // Lists
        ul: ({ children }) => <ul className="mb-3 pl-4 space-y-1">{children}</ul>,
        ol: ({ children }) => <ol className="mb-3 pl-4 space-y-1 list-decimal">{children}</ol>,
        li: ({ children }) => <li className="text-gray-800">{children}</li>,
        
        // Code
        code: ({ children, className }) => {
          const isInline = !className;
          if (isInline) {
            return (
              <code className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-sm font-mono">
                {children}
              </code>
            );
          }
          return (
            <code className="block bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm font-mono overflow-x-auto">
              {children}
            </code>
          );
        },
        
        // Block quotes
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-blue-500 pl-4 py-2 mb-3 bg-blue-50 text-gray-800 italic">
            {children}
          </blockquote>
        ),
        
        // Tables
        table: ({ children }) => (
          <div className="overflow-x-auto mb-3">
            <table className="min-w-full border border-gray-200 rounded-lg">
              {children}
            </table>
          </div>
        ),
        th: ({ children }) => (
          <th className="border border-gray-200 bg-gray-50 px-3 py-2 text-left font-semibold text-gray-900">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="border border-gray-200 px-3 py-2 text-gray-800">
            {children}
          </td>
        ),
        
        // Links
        a: ({ children, href }) => (
          <a 
            href={href} 
            className="text-blue-600 hover:text-blue-800 underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {children}
          </a>
        ),
        
        // Strong/Bold
        strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
        
        // Emphasis/Italic
        em: ({ children }) => <em className="italic text-gray-800">{children}</em>,
        }}
        >
          {content}
        </ReactMarkdown>
      </div>
    );
  } catch (error) {
    console.error('Markdown rendering error:', error);
    setHasError(true);
    return <div className="whitespace-pre-wrap text-gray-900">{content}</div>;
  }
}
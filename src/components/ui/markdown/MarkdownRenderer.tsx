import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import { cn } from '../../../lib/utils';

interface MarkdownRendererProps {
  content: string;
  className?: string;
  variant?: 'default' | 'compact' | 'response';
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  className = '',
  variant = 'default'
}) => {
  const baseClasses = 'prose prose-sm max-w-none font-inter';
  
  const variantClasses = {
    default: 'prose-gray',
    compact: 'prose-gray prose-compact',
    response: 'prose-gray prose-response'
  };

  return (
    <div className={cn(baseClasses, variantClasses[variant], className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks, remarkMath]}
        rehypePlugins={[rehypeKatex, rehypeRaw]}
        components={{
          // Headings
          h1: ({ children, ...props }) => (
            <h1 className="text-xl font-semibold text-black mb-4 mt-6 first:mt-0 font-inter" {...props}>
              {children}
            </h1>
          ),
          h2: ({ children, ...props }) => (
            <h2 className="text-lg font-semibold text-black mb-3 mt-5 first:mt-0 font-inter" {...props}>
              {children}
            </h2>
          ),
          h3: ({ children, ...props }) => (
            <h3 className="text-base font-semibold text-black mb-2 mt-4 first:mt-0 font-inter" {...props}>
              {children}
            </h3>
          ),
          h4: ({ children, ...props }) => (
            <h4 className="text-sm font-semibold text-black mb-2 mt-3 first:mt-0 font-inter" {...props}>
              {children}
            </h4>
          ),
          h5: ({ children, ...props }) => (
            <h5 className="text-sm font-medium text-black mb-1 mt-3 first:mt-0 font-inter" {...props}>
              {children}
            </h5>
          ),
          h6: ({ children, ...props }) => (
            <h6 className="text-sm font-medium text-gray-700 mb-1 mt-2 first:mt-0 font-inter" {...props}>
              {children}
            </h6>
          ),
          
          // Paragraphs
          p: ({ children, ...props }) => (
            <p className="text-sm text-black mb-3 leading-relaxed font-inter" {...props}>
              {children}
            </p>
          ),
          
          // Lists
          ul: ({ children, ...props }) => (
            <ul className="list-disc list-inside mb-3 space-y-1 text-sm text-black font-inter" {...props}>
              {children}
            </ul>
          ),
          ol: ({ children, ...props }) => (
            <ol className="list-decimal list-inside mb-3 space-y-1 text-sm text-black font-inter" {...props}>
              {children}
            </ol>
          ),
          li: ({ children, ...props }) => (
            <li className="text-sm text-black leading-relaxed font-inter" {...props}>
              {children}
            </li>
          ),
          
          // Emphasis
          strong: ({ children, ...props }) => (
            <strong className="font-semibold text-black font-inter" {...props}>
              {children}
            </strong>
          ),
          em: ({ children, ...props }) => (
            <em className="italic text-black font-inter" {...props}>
              {children}
            </em>
          ),
          
          // Code
          code: ({ children, className, ...props }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-xs font-mono font-inter" {...props}>
                  {children}
                </code>
              );
            }
            return (
              <code className="block bg-gray-50 text-gray-800 p-3 rounded-lg text-xs font-mono overflow-x-auto font-inter" {...props}>
                {children}
              </code>
            );
          },
          pre: ({ children, ...props }) => (
            <pre className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-3 overflow-x-auto" {...props}>
              {children}
            </pre>
          ),
          
          // Blockquotes
          blockquote: ({ children, ...props }) => (
            <blockquote className="border-l-4 border-blue-200 pl-4 py-2 mb-3 bg-blue-50 italic text-sm text-gray-700 font-inter" {...props}>
              {children}
            </blockquote>
          ),
          
          // Links
          a: ({ children, href, ...props }) => (
            <a 
              href={href} 
              className="text-blue-600 hover:text-blue-800 underline font-inter" 
              target="_blank" 
              rel="noopener noreferrer"
              {...props}
            >
              {children}
            </a>
          ),
          
          // Tables
          table: ({ children, ...props }) => (
            <div className="overflow-x-auto mb-3">
              <table className="min-w-full border border-gray-200 rounded-lg font-inter" {...props}>
                {children}
              </table>
            </div>
          ),
          thead: ({ children, ...props }) => (
            <thead className="bg-gray-50" {...props}>
              {children}
            </thead>
          ),
          tbody: ({ children, ...props }) => (
            <tbody className="divide-y divide-gray-200" {...props}>
              {children}
            </tbody>
          ),
          tr: ({ children, ...props }) => (
            <tr className="hover:bg-gray-50" {...props}>
              {children}
            </tr>
          ),
          th: ({ children, ...props }) => (
            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200 font-inter" {...props}>
              {children}
            </th>
          ),
          td: ({ children, ...props }) => (
            <td className="px-4 py-2 text-sm text-black border-b border-gray-200 font-inter" {...props}>
              {children}
            </td>
          ),
          
          // Horizontal rule
          hr: ({ ...props }) => (
            <hr className="my-6 border-gray-300" {...props} />
          ),
          
          // Images
          img: ({ src, alt, ...props }) => (
            <img 
              src={src} 
              alt={alt} 
              className="max-w-full h-auto rounded-lg mb-3 shadow-sm" 
              {...props} 
            />
          ),

          // Math components - KaTeX will handle these automatically
          // Global CSS will style them properly
          div: ({ children, className, ...props }) => {
            // Handle block math equations
            if (className?.includes('math-display')) {
              return (
                <div className="math-display" {...props}>
                  {children}
                </div>
              );
            }
            return <div className={className} {...props}>{children}</div>;
          },
          
          span: ({ children, className, ...props }) => {
            // Handle inline math equations
            if (className?.includes('math-inline')) {
              return (
                <span className="math-inline" {...props}>
                  {children}
                </span>
              );
            }
            return <span className={className} {...props}>{children}</span>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
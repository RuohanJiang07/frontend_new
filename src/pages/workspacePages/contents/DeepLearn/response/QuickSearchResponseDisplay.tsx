import React from 'react';
import { MarkdownRenderer } from '../../../../../components/ui/markdown';

interface QuickSearchResponseDisplayProps {
  content: string;
  isStreaming: boolean;
}

function QuickSearchResponseDisplay({ content, isStreaming }: QuickSearchResponseDisplayProps) {
  // Helper function to process highlight tags in content
  const processHighlightTags = (content: string): string => {
    if (!content || typeof content !== 'string') return content;
    
    // Replace <highlight>...</highlight> tags with HTML mark elements with light blue background
    return content.replace(
      /<highlight>(.*?)<\/highlight>/g, 
      '<mark class="bg-blue-100 text-blue-900 px-1 py-0.5 rounded font-medium">$1</mark>'
    );
  };

  // Process the content to handle highlights
  const processedContent = processHighlightTags(content);

  return (
    <div className="space-y-4">
      {/* Main Content with Markdown Support */}
      <div className="mb-4">
        <MarkdownRenderer 
          content={processedContent}
          variant="response"
          className="text-sm leading-relaxed"
        />
        
        {/* Streaming indicator */}
        {isStreaming && (
          <span className="inline-block w-2 h-4 bg-gray-400 ml-1 animate-pulse"></span>
        )}
      </div>

      {/* Loading indicator for ongoing process */}
      {isStreaming && (
        <div className="flex items-center gap-2 text-blue-600">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-sm font-['Inter',Helvetica]">Processing quick search content...</span>
        </div>
      )}
    </div>
  );
}

export default QuickSearchResponseDisplay;
import React, { useState } from 'react';
import { DeepLearnStreamingData } from '../../../../../api/workspaces/deep_learning/deepLearn_deeplearn';
import { MarkdownRenderer } from '../../../../../components/ui/markdown';
import { ChevronDownIcon, ChevronRightIcon, HelpCircleIcon } from 'lucide-react';

interface DeepLearnResponseDisplayProps {
  deepLearnData: DeepLearnStreamingData;
  isStreaming: boolean;
}

// Question-Answer pair interface
interface QuestionAnswerPair {
  question: string;
  answer: string;
}

// QuestionArea component for rendering collapsible Q&A sections
const QuestionArea: React.FC<{ pairs: QuestionAnswerPair[] }> = ({ pairs }) => {
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set());

  const toggleQuestion = (index: number) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedQuestions(newExpanded);
  };

  return (
    <div className="my-6 space-y-3">
      {pairs.map((pair, index) => (
        <div key={index} className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
          {/* Question Header - Always Visible */}
          <div
            className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => toggleQuestion(index)}
          >
            <div className="flex items-center gap-3 flex-1">
              <HelpCircleIcon className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <span className="text-sm font-medium text-gray-900 font-['Inter',Helvetica] leading-relaxed">
                {pair.question}
              </span>
            </div>
            <div className="flex-shrink-0 ml-3">
              {expandedQuestions.has(index) ? (
                <ChevronDownIcon className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronRightIcon className="w-5 h-5 text-gray-500" />
              )}
            </div>
          </div>

          {/* Answer Content - Collapsible */}
          {expandedQuestions.has(index) && (
            <div className="border-t border-gray-100 bg-gray-50">
              <div className="p-4">
                <MarkdownRenderer 
                  content={pair.answer}
                  variant="response"
                  className="text-sm leading-relaxed"
                />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

function DeepLearnResponseDisplay({ deepLearnData, isStreaming }: DeepLearnResponseDisplayProps) {
  // Helper function to process highlight tags in content
  const processHighlightTags = (content: string): string => {
    if (!content || typeof content !== 'string') return content;
    
    // Replace <highlight>...</highlight> tags with HTML mark elements with light blue background
    return content.replace(
      /<highlight>(.*?)<\/highlight>/g, 
      '<mark class="bg-blue-100 text-blue-900 px-1 py-0.5 rounded font-medium">$1</mark>'
    );
  };

  // Helper function to extract and parse question areas
  const extractQuestionAreas = (content: string): { content: string; questionAreas: QuestionAnswerPair[][] } => {
    if (!content || typeof content !== 'string') return { content, questionAreas: [] };

    const questionAreas: QuestionAnswerPair[][] = [];
    let processedContent = content;

    // Find all question_area blocks
    const questionAreaRegex = /<question_area>\s*([\s\S]*?)\s*<\/question_area>/g;
    let match;

    while ((match = questionAreaRegex.exec(content)) !== null) {
      const questionAreaContent = match[1];
      const pairs: QuestionAnswerPair[] = [];

      // Extract question-answer pairs within this question_area
      const qaRegex = /<question>(.*?)<\/question>\s*<answer>(.*?)<\/answer>/g;
      let qaMatch;

      while ((qaMatch = qaRegex.exec(questionAreaContent)) !== null) {
        pairs.push({
          question: qaMatch[1].trim(),
          answer: qaMatch[2].trim()
        });
      }

      if (pairs.length > 0) {
        questionAreas.push(pairs);
      }
    }

    // Remove question_area blocks from the main content
    processedContent = processedContent.replace(questionAreaRegex, '<!-- QUESTION_AREA_PLACEHOLDER -->');

    return { content: processedContent, questionAreas };
  };

  // Helper function to render LLM response content with markdown support, highlight processing, and question areas
  const renderLLMResponse = (llmResponse: any) => {
    if (!llmResponse) return null;

    // If it's a string, process highlights, extract question areas, and render with markdown support
    if (typeof llmResponse === 'string') {
      const { content: mainContent, questionAreas } = extractQuestionAreas(llmResponse);
      const processedContent = processHighlightTags(mainContent);

      // Split content by question area placeholders
      const contentParts = processedContent.split('<!-- QUESTION_AREA_PLACEHOLDER -->');

      return (
        <div>
          {contentParts.map((part, index) => (
            <React.Fragment key={index}>
              {/* Render main content part */}
              {part.trim() && (
                <MarkdownRenderer 
                  content={part}
                  variant="response"
                  className="text-sm leading-relaxed"
                />
              )}
              
              {/* Render question area if it exists for this index */}
              {questionAreas[index] && (
                <QuestionArea pairs={questionAreas[index]} />
              )}
            </React.Fragment>
          ))}
        </div>
      );
    }

    // If it's an object, try to extract meaningful content
    if (typeof llmResponse === 'object') {
      // Look for common content fields
      const content = llmResponse.content || 
                    llmResponse.text || 
                    llmResponse.response || 
                    llmResponse.message ||
                    JSON.stringify(llmResponse, null, 2);

      if (typeof content === 'string') {
        const { content: mainContent, questionAreas } = extractQuestionAreas(content);
        const processedContent = processHighlightTags(mainContent);

        // Split content by question area placeholders
        const contentParts = processedContent.split('<!-- QUESTION_AREA_PLACEHOLDER -->');

        return (
          <div>
            {contentParts.map((part, index) => (
              <React.Fragment key={index}>
                {/* Render main content part */}
                {part.trim() && (
                  <MarkdownRenderer 
                    content={part}
                    variant="response"
                    className="text-sm leading-relaxed"
                  />
                )}
                
                {/* Render question area if it exists for this index */}
                {questionAreas[index] && (
                  <QuestionArea pairs={questionAreas[index]} />
                )}
              </React.Fragment>
            ))}
          </div>
        );
      } else {
        // Fallback to JSON display with markdown
        return (
          <MarkdownRenderer 
            content={`\`\`\`json\n${JSON.stringify(content, null, 2)}\n\`\`\``}
            variant="response"
            className="text-sm leading-relaxed"
          />
        );
      }
    }

    return null;
  };

  return (
    <div className="space-y-4">
      {/* Progress information */}
      {deepLearnData.progress && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-800 font-['Inter',Helvetica]">
              Progress: {deepLearnData.progress.current_completions}/{deepLearnData.progress.total_expected_completions}
            </span>
            <span className="text-sm text-blue-600 font-['Inter',Helvetica]">
              {deepLearnData.progress.progress_percentage}%
            </span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${deepLearnData.progress.progress_percentage}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Stream info */}
      {deepLearnData.stream_info && (
        <div className="text-sm text-gray-600 mb-4 font-['Inter',Helvetica]">
          {deepLearnData.stream_info}
        </div>
      )}

      {/* Newly completed item */}
      {deepLearnData.newly_completed_item && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
          <div className="text-sm font-medium text-green-800 font-['Inter',Helvetica]">
            ✅ Completed: {deepLearnData.newly_completed_item.description}
          </div>
          <div className="text-xs text-green-600 mt-1 font-['Inter',Helvetica]">
            Section: {deepLearnData.newly_completed_item.section} | 
            Type: {deepLearnData.newly_completed_item.type}
          </div>
        </div>
      )}

      {/* LLM Response content - Now rendered with Markdown support, highlight processing, and question areas */}
      {deepLearnData.llm_response && (
        <div className="mb-4">
          {renderLLMResponse(deepLearnData.llm_response)}
        </div>
      )}

      {/* Generation status - Only show if it contains useful information */}
      {deepLearnData.generation_status && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
          <div className="text-sm font-medium text-yellow-800 mb-2 font-['Inter',Helvetica]">
            Generation Status
          </div>
          <div className="text-sm text-yellow-700 font-['Inter',Helvetica]">
            {typeof deepLearnData.generation_status === 'string' 
              ? deepLearnData.generation_status 
              : JSON.stringify(deepLearnData.generation_status, null, 2)
            }
          </div>
        </div>
      )}

      {/* Final status */}
      {deepLearnData.final && (
        <div className="bg-green-100 border border-green-300 rounded-lg p-3">
          <div className="text-green-800 font-medium font-['Inter',Helvetica]">
            🎉 Deep learning process completed!
          </div>
          {deepLearnData.total_streams_sent && (
            <div className="text-sm text-green-600 mt-1 font-['Inter',Helvetica]">
              Total streams sent: {deepLearnData.total_streams_sent}
            </div>
          )}
        </div>
      )}

      {/* Loading indicator for ongoing process */}
      {isStreaming && !deepLearnData.final && (
        <div className="flex items-center gap-2 text-blue-600">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-sm font-['Inter',Helvetica]">Processing deep learning content...</span>
        </div>
      )}
    </div>
  );
}

export default DeepLearnResponseDisplay;
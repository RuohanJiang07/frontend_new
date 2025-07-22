import React, { useState, useRef, useEffect } from 'react';
import { useTabContext } from '../../../workspaceFrame/TabContext';
import './ProblemHelpResponse.css';
import { MarkdownRenderer } from '../../../../../components/ui/markdown';
import { submitProblemSolverSolution } from '../../../../../api/workspaces/problem_help/ProblemHelpMain';
import { useToast } from '../../../../../hooks/useToast';
import { getProblemSolverHistoryConversation, ProblemSolverHistoryItem } from '../../../../../api/workspaces/problem_help/getHistory';

interface ProblemHelpResponseProps {
  onBack: () => void;
  tabIdx?: number;
  pageIdx?: number;
  screenId?: string;
  uniqueTabId?: string;
}

// Conversation message interface
interface ConversationMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isStreaming?: boolean;
  streamingContent?: string;
  concepts?: Array<{
    title: string;
    explanation: string;
  }>;
}

const ProblemHelpResponse: React.FC<ProblemHelpResponseProps> = ({ onBack, tabIdx = 0, pageIdx = 0, screenId = '', uniqueTabId }) => {
  const { switchToProblemHelp, getActiveScreens, activePage } = useTabContext();
  const { error, success } = useToast();
  
  // Helper function to extract concepts from content
  const extractConcepts = (content: string): { cleanContent: string; concepts: Array<{ title: string; explanation: string }> } => {
    if (!content || typeof content !== 'string') {
      return { cleanContent: content, concepts: [] };
    }

    const concepts: Array<{ title: string; explanation: string }> = [];
    
    // Regex to match <<concept::explanation>> format
    const conceptRegex = /<<([^:]+)::([^>]+)>>/g;
    let match;
    
    // Extract all concepts
    while ((match = conceptRegex.exec(content)) !== null) {
      const title = match[1].trim();
      const explanation = match[2].trim();
      concepts.push({ title, explanation });
    }
    
    // Remove concept definitions from content and replace with highlighted concept names
    let cleanContent = content.replace(conceptRegex, (fullMatch, conceptName) => {
      const trimmedName = conceptName.trim();
      return `<mark class="bg-blue-100 text-blue-900 px-1 py-0.5 rounded font-medium">${trimmedName}</mark>`;
    });
    
    return { cleanContent, concepts };
  };
  // Detect if we're in split screen mode
  const activeScreens = getActiveScreens(activePage);
  const isInSplitMode = activeScreens.length > 1 && !activeScreens.some(screen => screen.state === 'full-screen');
  const [followUpQuestion, setFollowUpQuestion] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [profileSelected, setProfileSelected] = useState(false);
  const [referenceSelected, setReferenceSelected] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [conversationId, setConversationId] = useState<string>('');
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);
  const [loadedHistoryData, setLoadedHistoryData] = useState<any[] | null>(null);
  const [isHistoryConversation, setIsHistoryConversation] = useState(false);

  // Refs for scroll handling
  const conversationMainRef = useRef<HTMLDivElement>(null);
  const scrollbarThumbRef = useRef<HTMLDivElement>(null);

  // Helper function to generate UUID
  const generateUUID = (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  // Helper function to generate conversation ID in ps-c-{uuid} format
  const generateConversationId = (): string => {
    const uuid = generateUUID();
    return `ps-c-${uuid}`;
  };

  // Load saved data for this tab and initialize conversation history
  useEffect(() => {
    // Use the provided unique tab ID
    const tabId = uniqueTabId || `${pageIdx}-${screenId}-${tabIdx}`;
    const isHistoryLoaded = localStorage.getItem(`problemhelp_history_loaded_${tabId}`) === 'true';
    const savedConversationId = localStorage.getItem(`problemhelp_conversation_${tabId}`);
    
    console.log('🔍 Loading conversation data for tab:', tabId);

    // Check if this is a loaded history conversation
    if (isHistoryLoaded && savedConversationId) {
      console.log('📂 Loading history conversation data for tab:', tabId);
      
      // Load the full conversation from the API
      const loadHistoryConversation = async () => {
        try {
          const response = await getProblemSolverHistoryConversation(savedConversationId);
          
          if (response.success && response.conversation_json) {
            setLoadedHistoryData(response.conversation_json);
            setIsHistoryConversation(true);
            setConversationId(savedConversationId);
            console.log('🆔 Set conversation ID from history:', savedConversationId);
            
            // Convert history data to conversation messages
            const messages: ConversationMessage[] = [];
            
            response.conversation_json.forEach((item: ProblemSolverHistoryItem, index) => {
              // Add user message
              messages.push({
                id: `history-user-${index}`,
                type: 'user',
                content: item.user_query,
                timestamp: new Date(item.time).toLocaleString()
              });
              
              // Add assistant message if response exists
              if (item.llm_response) {
                const { cleanContent, concepts } = extractConcepts(item.llm_response);
                messages.push({
                  id: `history-assistant-${index}`,
                  type: 'assistant',
                  content: cleanContent,
                  timestamp: 'Assistant',
                  concepts: concepts
                });
              }
            });
            
            setConversationHistory(messages);
            console.log('✅ Loaded history conversation with', messages.length, 'messages');
          } else {
            console.error('Failed to load history conversation:', response.message);
            error('Failed to load conversation history');
          }
        } catch (error) {
          console.error('❌ Error loading history conversation:', error);
          error('Failed to load conversation history');
          // Clear the history flags and fall through to normal loading
          localStorage.removeItem(`problemhelp_history_loaded_${tabId}`);
        }
      };
      
      loadHistoryConversation();
      return; // Exit early for history conversations
    }
    
    // For non-history conversations, load conversation ID from localStorage
    if (savedConversationId) {
      setConversationId(savedConversationId);
      console.log('🆔 Loaded conversation ID from localStorage:', savedConversationId);
    } else {
      console.error('❌ No conversation ID found in localStorage for tab:', tabId);
      console.log('🔍 Available localStorage keys:', Object.keys(localStorage).filter(key => key.includes('problemhelp')));
      error('No conversation found. Please start a new conversation from the entry page.');
      return;
    }
    
    // For non-history conversations, check if we have streaming data
    const savedQuery = localStorage.getItem(`problemhelp_query_${tabId}`);
    const savedProfile = localStorage.getItem(`problemhelp_profile_${tabId}`);
    const savedStreamingContent = localStorage.getItem(`problemhelp_streaming_content_${tabId}`) || '';
    const isStreamingComplete = localStorage.getItem(`problemhelp_streaming_complete_${tabId}`) === 'true';
    
    if (savedQuery) {
      console.log('📂 Resuming existing problem help conversation:', {
        tabId,
        conversationId: savedConversationId,
        query: savedQuery,
        profile: savedProfile,
        streamingContentLength: savedStreamingContent.length,
        isStreamingComplete
      });
      
      // Initialize conversation history with the first message
      const initialUserMessage: ConversationMessage = {
        id: 'initial-user',
        type: 'user',
        content: savedQuery,
        timestamp: 'Me, ' + new Date().toLocaleString()
      };

      const initialAssistantMessage: ConversationMessage = {
        id: 'initial-assistant',
        type: 'assistant',
        content: '',
        streamingContent: isStreamingComplete ? savedStreamingContent : '',
        timestamp: 'Assistant',
        isStreaming: !isStreamingComplete
      };

      setConversationHistory([initialUserMessage, initialAssistantMessage]);
      
      // Listen for streaming updates
      const handleStreamingUpdate = (event: CustomEvent) => {
        if (event.detail.tabId === tabId) {
          console.log('📥 Received streaming update:', event.detail.content.substring(0, 100) + '...');
          setConversationHistory(prev => 
            prev.map(msg => 
              msg.id === 'initial-assistant'
                ? { ...msg, streamingContent: event.detail.content, isStreaming: true }
                : msg
            )
          );
        }
      };

      const handleStreamingComplete = (event: CustomEvent) => {
        if (event.detail.tabId === tabId) {
          console.log('✅ Problem Help streaming completed');
          
          setConversationHistory(prev => 
            prev.map(msg => 
              msg.id === 'initial-assistant' ? {
                ...msg, 
                isStreaming: false,
                content: (() => {
                  const finalContent = msg.streamingContent || msg.content;
                  const { cleanContent } = extractConcepts(finalContent);
                  return cleanContent;
                })()
              } : msg
            )
          );
        }
      };

      window.addEventListener('problemhelp-streaming-update', handleStreamingUpdate as EventListener);
      window.addEventListener('problemhelp-streaming-complete', handleStreamingComplete as EventListener);

      return () => {
        window.removeEventListener('problemhelp-streaming-update', handleStreamingUpdate as EventListener);
        window.removeEventListener('problemhelp-streaming-complete', handleStreamingComplete as EventListener);
      };
    } else {
      console.log('No saved data found, using defaults');
    }
  }, [error, pageIdx, screenId, tabIdx]);

  // Handle submitting follow-up question
  const handleSubmitFollowUp = async () => {
    if (!followUpQuestion.trim() || isSubmitting) {
      return;
    }

    // Validate conversation ID exists - if not, this is an error state
    if (!conversationId) {
      error('No conversation ID found for follow-up question. Please start a new conversation.');
      console.error('❌ No conversation ID available for follow-up. Current state:', {
        conversationId,
        conversationHistoryLength: conversationHistory.length,
        isHistoryConversation
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      console.log('🔄 Starting follow-up question in existing conversation:', {
        conversationId: conversationId,
        query: followUpQuestion.trim(),
        isNewConversation: conversationHistory.length === 0, // New if no history
        isHistoryConversation
      });
      
      // Add user message to conversation history
      const newUserMessage: ConversationMessage = {
        id: `user-${Date.now()}`,
        type: 'user',
        content: followUpQuestion.trim(),
        timestamp: 'Me, ' + new Date().toLocaleString()
      };

      // Add assistant message placeholder
      const newAssistantMessage: ConversationMessage = {
        id: `assistant-${Date.now()}`,
        type: 'assistant',
        content: '',
        timestamp: 'Assistant',
        isStreaming: true
      };

      setConversationHistory(prev => [...prev, newUserMessage, newAssistantMessage]);
      
      // Clear input immediately after submission
      const queryToSubmit = followUpQuestion.trim();
      setFollowUpQuestion('');

      // Determine if this is a new conversation or follow-up
      const isNewConversation = conversationHistory.length === 0;
      
      console.log('📤 About to call API:', {
        conversationId: conversationId,
        isNewConversation,
        existingConversationId: isNewConversation ? undefined : conversationId,
        generatedConversationId: isNewConversation ? conversationId : undefined
      });
      
      // Start problem solver
      await submitProblemSolverSolution(
        queryToSubmit,
        profileSelected ? 'selected' : undefined,
        null, // references
        (data: string) => {
          console.log('📥 Received follow-up streaming data:', data);
          // Update the streaming content for the current assistant message
          setConversationHistory(prev => 
            prev.map(msg => 
              msg.id === newAssistantMessage.id
                ? { 
                    ...msg, 
                    streamingContent: (msg.streamingContent || '') + data,
                    isStreaming: true
                  }
                : msg
            )
          );
        },
        (errorMsg: string) => {
          console.error('Problem Help follow-up streaming error:', errorMsg);
          error(`Streaming error: ${errorMsg}`);
          setIsSubmitting(false);
        },
        () => {
          console.log('Problem Help follow-up streaming completed');
          // Mark streaming as complete
          setConversationHistory(prev => 
            prev.map(msg => 
              msg.id === newAssistantMessage.id ? {
                ...msg, 
                isStreaming: false,
                content: (() => {
                  const finalContent = msg.streamingContent || msg.content;
                  const { cleanContent } = extractConcepts(finalContent);
                  return cleanContent;
                })()
              } : msg
            )
          );
          setIsSubmitting(false);
        },
        isNewConversation ? undefined : conversationId, // existing conversation ID
        isNewConversation ? conversationId : undefined  // generated conversation ID for new
      );
      
    } catch (err) {
      console.error('Error submitting follow-up question:', err);
      error('Failed to submit question. Please try again.');
      setIsSubmitting(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitFollowUp();
    }
  };

  const toggleProfile = () => {
    setProfileSelected(!profileSelected);
  };

  const toggleReference = () => {
    setReferenceSelected(!referenceSelected);
  };

  // Render the main response content for a message
  const renderMessageContent = (message: ConversationMessage) => {
    if (message.type === 'user') {
      return (
        <div className="problem-help-response-question">
          <span className="problem-help-response-question-date">
            {message.timestamp}
          </span>
          <div className="problem-help-response-question-box">
            <span className="problem-help-response-question-text">
              {message.content}
            </span>
          </div>
        </div>
      );
    }

    // Assistant message - use stored concepts or extract from current content
    const currentContent = message.streamingContent || message.content;
    
    // For history messages, use the pre-extracted concepts and content
    // For streaming messages, extract concepts from current content
    let cleanContent: string;
    let concepts: Array<{ title: string; explanation: string }>;
    
    if (message.concepts && message.id.startsWith('history-assistant-')) {
      // Use pre-extracted concepts and content for history messages
      cleanContent = currentContent;
      concepts = message.concepts;
    } else {
      // Extract concepts for new/streaming messages
      const extracted = extractConcepts(currentContent);
      cleanContent = extracted.cleanContent;
      concepts = extracted.concepts;
    }

    return (
      <div className="problem-help-response-answer">
        <div className="problem-help-response-answer-header">
          <span className="problem-help-response-answer-title">{message.timestamp}</span>
          <div className="problem-help-response-solution-tag">Solution</div>
        </div>
        
        <div className="problem-help-response-answer-content">
          {/* Main Solution - No box wrapper */}
          <div className="problem-help-response-solution">
            {cleanContent && !message.isStreaming ? (
              <MarkdownRenderer 
                content={cleanContent}
                variant="response"
                className="text-sm leading-relaxed"
              />
            ) : cleanContent && message.isStreaming ? (
              <div>
                <MarkdownRenderer 
                  content={cleanContent}
                  variant="response"
                  className="text-sm leading-relaxed"
                />
                <div className="flex items-center gap-2 text-blue-600 mt-2">
                  <div className="w-3 h-4 bg-[#4C6694] animate-pulse"></div>
                  <span className="text-sm font-['Inter',Helvetica]">Streaming response...</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-blue-600 py-4">
                <div className="w-3 h-4 bg-[#4C6694] animate-pulse"></div>
                <span className="text-sm font-['Inter',Helvetica]">Generating solution...</span>
              </div>
            )}
          </div>
          
          {/* Key Concepts Sidebar - Show extracted concepts */}
          {concepts && concepts.length > 0 && (
            <div className="problem-help-response-concepts">
              {concepts.map((concept, index) => (
                <div key={index} className="problem-help-response-concept-box">
                  <div className="problem-help-response-concept-header">
                    <img
                      src="/workspace/problemSolver/related-concepts.svg"
                      alt="Related concepts"
                      className="problem-help-response-concept-icon"
                    />
                    <span className="problem-help-response-concept-title">{concept.title}</span>
                  </div>
                  <div className="problem-help-response-concept-body">
                    <p className="problem-help-response-concept-text">
                      {concept.explanation}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Action Buttons */}
        {cleanContent && !message.isStreaming && (
          <div className="problem-help-response-actions">
            <button className="problem-help-response-action-button">
              <img
                src="/workspace/copy.svg"
                alt="Copy"
                className="problem-help-response-action-icon"
              />
            </button>
            <button className="problem-help-response-action-button">
              <img
                src="/workspace/documentChat/thumbsup.svg"
                alt="Thumbs up"
                className="problem-help-response-action-icon"
              />
            </button>
            <button className="problem-help-response-action-button">
              <img
                src="/workspace/documentChat/thumbsdown.svg"
                alt="Thumbs down"
                className="problem-help-response-action-icon"
              />
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="problem-help-response">
      {/* Header Section */}
      <header className="problem-help-response-header">
        {/* Left-aligned elements */}
        <div className="problem-help-response-header-left">
          {/* Back Arrow */}
          <button
            onClick={() => switchToProblemHelp(pageIdx, screenId, tabIdx)}
            className="problem-help-response-back-button"
            aria-label="Go back to problem help entry"
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path 
                d="M17.4168 10.9999H4.5835M4.5835 10.9999L11.0002 17.4166M4.5835 10.9999L11.0002 4.58325" 
                stroke="#00276C" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {/* Conversation Title */}
          <h1 className="problem-help-response-title">
            Problem Help: Solving the derivatives
          </h1>

          {/* Conversation Tag */}
          <div className="problem-help-response-tag">
            <span className="problem-help-response-tag-text">
              Conversation
            </span>
          </div>
        </div>

        {/* Right-aligned elements - Only show in full screen mode */}
        {!isInSplitMode && (
          <div className="problem-help-response-header-right">
            {/* Share Icon */}
            <button
              className="problem-help-response-action-button"
              aria-label="Share conversation"
            >
              <img
                src="/workspace/share.svg"
                alt="Share"
                className="problem-help-response-action-icon"
              />
            </button>

            {/* Print Icon */}
            <button
              className="problem-help-response-action-button"
              aria-label="Print conversation"
            >
              <img
                src="/workspace/print.svg"
                alt="Print"
                className="problem-help-response-action-icon"
              />
            </button>

            {/* Publish to Community Button */}
            <button
              className="problem-help-response-publish-button"
              aria-label="Publish to community"
            >
              <img
                src="/workspace/publish.svg"
                alt="Publish"
                className="problem-help-response-publish-icon"
              />
              <span className="problem-help-response-publish-text">
                Publish to Community
              </span>
            </button>
          </div>
        )}
      </header>

      {/* Main Content Section */}
      <div className="problem-help-response-main-frame">
        <div className="problem-help-response-conversation-main" ref={conversationMainRef}>
          <div className="problem-help-response-conversation-groups">
            {conversationHistory.map((message) => (
              <div key={message.id} className="problem-help-response-conversation-group">
                {renderMessageContent(message)}
              </div>
            ))}
            
            {/* Show empty state if no conversation yet */}
            {conversationHistory.length === 0 && (
              <div className="space-y-6">
                {/* Loading skeleton for conversation */}
                <div className="flex flex-col items-end gap-2">
                  <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="w-80 h-16 bg-gray-200 rounded-lg animate-pulse"></div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-5 bg-gray-200 rounded animate-pulse"></div>
                    <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                  
                  <div className="w-full h-px bg-gray-200 animate-pulse"></div>
                  
                  <div className="space-y-3">
                    <div className="w-full h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="w-full h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="w-4/5 h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="w-full h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="w-3/4 h-4 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                  
                  <div className="flex justify-end gap-2 mt-4">
                    <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
                    <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
                    <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="problem-help-response-input-section">
          <div className={`problem-help-response-input-box ${isInputFocused ? 'focused' : ''}`}>
            <textarea
              className="problem-help-response-input"
              placeholder="Follow up on this question or start a new one..."
              value={followUpQuestion}
              onChange={(e) => setFollowUpQuestion(e.target.value)}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
              onKeyPress={handleKeyPress}
              disabled={isSubmitting}
            />
            <div className="problem-help-response-buttons">
              <button 
                className={`problem-help-response-button ${profileSelected ? 'selected' : ''}`}
                onClick={toggleProfile}
                title="Select Profile" 
                disabled={isSubmitting}
              >
                <img 
                  src="/workspace/deepLearn/contacts-line.svg" 
                  alt="Profile" 
                  className="problem-help-response-button-icon"
                  style={{ filter: profileSelected ? 'brightness(0) invert(1)' : 'brightness(0) saturate(100%) invert(39%) sepia(0%) saturate(0%) hue-rotate(147deg) brightness(94%) contrast(87%)' }}
                />
              </button>
              <button 
                className={`problem-help-response-button ${referenceSelected ? 'selected' : ''}`}
                onClick={toggleReference}
                title="Select References" 
                disabled={isSubmitting}
              >
                <img 
                  src="/workspace/deepLearn/folder.svg" 
                  alt="References" 
                  className="problem-help-response-button-icon"
                  style={{ filter: referenceSelected ? 'brightness(0) invert(1)' : 'brightness(0) saturate(100%) invert(39%) sepia(0%) saturate(0%) hue-rotate(147deg) brightness(94%) contrast(87%)' }}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Custom scrollbar positioned at tab level */}
      <div className="problem-help-response-custom-scrollbar">
        <div className="problem-help-response-custom-scrollbar-track">
          <div 
            className="problem-help-response-custom-scrollbar-thumb"
            ref={scrollbarThumbRef}
          />
        </div>
      </div>
    </div>
  );
};

export default ProblemHelpResponse;
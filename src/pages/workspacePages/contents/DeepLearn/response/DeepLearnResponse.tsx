import React, { useState, useEffect } from 'react';
import { useTabContext, useTabCleanup } from '../../../workspaceFrame/TabContext';
import { submitQuickSearchQuery } from '../../../../../api/workspaces/deep_learn/deepLearn_quicksearch';
import { submitDeepLearnDeepQuery, DeepLearnStreamingData } from '../../../../../api/workspaces/deep_learn/deepLearn_deeplearn';
import { submitFollowUpQuery } from '../../../../../api/workspaces/deep_learn/deepLearn_followup';
import { MarkdownRenderer } from '../../../../../components/ui/markdown';
import './DeepLearnResponse.css';

interface DeepLearnResponseProps {
  isSplit?: boolean;
  onBack?: () => void;
  tabIdx?: number;
  pageIdx?: number;
  screenId?: string;
}

interface ConversationMessage {
  id: string;
  type: 'question' | 'answer';
  content: string;
  timestamp: string;
  mode: 'deep-learn' | 'quick-search';
  isStreaming?: boolean;
}

interface InteractiveData {
  success: boolean;
  conversation_title: string;
  topic: string;
  roadmap_node_index: number;
  concept_map: {
    nodes: Array<{
      id: number;
      label: string;
      neighbors: number[];
    }>;
  };
  interactive_content: {
    conversation_title: string;
    recommended_videos: Array<{
      title: string;
      url: string;
      thumbnail: string;
      channel: string;
    }>;
    related_webpages: Array<{
      title: string;
      url: string;
      description: string;
    }>;
    related_concepts: Array<{
      concept: string;
      explanation: string;
    }>;
  };
  files_updated: {
    conversation_json: string;
    concept_map_json: string;
  };
  timestamp: string;
}

const DeepLearnResponse: React.FC<DeepLearnResponseProps> = ({ isSplit = false, onBack, tabIdx = 0, pageIdx = 0, screenId = '' }) => {
  const { switchToDeepLearn, getActiveScreens, activePage } = useTabContext();
  const { registerCleanup } = useTabCleanup(pageIdx, screenId, tabIdx);
  
  // Detect if we're in split screen mode
  const activeScreens = getActiveScreens(activePage);
  const isInSplitMode = activeScreens.length > 1 && !activeScreens.some(screen => screen.state === 'full-screen');
  
  const [profileSelected, setProfileSelected] = useState(false);
  const [referenceSelected, setReferenceSelected] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [hasFirstQuestion, setHasFirstQuestion] = useState(false);
  const [selectedMode, setSelectedMode] = useState<'follow-up' | 'new-topic' | null>(null);
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const [selectedResponseMode, setSelectedResponseMode] = useState<'deep-learn' | 'quick-search'>('deep-learn');
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [interactiveData, setInteractiveData] = useState<InteractiveData | null>(null);
  const [isInteractiveLoading, setIsInteractiveLoading] = useState(true); // Start with loading true
  const [currentConversationId, setCurrentConversationId] = useState<string>(''); // Store current conversation ID
  const [deepLearnProgress, setDeepLearnProgress] = useState<{
    current: number;
    total: number;
    percentage: number;
    status: string;
  } | null>(null);
  
  // Ensure loading state is properly initialized
  useEffect(() => {
    console.log('🔧 Ensuring loading state is true on mount');
    setIsInteractiveLoading(true);
  }, []);
  
  // Debug loading state
  useEffect(() => {
    console.log('🔄 Interactive loading state changed:', isInteractiveLoading);
  }, [isInteractiveLoading]);

  // Debug initial render
  useEffect(() => {
    console.log('🚀 DeepLearnResponse component mounted, isInteractiveLoading:', isInteractiveLoading);
  }, []);

  // Load conversation data from localStorage on component mount
  useEffect(() => {
    const conversationId = localStorage.getItem('current_deeplearn_conversation_id');
    const query = localStorage.getItem('current_deeplearn_query');
    const mode = localStorage.getItem('current_deeplearn_mode');
    const webSearch = localStorage.getItem('current_deeplearn_web_search') === 'true';
    
    // Don't load cached interactive data - always start fresh
    // Interactive data should only come from the current API call
    console.log('🚀 Starting fresh - no cached interactive data loaded');
    
    if (conversationId && query && (mode === 'quick-search' || mode === 'deep-learn')) {
      // Store the conversation ID for follow-up queries
      setCurrentConversationId(conversationId);
      
      // Set the response mode based on the initial mode
      setSelectedResponseMode(mode as 'deep-learn' | 'quick-search');
      
      // Add the initial question to the conversation
      const initialQuestion: ConversationMessage = {
        id: '1',
        type: 'question',
        content: query,
        timestamp: new Date().toLocaleString(),
        mode: mode as 'deep-learn' | 'quick-search'
      };
      
      setConversation([initialQuestion]);
      setIsLoading(true);
      setDeepLearnProgress(null); // Clear any previous progress
      
      if (mode === 'quick-search') {
        // Add a streaming answer message for quick search
        const streamingAnswer: ConversationMessage = {
          id: '2',
          type: 'answer',
          content: '',
          timestamp: new Date().toLocaleString(),
          mode: 'quick-search',
          isStreaming: true
        };
        
        setConversation([initialQuestion, streamingAnswer]);
        
        // Call the quick search API to get the streaming response
        submitQuickSearchQuery(
          query,
          webSearch,
          (data: string) => {
            // Update the streaming content
            setConversation(prev => prev.map(msg => 
              msg.id === '2' 
                ? { ...msg, content: msg.content + data }
                : msg
            ));
          },
          (error: string) => {
            console.error('Quick search error:', error);
            setIsLoading(false);
            // Update the message to show error
            setConversation(prev => prev.map(msg => 
              msg.id === '2' 
                ? { ...msg, content: `Error: ${error}`, isStreaming: false }
                : msg
            ));
          },
          () => {
            console.log('Quick search completed');
            setIsLoading(false);
            // Mark streaming as complete
            setConversation(prev => prev.map(msg => 
              msg.id === '2' 
                ? { ...msg, isStreaming: false }
                : msg
            ));
          },
          undefined, // additionalComments
          undefined, // references
          undefined, // existingConversationId - don't pass this for new conversations
          conversationId, // generatedConversationId - pass as generated conversation ID
          undefined, // searchType
          pageIdx,
          screenId,
          tabIdx
        );
      } else if (mode === 'deep-learn') {
        // Add a streaming answer message for deep learn
        const streamingAnswer: ConversationMessage = {
          id: '2',
          type: 'answer',
          content: '',
          timestamp: new Date().toLocaleString(),
          mode: 'deep-learn',
          isStreaming: true
        };
        
        setConversation([initialQuestion, streamingAnswer]);
        
        // Call the deep learn API to get the streaming response
        submitDeepLearnDeepQuery(
          query,
          webSearch,
          (data: DeepLearnStreamingData) => {
            console.log('📥 Received deep learn streaming data:', data);
            
            // Update progress if available
            if (data.progress) {
              setDeepLearnProgress({
                current: data.progress.current_completions,
                total: data.progress.total_expected_completions,
                percentage: data.progress.progress_percentage,
                status: data.stream_info || 'Processing...'
              });
            }
            
            // Update the streaming content with the LLM response
            if (data.llm_response) {
              setConversation(prev => prev.map(msg => 
                msg.id === '2' 
                  ? { ...msg, content: data.llm_response }
                  : msg
              ));
            }
          },
          (error: string) => {
            console.error('Deep learn error:', error);
            setIsLoading(false);
            // Update the message to show error
            setConversation(prev => prev.map(msg => 
              msg.id === '2' 
                ? { ...msg, content: `Error: ${error}`, isStreaming: false }
                : msg
            ));
          },
          () => {
            console.log('Deep learn completed');
            setIsLoading(false);
            // Mark streaming as complete
            setConversation(prev => prev.map(msg => 
              msg.id === '2' 
                ? { ...msg, isStreaming: false }
                : msg
            ));
          },
          undefined, // additionalComments
          undefined, // references
          undefined, // existingConversationId - don't pass this for new conversations
          conversationId, // generatedConversationId - pass as generated conversation ID
          undefined, // searchType
          pageIdx,
          screenId,
          tabIdx
        );
      }
      
      // Register cleanup function for localStorage clearing when tab is closed
      const tabId = `${pageIdx}-${screenId}-${tabIdx}`;
      registerCleanup(() => {
        console.log('🧹 Cleaning up localStorage for tab (tab closed):', tabId);
        localStorage.removeItem('current_deeplearn_conversation_id');
        localStorage.removeItem('current_deeplearn_query');
        localStorage.removeItem('current_deeplearn_mode');
        localStorage.removeItem('current_deeplearn_web_search');
        localStorage.removeItem(`deeplearn_interactive_${tabId}`);
      });
    }
  }, [registerCleanup]);

  // Set a timeout to stop interactive loading after 60 seconds (fallback)
  useEffect(() => {
    if (isInteractiveLoading) {
      const timeout = setTimeout(() => {
        console.log('⏰ Interactive loading timeout after 60s - stopping loading state');
        console.log('⚠️ This might indicate a backend issue or event listener problem');
        setIsInteractiveLoading(false);
      }, 60000); // 60 seconds - much longer timeout

      return () => clearTimeout(timeout);
    }
  }, [isInteractiveLoading]);

  // Listen for interactive data updates with tab isolation
  useEffect(() => {
    console.log('👂 Setting up interactive data event listener for tab isolation');
    
    const handleInteractiveUpdate = (event: CustomEvent) => {
      const { tabId, data } = event.detail;
      const currentTabId = `${pageIdx}-${screenId}-${tabIdx}`;
      
      // Only process events for this specific tab
      if (tabId !== currentTabId) {
        console.log('🚫 Ignoring interactive update for different tab:', tabId, 'current tab:', currentTabId);
        return;
      }
      
      console.log('📡 Received interactive data update for current tab:', tabId);
      console.log('📊 Data structure:', {
        hasVideos: data?.interactive_content?.recommended_videos?.length > 0,
        hasWebpages: data?.interactive_content?.related_webpages?.length > 0,
        videosLength: data?.interactive_content?.recommended_videos?.length,
        webpagesLength: data?.interactive_content?.related_webpages?.length
      });
      
      setInteractiveData(data);
      
      // Only stop loading if we have actual content
      if (data?.interactive_content?.recommended_videos?.length > 0 || 
          data?.interactive_content?.related_webpages?.length > 0) {
        console.log('✅ Interactive content received - stopping loading state');
        setIsInteractiveLoading(false);
      } else {
        console.log('⚠️ Interactive data received but no content yet - keeping loading state');
      }
    };

    window.addEventListener('deeplearn-interactive-update', handleInteractiveUpdate as EventListener);
    console.log('✅ Interactive event listener registered for tab:', `${pageIdx}-${screenId}-${tabIdx}`);

    // Register cleanup function that only runs when tab is closed
    registerCleanup(() => {
      console.log('🧹 Cleaning up interactive event listener for tab (tab closed):', `${pageIdx}-${screenId}-${tabIdx}`);
      window.removeEventListener('deeplearn-interactive-update', handleInteractiveUpdate as EventListener);
    });
  }, [pageIdx, screenId, tabIdx, registerCleanup]);

  const handleBackClick = () => {
    // Navigate back to deep learn entry page
    switchToDeepLearn(pageIdx, screenId, tabIdx);
  };

  const toggleProfile = () => {
    setProfileSelected(!profileSelected);
  };

  const toggleReference = () => {
    setReferenceSelected(!referenceSelected);
  };

  const handleFollowUp = () => {
    setHasFirstQuestion(true);
    setSelectedMode('follow-up');
    // Additional logic for follow up mode
  };

  const handleNewTopic = () => {
    setHasFirstQuestion(true);
    setSelectedMode('new-topic');
    // Additional logic for new topic mode
  };

  const handleModeChange = (newMode: 'follow-up' | 'new-topic') => {
    setSelectedMode(newMode);
  };

  const toggleWebSearch = () => {
    setWebSearchEnabled(!webSearchEnabled);
  };

  const toggleResponseMode = (mode: 'deep-learn' | 'quick-search') => {
    setSelectedResponseMode(mode);
  };

  // Handle submit from input box
  const handleSubmitQuery = async () => {
    if (!inputValue.trim() || isLoading) return;

    const query = inputValue.trim();
    console.log('📝 Submitting follow-up query:', query);
    console.log('🔍 Current mode:', selectedMode);
    console.log('🌐 Web search enabled:', webSearchEnabled);
    console.log('🎯 Response mode:', selectedResponseMode);

    // For follow-up mode, always use quick-search style regardless of mode selection
    const displayMode = selectedMode === 'follow-up' ? 'quick-search' : selectedResponseMode;

    // Add the new question to conversation
    const newQuestion: ConversationMessage = {
      id: Date.now().toString(),
      type: 'question',
      content: query,
      timestamp: new Date().toLocaleString(),
      mode: displayMode
    };

    // Add streaming answer message
    const streamingAnswer: ConversationMessage = {
      id: (Date.now() + 1).toString(),
      type: 'answer',
      content: '',
      timestamp: new Date().toLocaleString(),
      mode: displayMode,
      isStreaming: true
    };

    setConversation(prev => [...prev, newQuestion, streamingAnswer]);
    setIsLoading(true);
    // Only start interactive loading for new topic mode, not for follow-up mode
    if (selectedMode === 'new-topic') {
      setIsInteractiveLoading(true);
    }
    setDeepLearnProgress(null); // Clear previous progress
    setInputValue(''); // Clear input

    // Use stored conversation ID or generate new one
    const conversationIdToUse = currentConversationId || 'dl-c-' + Date.now();

    try {
      if (selectedMode === 'follow-up') {
        // Use follow-up API for follow-up mode, ignoring the deep-learn/quick-search selection
        await submitFollowUpQuery(
          query,
          webSearchEnabled,
          (data: string) => {
            // Update the streaming content
            setConversation(prev => prev.map(msg => 
              msg.id === streamingAnswer.id 
                ? { ...msg, content: msg.content + data }
                : msg
            ));
          },
          (error: string) => {
            console.error('Follow-up API error:', error);
            setIsLoading(false);
            // Update the message to show error
            setConversation(prev => prev.map(msg => 
              msg.id === streamingAnswer.id 
                ? { ...msg, content: `Error: ${error}`, isStreaming: false }
                : msg
            ));
          },
          () => {
            console.log('Follow-up API completed');
            setIsLoading(false);
            // Mark streaming as complete
            setConversation(prev => prev.map(msg => 
              msg.id === streamingAnswer.id 
                ? { ...msg, isStreaming: false }
                : msg
            ));
          },
          conversationIdToUse, // conversationId - required for follow-up
          'followup', // searchType - always 'followup' for follow-up mode
          undefined, // additionalComments
          undefined, // references
          pageIdx,
          screenId,
          tabIdx
        );
      } else if (selectedResponseMode === 'quick-search') {
        // Use regular quick search for new topic
        await submitQuickSearchQuery(
          query,
          webSearchEnabled,
          (data: string) => {
            // Update the streaming content
            setConversation(prev => prev.map(msg => 
              msg.id === streamingAnswer.id 
                ? { ...msg, content: msg.content + data }
                : msg
            ));
          },
          (error: string) => {
            console.error('Quick search error:', error);
            setIsLoading(false);
            // Update the message to show error
            setConversation(prev => prev.map(msg => 
              msg.id === streamingAnswer.id 
                ? { ...msg, content: `Error: ${error}`, isStreaming: false }
                : msg
            ));
          },
          () => {
            console.log('Quick search completed');
            setIsLoading(false);
            // Mark streaming as complete
            setConversation(prev => prev.map(msg => 
              msg.id === streamingAnswer.id 
                ? { ...msg, isStreaming: false }
                : msg
            ));
          },
          undefined, // additionalComments
          undefined, // references
          conversationIdToUse, // existingConversationId - pass current conversation ID
          undefined, // generatedConversationId - not needed for follow-up
          'new_topic', // searchType - always 'new_topic' for new topic mode
          pageIdx,
          screenId,
          tabIdx
        );
      } else if (selectedResponseMode === 'deep-learn') {
        // Use deep learn API for new topic mode
        await submitDeepLearnDeepQuery(
          query,
          webSearchEnabled,
          (data: DeepLearnStreamingData) => {
            console.log('📥 Received deep learn streaming data:', data);
            
            // Update progress if available
            if (data.progress) {
              setDeepLearnProgress({
                current: data.progress.current_completions,
                total: data.progress.total_expected_completions,
                percentage: data.progress.progress_percentage,
                status: data.stream_info || 'Processing...'
              });
            }
            
            // Update the streaming content with the LLM response
            if (data.llm_response) {
              setConversation(prev => prev.map(msg => 
                msg.id === streamingAnswer.id 
                  ? { ...msg, content: data.llm_response }
                  : msg
              ));
            }
          },
          (error: string) => {
            console.error('Deep learn error:', error);
            setIsLoading(false);
            // Update the message to show error
            setConversation(prev => prev.map(msg => 
              msg.id === streamingAnswer.id 
                ? { ...msg, content: `Error: ${error}`, isStreaming: false }
                : msg
            ));
          },
          () => {
            console.log('Deep learn completed');
            setIsLoading(false);
            // Mark streaming as complete
            setConversation(prev => prev.map(msg => 
              msg.id === streamingAnswer.id 
                ? { ...msg, isStreaming: false }
                : msg
            ));
          },
          undefined, // additionalComments
          undefined, // references
          conversationIdToUse, // existingConversationId - pass current conversation ID
          undefined, // generatedConversationId - not needed for follow-up
          'new_topic', // searchType - always 'new_topic' for new topic mode
          pageIdx,
          screenId,
          tabIdx
        );
      }
    } catch (error) {
      console.error('Error submitting follow-up query:', error);
      setIsLoading(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return `Me, ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
    } else {
      return `Me, ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
    }
  };

  const renderConversationGroup = (message: ConversationMessage, index: number) => {
    if (message.type === 'question') {
      return (
        <div key={message.id} className="deep-learn-response-conversation-group">
          {/* Question Part */}
          <div className="deep-learn-response-question">
            <span className="deep-learn-response-question-date">
              {formatTimestamp(message.timestamp)}
            </span>
            <div className="deep-learn-response-question-box">
              <span className="deep-learn-response-question-text">
                {message.content}
              </span>
            </div>
          </div>
        </div>
      );
    } else if (message.type === 'answer') {
      return (
        <div key={message.id} className="deep-learn-response-conversation-group">
          {/* Answer Part */}
          <div className={`deep-learn-response-answer ${message.mode === 'quick-search' ? 'response-quick-search' : ''}`}>
            {/* Title Section */}
            <div className="deep-learn-response-title-section">
              <span className="deep-learn-response-answer-title">
                {message.mode === 'quick-search' ? 'Quick Search Response' : 'Deep Learn Response'}
              </span>
              <div className="deep-learn-response-tag">
                <span className="deep-learn-response-tag-text">
                  {message.mode === 'quick-search' ? 'Quick Search' : 'Deep Learn'}
                </span>
              </div>
            </div>
            
            {/* Separation Line */}
            <div className="deep-learn-response-separator"></div>
            
            {/* Progress Bar for Deep Learn */}
            {message.mode === 'deep-learn' && (
              <div className="deep-learn-response-thinking-bar">
                <span className="deep-learn-response-thinking-status">
                  {deepLearnProgress ? deepLearnProgress.status : "Hyperknow is thinking..."}
                </span>
                <div className="deep-learn-response-thinking-right">
                  <span className="deep-learn-response-thinking-duration">
                    {deepLearnProgress ? `${deepLearnProgress.current}/${deepLearnProgress.total}` : "0/0"}
                  </span>
                  <div className="deep-learn-response-thinking-arrow">
                    <img 
                      src="/workspace/back-arrow.svg" 
                      alt="Progress" 
                      className="deep-learn-response-arrow-icon"
                    />
                  </div>
                </div>
              </div>
            )}
            
            {/* Source Cards for Deep Learn - Show at beginning */}
            {message.mode === 'deep-learn' && (
              <div className="deep-learn-response-sources">
                <div className="deep-learn-response-source-card">
                  <div className="deep-learn-response-source-title">
                    Quantum Mechanics and Black Hole Thermodynamics
                  </div>
                  <div className="deep-learn-response-source-detail">
                    Exploring the intersection of quantum mechanics and black hole thermodynamics.
                  </div>
                  <div className="deep-learn-response-source-site">
                    <img 
                      src="/workspace/site-icons/science.svg" 
                      alt="Science" 
                      className="deep-learn-response-site-icon"
                    />
                    <span className="deep-learn-response-site-name">
                      Science
                    </span>
                  </div>
                </div>
                
                <div className="deep-learn-response-source-card">
                  <div className="deep-learn-response-source-title">
                    String Theory Approaches to Information Paradox
                  </div>
                  <div className="deep-learn-response-source-detail">
                    How string theory provides insights into resolving the black hole information paradox.
                  </div>
                  <div className="deep-learn-response-source-site">
                    <img 
                      src="/workspace/site-icons/arxiv.svg" 
                      alt="arXiv" 
                      className="deep-learn-response-site-icon"
                    />
                    <span className="deep-learn-response-site-name">
                      arXiv
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Response Content */}
            <div className="deep-learn-response-content-text">
              {message.isStreaming ? (
                <div className="streaming-content">
                  {message.mode === 'deep-learn' ? (
                    message.content ? (
                      <MarkdownRenderer content={message.content} />
                    ) : (
                      // Loading skeleton for deep learn
                      <div className="deep-learn-loading-skeleton">
                        <div className="skeleton-heading"></div>
                        <div className="skeleton-paragraph"></div>
                        <div className="skeleton-paragraph short"></div>
                        <div className="skeleton-paragraph"></div>
                        <div className="skeleton-image"></div>
                        <div className="skeleton-heading sub"></div>
                        <div className="skeleton-paragraph"></div>
                        <div className="skeleton-paragraph"></div>
                        <div className="skeleton-paragraph short"></div>
                        <div className="skeleton-paragraph"></div>
                      </div>
                    )
                  ) : (
                    message.content
                  )}
                  {message.mode !== 'deep-learn' && (
                    <div className="flex items-center gap-2 text-blue-600 mt-2">
                      <div className="w-3 h-4 bg-[#4C6694] animate-pulse"></div>
                      <span className="text-sm font-['Inter',Helvetica]">
                        Streaming response...
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                message.mode === 'deep-learn' ? (
                  <MarkdownRenderer content={message.content} />
                ) : (
                  message.content
                )
              )}
            </div>
            
            {/* End Separator - Only show when not streaming */}
            {!message.isStreaming && (
              <div className="deep-learn-response-separator" style={{ marginTop: '10px' }}></div>
            )}
          </div>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="deep-learn-response">
      {/* Header Section */}
      <header className="deep-learn-response-header">
        {/* Left-aligned elements */}
        <div className="deep-learn-response-header-left">
          {/* Back Arrow */}
          <button
            onClick={handleBackClick}
            className="deep-learn-response-back-button"
            aria-label="Go back to deep learn entry"
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
          <h1 className="deep-learn-response-title">
            Learning Journey: {interactiveData?.interactive_content?.conversation_title || (conversation.length > 0 ? conversation[0].content.substring(0, 50) + '...' : 'New Conversation')}
          </h1>

          {/* Conversation Tag */}
          <div className="deep-learn-response-tag">
            <span className="deep-learn-response-tag-text">
              Conversation
            </span>
          </div>
        </div>

        {/* Right-aligned elements - Only show in full screen mode */}
        {!isInSplitMode && (
          <div className="deep-learn-response-header-right">
            {/* Share Icon */}
            <button
              className="deep-learn-response-action-button"
              aria-label="Share analysis"
            >
              <img
                src="/workspace/share.svg"
                alt="Share"
                className="deep-learn-response-action-icon"
              />
            </button>

            {/* Print Icon */}
            <button
              className="deep-learn-response-action-button"
              aria-label="Print analysis"
            >
              <img
                src="/workspace/print.svg"
                alt="Print"
                className="deep-learn-response-action-icon"
              />
            </button>

            {/* Publish to Community Button */}
            <button
              className="deep-learn-response-publish-button"
              aria-label="Publish to community"
            >
              <img
                src="/workspace/publish.svg"
                alt="Publish"
                className="deep-learn-response-publish-icon"
              />
              <span className="deep-learn-response-publish-text">
                Publish to Community
              </span>
            </button>
          </div>
        )}
      </header>

      {/* Main Content Section */}
      <div className="deep-learn-response-main">
        <div className="deep-learn-response-content">
          {/* Conversation Section */}
          <div className="deep-learn-response-conversation">
            {/* Conversation Main Section */}
            <div className="deep-learn-response-conversation-main">
              {/* Conversation Groups */}
              <div className="deep-learn-response-conversation-groups">
                {conversation.length > 0 ? (
                  conversation.map((message, index) => renderConversationGroup(message, index))
                ) : (
                  <div className="deep-learn-response-conversation-group">
                    <div className="deep-learn-response-question">
                      <span className="deep-learn-response-question-date">
                        Me, Jun 1, 9:50PM
                      </span>
                      <div className="deep-learn-response-question-box">
                        <span className="deep-learn-response-question-text">
                          What is the Black Hole Information Paradox?
                        </span>
                      </div>
                    </div>

                    {/* Sample Deep Learn Response Part */}
                    <div className="deep-learn-response-answer">
                      {/* Title Section */}
                      <div className="deep-learn-response-title-section">
                        <span className="deep-learn-response-answer-title">
                          Solution of Black Hole Information Paradox
                        </span>
                        <div className="deep-learn-response-tag">
                          <span className="deep-learn-response-tag-text">
                            Deep Learn
                          </span>
                        </div>
                      </div>
                      
                      {/* Separation Line */}
                      <div className="deep-learn-response-separator"></div>
                      
                      {/* Thinking Progress Bar */}
                      <div className="deep-learn-response-thinking-bar">
                        <span className="deep-learn-response-thinking-status">
                          Thinking...
                        </span>
                        <div className="deep-learn-response-thinking-right">
                          <span className="deep-learn-response-thinking-duration">
                            Thought for 13 seconds
                          </span>
                          <svg 
                            width="16" 
                            height="16" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            xmlns="http://www.w3.org/2000/svg"
                            className="deep-learn-response-arrow-icon"
                          >
                            <path 
                              d="M6 9L12 15L18 9" 
                              stroke="black" 
                              strokeWidth="2" 
                              strokeLinecap="round" 
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                      </div>
                      
                      {/* Source Webpages Section */}
                      <div className="deep-learn-response-sources">
                        <div className="deep-learn-response-source-card">
                          <div className="deep-learn-response-source-title">
                            Black Hole Information Paradox: A Comprehensive Analysis
                          </div>
                          <div className="deep-learn-response-source-detail">
                            Recent developments in quantum mechanics and general relativity have shed new light on this fundamental problem in theoretical physics.
                          </div>
                          <div className="deep-learn-response-source-site">
                            <img 
                              src="/workspace/site-icons/physics-today.svg" 
                              alt="Physics Today" 
                              className="deep-learn-response-site-icon"
                            />
                            <span className="deep-learn-response-site-name">
                              Physics Today
                            </span>
                          </div>
                        </div>
                        
                        <div className="deep-learn-response-source-card">
                          <div className="deep-learn-response-source-title">
                            Hawking Radiation and Information Loss
                          </div>
                          <div className="deep-learn-response-source-detail">
                            Understanding the relationship between Hawking radiation and the preservation of quantum information.
                          </div>
                          <div className="deep-learn-response-source-site">
                            <img 
                              src="/workspace/site-icons/nature.svg" 
                              alt="Nature" 
                              className="deep-learn-response-site-icon"
                            />
                            <span className="deep-learn-response-site-name">
                              Nature
                            </span>
                          </div>
                        </div>
                        
                        <div className="deep-learn-response-source-card">
                          <div className="deep-learn-response-source-title">
                            Quantum Mechanics and Black Hole Thermodynamics
                          </div>
                          <div className="deep-learn-response-source-detail">
                            Exploring the intersection of quantum mechanics and black hole thermodynamics.
                          </div>
                          <div className="deep-learn-response-source-site">
                            <img 
                              src="/workspace/site-icons/science.svg" 
                              alt="Science" 
                              className="deep-learn-response-site-icon"
                            />
                            <span className="deep-learn-response-site-name">
                              Science
                            </span>
                          </div>
                        </div>
                        
                        <div className="deep-learn-response-source-card">
                          <div className="deep-learn-response-source-title">
                            String Theory Approaches to Information Paradox
                          </div>
                          <div className="deep-learn-response-source-detail">
                            How string theory provides insights into resolving the black hole information paradox.
                          </div>
                          <div className="deep-learn-response-source-site">
                            <img 
                              src="/workspace/site-icons/arxiv.svg" 
                              alt="arXiv" 
                              className="deep-learn-response-site-icon"
                            />
                            <span className="deep-learn-response-site-name">
                              arXiv
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Response Content */}
                      <div className="deep-learn-response-content-text">
                        The Black Hole Information Paradox represents one of the most profound challenges in theoretical physics, arising from the apparent conflict between quantum mechanics and general relativity. At its core, the paradox questions whether information that falls into a black hole is permanently lost or somehow preserved.

                        Stephen Hawking's groundbreaking work in 1974 showed that black holes emit radiation (now known as Hawking radiation) and can eventually evaporate. However, this radiation appears to be purely thermal, containing no information about the matter that originally formed the black hole. This creates a fundamental problem: if information is truly lost, it violates the principle of unitarity in quantum mechanics, which states that information must be conserved.

                        Several theoretical approaches have been proposed to resolve this paradox. The AdS/CFT correspondence, proposed by Juan Maldacena in 1997, suggests that information is indeed preserved through a holographic principle where the information is encoded on the black hole's event horizon rather than being lost inside. String theory approaches propose that quantum correlations in the Hawking radiation carry the necessary information.

                        Recent developments in quantum information theory and the study of quantum entanglement have provided new insights. The concept of "firewalls" and the ER=EPR conjecture suggest that quantum entanglement might play a crucial role in preserving information across the event horizon.

                        While the paradox remains not fully resolved, these theoretical frameworks provide promising directions for understanding how quantum mechanics and gravity can be reconciled, potentially leading to a unified theory of quantum gravity.
                      </div>
                      
                      {/* End Separator */}
                      <div className="deep-learn-response-separator" style={{ marginTop: '10px' }}></div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Input Box Section */}
            <div className="deep-learn-response-input-section">
              {/* Input Area */}
              <div className="deep-learn-response-input-box">
                {!hasFirstQuestion ? (
                  <div className="deep-learn-response-mode-selection">
                    <span className="deep-learn-response-mode-text">Start a </span>
                    <button 
                      className="deep-learn-response-mode-button follow-up"
                      onClick={handleFollowUp}
                    >
                      Follow Up
                    </button>
                    <span className="deep-learn-response-mode-text"> or </span>
                    <button 
                      className="deep-learn-response-mode-button new-topic"
                      onClick={handleNewTopic}
                    >
                      New Topic
                    </button>
                  </div>
                ) : (
                  <>
                                <textarea
              className="deep-learn-response-input"
              placeholder="Type your question here..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmitQuery();
                }
              }}
            />
                    {selectedMode && (
                      <div className="deep-learn-response-mode-change">
                        <span className="deep-learn-response-mode-text">Change to </span>
                        <button 
                          className={`deep-learn-response-mode-button ${selectedMode === 'follow-up' ? 'new-topic' : 'follow-up'}`}
                          onClick={() => handleModeChange(selectedMode === 'follow-up' ? 'new-topic' : 'follow-up')}
                        >
                          {selectedMode === 'follow-up' ? 'New Topic' : 'Follow Up'}
                        </button>
                      </div>
                    )}
                  </>
                )}
                
                {/* Buttons at the bottom right */}
                <div className="deep-learn-response-buttons">
                  {/* Mode Toggle Button - Only show when New Topic is selected */}
                  {selectedMode === 'new-topic' && (
                    <div className="deep-learn-response-mode-toggle">
                      <div 
                        className={`deep-learn-response-mode-toggle-option ${selectedResponseMode === 'deep-learn' ? 'selected' : 'unselected'}`}
                        onClick={() => toggleResponseMode('deep-learn')}
                        title="Deep Learn"
                      >
                        <img 
                          src="/workspace/deepLearn/lens-stars.svg" 
                          alt="Deep Learn Icon" 
                          className="deep-learn-response-mode-toggle-icon"
                          style={{ filter: selectedResponseMode === 'deep-learn' ? 'brightness(0) invert(1)' : 'brightness(0) saturate(100%) invert(32%) sepia(9%) saturate(2096%) hue-rotate(182deg) brightness(93%) contrast(87%)' }}
                        />
                      </div>
                      <div 
                        className={`deep-learn-response-mode-toggle-option ${selectedResponseMode === 'quick-search' ? 'selected' : 'unselected'}`}
                        onClick={() => toggleResponseMode('quick-search')}
                        title="Quick Search"
                      >
                        <img 
                          src="/workspace/deepLearn/lens-check.svg" 
                          alt="Quick Search Icon" 
                          className="deep-learn-response-mode-toggle-icon"
                          style={{ filter: selectedResponseMode === 'quick-search' ? 'brightness(0) invert(1)' : 'brightness(0) saturate(100%) invert(32%) sepia(9%) saturate(2096%) hue-rotate(182deg) brightness(93%) contrast(87%)' }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Web Search Toggle Button */}
                  <button 
                    className={`deep-learn-response-web-search ${webSearchEnabled ? 'selected' : 'unselected'}`}
                    onClick={toggleWebSearch}
                    title="Toggle Web Search"
                  >
                    <img 
                      src="/workspace/deepLearn/language.svg" 
                      alt="Web Search" 
                      className="deep-learn-response-web-search-icon"
                      style={{ filter: webSearchEnabled ? 'brightness(0) saturate(100%) invert(32%) sepia(9%) saturate(2096%) hue-rotate(182deg) brightness(93%) contrast(87%)' : 'brightness(0) saturate(100%) invert(48%) sepia(0%) saturate(0%) hue-rotate(251deg) brightness(94%) contrast(92%)' }}
                    />
                  </button>

                  {/* Profile Select Button */}
                  <button 
                    className={`deep-learn-response-button ${profileSelected ? 'selected' : ''}`}
                    onClick={toggleProfile}
                    title="Select Profile"
                  >
                    <img 
                      src="/workspace/deepLearn/contacts-line.svg" 
                      alt="Profile" 
                      className="deep-learn-response-button-icon"
                      style={{ filter: profileSelected ? 'brightness(0) invert(1)' : 'brightness(0) saturate(100%) invert(39%) sepia(0%) saturate(0%) hue-rotate(147deg) brightness(94%) contrast(87%)' }}
                    />
                  </button>
                  
                  {/* Reference Select Button */}
                  <button 
                    className={`deep-learn-response-button ${referenceSelected ? 'selected' : ''}`}
                    title="Select References"
                    onClick={toggleReference}
                  >
                    <img 
                      src="/workspace/deepLearn/folder.svg" 
                      alt="References" 
                      className="deep-learn-response-button-icon"
                      style={{ filter: referenceSelected ? 'brightness(0) invert(1)' : 'brightness(0) saturate(100%) invert(39%) sepia(0%) saturate(0%) hue-rotate(147deg) brightness(94%) contrast(87%)' }}
                    />
                  </button>

                  {/* Separator Line */}
                  <div className="deep-learn-response-button-separator"></div>

                  {/* Send Button */}
                  <button 
                    className={`deep-learn-response-send-button ${inputValue.trim() && !isLoading ? 'active' : ''}`}
                    disabled={!inputValue.trim() || isLoading}
                    title="Send Query"
                    onClick={handleSubmitQuery}
                  >
                    <img 
                      src="/workspace/arrow-up.svg" 
                      alt="Send" 
                      className="deep-learn-response-send-icon"
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Section */}
          <div className="deep-learn-response-interactive">
            {/* Top Gray Box */}
            <div className="deep-learn-response-interactive-box top-box">
              <div className="deep-learn-response-interactive-content">
                {/* Related Videos Section */}
                <div className="deep-learn-response-related-videos">
                  {/* Header */}
                  <div className="deep-learn-response-related-header">
                    <img 
                      src="/workspace/deepLearn/related-videos.svg" 
                      alt="Related Videos" 
                      className="deep-learn-response-related-icon"
                    />
                    <span className="deep-learn-response-related-title">
                      Related Videos
                    </span>
                  </div>
                  
                  {/* Video Content */}
                  <div className="deep-learn-response-video-content">
                    {isInteractiveLoading ? (
                      /* Loading state for video */
                      <div className="deep-learn-response-video-box">
                        {/* Image Section with grey box and loading overlay */}
                        <div className="deep-learn-response-video-image-section">
                          <div className="video-loading-placeholder">
                            <div className="video-loading-spinner"></div>
                          </div>
                        </div>
                        
                        {/* Text Section with skeleton loading */}
                        <div className="deep-learn-response-video-text-section">
                          <div className="skeleton-video-title"></div>
                          <div className="skeleton-video-source"></div>
                        </div>
                      </div>
                    ) : interactiveData?.interactive_content?.recommended_videos && interactiveData.interactive_content.recommended_videos.length > 0 ? (
                      // Show only the top 1 video
                      <div className="deep-learn-response-video-box">
                        {/* Image Section */}
                        <div className="deep-learn-response-video-image-section">
                          <img 
                            src={interactiveData.interactive_content.recommended_videos[0].thumbnail} 
                            alt={interactiveData.interactive_content.recommended_videos[0].title} 
                            className="deep-learn-response-video-image"
                            onError={(e) => {
                              // Handle broken images
                              const target = e.target as HTMLImageElement;
                              target.src = "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=284&h=132&fit=crop";
                            }}
                          />
                        </div>
                        
                        {/* Text Section */}
                        <div className="deep-learn-response-video-text-section">
                          <h4 className="deep-learn-response-video-title">
                            <a 
                              href={interactiveData.interactive_content.recommended_videos[0].url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                            >
                              {interactiveData.interactive_content.recommended_videos[0].title}
                            </a>
                          </h4>
                          <div className="deep-learn-response-video-source">
                            <img 
                              src="/workspace/deepLearn/youtube.svg" 
                              alt="YouTube" 
                              className="deep-learn-response-youtube-icon"
                            />
                            <span className="deep-learn-response-source-text">
                              {interactiveData.interactive_content.recommended_videos[0].channel || 'YouTube'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Fallback video box */
                      <div className="deep-learn-response-video-box">
                        {/* Image Section */}
                        <div className="deep-learn-response-video-image-section">
                          <img 
                            src="https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=284&h=132&fit=crop" 
                            alt="Universe video thumbnail" 
                            className="deep-learn-response-video-image"
                          />
                        </div>
                        
                        {/* Text Section */}
                        <div className="deep-learn-response-video-text-section">
                          <h4 className="deep-learn-response-video-title">
                            <a href="#" onClick={(e) => e.preventDefault()}>
                              DNA and Gene Editing Using CRISPR Technology
                            </a>
                          </h4>
                          <div className="deep-learn-response-video-source">
                            <img 
                              src="/workspace/deepLearn/youtube.svg" 
                              alt="YouTube" 
                              className="deep-learn-response-youtube-icon"
                            />
                            <span className="deep-learn-response-source-text">
                              Science Channel
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Related Webpages Section */}
                <div className="deep-learn-response-related-webpages">
                  {/* Header */}
                  <div className="deep-learn-response-webpages-header">
                    <img 
                      src="/workspace/deepLearn/related-webpages.svg" 
                      alt="Related Webpages" 
                      className="deep-learn-response-webpages-icon"
                    />
                    <span className="deep-learn-response-webpages-title">
                      Related Webpages
                    </span>
                  </div>
                  
                  {/* Webpages Content */}
                  <div className="deep-learn-response-webpages-content">
                    {isInteractiveLoading ? (
                      /* Loading state for webpages - skeleton animation */
                      <>
                        <div className="deep-learn-response-webpage-box">
                          <div className="skeleton-webpage-title"></div>
                          <div className="skeleton-webpage-description"></div>
                        </div>
                        
                        <div className="deep-learn-response-webpage-box">
                          <div className="skeleton-webpage-title"></div>
                          <div className="skeleton-webpage-description"></div>
                        </div>
                      </>
                    ) : interactiveData?.interactive_content?.related_webpages && interactiveData.interactive_content.related_webpages.length > 0 ? (
                      // Show only the top 2 webpages
                      interactiveData.interactive_content.related_webpages.slice(0, 2).map((webpage, index) => (
                        <div key={index} className="deep-learn-response-webpage-box">
                          <h4 className="deep-learn-response-webpage-title">
                            <a 
                              href={webpage.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                            >
                              {webpage.title}
                            </a>
                          </h4>
                          <p className="deep-learn-response-webpage-description">
                            {webpage.description}
                          </p>
                        </div>
                      ))
                    ) : (
                      /* Fallback webpage boxes */
                      <>
                        <div className="deep-learn-response-webpage-box">
                          <h4 className="deep-learn-response-webpage-title">
                            Related Webpages 1
                          </h4>
                          <p className="deep-learn-response-webpage-description">
                            Discover Pinterest's best ideas and inspiration for Study icon. Get inspired and try out new things.
                          </p>
                        </div>
                        
                        <div className="deep-learn-response-webpage-box">
                          <h4 className="deep-learn-response-webpage-title">
                            Related Webpages 1
                          </h4>
                          <p className="deep-learn-response-webpage-description">
                            Discover Pinterest's best ideas and inspiration for Study icon. Get inspired and try out new things.
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Bottom Gray Box */}
            <div className="deep-learn-response-interactive-box bottom-box">
              <div className="deep-learn-response-interactive-content">
                {/* Concept Map Section */}
                <div className="deep-learn-response-concept-map">
                  {/* Header */}
                  <div className="deep-learn-response-concept-map-header">
                    <img 
                      src="/workspace/deepLearn/concept-map.svg" 
                      alt="Concept Map" 
                      className="deep-learn-response-concept-map-icon"
                    />
                    <span className="deep-learn-response-concept-map-title">
                      Concept Map
                    </span>
                  </div>
                  
                  {/* Concept Map Content */}
                  <div className="deep-learn-response-concept-map-content">
                    {/* Concept Map Box */}
                    <div className="deep-learn-response-concept-map-box">
                      {/* Concept Map visualization would go here */}
                      <div className="deep-learn-response-concept-map-placeholder">
                        <div className="deep-learn-response-concept-map-node black-hole-node">
                          <div className="deep-learn-response-concept-map-node-dot"></div>
                          <span className="deep-learn-response-concept-map-node-label">Black Hole</span>
                        </div>
                        <div className="deep-learn-response-concept-map-node white-dwarf-node">
                          <div className="deep-learn-response-concept-map-node-dot"></div>
                          <span className="deep-learn-response-concept-map-node-label">White dwarf</span>
                        </div>
                        <div className="deep-learn-response-concept-map-node supernova-node">
                          <div className="deep-learn-response-concept-map-node-dot"></div>
                          <span className="deep-learn-response-concept-map-node-label">Type I Supernova</span>
                        </div>
                        <div className="deep-learn-response-concept-map-node horizon-node">
                          <div className="deep-learn-response-concept-map-node-dot"></div>
                          <span className="deep-learn-response-concept-map-node-label">Stretched Horizon</span>
                        </div>
                        <div className="deep-learn-response-concept-map-node cosmology-node">
                          <div className="deep-learn-response-concept-map-node-dot"></div>
                          <span className="deep-learn-response-concept-map-node-label">Cosmology</span>
                        </div>
                        <div className="deep-learn-response-concept-map-node gravity-wave-node">
                          <div className="deep-learn-response-concept-map-node-dot"></div>
                          <span className="deep-learn-response-concept-map-node-label">Gravity Wave</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Current Selection Indicator */}
                    <div className="deep-learn-response-concept-map-selection">
                      <span className="deep-learn-response-concept-map-selection-text">
                        You are currently at:
                      </span>
                      <div className="deep-learn-response-concept-map-selection-button">
                        Black Hole
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeepLearnResponse;

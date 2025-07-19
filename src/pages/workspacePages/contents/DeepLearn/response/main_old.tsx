import React, { useState, useEffect } from 'react';
import { Button } from '../../../../../components/ui/button';
import {
  ArrowLeftIcon,
  GlobeIcon,
  FolderIcon
} from 'lucide-react';
import { useToast } from '../../../../../hooks/useToast';
import { DeepLearnStreamingData } from '../../../../../api/workspaces/deep_learning/deepLearn_deeplearn';
import { submitQuickSearchQuery } from '../../../../../api/workspaces/deep_learning/deepLearnMain';
import { submitDeepLearnDeepQuery } from '../../../../../api/workspaces/deep_learning/deepLearn_deeplearn';
import { ConversationHistoryItem } from '../../../../../api/workspaces/deep_learning/getHistory';
import Interactive from './Interactive';
import DeepLearnResponseDisplay from './DeepLearnResponseDisplay';
import QuickSearchResponseDisplay from './QuickSearchResponseDisplay';

interface DeepLearnResponseProps {
  onBack: () => void;
  isSplit?: boolean;
}

// Conversation message interface
interface ConversationMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: string;
  mode?: 'deep-learn' | 'quick-search';
  isStreaming?: boolean;
  streamingContent?: string;
  deepLearnData?: DeepLearnStreamingData;
}

// 回答标题区域组件 - 缩小上下间距
const AnswerHeader: React.FC<{ title: string; tag: string; isSplit?: boolean }> = ({ title, tag, isSplit = false }) => (
  <div className={`mt-3 ${isSplit ? 'w-full' : 'w-[649px]'} mx-auto`}>
    <div className="flex items-center ml-0">
      <span className="text-black text-[13px] font-medium font-normal leading-normal">
        {title}
      </span>
      <span className="flex items-center justify-center ml-[9px] w-[61px] h-4 flex-shrink-0 rounded-lg border border-[#D9D9D9] bg-[#F9F9F9] text-[#6B6B6B] text-[9px] font-medium font-normal leading-normal">
        {tag}
      </span>
    </div>
    <div className={`mt-1.5 ${isSplit ? 'w-full' : 'w-[649px]'} h-[1.5px] bg-[#D9D9D9] rounded`} />
  </div>
);

// Source Webpages 区域占位组件 - 学习参考代码的样式
const SourceWebpagesPlaceholders: React.FC<{ isSplit?: boolean }> = ({ isSplit = false }) => (
  <div className={`flex justify-center mt-3 ${isSplit ? 'w-full' : 'w-[649px]'} mx-auto`}>
    {[0, 1, 2, 3].map((i) => (
      <div
        key={i}
        className={`${isSplit ? 'w-20 h-[50px]' : 'w-[114px] h-[73px]'} flex-shrink-0 rounded-lg border border-[rgba(179,179,179,0.58)] bg-[rgba(236,241,246,0.55)] shadow-[0px_1px_15px_0px_rgba(73,127,255,0.10)] ${i < 3 ? (isSplit ? 'mr-3' : 'mr-[18px]') : 'mr-0'}`}
      />
    ))}
    {/* More 按钮 placeholder */}
    <div className={`${isSplit ? 'w-[55px] h-[50px]' : 'w-[77px] h-[73px]'} flex-shrink-0 rounded-lg border border-[rgba(179,179,179,0.58)] bg-[rgba(236,241,246,0.55)] shadow-[0px_1px_15px_0px_rgba(73,127,255,0.10)] ${isSplit ? 'ml-3' : 'ml-[18px]'}`} />
  </div>
);

// 用户提问气泡组件 - 动态调整宽度
const UserQuestionBubble: React.FC<{
  content: string;
  time: string;
  className?: string;
  isSplit?: boolean;
}> = ({ content, time, className = "", isSplit = false }) => {
  // Calculate dynamic width based on content length
  const getWidth = () => {
    const baseWidth = isSplit ? 140 : 163;
    const charLength = content.length;
    
    if (charLength <= 20) return baseWidth;
    if (charLength <= 40) return baseWidth + (isSplit ? 40 : 60);
    if (charLength <= 60) return baseWidth + (isSplit ? 80 : 120);
    return baseWidth + (isSplit ? 120 : 180);
  };

  const dynamicWidth = getWidth();

  return (
    <div className={`flex flex-col items-end mb-6 ${isSplit ? 'w-full' : 'w-[649px]'} mx-auto ${className}`}>
      <span className="font-medium text-[#636363] font-['Inter'] text-[10px] font-normal font-medium leading-normal mb-0.5 self-end">
        {time}
      </span>
      <div 
        className={`flex items-center justify-center h-auto min-h-[34px] flex-shrink-0 rounded-[10px] bg-[#ECF1F6] self-end px-3 py-2`}
        style={{ width: `${dynamicWidth}px`, maxWidth: isSplit ? '300px' : '400px' }}
      >
        <span className={`text-black font-['Inter'] ${isSplit ? 'text-[11px]' : 'text-[13px]'} font-medium font-normal leading-normal text-center break-words`}>
          {content}
        </span>
      </div>
    </div>
  );
};

// 正文解释部分组件 - 学习参考代码的样式
const AnswerBody: React.FC<{ children: React.ReactNode; isSplit?: boolean }> = ({ children, isSplit = false }) => (
  <div className={`${isSplit ? 'w-full' : 'w-[649px]'} mx-auto mt-[18px]`}>
    <div className={`text-black ${isSplit ? 'text-[11px]' : 'text-[12px]'} font-normal font-normal leading-normal font-['Inter'] text-left`}>
      {children}
    </div>
    <div className={`mt-4 ${isSplit ? 'w-full' : 'w-[649px]'} h-[1.5px] bg-[#D9D9D9] rounded`} />
  </div>
);

// Conversation ID Display Component
const ConversationIdDisplay: React.FC<{ conversationId: string; isSplit?: boolean }> = ({ conversationId, isSplit = false }) => (
  <div className={`${isSplit ? 'w-full' : 'w-[649px]'} mx-auto mb-4`}>
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-blue-800">Conversation ID:</span>
        <code className="text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded font-mono">
          {conversationId}
        </code>
      </div>
    </div>
  </div>
);

// Assistant message component
const AssistantMessage: React.FC<{
  message: ConversationMessage;
  isSplit?: boolean;
  conversationId?: string;
}> = ({ message, isSplit = false, conversationId }) => {
  const renderContent = () => {
    if (message.mode === 'quick-search') {
      if (message.isStreaming && !message.streamingContent) {
        return (
          <div className="text-gray-500 italic">
            Loading response...
          </div>
        );
      } else if (message.streamingContent) {
        return (
          <QuickSearchResponseDisplay 
            content={message.streamingContent}
            isStreaming={message.isStreaming || false}
          />
        );
      } else {
        return (
          <QuickSearchResponseDisplay 
            content={message.content}
            isStreaming={false}
          />
        );
      }
    } else {
      // Deep learn mode
      if (message.isStreaming && !message.deepLearnData) {
        return (
          <div className="text-gray-500 italic">
            Loading deep learn response...
          </div>
        );
      } else if (message.deepLearnData) {
        return (
          <DeepLearnResponseDisplay 
            deepLearnData={message.deepLearnData} 
            isStreaming={message.isStreaming || false} 
          />
        );
      } else {
        return (
          <div className="whitespace-pre-wrap leading-relaxed">
            {message.content}
          </div>
        );
      }
    }
  };

  return (
    <div className="prose max-w-none font-['Inter',Helvetica] text-sm leading-relaxed mb-6">
      {/* Show conversation ID for the first assistant message */}
      {conversationId && message.id === 'initial-assistant' && (
        <ConversationIdDisplay conversationId={conversationId} isSplit={isSplit} />
      )}
      
      <AnswerHeader 
        title={message.content.substring(0, 50) + (message.content.length > 50 ? '...' : '')} 
        tag={message.mode === 'deep-learn' ? 'Deep Learn' : 'Quick Search'} 
        isSplit={isSplit} 
      />
      <SourceWebpagesPlaceholders isSplit={isSplit} />
      
      <AnswerBody isSplit={isSplit}>
        {renderContent()}
      </AnswerBody>
    </div>
  );
};

function DeepLearnResponse({ onBack, isSplit = false }: DeepLearnResponseProps) {
  const { error, success } = useToast();
  const [selectedMode, setSelectedMode] = useState<'deep-learn' | 'quick-search'>('deep-learn');
  const [conversationId, setConversationId] = useState<string>('');
  const [webSearchEnabled, setWebSearchEnabled] = useState(true); // Add web search state

  // New state for conversation history
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);
  
  // New state for loaded history data
  const [loadedHistoryData, setLoadedHistoryData] = useState<ConversationHistoryItem[] | null>(null);
  const [isHistoryConversation, setIsHistoryConversation] = useState(false);
  
  // New state for continuous conversation
  const [conversationMode, setConversationMode] = useState<'follow-up' | 'new-topic' | null>(null);
  const [inputText, setInputText] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper function to generate UUID
  const generateUUID = (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  // Helper function to generate conversation ID in dl-c-{uuid} format
  const generateConversationId = (): string => {
    const uuid = generateUUID();
    return `dl-c-${uuid}`;
  };

  // Load saved data for this tab and initialize conversation history
  useEffect(() => {
    const tabId = window.location.pathname + window.location.search;
    const historyDataString = localStorage.getItem(`deeplearn_history_data_${tabId}`);
    const isHistoryLoaded = localStorage.getItem(`deeplearn_history_loaded_${tabId}`) === 'true';

    // Check if this is a loaded history conversation
    if (isHistoryLoaded && historyDataString) {
      console.log('📂 Loading history conversation data for tab:', tabId);
      
      try {
        const historyData: ConversationHistoryItem[] = JSON.parse(historyDataString);
        setLoadedHistoryData(historyData);
        setIsHistoryConversation(true);
        
        const savedConversationId = localStorage.getItem(`deeplearn_conversation_${tabId}`);
        if (savedConversationId) {
          setConversationId(savedConversationId);
        }
        
        // Convert history data to conversation messages
        const messages: ConversationMessage[] = [];
        
        historyData.forEach((item, index) => {
          // Add user message
          messages.push({
            id: `history-user-${index}`,
            type: 'user',
            content: item.user_query,
            timestamp: new Date(item.time).toLocaleString(),
            mode: item.question_type === 'deep_learn' ? 'deep-learn' : 'quick-search'
          });
          
          // Add assistant message
          messages.push({
            id: `history-assistant-${index}`,
            type: 'assistant',
            content: item.user_query,
            timestamp: 'Assistant',
            mode: item.question_type === 'deep_learn' ? 'deep-learn' : 'quick-search',
            isStreaming: false,
            streamingContent: item.question_type === 'deep_learn' ? undefined : item.llm_response,
            deepLearnData: item.question_type === 'deep_learn' ? {
              stream_info: 'Loaded from history',
              conversation_id: savedConversationId || '',
              llm_response: item.llm_response,
              generation_status: item.generation_status,
              final: true,
              timestamp: item.time
            } : undefined
          });
        });
        
        setConversationHistory(messages);
        console.log('✅ Loaded history conversation with', messages.length, 'messages');
        
        // Exit early for history conversations - don't load any streaming data
        return;
      } catch (error) {
        console.error('❌ Error parsing history data:', error);
        // If parsing fails, clear the history flags and fall through to normal loading
        localStorage.removeItem(`deeplearn_history_data_${tabId}`);
        localStorage.removeItem(`deeplearn_history_loaded_${tabId}`);
      }
    }
    
    // For non-history conversations, check if we have streaming data
    const savedConversationId = localStorage.getItem(`deeplearn_conversation_${tabId}`);
    const savedQuery = localStorage.getItem(`deeplearn_query_${tabId}`);
    const savedMode = localStorage.getItem(`deeplearn_mode_${tabId}`) as 'deep-learn' | 'quick-search';
    const savedStreamingContent = localStorage.getItem(`deeplearn_streaming_content_${tabId}`) || '';
    const savedDeepContent = localStorage.getItem(`deeplearn_deep_content_${tabId}`);
    const isStreamingComplete = localStorage.getItem(`deeplearn_streaming_complete_${tabId}`) === 'true';
    const isDeepComplete = localStorage.getItem(`deeplearn_deep_complete_${tabId}`) === 'true';
    
    if (savedQuery) {
      console.log('📂 Resuming existing deep learn conversation:', {
        tabId,
        conversationId: savedConversationId,
        query: savedQuery,
        mode: savedMode,
        streamingContentLength: savedStreamingContent.length,
        hasDeepContent: !!savedDeepContent,
        isStreamingComplete,
        isDeepComplete
      });
      
      if (savedMode) {
        setSelectedMode(savedMode);
      }
      if (savedConversationId) {
        setConversationId(savedConversationId);
        console.log('🆔 Loaded conversation ID from localStorage:', savedConversationId);
      }

      // Initialize conversation history with the first message
      const initialUserMessage: ConversationMessage = {
        id: 'initial-user',
        type: 'user',
        content: savedQuery,
        timestamp: 'Me, Jun 1, 9:50 PM'
      };

      const initialAssistantMessage: ConversationMessage = {
        id: 'initial-assistant',
        type: 'assistant',
        content: savedQuery,
        timestamp: 'Assistant',
        mode: savedMode,
        isStreaming: savedMode === 'quick-search' ? !isStreamingComplete : !isDeepComplete,
        streamingContent: savedMode === 'quick-search' ? savedStreamingContent : undefined,
        deepLearnData: savedMode === 'deep-learn' && savedDeepContent ? JSON.parse(savedDeepContent) : undefined
      };

      setConversationHistory([initialUserMessage, initialAssistantMessage]);
      
      // Listen for streaming updates
      const handleStreamingUpdate = (event: CustomEvent) => {
        if (event.detail.tabId === tabId) {
          setConversationHistory(prev => 
            prev.map(msg => 
              msg.id === 'initial-assistant' && msg.mode === 'quick-search'
                ? { ...msg, streamingContent: event.detail.content }
                : msg
            )
          );
        }
      };

      const handleStreamingComplete = (event: CustomEvent) => {
        if (event.detail.tabId === tabId) {
          setConversationHistory(prev => 
            prev.map(msg => 
              msg.id === 'initial-assistant' && msg.mode === 'quick-search'
                ? { ...msg, isStreaming: false }
                : msg
            )
          );
        }
      };

      const handleDeepUpdate = (event: CustomEvent) => {
        if (event.detail.tabId === tabId) {
          setConversationHistory(prev => 
            prev.map(msg => 
              msg.id === 'initial-assistant' && msg.mode === 'deep-learn'
                ? { ...msg, deepLearnData: event.detail.data }
                : msg
            )
          );
        }
      };

      const handleDeepComplete = (event: CustomEvent) => {
        if (event.detail.tabId === tabId) {
          setConversationHistory(prev => 
            prev.map(msg => 
              msg.id === 'initial-assistant' && msg.mode === 'deep-learn'
                ? { ...msg, isStreaming: false }
                : msg
            )
          );
        }
      };

      window.addEventListener('deeplearn-streaming-update', handleStreamingUpdate as EventListener);
      window.addEventListener('deeplearn-streaming-complete', handleStreamingComplete as EventListener);
      window.addEventListener('deeplearn-deep-update', handleDeepUpdate as EventListener);
      window.addEventListener('deeplearn-deep-complete', handleDeepComplete as EventListener);

      return () => {
        window.removeEventListener('deeplearn-streaming-update', handleStreamingUpdate as EventListener);
        window.removeEventListener('deeplearn-streaming-complete', handleStreamingComplete as EventListener);
        window.removeEventListener('deeplearn-deep-update', handleDeepUpdate as EventListener);
        window.removeEventListener('deeplearn-deep-complete', handleDeepComplete as EventListener);
      };
    } else {
      console.log('No saved data found, using defaults');
    }
  }, []);

  // Handle mode selection
  const handleModeSelection = (mode: 'follow-up' | 'new-topic') => {
    setConversationMode(mode);
  };

  // Handle mode change
  const handleModeChange = () => {
    if (conversationMode === 'follow-up') {
      setConversationMode('new-topic');
    } else if (conversationMode === 'new-topic') {
      setConversationMode('follow-up');
    }
  };

  // Get the opposite mode for "Change to" text
  const getOppositeMode = () => {
    return conversationMode === 'follow-up' ? 'New Topic' : 'Follow Up';
  };

  // Handle web search toggle
  const handleWebSearchToggle = () => {
    setWebSearchEnabled(!webSearchEnabled);
  };

  // Handle submitting new question
  const handleSubmitQuestion = async () => {
    if (!inputText.trim() || isSubmitting) {
      return;
    }

    if (conversationMode === 'follow-up') {
      // TODO: Implement follow-up logic later
      success('Follow-up functionality will be implemented next!');
      return;
    }

    if (conversationMode === 'new-topic') {
      try {
        setIsSubmitting(true);
        
        // For history conversations, we can continue with the same conversation ID
        // For new conversations, we generate a new one
        // Use existing conversation ID for new topic in same conversation
        const currentConversationId = conversationId || generateConversationId();
        
        console.log('🔄 Starting new topic in existing conversation:', {
          conversationId: currentConversationId,
          query: inputText.trim(),
          mode: selectedMode,
          webSearch: webSearchEnabled, // Use the web search state
          isNewConversation: false,
          isHistoryConversation
        });
        
        // Add user message to conversation history
        const newUserMessage: ConversationMessage = {
          id: `user-${Date.now()}`,
          type: 'user',
          content: inputText.trim(),
          timestamp: new Date().toLocaleString()
        };

        // Add assistant message placeholder
        const newAssistantMessage: ConversationMessage = {
          id: `assistant-${Date.now()}`,
          type: 'assistant',
          content: inputText.trim(),
          timestamp: 'Assistant',
          mode: selectedMode,
          isStreaming: true,
          streamingContent: selectedMode === 'quick-search' ? '' : undefined,
          deepLearnData: undefined
        };

        setConversationHistory(prev => [...prev, newUserMessage, newAssistantMessage]);
        
        // Clear input immediately after submission
        const queryToSubmit = inputText.trim();
        setInputText('');

        if (selectedMode === 'quick-search') {
          // Start quick search with existing conversation ID and web search setting
          await submitQuickSearchQuery(
            queryToSubmit,
            webSearchEnabled, // Use the web search state
            undefined, // no additional comments
            null, // no references
            (data: string) => {
              // Update the streaming content for the current assistant message
              setConversationHistory(prev => 
                prev.map(msg => 
                  msg.id === newAssistantMessage.id
                    ? { ...msg, streamingContent: (msg.streamingContent || '') + data }
                    : msg
                )
              );
            },
            (errorMsg: string) => {
              console.error('Quick search streaming error:', errorMsg);
              error(`Streaming error: ${errorMsg}`);
              setIsSubmitting(false);
            },
            () => {
              console.log('Quick search streaming completed');
              setConversationHistory(prev => 
                prev.map(msg => 
                  msg.id === newAssistantMessage.id
                    ? { ...msg, isStreaming: false }
                    : msg
                )
              );
              setIsSubmitting(false);
            },
            currentConversationId, // Pass existing conversation ID
            currentConversationId // Also pass as the generated conversation ID parameter
          );
        } else {
          // Deep learn mode with web search setting
          await submitDeepLearnDeepQuery(
            queryToSubmit,
            webSearchEnabled, // Use the web search state
            undefined, // no additional comments
            null, // no references
            (data) => {
              // Update the deep learn data for the current assistant message
              setConversationHistory(prev => 
                prev.map(msg => 
                  msg.id === newAssistantMessage.id
                    ? { ...msg, deepLearnData: data }
                    : msg
                )
              );
            },
            (errorMsg: string) => {
              console.error('Deep learn streaming error:', errorMsg);
              error(`Deep learn error: ${errorMsg}`);
              setIsSubmitting(false);
            },
            () => {
              console.log('Deep learn streaming completed');
              setConversationHistory(prev => 
                prev.map(msg => 
                  msg.id === newAssistantMessage.id
                    ? { ...msg, isStreaming: false }
                    : msg
                )
              );
              setIsSubmitting(false);
            },
            currentConversationId, // Pass existing conversation ID
            currentConversationId // Also pass as the generated conversation ID parameter
          );
        }
        
      } catch (err) {
        console.error('Error submitting new topic question:', err);
        error('Failed to submit question. Please try again.');
        setIsSubmitting(false);
      }
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitQuestion();
    }
  };

  return (
    <div className="h-[calc(100vh-88px)] flex flex-col bg-white overflow-hidden">
      {/* Header - 缩小上下padding */}
      <div className="flex items-center justify-between px-4 py-2 bg-white flex-shrink-0">
        <div className="flex items-center gap-[13px]">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="p-0 w-5 h-5 flex-shrink-0"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </Button>
          <h1 className="font-['Inter',Helvetica] text-[14px] font-medium text-black leading-normal">
            Learning Journey: {isHistoryConversation && loadedHistoryData ? loadedHistoryData[0]?.user_query : (conversationHistory[0]?.content || 'Research Topic')}
          </h1>
        </div>

        <div className="flex items-center gap-[23px]">
          {/* Publish to Community 按钮 - 学习参考代码的样式 */}
          <button className="flex items-center justify-between w-[163px] h-[25px] flex-shrink-0 rounded-lg bg-[#80A5E4] px-3 py-0 font-['Inter'] text-[12px] font-medium text-white leading-normal">
            <span className="whitespace-nowrap">Publish to Community</span>
            <span className="ml-1 flex items-center">
              {/* Publish SVG */}
              <img
                src="/workspace/publish_icon.svg"
                alt="Publish Icon"
                className="w-[18px] h-[17px]"
              />
            </span>
          </button>

          {/* 分享按钮 - 学习参考代码的样式 */}
          <button
            className="flex items-center justify-center w-[18px] h-[18px] flex-shrink-0 mr-[18px]"
            aria-label="Share"
          >
            <img
              src="/workspace/share_icon.svg"
              alt="Share Icon"
              className="w-5 h-5"
            />
          </button>

          {/* 打印按钮 - 调整间距和图标粗细 */}
          <button
            className="flex items-center justify-center w-[18px] h-[18px] flex-shrink-0"
            aria-label="Print"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6,9 6,2 18,2 18,9" />
              <path d="M6,18H4a2,2,0,0,1-2-2V11a2,2,0,0,1,2-2H20a2,2,0,0,1,2,2v5a2,2,0,0,1-2,2H18" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Content Area - 修复布局，防止页面滚动 */}
      <div className={`flex-1 flex overflow-hidden ${isSplit ? 'w-[95%]' : 'w-[70%]'}  self-center`}>
        {/* 整个内容区域居中 - 使用justify-center让内容组合在屏幕中央 */}
        <div className="flex-1 flex justify-center overflow-hidden">
          {/* 文字+sidebar组合 - 固定总宽度，在屏幕中央 */}
          <div className={`flex gap-6  ${isSplit ? 'max-w-[849px]' : 'max-w-[975px]'}`}>
            {/* Main Content - Scrollable - 固定宽度649px */}
            <div className={`${isSplit ? 'max-w-[449px]' : 'w-[649px]'}`}>
              <div className="h-[calc(100vh-280px)] overflow-y-auto py-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] flex-shrink-0">
                {/* Render conversation history */}
                {conversationHistory.map((message) => (
                  <div key={message.id}>
                    {message.type === 'user' ? (
                      <UserQuestionBubble 
                        content={message.content} 
                        time={message.timestamp} 
                        isSplit={isSplit} 
                      />
                    ) : (
                      <AssistantMessage 
                        message={message} 
                        isSplit={isSplit}
                        conversationId={message.id === 'initial-assistant' || message.id.startsWith('history-assistant-0') ? conversationId : undefined}
                      />
                    )}
                  </div>
                ))}
              </div>
              
              {/* Fixed Bottom Input Box - Enhanced hover effects, removed submit button */}
              <div className={`bg-white border rounded-2xl px-4 py-2 shadow-sm h-[120px] text-[12px] flex flex-col justify-between transition-all duration-300 ${
                isInputFocused 
                  ? 'border-[#80A5E4] shadow-[0px_2px_15px_0px_rgba(128,165,228,0.15)]' 
                  : 'border-gray-300'
              }`}>
                {/* Mode Selection Section - Only show if no mode is selected */}
                {!conversationMode && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-gray-700 font-['Inter',Helvetica] text-[12px]">Start a</span>
                      <button 
                        className="bg-[#F9F9F9] border border-[#D9D9D9] text-[#4A4A4A] rounded-xl px-2 py-0.5 font-['Inter',Helvetica] text-[12px] hover:bg-gray-100 transition-colors"
                        onClick={() => handleModeSelection('follow-up')}
                      >
                        Follow Up
                      </button>
                      <span className="text-gray-500 font-['Inter',Helvetica] text-[12px]">or</span>
                      <button 
                        className="bg-[#F9F9F9] border border-[#D9D9D9] text-[#4A4A4A] rounded-xl px-2 py-0.5 font-['Inter',Helvetica] text-[12px] hover:bg-gray-100 transition-colors"
                        onClick={() => handleModeSelection('new-topic')}
                      >
                        New Topic
                      </button>
                    </div>
                  </div>
                )}

                {/* Input Area - Show when mode is selected */}
                {conversationMode && (
                  <div className="flex-1">
                    <textarea
                      className={`w-full h-full resize-none border-none outline-none bg-transparent font-['Inter',Helvetica] text-[12px] placeholder:text-gray-400 transition-all duration-300 ${
                        isInputFocused ? 'caret-[#80A5E4]' : ''
                      }`}
                      placeholder={`Type your ${conversationMode === 'follow-up' ? 'follow-up question' : 'new topic'} here...`}
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onFocus={() => setIsInputFocused(true)}
                      onBlur={() => setIsInputFocused(false)}
                      onKeyPress={handleKeyPress}
                      disabled={isSubmitting}
                    />
                  </div>
                )}

                {/* Bottom Controls - Show when mode is selected */}
                {conversationMode && (
                  <div className="space-y-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 font-['Inter',Helvetica]">Change to</span>
                        <button 
                          className="bg-[#F9F9F9] border border-[#D9D9D9] text-[#4A4A4A] rounded-xl px-2 py-0.5 text-[12px] font-['Inter',Helvetica] hover:bg-gray-100 transition-colors"
                          onClick={handleModeChange}
                          disabled={isSubmitting}
                        >
                          {getOppositeMode()}
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Web Search Toggle Button */}
                        <button
                          onClick={handleWebSearchToggle}
                          className={`p-1 rounded transition-colors ${
                            webSearchEnabled 
                              ? 'text-black' 
                              : 'text-gray-400'
                          }`}
                          title={webSearchEnabled ? 'Web search enabled' : 'Web search disabled'}
                          disabled={isSubmitting}
                        >
                          <GlobeIcon className="w-4 h-4" />
                        </button>

                        {/* Deep Learn / Quick Search Toggle - Only show in new-topic mode */}
                        {conversationMode === 'new-topic' && (
                          <div
                            className="w-[180px] h-[30px] bg-[#ECF1F6] rounded-[16.5px] flex items-center cursor-pointer relative"
                            onClick={() => !isSubmitting && setSelectedMode(selectedMode === 'deep-learn' ? 'quick-search' : 'deep-learn')}
                          >
                            <div
                              className={`absolute top-1 w-[84px] h-[22px] bg-white rounded-[14px] transition-all duration-300 ease-in-out z-10 ${selectedMode === 'deep-learn' ? 'left-1.5' : 'left-[94px]'
                                }`}
                            />
                            <div className="absolute left-4 h-full flex items-center z-20">
                              <span className="text-[#6B6B6B] font-['Inter',Helvetica] text-xs font-medium">Deep Learn</span>
                            </div>
                            <div className="absolute right-3 h-full flex items-center z-20">
                              <span className="text-[#6B6B6B] font-['Inter',Helvetica] text-xs font-medium">Quick Search</span>
                            </div>
                          </div>
                        )}

                        <Button variant="ghost" size="icon" className="w-8 h-8 text-gray-600" disabled={isSubmitting}>
                          <FolderIcon className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Sidebar - 紧贴左侧文字，缩小间距 */}
            <Interactive isSplit={isSplit} />
          </div>
        </div>
      </div>
    </div >
  );
}

export default DeepLearnResponse;
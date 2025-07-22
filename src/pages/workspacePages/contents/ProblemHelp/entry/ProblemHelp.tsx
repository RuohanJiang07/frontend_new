import React from 'react';
import { useState } from 'react';
import './ProblemHelp.css';
import { submitProblemSolverSolution } from '../../../../../api/workspaces/problem_help/ProblemHelpMain';
import { getProblemSolverHistory, ProblemSolverConversation } from '../../../../../api/workspaces/problem_help/getHistory';
import { useToast } from '../../../../../hooks/useToast';
import { useEffect } from 'react';
import { useTabContext } from '../../../workspaceFrame/TabContext';

interface ProblemHelpProps {
  isSplit?: boolean;
  onBack?: () => void;
  onViewChange?: (view: string | null) => void;
  tabIdx?: number;
  pageIdx?: number;
  screenId?: string;
}

function ProblemHelp({ isSplit = false, onBack, onViewChange, tabIdx = 0, pageIdx = 0, screenId = '' }: ProblemHelpProps) {
  const { switchToProblemHelp, switchToProblemHelpResponse } = useTabContext();
  const { error, success } = useToast();
  const [inputValue, setInputValue] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [profileSelected, setProfileSelected] = useState(false);
  const [isUploadHovered, setIsUploadHovered] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [historyItems, setHistoryItems] = useState<ProblemSolverConversation[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Load history data when component mounts
  useEffect(() => {
    loadHistoryData();
  }, []);

  const loadHistoryData = async () => {
    try {
      setLoadingHistory(true);
      const response = await getProblemSolverHistory();
      
      if (response.success) {
        setHistoryItems(response.problem_solver_conversations.items);
        console.log('📂 Loaded problem solver history:', response.problem_solver_conversations.items.length, 'conversations');
      } else {
        console.warn('Failed to load problem solver history');
      }
    } catch (err) {
      console.error('Error loading problem solver history:', err);
      // Don't show error to user, just use empty state
    } finally {
      setLoadingHistory(false);
    }
  };

  // Helper function to format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const toggleProfile = () => {
    setProfileSelected(!profileSelected);
  };

  const handleUploadClick = () => {
    // Handle upload functionality here
    console.log('Upload clicked');
  };

  // Handle clicking on a history card
  const handleHistoryCardClick = (historyItem: ProblemSolverConversation) => {
    // Generate a unique tab ID for this specific tab instance
    const tabId = `${pageIdx}-${screenId}-${tabIdx}`;
    
    // Store the conversation ID for loading the full conversation
    localStorage.setItem(`problemhelp_conversation_${tabId}`, historyItem.conversation_id);
    
    // Mark this as a history conversation that needs to be loaded
    localStorage.setItem(`problemhelp_history_loaded_${tabId}`, 'true');
    
    // Clear any existing data
    localStorage.removeItem(`problemhelp_history_data_${tabId}`);
    localStorage.removeItem(`problemhelp_streaming_content_${tabId}`);
    localStorage.removeItem(`problemhelp_streaming_complete_${tabId}`);
    localStorage.removeItem(`problemhelp_query_${tabId}`);
    localStorage.removeItem(`problemhelp_profile_${tabId}`);
    
    // Navigate to the response page
    switchToProblemHelpResponse(pageIdx, screenId, tabIdx);
  };

  // Filter history based on search query
  const filteredHistory = historyItems
    .filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.type.toLowerCase().includes(searchQuery.toLowerCase())
  )
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()); // Sort by latest first

  // Handle sending a new query - Updated to use real API
  const handleSendQuery = async () => {
    if (!inputValue.trim() || isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      
      // Generate a unique tab ID for this specific tab instance
      const tabId = `${pageIdx}-${screenId}-${tabIdx}`;
      
      // Generate conversation ID FIRST, before any navigation or API calls
      const newConversationId = `ps-c-${generateUUID()}`;
      
      console.log('🚀 Starting new Problem Help conversation:', {
        query: inputValue.trim(),
        profile: profileSelected ? 'selected' : null,
        tabId,
        conversationId: newConversationId
      });
      
      // Clear any existing data for this tab
      localStorage.removeItem(`problemhelp_history_data_${tabId}`);
      localStorage.removeItem(`problemhelp_history_loaded_${tabId}`);
      localStorage.removeItem(`problemhelp_streaming_content_${tabId}`);
      localStorage.removeItem(`problemhelp_streaming_complete_${tabId}`);
      
      // Store the conversation ID BEFORE navigation
      localStorage.setItem(`problemhelp_conversation_${tabId}`, newConversationId);
      console.log('💾 Stored conversation ID BEFORE navigation:', newConversationId);
      
      // Store the initial query for the response page
      localStorage.setItem(`problemhelp_query_${tabId}`, inputValue.trim());
      localStorage.setItem(`problemhelp_profile_${tabId}`, profileSelected ? 'selected' : '');
      
      // Navigate to response page first
      switchToProblemHelpResponse(pageIdx, screenId, tabIdx);
      
      // Start the API call
      await submitProblemSolverSolution(
        inputValue.trim(),
        profileSelected ? 'selected' : undefined,
        null, // references
        (data: string) => {
          // Store streaming data for the response page to pick up
          const currentContent = localStorage.getItem(`problemhelp_streaming_content_${tabId}`) || '';
          localStorage.setItem(`problemhelp_streaming_content_${tabId}`, currentContent + data);
          
          // Trigger event for response page to update
          window.dispatchEvent(new CustomEvent('problemhelp-streaming-update', {
            detail: { tabId, content: currentContent + data }
          }));
        },
        (errorMsg: string) => {
          console.error('Problem Help streaming error:', errorMsg);
          error(`Error: ${errorMsg}`);
          setIsSubmitting(false);
        },
        () => {
          console.log('Problem Help streaming completed');
          localStorage.setItem(`problemhelp_streaming_complete_${tabId}`, 'true');
          
          // Trigger completion event
          window.dispatchEvent(new CustomEvent('problemhelp-streaming-complete', {
            detail: { tabId }
          }));
          setIsSubmitting(false);
        },
        undefined, // no existing conversation ID (this is a new conversation)
        newConversationId  // use our pre-generated conversation ID
      );
      
      console.log('✅ Problem Help conversation started with ID:', newConversationId);
      
    } catch (err) {
      console.error('Error starting Problem Help conversation:', err);
      error('Failed to start conversation. Please try again.');
      setIsSubmitting(false);
    }
  };
  
  // Helper function to generate UUID
  const generateUUID = (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendQuery();
    }
  };

  return (
    <div className="problem-help-container">
      {/* Header Section */}
      <div className="problem-help-header">
        <img
          src="/workspace/problemHelp/problemHelp.svg"
          alt="Problem Help Icon"
          className="problem-help-header-icon"
        />
        <div className="problem-help-header-text">
          <h1 className="problem-help-title font-outfit">Problem Help</h1>
          <p className="problem-help-subtitle font-outfit">It's ok to not understand every problem</p>
        </div>
      </div>

      {/* Upload Section */}
      <div className="problem-help-upload-section">
        <div 
          className="problem-help-upload-box"
          onClick={handleUploadClick}
          onMouseEnter={() => setIsUploadHovered(true)}
          onMouseLeave={() => setIsUploadHovered(false)}
        >
          <img
            src="/workspace/problemHelp/upload.svg"
            alt="Upload Icon"
            className="problem-help-upload-icon"
          />
          <span className="problem-help-upload-text">
            Drag or select additional contents here
          </span>
        </div>
      </div>

      {/* Input Section */}
      <div className="problem-help-input-section">
        {/* Input Box */}
        <div className={`problem-help-input-box ${isInputFocused ? 'focused' : ''}`}>          
          <textarea
            className="problem-help-input"
            placeholder="Enter your problem here..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setIsInputFocused(false)}
            onKeyDown={handleInputKeyDown}
          />

          {/* Model Selection Dropdown */}
          <div className="problem-help-model-dropdown">
            <img
              src="/workspace/problemHelp/stack-line.svg"
              alt="Model Icon"
              className="problem-help-model-icon"
            />
            <span className="problem-help-model-text">
              GPT-4o
            </span>
            <svg 
              width="19" 
              height="19" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="#4C6694" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="problem-help-dropdown-arrow"
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
          
          {/* Buttons at the bottom right */}
          <div className="problem-help-buttons">
            {/* Profile Button */}
            <button 
              className={`problem-help-button ${profileSelected ? 'selected' : ''}`}
              onClick={toggleProfile}
              title="Select Profile" 
            >
              <img 
                src="/workspace/deepLearn/contacts-line.svg" 
                alt="Profile" 
                className="problem-help-button-icon"
                style={{ filter: profileSelected ? 'brightness(0) invert(1)' : 'brightness(0) saturate(100%) invert(39%) sepia(0%) saturate(0%) hue-rotate(147deg) brightness(94%) contrast(87%)' }}
              />
            </button>

            {/* Separator Line */}
            <div className="problem-help-button-separator"></div>

            {/* Send Button */}
            <button 
              className={`problem-help-send-button ${inputValue.trim() && !isSubmitting ? 'active' : ''}`}
              onClick={handleSendQuery}
              disabled={!inputValue.trim() || isSubmitting}
              title="Send Query" 
            >
              <img 
                src="/workspace/arrow-up.svg" 
                alt="Send" 
                className="problem-help-send-icon"
              />
            </button>
          </div>
        </div>
      </div>

      {/* History Section */}
      <div className="problem-help-history-section">
        <div className="problem-help-history-header">
          <div className="problem-help-history-title">
            <img 
              src="/workspace/deepLearn/history.svg" 
              alt="History Icon"
              className="deep-learn-tab-button-icon"
              style={{ width: '20px', height: '20px', filter: 'brightness(0) saturate(100%) invert(32%) sepia(9%) saturate(2096%) hue-rotate(182deg) brightness(93%) contrast(87%)' }}
            />
            My History
          </div>
          <div className="problem-help-search-container">
            <img
              src="/workspace/problemHelp/search.svg"
              alt="Search Icon"
              className="problem-help-search-icon"
            />
            <input
              type="text"
              className="problem-help-search-input"
              placeholder="Search in workspace..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* History Cards Section - Independent frame */}
      <div className={`problem-help-cards-container ${isSplit ? 'split' : ''}`}>
        {loadingHistory ? (
          // Loading skeleton cards
          Array.from({ length: 6 }).map((_, index) => (
            <div key={`loading-${index}`} className="problem-help-card">
              <div className="w-full h-[58px] bg-gray-200 rounded animate-pulse mb-4"></div>
              <div className="problem-help-card-detail">
                <div className="w-16 h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          ))
        ) : filteredHistory.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-500">
            <div className="text-lg font-medium mb-2">No problem history found</div>
            <div className="text-sm text-center max-w-md">
              {searchQuery ? 'Try adjusting your search criteria' : 'Start solving problems to see your history here'}
            </div>
          </div>
        ) : (
          filteredHistory.map((item) => (
          <div 
            key={item.conversation_id} 
            className="problem-help-card"
            onClick={() => handleHistoryCardClick(item)}
            style={{ cursor: 'pointer' }}
          >
              <div className="problem-help-card-title">
              {item.title}
            </div>
            <div className="problem-help-card-detail">
              <div className={`problem-help-card-tag ${item.type}`}>
                {item.type === 'solution' ? 'Solution' : item.type}
              </div>
              <div className="problem-help-card-date">
                <img
                  src="/workspace/problemHelp/calendar.svg"
                  alt="Calendar"
                  className="problem-help-card-date-icon"
                />
                <span className="problem-help-card-date-text">
                  {formatDate(item.created_at)}
                </span>
              </div>
            </div>
          </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ProblemHelp;
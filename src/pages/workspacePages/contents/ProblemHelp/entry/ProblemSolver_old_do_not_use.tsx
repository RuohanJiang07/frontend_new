import React, { useState, useEffect } from 'react';
import { Button } from '../../../../../components/ui/button';
import {
  ChevronDownIcon,
  UserIcon,
  PaperclipIcon,
  SearchIcon,
  UploadIcon
} from 'lucide-react';
import { submitProblemSolverSolution } from '../../../../../api/workspaces/problem_help/ProblemHelpMain';
import { useToast } from '../../../../../hooks/useToast';
import { getProblemSolverHistory, ProblemSolverConversation, getProblemSolverHistoryConversation } from '../../../../../api/workspaces/problem_help/getHistory';

interface ProblemSolverProps {
  onBack?: () => void;
  onViewChange?: (view: string | null) => void;
}

function ProblemSolver({ onBack, onViewChange }: ProblemSolverProps) {
  const { success, error } = useToast();
  const [problemText, setProblemText] = useState('');
  const [selectedModel, setSelectedModel] = useState('GPT-4o');
  const [selectedMode, setSelectedMode] = useState<'step-by-step' | 'solution'>('step-by-step');
  const [sortBy, setSortBy] = useState('Date/Type');
  const [isFocused, setIsFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [historyConversations, setHistoryConversations] = useState<ProblemSolverConversation[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [filteredItems, setFilteredItems] = useState<ProblemSolverConversation[]>([]);

  // Load history when component mounts
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setIsLoadingHistory(true);
      const historyData = await getProblemSolverHistory();
      
      if (historyData.success) {
        // Handle case where problem_solver_conversations might be undefined or items might be undefined
        const conversations = historyData.problem_solver_conversations?.items || [];
        setHistoryConversations(conversations);
        setFilteredItems(conversations);
        console.log('📚 Loaded problem solver history conversations:', historyData.problem_solver_conversations.items.length);
      } else {
        // Don't show error for empty history, just set empty array
        setHistoryConversations([]);
        setFilteredItems([]);
        console.log('📚 No problem solver conversation history found or failed to load');
      }
    } catch (err) {
      console.error('Error loading problem solver history:', err);
      // Don't show error for empty history, just set empty array
      setHistoryConversations([]);
      setFilteredItems([]);
      console.log('📚 Error loading problem solver history, setting empty state');
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Update filtered items when search query or history changes
  useEffect(() => {
    // Ensure historyConversations is an array before filtering
    const conversationsArray = Array.isArray(historyConversations) ? historyConversations : [];
    const filtered = conversationsArray.filter(item =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredItems(filtered);
    setCurrentPage(1); // Reset to first page when search changes
  }, [searchQuery, historyConversations]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredItems.slice(startIndex, endIndex);
  };

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

  // Helper function to save conversation ID and query for this tab
  const saveTabData = (conversationId: string, query: string, mode: 'step-by-step' | 'solution') => {
    // Get current tab ID from the URL or generate one if needed
    const tabId = window.location.pathname + window.location.search;
    localStorage.setItem(`problemhelp_conversation_${tabId}`, conversationId);
    localStorage.setItem(`problemhelp_query_${tabId}`, query);
    localStorage.setItem(`problemhelp_mode_${tabId}`, mode);
    
    console.log(`💾 Saved problem help conversation data for tab ${tabId}:`, {
      conversationId,
      query,
      mode
    });
  };

  // Helper function to clear related content for new conversations
  const clearRelatedContent = () => {
    const tabId = window.location.pathname + window.location.search;
    // Clear all localStorage keys related to problem help for this tab
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(`problemhelp_`) && key.includes(tabId)) {
        localStorage.removeItem(key);
      }
    });
    
    console.log('🧹 Cleared related content for new problem help conversation');
  };

  const handleSubmitProblem = async () => {
    if (!problemText.trim()) {
      error('Please enter a problem to solve');
      return;
    }

    // Only handle solution mode for now
    if (selectedMode !== 'solution') {
      error('Step-by-step mode is not implemented yet. Please select Solution mode.');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Clear related content when starting a new conversation
      clearRelatedContent();

      // Clear any history loaded flag to ensure we're starting fresh
      const tabId = window.location.pathname + window.location.search;
      localStorage.removeItem(`problemhelp_history_loaded_${tabId}`);
      localStorage.removeItem(`problemhelp_history_data_${tabId}`);

      // Generate conversation ID for new conversation
      const conversationId = generateConversationId();
      
      console.log('🆔 Generated conversation ID:', conversationId);
      console.log('📝 Submitting problem with params:', {
        query: problemText.trim(),
        mode: selectedMode,
        profile: 'profile-default',
        references: null,
        conversationId
      });

      // Save conversation data immediately
      saveTabData(conversationId, problemText.trim(), selectedMode);

      // For solution mode, use the problem solver solution endpoint
      localStorage.setItem(`problemhelp_query_${tabId}`, problemText.trim());
      localStorage.setItem(`problemhelp_mode_${tabId}`, selectedMode);
      localStorage.setItem(`problemhelp_streaming_content_${tabId}`, ''); // Clear previous content
      
      // Navigate to response page immediately
      onViewChange?.('problem-help-response');
      
      // Start streaming in the background
      await submitProblemSolverSolution(
        problemText.trim(),
        'profile-default',
        null,
        (data: string) => {
          // Update streaming content in localStorage
          const currentContent = localStorage.getItem(`problemhelp_streaming_content_${tabId}`) || '';
          localStorage.setItem(`problemhelp_streaming_content_${tabId}`, currentContent + data);
          
          // Trigger a custom event to notify the response component
          window.dispatchEvent(new CustomEvent('problemhelp-streaming-update', {
            detail: { tabId, content: currentContent + data }
          }));
        },
        (errorMsg: string) => {
          console.error('Problem solver streaming error:', errorMsg);
          error(`Streaming error: ${errorMsg}`);
        },
        () => {
          console.log('Problem solver streaming completed');
          // Mark streaming as complete
          localStorage.setItem(`problemhelp_streaming_complete_${tabId}`, 'true');
          window.dispatchEvent(new CustomEvent('problemhelp-streaming-complete', {
            detail: { tabId }
          }));
        },
        undefined, // No existing conversation ID for new conversation
        conversationId // Pass the generated conversation ID
      );

    } catch (err) {
      console.error('Error submitting problem:', err);
      error('Failed to start problem solving. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleHistoryItemClick = (conversation: ProblemSolverConversation) => {
    // Load the historical conversation data
    loadHistoryConversation(conversation);
  };

  const loadHistoryConversation = async (conversation: ProblemSolverConversation) => {
    try {
      console.log('📖 Loading problem solver history conversation:', conversation.conversation_id);
      
      // Fetch the conversation history
      const historyData = await getProblemSolverHistoryConversation(conversation.conversation_id);
      
      if (historyData.success && historyData.conversation_json.length > 0) {
        const tabId = window.location.pathname + window.location.search;
        
        // Clear ALL existing conversation data for this tab
        localStorage.removeItem(`problemhelp_streaming_content_${tabId}`);
        localStorage.removeItem(`problemhelp_streaming_complete_${tabId}`);
        localStorage.removeItem(`problemhelp_conversation_${tabId}`);
        localStorage.removeItem(`problemhelp_query_${tabId}`);
        localStorage.removeItem(`problemhelp_mode_${tabId}`);
        
        // Save the conversation data for loading in response view
        localStorage.setItem(`problemhelp_conversation_${tabId}`, conversation.conversation_id);
        localStorage.setItem(`problemhelp_query_${tabId}`, conversation.title);
        localStorage.setItem(`problemhelp_mode_${tabId}`, conversation.type || 'solution');
        
        // Store the full conversation history
        localStorage.setItem(`problemhelp_history_data_${tabId}`, JSON.stringify(historyData.conversation_json));
        
        // Mark as history conversation loaded
        localStorage.setItem(`problemhelp_history_loaded_${tabId}`, 'true');
        
        console.log('✅ Successfully loaded and stored problem solver history conversation data');
        
        // NOW navigate to response view after all data is properly stored
        onViewChange?.('problem-help-response');
      } else {
        error('Failed to load conversation history');
      }
    } catch (err) {
      console.error('❌ Error loading problem solver history conversation:', err);
      error('Failed to load conversation history. Please try again.');
    }
  };

  const handleBackToEntry = () => {
    // Notify parent component to go back to default view
    onViewChange?.(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitProblem();
    }
  };

  // If we're in response view, render the response component
  // This will be handled by the parent component based on activeView
  return (
    <div className="h-[calc(100vh-88px)] flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <main className="flex-1 p-12 max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-center mb-[55px]">
            <div className="flex items-center gap-4">
              <img
                className="w-12 h-10"
                alt="Hyperknow logo"
                src="/main/landing_page/hyperknow_logo 1.svg"
              />
              <div>
                <h2 className="font-['Outfit',Helvetica] font-medium text-black text-2xl">
                  Problem Help
                </h2>
                <p className="font-['Outfit',Helvetica] font-medium text-black text-[13px]">
                  get step-by-step help for problem sets
                </p>
              </div>
            </div>
          </div>

          {/* Upload area */}
          <div className="flex justify-center mb-6">
            <div className="flex w-[661px] h-[100px] p-6 flex-col justify-center items-center gap-2 border-2 border-dashed border-[#0064A2] bg-[rgba(226,238,252,0.60)] rounded-lg shadow-[0px_3px_60px_1px_rgba(72,112,208,0.08)]">
              <div className="w-10 h-10 flex-shrink-0">
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" fill="none">
                  <path d="M26.6671 26.6667L20.0004 20.0001M20.0004 20.0001L13.3338 26.6667M20.0004 20.0001L20.0004 35.0001M33.9838 30.6501C35.6093 29.7638 36.8935 28.3615 37.6335 26.6644C38.3736 24.9673 38.5274 23.0721 38.0708 21.2779C37.6141 19.4836 36.5729 17.8926 35.1115 16.7558C33.6502 15.619 31.8519 15.0013 30.0004 15.0001H27.9004C27.3959 13.0488 26.4557 11.2373 25.1503 9.70171C23.845 8.16614 22.2085 6.94647 20.3639 6.1344C18.5193 5.32233 16.5147 4.93899 14.5006 5.01319C12.4866 5.0874 10.5155 5.61722 8.73572 6.56283C6.9559 7.50844 5.41361 8.84523 4.22479 10.4727C3.03598 12.1002 2.23157 13.9759 1.87206 15.959C1.51254 17.9421 1.60726 19.9809 2.14911 21.9222C2.69096 23.8634 3.66583 25.6565 5.00042 27.1667" stroke="#B3B3B3" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="text-[#6B6B6B] text-center font-['Inter',Helvetica] text-sm font-normal leading-5">
                Drag or upload additional context here
              </p>
            </div>
          </div>

          {/* Input box */}
          <div className="flex justify-center relative mt-5">
            <div className={`w-[720px] h-36 border bg-white rounded-[13px] relative transition-all duration-200 overflow-hidden ${
              isFocused 
                ? 'border-[#80A5E4] shadow-[0px_2px_20px_0px_rgba(128,165,228,0.15)]' 
                : 'border border-[#D0DAE4] shadow-[0px_3px_60px_1px_rgba(72,112,208,0.05)]'
            }`}>
              <textarea
                className="w-full h-full resize-none bg-transparent outline-none border-none rounded-[13px] p-4 pb-12 text-black font-['Inter',Helvetica] text-base font-normal leading-relaxed selection:bg-blue-100 selection:text-black placeholder:text-[#9CA3AF] caret-[#80A5E4]"
                placeholder={!isFocused && !problemText ? "Paste or type your problem here..." : ""}
                value={problemText}
                onChange={(e) => setProblemText(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onKeyPress={handleKeyPress}
                disabled={isSubmitting}
              />

              {/* Bottom buttons container */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center">
                {/* GPT-4o button */}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-[106px] h-[25px] bg-[rgba(236,241,246,0.63)] border-none rounded-lg flex items-center justify-center gap-1 p-0 hover:bg-[rgba(236,241,246,0.8)] transition-colors duration-200"
                  disabled={isSubmitting}
                >
                  <div className="w-4 h-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M8.00033 10.0001C8.55588 10.0001 9.0281 9.80564 9.41699 9.41675C9.80588 9.02786 10.0003 8.55564 10.0003 8.00008C10.0003 7.44453 9.80588 6.9723 9.41699 6.58341C9.0281 6.19453 8.55588 6.00008 8.00033 6.00008C7.44477 6.00008 6.97255 6.19453 6.58366 6.58341C6.19477 6.9723 6.00033 7.44453 6.00033 8.00008C6.00033 8.55564 6.19477 9.02786 6.58366 9.41675C6.97255 9.80564 7.44477 10.0001 8.00033 10.0001ZM8.00033 11.3334C7.0781 11.3334 6.29199 11.0084 5.64199 10.3584C4.99199 9.70841 4.66699 8.9223 4.66699 8.00008C4.66699 7.07786 4.99199 6.29175 5.64199 5.64175C6.29199 4.99175 7.0781 4.66675 8.00033 4.66675C8.92255 4.66675 9.70866 4.99175 10.3587 5.64175C11.0087 6.29175 11.3337 7.07786 11.3337 8.00008C11.3337 8.9223 11.0087 9.70841 10.3587 10.3584C9.70866 11.0084 8.92255 11.3334 8.00033 11.3334ZM3.33366 8.66675H0.666992V7.33341H3.33366V8.66675ZM15.3337 8.66675H12.667V7.33341H15.3337V8.66675ZM7.33366 3.33341V0.666748H8.66699V3.33341H7.33366ZM7.33366 15.3334V12.6667H8.66699V15.3334H7.33366ZM4.26699 5.16675L2.58366 3.55008L3.53366 2.56675L5.13366 4.23341L4.26699 5.16675ZM12.467 13.4334L10.8503 11.7501L11.7337 10.8334L13.417 12.4501L12.467 13.4334ZM10.8337 4.26675L12.4503 2.58341L13.4337 3.53341L11.767 5.13341L10.8337 4.26675ZM2.56699 12.4667L4.25033 10.8501L5.16699 11.7334L3.55033 13.4167L2.56699 12.4667Z" fill="#6B6B6B" />
                    </svg>
                  </div>
                  <span className="text-[#6B6B6B] font-['Inter',Helvetica] text-xs font-medium">GPT-4o</span>
                  <ChevronDownIcon className="w-3 h-3 text-[#6B6B6B]" />
                </Button>

                {/* Mode selection toggle - positioned 13px to the right */}
                <div
                  className={`ml-[13px] w-[168px] h-[30px] bg-[#ECF1F6] rounded-[16.5px] flex items-center cursor-pointer relative ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => !isSubmitting && setSelectedMode(selectedMode === 'step-by-step' ? 'solution' : 'step-by-step')}
                >
                  <div
                    className={`absolute top-1 w-24 h-[22px] bg-white rounded-[14px] transition-all duration-300 ease-in-out z-10 ${selectedMode === 'step-by-step' ? 'left-1.5' : 'left-[66px]'
                      }`}
                  />
                  <div className="absolute left-4 h-full flex items-center z-20">
                    <span className="text-[#6B6B6B] font-['Inter',Helvetica] text-xs font-medium">Step-by-step</span>
                  </div>
                  <div className="absolute right-3.5 h-full flex items-center z-20">
                    <span className="text-[#6B6B6B] font-['Inter',Helvetica] text-xs font-medium">Solution</span>
                  </div>
                </div>

                {/* Profile selection button - pushed to the right */}
                <div className="ml-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-[81px] h-[25px] bg-[#EDF2F7] border-none rounded-lg flex items-center justify-center gap-1 p-0 hover:bg-[#e2e8f0] transition-colors duration-200"
                    disabled={isSubmitting}
                  >
                    <UserIcon className="w-3 h-3 text-[#6B6B6B]" />
                    <span className="text-[#6B6B6B] font-['Inter',Helvetica] text-xs font-medium">Profile</span>
                    <ChevronDownIcon className="w-3 h-3 text-[#6B6B6B]" />
                  </Button>
                </div>
              </div>

              {/* Submit button - only show when there's text and solution mode is selected */}
              {problemText.trim() && selectedMode === 'solution' && (
                <div className="absolute bottom-3 right-3">
                  <Button
                    onClick={handleSubmitProblem}
                    disabled={isSubmitting}
                    className="bg-[#80A5E4] hover:bg-[#6b94d6] text-white rounded-lg px-4 py-1 text-sm font-['Inter',Helvetica]"
                  >
                    {isSubmitting ? 'Solving...' : 'Solve'}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* History section - reduced top margin to move closer to input box */}
          <div className="w-full max-w-4xl mx-auto mt-[32px]">
            {/* History header and controls - increased bottom margin to create more space to table */}
            <div className="flex items-center justify-between mb-[18px]">
              <h3 className="text-black font-['Inter',Helvetica] text-xl font-medium">
                History
              </h3>

              <div className="flex items-center gap-2 ml-[420px]">
                {/* DA button */}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-[30px] h-[29px] bg-[#ECF1F6] border-none rounded-lg flex items-center justify-center p-0"
                >
                  <span className="text-[#6B6B6B] font-['Inter',Helvetica] text-xs font-medium">DA</span>
                </Button>

                {/* Sort button */}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-[120px] h-[29px] bg-[#ECF1F6] border-none rounded-lg flex items-center justify-center p-0 ml-2"
                >
                  <span className="text-[#6B6B6B] font-['Inter',Helvetica] text-xs font-medium">Date/Type</span>
                </Button>

                {/* Search bar */}
                <div className="w-[172px] h-[29px] bg-[#ECF1F6] rounded-lg flex items-center px-2 ml-2">
                  <SearchIcon className="w-4 h-4 text-[#6B6B6B]" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="ml-2 bg-transparent outline-none border-none text-[#6B6B6B] font-['Inter',Helvetica] text-xs placeholder:text-[#6B6B6B] w-full"
                  />
                </div>
              </div>
            </div>

            {/* History table - centered */}
            <div className="flex justify-center">
              <div className="w-[920px]">
                {/* Table header row - no top border, not clickable, no paperclip icon, only 9px margin bottom */}
                <div className="flex items-center h-[41px] mb-[0px]">
                  {/* Empty space where paperclip would be for content rows */}
                  <div className="w-[35px]"></div>
                  {/* Problem header - shifted right by 8px */}
                  <div className="w-[427px] pl-[19px]">
                    <span className="text-black font-['Inter',Helvetica] text-[15px] font-medium leading-normal">
                      Problem
                    </span>
                  </div>
                  {/* Date header - centered */}
                  <div className="w-[256px] flex justify-center">
                    <span className="text-black font-['Inter',Helvetica] text-[15px] font-medium leading-normal">
                      Date
                    </span>
                  </div>
                  {/* Type header - centered */}
                  <div className="flex-1 flex justify-center">
                    <span className="text-black font-['Inter',Helvetica] text-[15px] font-medium leading-normal">
                      Type
                    </span>
                  </div>
                </div>

                {/* Divider line - directly after header with no extra spacing */}
                <div className="w-[920px] h-[1px] bg-[#D9D9D9] mb-0"></div>

                {/* Table rows */}
                {isLoadingHistory ? (
                  // Loading state
                  <div className="divide-y divide-[#D9D9D9]">
                    {Array.from({ length: 7 }, (_, index) => (
                      <div key={index} className="flex items-center h-[41px] animate-pulse">
                        <div className="w-[35px] flex justify-center">
                          <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                        </div>
                        <div className="w-[427px] pl-[11px]">
                          <div className="h-4 bg-gray-200 rounded w-[70%]"></div>
                        </div>
                        <div className="w-[256px] flex justify-center">
                          <div className="h-4 bg-gray-200 rounded w-[120px]"></div>
                        </div>
                        <div className="flex-1 flex justify-center">
                          <div className="h-6 w-[80px] bg-gray-200 rounded-lg"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredItems.length > 0 ? (
                  // History items
                  <div className="divide-y divide-[#D9D9D9]">
                    {getCurrentPageItems().map((item) => (
                      <div
                        key={item.conversation_id}
                        className="flex items-center h-[41px] hover:bg-[#f5f5f5] cursor-pointer transition-colors"
                        onClick={() => handleHistoryItemClick(item)}
                      >
                        <div className="w-[35px] flex justify-center">
                          <PaperclipIcon className="w-4 h-4 text-gray-600" />
                        </div>
                        <div className="w-[427px] pl-[11px]">
                          <span className="text-black font-['Inter',Helvetica] text-[15px] font-normal leading-normal">
                            {item.title}
                          </span>
                        </div>
                        <div className="w-[256px] flex justify-center">
                          <span className="text-black font-['Inter',Helvetica] text-[15px] font-normal leading-normal">
                            {new Date(item.created_at).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex-1 flex justify-center">
                          <span
                            className={`inline-block px-3 py-1 rounded-lg font-['Inter',Helvetica] text-[14px] font-medium leading-normal ${
                              item.type === 'step-by-step'
                                ? 'bg-[#D5EBF3] text-[#1e40af]'
                                : 'bg-[#D5DAF3] text-[#6b21a8]'
                            }`}
                          >
                            {item.type === 'step-by-step' ? 'Step-by-step' : 'Solution'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  // Empty state
                  <div className="py-12 flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1 font-['Inter',Helvetica]">No problem history yet</h3>
                    <p className="text-sm text-gray-500 font-['Inter',Helvetica] text-center max-w-md">
                      {searchQuery 
                        ? 'No results match your search. Try different keywords.' 
                        : 'Start solving problems to build your history. Your solved problems will appear here.'}
                    </p>
                  </div>
                )}

                {/* Pagination - matching Document Chat style with 38px top margin */}
                {!isLoadingHistory && totalPages > 1 && (
                  <div className="flex justify-center items-center gap-[9px] mt-[38px]">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-[19px] h-[20px] font-['Inter',Helvetica] text-[14px] font-medium text-black leading-normal ${
                          currentPage === pageNum ? 'bg-[#ECF1F6] rounded-[6px]' : ''
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      className="w-[45px] h-[23px] bg-[#ECF1F6] rounded-[6px] font-['Inter',Helvetica] text-[14px] font-medium text-black leading-normal ml-[9px]"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default ProblemSolver;
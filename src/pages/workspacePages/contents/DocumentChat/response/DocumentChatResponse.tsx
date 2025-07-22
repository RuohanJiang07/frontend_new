import React, { useEffect, useRef, useState } from 'react';
import { useTabContext } from '../../../workspaceFrame/TabContext';
import './DocumentChatResponse.css';
import { submitDocumentChatQuery } from '../../../../../api/workspaces/document_chat/DocumentChatMain';
import { useToast } from '../../../../../hooks/useToast';
import { MarkdownRenderer } from '../../../../../components/ui/markdown';

interface DocumentChatResponseProps {
  isSplit?: boolean;
  onBack?: () => void;
  tabIdx?: number;
  pageIdx?: number;
  screenId?: string;
}

interface FileItem {
  id: string;
  name: string;
  icon: string;
  checked: boolean;
}

// Conversation message interface
interface ConversationMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isStreaming?: boolean;
  streamingContent?: string;
}

const DocumentChatResponse: React.FC<DocumentChatResponseProps> = ({ isSplit = false, onBack, tabIdx = 0, pageIdx = 0, screenId = '' }) => {
  const { switchToDocumentChat, getActiveScreens, activePage } = useTabContext();
  const { error, success } = useToast();
  const conversationMainRef = useRef<HTMLDivElement>(null);
  const scrollbarThumbRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isReferenceListCollapsed, setIsReferenceListCollapsed] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [conversationId, setConversationId] = useState<string>('');
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);

  // Detect if we're in split screen mode
  const activeScreens = getActiveScreens(activePage);
  const isInSplitMode = activeScreens.length > 1 && !activeScreens.some(screen => screen.state === 'full-screen');

  // File selection state - will be loaded from localStorage
  const [files, setFiles] = useState<FileItem[]>([]);

  const [selectAll, setSelectAll] = useState(false);

  // Helper function to generate UUID
  const generateUUID = (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  // Helper function to generate conversation ID in chat-c-{uuid} format
  const generateConversationId = (): string => {
    const uuid = generateUUID();
    return `chat-c-${uuid}`;
  };

  // Load selected references and initialize conversation when component mounts
  useEffect(() => {
    const tabId = window.location.pathname + window.location.search;
    
    // Load selected files from localStorage
    const selectedFilesString = localStorage.getItem(`documentchat_selected_files_${tabId}`);
    const selectedDocumentsString = localStorage.getItem(`documentchat_selected_documents_${tabId}`);
    const historyItemString = localStorage.getItem(`documentchat_history_item_${tabId}`);
    
    if (selectedFilesString && selectedDocumentsString) {
      try {
        const selectedFileIds: string[] = JSON.parse(selectedFilesString);
        const selectedDocuments: any[] = JSON.parse(selectedDocumentsString);
        
        // Helper function to get correct icon path
        const getCorrectIconPath = (fileType: string) => {
          const normalizedType = fileType.toLowerCase();
          switch (normalizedType) {
            case 'pdf':
              return '/workspace/fileIcons/pdf.svg';
            case 'doc':
            case 'docx':
              return '/workspace/fileIcons/txt.svg'; // docx files use txt.svg
            case 'txt':
            case 'md':
              return '/workspace/fileIcons/txt.svg';
            case 'ppt':
            case 'pptx':
              return '/workspace/fileIcons/ppt.svg';
            case 'epub':
              return '/workspace/fileIcons/epub.svg';
            default:
              return '/workspace/file_icon.svg'; // Generic fallback
          }
        };
        
        // Convert to FileItem format
        const fileItems: FileItem[] = selectedDocuments.map(doc => ({
          id: doc.id,
          name: doc.name,
          icon: getCorrectIconPath(doc.file_type || doc.type || 'pdf'),
          checked: true // All selected files are checked by default
        }));
        
        setFiles(fileItems);
        setSelectAll(fileItems.length > 0);
        
        console.log('📁 Loaded selected files for document chat:', fileItems);
        
        // Generate or load conversation ID
        let currentConversationId = localStorage.getItem(`documentchat_conversation_${tabId}`);
        if (!currentConversationId) {
          currentConversationId = generateConversationId();
          localStorage.setItem(`documentchat_conversation_${tabId}`, currentConversationId);
        }
        setConversationId(currentConversationId);
        
        // If this is from a history item, add initial conversation
        if (historyItemString) {
          try {
            const historyItem = JSON.parse(historyItemString);
            const initialUserMessage: ConversationMessage = {
              id: 'history-user-1',
              type: 'user',
              content: `What are the main findings in ${historyItem.title}?`,
              timestamp: 'Me, ' + new Date().toLocaleString()
            };
            
            const initialAssistantMessage: ConversationMessage = {
              id: 'history-assistant-1',
              type: 'assistant',
              content: `Based on the document "${historyItem.title}", here are the main findings...`,
              timestamp: 'Assistant',
              isStreaming: false
            };
            
            setConversationHistory([initialUserMessage, initialAssistantMessage]);
          } catch (e) {
            console.error('Error parsing history item:', e);
          }
        }
        
      } catch (e) {
        console.error('Error loading selected files:', e);
        error('Failed to load selected references');
      }
    } else {
      console.warn('No selected files found in localStorage');
      error('No references selected. Please go back and select references first.');
    }
  }, [error]);

  const handleBackClick = () => {
    // Navigate back to document chat entry page
    switchToDocumentChat(pageIdx, screenId, tabIdx);
  };

  const handleToggleReferenceList = () => {
    setIsReferenceListCollapsed(!isReferenceListCollapsed);
  };

  // Handle Select All checkbox
  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    setFiles(files.map(file => ({ ...file, checked })));
  };

  // Handle individual file checkbox
  const handleFileCheck = (fileId: string, checked: boolean) => {
    const updatedFiles = files.map(file => 
      file.id === fileId ? { ...file, checked } : file
    );
    setFiles(updatedFiles);
    
    // Update Select All state
    const allChecked = updatedFiles.every(file => file.checked);
    setSelectAll(allChecked);
  };

  // Handle removing reference from input box
  const handleRemoveReference = (fileId: string) => {
    setFiles(files.map(file => 
      file.id === fileId ? { ...file, checked: false } : file
    ));
    
    // Update Select All state
    const allChecked = files.every(file => file.id === fileId ? false : file.checked);
    setSelectAll(allChecked);
  };

  // Get selected files for reference boxes
  const selectedFiles = files.filter(file => file.checked);

  // Update Select All state when files change
  useEffect(() => {
    const allChecked = files.every(file => file.checked);
    setSelectAll(allChecked);
  }, [files]);

  // Handle submitting a new question
  const handleSubmitQuestion = async () => {
    if (!inputValue.trim() || isSubmitting) {
      return;
    }

    if (selectedFiles.length === 0) {
      error('Please select at least one reference file');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Get selected file IDs
      const selectedFileIds = selectedFiles.map(file => file.id);
      
      // Determine if this is a new conversation or continuing
      const isNewConversation = conversationHistory.length === 0;
      const currentConversationId = conversationId || generateConversationId();
      
      if (!conversationId) {
        setConversationId(currentConversationId);
      }
      
      console.log('🔄 Starting document chat query:', {
        conversationId: currentConversationId,
        query: inputValue.trim(),
        selectedFileIds,
        isNewConversation
      });
      
      // Add user message to conversation history
      const newUserMessage: ConversationMessage = {
        id: `user-${Date.now()}`,
        type: 'user',
        content: inputValue.trim(),
        timestamp: 'Me, ' + new Date().toLocaleString()
      };

      // Add assistant message placeholder
      const newAssistantMessage: ConversationMessage = {
        id: `assistant-${Date.now()}`,
        type: 'assistant',
        content: '',
        timestamp: 'Assistant',
        isStreaming: true,
        streamingContent: ''
      };

      setConversationHistory(prev => [...prev, newUserMessage, newAssistantMessage]);
      
      // Clear input immediately after submission
      const queryToSubmit = inputValue.trim();
      setInputValue('');

      // Start document chat query
      await submitDocumentChatQuery(
        queryToSubmit,
        undefined, // profile
        null, // references (will be handled by selectedFileIds)
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
          console.error('Document chat streaming error:', errorMsg);
          error(`Streaming error: ${errorMsg}`);
          setIsSubmitting(false);
        },
        () => {
          console.log('Document chat streaming completed');
          setConversationHistory(prev => 
            prev.map(msg => 
              msg.id === newAssistantMessage.id
                ? { 
                    ...msg, 
                    isStreaming: false,
                    content: msg.streamingContent || msg.content // Preserve the streamed content
                  }
                : msg
            )
          );
          setIsSubmitting(false);
        },
        isNewConversation ? undefined : currentConversationId, // existing conversation ID
        isNewConversation ? currentConversationId : undefined, // generated conversation ID for new
        selectedFileIds // selected file IDs
      );
      
    } catch (err) {
      console.error('Error submitting document chat question:', err);
      error('Failed to submit question. Please try again.');
      setIsSubmitting(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitQuestion();
    }
  };

  // Render conversation message
  const renderMessage = (message: ConversationMessage) => {
    if (message.type === 'user') {
      return (
        <div className="document-chat-response-question">
          <span className="document-chat-response-question-date">
            {message.timestamp}
          </span>
          <div className="document-chat-response-question-box">
            <span className="document-chat-response-question-text">
              {message.content}
            </span>
          </div>
        </div>
      );
    }

    // Assistant message
    const contentToRender = message.isStreaming && message.streamingContent 
      ? message.streamingContent 
      : message.content;

    return (
      <div className="document-chat-response-answer">
        {contentToRender ? (
          <MarkdownRenderer 
            content={contentToRender}
            variant="response"
            className="document-chat-response-answer-text"
          />
        ) : !message.isStreaming ? (
          <div className="text-gray-500 italic">
            No response available
          </div>
        ) : null}
        
        {/* Streaming indicator */}
        {message.isStreaming && (
          <div className="flex items-center gap-2 mt-2">
            <div className="w-3 h-4 bg-[#4C6694] animate-pulse"></div>
          </div>
        )}
        
        {/* User Actions - only show for completed messages */}
        {!message.isStreaming && contentToRender && (
          <div className="document-chat-response-actions">
            <button className="document-chat-response-action-button">
              <img
                src="/workspace/copy.svg"
                alt="Copy"
                className="document-chat-response-action-icon"
              />
            </button>
            <button className="document-chat-response-action-button">
              <img
                src="/workspace/documentChat/thumbsup.svg"
                alt="Thumbs up"
                className="document-chat-response-action-icon"
              />
            </button>
            <button className="document-chat-response-action-button">
              <img
                src="/workspace/documentChat/thumbsdown.svg"
                alt="Thumbs down"
                className="document-chat-response-action-icon"
              />
            </button>
          </div>
        )}
      </div>
    );
  };

  // Handle scroll events and update custom scrollbar
  useEffect(() => {
    const conversationMain = conversationMainRef.current;
    const scrollbarThumb = scrollbarThumbRef.current;
    const scrollbarContainer = document.querySelector('.document-chat-response-custom-scrollbar') as HTMLElement;
    const scrollbarTrack = document.querySelector('.document-chat-response-custom-scrollbar-track') as HTMLElement;
    
    if (!conversationMain || !scrollbarThumb || !scrollbarContainer || !scrollbarTrack) return;

    let scrollTimeout: number;

    const updateScrollbar = () => {
      const { scrollTop, scrollHeight, clientHeight } = conversationMain;
      
      // Only show scrollbar if content is scrollable
      if (scrollHeight <= clientHeight) {
        scrollbarContainer.style.display = 'none';
        return;
      }
      
      scrollbarContainer.style.display = 'block';
      
      const scrollPercentage = scrollTop / (scrollHeight - clientHeight);
      
      // Calculate scrollbar height to extend to bottom of screen
      const viewportHeight = window.innerHeight;
      const scrollbarHeight = viewportHeight - 100; // 100px is the top offset from CSS
      
      // Update scrollbar thumb position and height
      const thumbHeight = Math.max(30, (clientHeight / scrollHeight) * scrollbarHeight); // Minimum 30px height
      const maxThumbTop = scrollbarHeight - thumbHeight;
      
      scrollbarThumb.style.top = `${scrollPercentage * maxThumbTop}px`;
      scrollbarThumb.style.height = `${thumbHeight}px`;
      
      // Set scrollbar container height to extend to bottom of screen
      scrollbarContainer.style.height = `${scrollbarHeight}px`;
    };

    const handleScroll = () => {
      updateScrollbar();
      
      // Show scrollbar when scrolling
      scrollbarContainer.classList.add('scrolling');
      
      // Hide scrollbar after scrolling stops
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        scrollbarContainer.classList.remove('scrolling');
      }, 1000); // Hide after 1 second of no scrolling
    };

    // Handle clicks on scrollbar track
    const handleTrackClick = (e: MouseEvent) => {
      const { scrollHeight, clientHeight } = conversationMain;
      const scrollbarHeight = window.innerHeight - 100;
      
      // Calculate click position relative to scrollbar
      const rect = scrollbarTrack.getBoundingClientRect();
      const clickY = e.clientY - rect.top;
      const clickPercentage = clickY / scrollbarHeight;
      
      // Scroll to the clicked position
      const targetScrollTop = clickPercentage * (scrollHeight - clientHeight);
      conversationMain.scrollTop = targetScrollTop;
    };

    // Handle global wheel events for the entire tab area
    const handleGlobalWheel = (e: WheelEvent) => {
      // Check if the target is within the tab area but not in conversation-main
      const target = e.target as HTMLElement;
      const isInConversationMain = conversationMain.contains(target);
      
      // If not in conversation-main but in the tab area, control conversation-main scrolling
      if (!isInConversationMain) {
        e.preventDefault();
        
        const { scrollTop, scrollHeight, clientHeight } = conversationMain;
        const scrollDelta = e.deltaY;
        const newScrollTop = scrollTop + scrollDelta;
        
        // Ensure scroll stays within bounds
        const maxScrollTop = scrollHeight - clientHeight;
        conversationMain.scrollTop = Math.max(0, Math.min(newScrollTop, maxScrollTop));
      }
    };

    conversationMain.addEventListener('scroll', handleScroll);
    scrollbarTrack.addEventListener('click', handleTrackClick);
    window.addEventListener('wheel', handleGlobalWheel, { passive: false });
    window.addEventListener('resize', updateScrollbar);
    
    // Initial update
    updateScrollbar();

    return () => {
      conversationMain.removeEventListener('scroll', handleScroll);
      scrollbarTrack.removeEventListener('click', handleTrackClick);
      window.removeEventListener('wheel', handleGlobalWheel);
      window.removeEventListener('resize', updateScrollbar);
      clearTimeout(scrollTimeout);
    };
  }, []);

  return (
    <div className="document-chat-response">
      {/* Header Section */}
      <header className="document-chat-response-header">
        {/* Left-aligned elements */}
        <div className="document-chat-response-header-left">
          {/* Back Arrow */}
          <button
            onClick={handleBackClick}
            className="document-chat-response-back-button"
            aria-label="Go back to document chat entry"
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
          <h1 className="document-chat-response-title">
            Document Chat: {selectedFiles.length > 0 ? selectedFiles[0].name : 'Selected Documents'}
          </h1>

          {/* Conversation Tag */}
          <div className="document-chat-response-tag">
            <span className="document-chat-response-tag-text">
              Conversation
            </span>
          </div>
        </div>

        {/* Right-aligned elements - Only show in full screen mode */}
        {!isInSplitMode && (
          <div className="document-chat-response-header-right">
            {/* Share Icon */}
            <button
              className="document-chat-response-action-button"
              aria-label="Share conversation"
            >
              <img
                src="/workspace/share.svg"
                alt="Share"
                className="document-chat-response-action-icon"
              />
            </button>

            {/* Print Icon */}
            <button
              className="document-chat-response-action-button"
              aria-label="Print conversation"
            >
              <img
                src="/workspace/print.svg"
                alt="Print"
                className="document-chat-response-action-icon"
              />
            </button>

            {/* Publish to Community Button */}
            <button
              className="document-chat-response-publish-button"
              aria-label="Publish to community"
            >
              <img
                src="/workspace/publish.svg"
                alt="Publish"
                className="document-chat-response-publish-icon"
              />
              <span className="document-chat-response-publish-text">
                Publish to Community
              </span>
            </button>
          </div>
        )}
      </header>

      {/* Main Content Section */}
      <div className="document-chat-response-main">
        <div className="document-chat-response-content">
          {/* File List Section */}
          <div className={`document-chat-response-file-list ${isReferenceListCollapsed ? 'collapsed' : ''}`}>
            {/* Sidebar Toggle Icon */}
            <div 
              className="document-chat-response-sidebar-toggle"
              onClick={handleToggleReferenceList}
              aria-label={isReferenceListCollapsed ? "Expand reference list" : "Collapse reference list"}
              title={isReferenceListCollapsed ? "Show References" : "Hide References"}
            >
              <img
                src={isReferenceListCollapsed 
                  ? "/workspace/documentChat/sidebar-unfold.svg" 
                  : "/workspace/documentChat/sidebar-fold.svg"
                }
                alt={isReferenceListCollapsed ? "Unfold sidebar" : "Fold sidebar"}
              />
            </div>

            <div className="document-chat-response-file-list-content">
              {/* List Header */}
              <div className="document-chat-response-file-list-header">
                <span className="document-chat-response-file-list-title">
                  File Uploaded
                </span>
                <div className="document-chat-response-file-list-select-all">
                  <span className="document-chat-response-file-list-select-all-text">
                    Select All
                  </span>
                  <input
                    type="checkbox"
                    className="document-chat-response-checkbox"
                    checked={selectAll}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                </div>
              </div>

              {/* List Content */}
              <div className="document-chat-response-file-list-items">
                {files.map(file => (
                  <div key={file.id} className="document-chat-response-file-item">
                    <img
                      src={file.icon}
                      alt={file.name}
                      className="document-chat-response-file-icon"
                    />
                    <span className="document-chat-response-file-name">
                      {file.name}
                    </span>
                    <input
                      type="checkbox"
                      className="document-chat-response-checkbox"
                      checked={file.checked}
                      onChange={(e) => handleFileCheck(file.id, e.target.checked)}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Add New References Button */}
            <button className="document-chat-response-add-button">
              <img
                src="/workspace/documentChat/add.svg"
                alt="Add"
                className="document-chat-response-add-icon"
              />
              <span className="document-chat-response-add-text">
                Add New References
              </span>
            </button>
          </div>

          {/* Conversation Section */}
          <div className="document-chat-response-conversation">
            {/* Conversation Main Section */}
            <div className="document-chat-response-conversation-main" ref={conversationMainRef}>
              <div className="document-chat-response-conversation-groups">
                {/* Render conversation history */}
                {conversationHistory.map((message) => (
                  <div key={message.id} className="document-chat-response-conversation-group">
                    {renderMessage(message)}
                  </div>
                ))}
                
                {/* Show empty state if no conversation yet */}
                {conversationHistory.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                    <div className="text-lg font-medium mb-2">Start a conversation</div>
                    <div className="text-sm text-center max-w-md">
                      Ask questions about your selected documents using the input box below.
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Input Box Section */}
            <div className="document-chat-response-input-section">
              {/* Selected References Part */}
              <div className="document-chat-response-references">
                {selectedFiles.map(file => (
                  <div key={file.id} className="document-chat-response-reference-box">
                    <span className="document-chat-response-reference-text">
                      {file.name}
                    </span>
                    <button 
                      className="document-chat-response-remove-button"
                      onClick={() => handleRemoveReference(file.id)}
                    >
                      <img
                        src="/workspace/documentChat/remove.svg"
                        alt="Remove"
                        className="document-chat-response-remove-icon"
                      />
                    </button>
                  </div>
                ))}
              </div>

              {/* Input Area */}
              <div className={`document-chat-response-input-box ${isSubmitting ? 'loading' : ''}`}>
                <textarea
                  className="document-chat-response-input"
                  placeholder="Ask questions about your selected documents..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isSubmitting || selectedFiles.length === 0}
                />
                
                {/* Show submit button when there's text */}
                {inputValue.trim() && selectedFiles.length > 0 && (
                  <button
                    onClick={handleSubmitQuestion}
                    disabled={isSubmitting}
                    className="absolute bottom-4 right-4 bg-[#80A5E4] hover:bg-[#6b94d6] text-white rounded-lg px-4 py-2 text-sm font-['Inter',Helvetica] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Sending...' : 'Send'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom scrollbar positioned at tab level */}
      <div className="document-chat-response-custom-scrollbar">
        <div className="document-chat-response-custom-scrollbar-track">
          <div 
            className="document-chat-response-custom-scrollbar-thumb"
            ref={scrollbarThumbRef}
          />
        </div>
      </div>
    </div>
  );
};

export default DocumentChatResponse;
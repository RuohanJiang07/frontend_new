import React, { useState, useEffect } from 'react';
import { Button } from '../../../../../components/ui/button';
import {
  ArrowLeftIcon,
  ShareIcon,
  ThumbsUpIcon,
  ThumbsDownIcon,
  CopyIcon,
  FolderIcon,
  UploadIcon,
  PlusIcon
} from 'lucide-react';
import { submitDocumentChatQuery } from '../../../../../api/workspaces/document_chat/DocumentChatMain';
import { useToast } from '../../../../../hooks/useToast';
import { DocumentChatHistoryItem } from '../../../../../api/workspaces/document_chat/getHistory';
import { getDriveFiles, DriveFileItem } from '../../../../../api/workspaces/drive/getFiles';

interface DocumentChatResponseProps {
  onBack: () => void;
  isSplit?: boolean;
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

// Reference file interface
interface ReferenceFile {
  id: string;
  name: string;
  type: 'pdf' | 'doc' | 'txt' | 'docx' | 'ppt' | 'pptx' | 'xls' | 'xlsx';
}

function DocumentChatResponse({ onBack, isSplit = false }: DocumentChatResponseProps) {
  const { error } = useToast();
  const [userQuery, setUserQuery] = useState('');
  const [conversationId, setConversationId] = useState('');
  const [streamingContent, setStreamingContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(true);
  const [followUpQuestion, setFollowUpQuestion] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New state for conversation history
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);

  // State for reference files loaded from session storage
  const [referenceFiles, setReferenceFiles] = useState<ReferenceFile[]>([]);

  // State for drive files to map reference IDs to actual file names
  const [driveFiles, setDriveFiles] = useState<DriveFileItem[]>([]);
  const [isLoadingDriveFiles, setIsLoadingDriveFiles] = useState(false);

  // New state for loaded history data
  const [loadedHistoryData, setLoadedHistoryData] = useState<DocumentChatHistoryItem[] | null>(null);
  const [isHistoryConversation, setIsHistoryConversation] = useState(false);

  // Load drive files to map reference IDs to file names
  useEffect(() => {
    loadDriveFiles();
  }, []);

  const loadDriveFiles = async () => {
    try {
      setIsLoadingDriveFiles(true);
      const response = await getDriveFiles();
      
      if (response.success) {
        setDriveFiles(response.drive_files.items);
        console.log('📁 Loaded drive files for reference mapping:', response.drive_files.items.length, 'items');
      }
    } catch (err) {
      console.error('Error loading drive files:', err);
    } finally {
      setIsLoadingDriveFiles(false);
    }
  };

  // Helper function to get file name from reference ID
  const getFileNameFromId = (fileId: string): string => {
    const file = driveFiles.find(f => f.id === fileId);
    return file ? file.name : `File ${fileId.substring(0, 8)}`;
  };

  // Helper function to get file type from reference ID
  const getFileTypeFromId = (fileId: string): 'pdf' | 'doc' | 'txt' | 'other' => {
    const file = driveFiles.find(f => f.id === fileId);
    if (!file) return 'other';
    
    const fileType = file.file_type?.toLowerCase() || '';
    if (fileType === 'pdf') return 'pdf';
    if (fileType === 'doc' || fileType === 'docx') return 'doc';
    if (fileType === 'txt' || fileType === 'md') return 'txt';
    return 'other';
  };

  // Load selected files from session storage on component mount
  useEffect(() => {
    const selectedFilesData = sessionStorage.getItem('documentchat_selected_files');
    if (selectedFilesData) {
      try {
        const selectedFiles = JSON.parse(selectedFilesData);
        const convertedFiles: ReferenceFile[] = selectedFiles.map((file: any) => ({
          id: file.id,
          name: file.name,
          type: file.type
        }));
        setReferenceFiles(convertedFiles);
        console.log('📁 Loaded selected files for document chat:', convertedFiles);
      } catch (error) {
        console.error('Error parsing selected files:', error);
        // Fallback to default file if parsing fails
        setReferenceFiles([{
          id: 'file-1bcf6d47fc704e63bf6b754b88668b08',
          name: 'Introduction to Quantum Mechanics',
          type: 'pdf'
        }]);
      }
    } else {
      // Fallback to default file if no selection found
      setReferenceFiles([{
        id: 'file-1bcf6d47fc704e63bf6b754b88668b08',
        name: 'Introduction to Quantum Mechanics',
        type: 'pdf'
      }]);
    }
  }, []);

  const getFileIcon = (type: string) => {
    // Map file types to icon names (handle specific mappings)
    const getIconName = (type: string) => {
      switch (type) {
        case 'pptx':
          return 'ppt';
        case 'docx':
        case 'txt':
        case 'doc':
          return 'txt'; // All text-based documents use txt.svg
        default:
          return type;
      }
    };
    
    const iconName = getIconName(type);
    const iconPath = `/workspace/fileIcons/${iconName}.svg`;
    
    return (
      <img 
        src={iconPath} 
        alt={`${type} icon`} 
        className="w-4 h-4"
        onError={(e) => {
          // Fallback to generic file icon if specific type not found
          const target = e.target as HTMLImageElement;
          target.src = '/workspace/file_icon.svg';
        }}
      />
    );
  };

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

  // Helper function to save conversation ID and query for this tab
  const saveTabData = (conversationId: string, query: string) => {
    // Get current tab ID from the URL or generate one if needed
    const tabId = window.location.pathname + window.location.search;
    localStorage.setItem(`documentchat_conversation_${tabId}`, conversationId);
    localStorage.setItem(`documentchat_query_${tabId}`, query);
    
    console.log(`💾 Saved document chat conversation data for tab ${tabId}:`, {
      conversationId,
      query
    });
  };

  // Helper function to clear related content for new conversations
  const clearRelatedContent = () => {
    const tabId = window.location.pathname + window.location.search;
    // Clear all related content data for this tab
    localStorage.removeItem(`documentchat_streaming_content_${tabId}`);
    localStorage.removeItem(`documentchat_streaming_complete_${tabId}`);
    
    console.log('🧹 Cleared related content for new document chat conversation');
  };

  // Helper function to clear all conversation data for fresh start
  const clearAllConversationData = () => {
    const tabId = window.location.pathname + window.location.search;
    localStorage.removeItem(`documentchat_conversation_${tabId}`);
    localStorage.removeItem(`documentchat_query_${tabId}`);
    localStorage.removeItem(`documentchat_streaming_content_${tabId}`);
    localStorage.removeItem(`documentchat_streaming_complete_${tabId}`);
    
    console.log('🧹 Cleared ALL conversation data for fresh start');
  };

  // Load saved data for this tab and initialize conversation history
  useEffect(() => {
    const tabId = window.location.pathname + window.location.search;
    const historyDataString = localStorage.getItem(`documentchat_history_data_${tabId}`);
    const isHistoryLoaded = localStorage.getItem(`documentchat_history_loaded_${tabId}`) === 'true';

    // Check if this is a loaded history conversation
    if (isHistoryLoaded && historyDataString) {
      console.log('📂 Loading document chat history conversation data for tab:', tabId);
      
      try {
        const historyData: DocumentChatHistoryItem[] = JSON.parse(historyDataString);
        setLoadedHistoryData(historyData);
        setIsHistoryConversation(true);
        
        const savedConversationId = localStorage.getItem(`documentchat_conversation_${tabId}`);
        if (savedConversationId) {
          setConversationId(savedConversationId);
          
          // Extract reference files from history data
          if (historyData.length > 0 && historyData[0].references_selected) {
            const referenceIds = historyData[0].references_selected;
            
            // Create reference files from the IDs
            const historyReferenceFiles: ReferenceFile[] = referenceIds.map((refId, index) => ({
              id: refId,
              name: getFileNameFromId(refId),
              type: getFileTypeFromId(refId)
            }));
            
            setReferenceFiles(historyReferenceFiles);
            console.log('📄 Loaded reference files from history:', historyReferenceFiles);
          }
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
          });
          
          // Add assistant message
          messages.push({
            id: `history-assistant-${index}`,
            type: 'assistant',
            content: item.user_query,
            timestamp: 'Assistant',
            isStreaming: false,
            streamingContent: item.llm_response,
          });
        });
        
        setConversationHistory(messages);
        console.log('✅ Loaded document chat history conversation with', messages.length, 'messages');
        
        // Exit early for history conversations - don't load any streaming data
        return;
      } catch (error) {
        console.error('❌ Error parsing document chat history data:', error);
        // If parsing fails, clear the history flags and fall through to normal loading
        localStorage.removeItem(`documentchat_history_data_${tabId}`);
        localStorage.removeItem(`documentchat_history_loaded_${tabId}`);
      }
    }
    
    // Check if we're coming from "Create New Chat" by looking for a special flag
    const isNewChatSession = sessionStorage.getItem('documentchat_new_session') === 'true';
    if (isNewChatSession) {
      console.log('🆕 Detected new chat session, clearing all existing data');
      // Clear all localStorage keys related to document chat for this tab
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(`documentchat_`) && key.includes(tabId)) {
          localStorage.removeItem(key);
        }
      });
      
      // Explicitly remove history loaded flag
      localStorage.removeItem(`documentchat_history_loaded_${tabId}`);
      localStorage.removeItem(`documentchat_history_data_${tabId}`);
      
      sessionStorage.removeItem('documentchat_new_session');
      
      // Start fresh with new conversation ID
      const newConversationId = generateConversationId();
      setConversationId(newConversationId);
      setConversationHistory([]);
      setIsStreaming(false);
      setIsHistoryConversation(false);
      setLoadedHistoryData(null);
      console.log('🆔 Generated new conversation ID for fresh start:', newConversationId);
      return;
    }

    // For non-history, non-new chat sessions, we might be in the middle of a streaming response
    // Check if we have streaming data
    const savedConversationId = localStorage.getItem(`documentchat_conversation_${tabId}`);
    
    // Only proceed with loading existing conversation if we have a saved ID
    if (savedConversationId) {
      const savedQuery = localStorage.getItem(`documentchat_query_${tabId}`);
      const savedStreamingContent = localStorage.getItem(`documentchat_streaming_content_${tabId}`) || '';
      const isStreamingComplete = localStorage.getItem(`documentchat_streaming_complete_${tabId}`) === 'true';

      console.log('📂 Resuming existing document chat conversation:', {
        tabId,
        conversationId: savedConversationId,
        query: savedQuery,
        streamingContentLength: savedStreamingContent.length,
        isStreamingComplete
      });
      
      setUserQuery(savedQuery);
      setConversationId(savedConversationId);

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
        content: savedQuery,
        timestamp: 'Assistant',
        isStreaming: !isStreamingComplete,
        streamingContent: savedStreamingContent
      };

      setConversationHistory([initialUserMessage, initialAssistantMessage]);
      
      if (savedStreamingContent) {
        setStreamingContent(savedStreamingContent);
      }
      setIsStreaming(!isStreamingComplete);

      // Listen for streaming updates
      const handleStreamingUpdate = (event: CustomEvent) => {
        if (event.detail.tabId === tabId) {
          setStreamingContent(event.detail.content);
          
          // Update conversation history
          setConversationHistory(prev => 
            prev.map(msg => 
              msg.id === 'initial-assistant'
                ? { ...msg, streamingContent: event.detail.content }
                : msg
            )
          );
        }
      };

      const handleStreamingComplete = (event: CustomEvent) => {
        if (event.detail.tabId === tabId) {
          setIsStreaming(false);
          setConversationHistory(prev => 
            prev.map(msg => 
              msg.id === 'initial-assistant'
                ? { ...msg, isStreaming: false }
                : msg
            )
          );
        }
      };

      window.addEventListener('documentchat-streaming-update', handleStreamingUpdate as EventListener);
      window.addEventListener('documentchat-streaming-complete', handleStreamingComplete as EventListener);

      return () => {
        window.removeEventListener('documentchat-streaming-update', handleStreamingUpdate as EventListener);
        window.removeEventListener('documentchat-streaming-complete', handleStreamingComplete as EventListener);
      };
    } 
    else {
      // If no saved query, this means we're starting a new conversation
      // Generate a conversation ID and wait for the first question
      const newConversationId = generateConversationId();
      setConversationId(newConversationId);
      setConversationHistory([]);
      setIsStreaming(false);
      setIsHistoryConversation(false);
      setLoadedHistoryData(null);
      console.log('🆔 Generated new conversation ID for fresh start:', newConversationId);
    }
  }, []);

  // Handle submitting the first question (when there's no conversation history)
  const handleSubmitFirstQuestion = async (question: string) => {
    if (!question.trim()) {
      error('Please enter a question');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Clear related content when starting a new conversation
      // Clear all localStorage keys related to document chat for this tab
      const tabId = window.location.pathname + window.location.search;
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(`documentchat_`) && key.includes(tabId)) {
          localStorage.removeItem(key);
        }
      });

      // Use existing conversation ID or generate new one
      const currentConversationId = conversationId || generateConversationId();
      
      // Get selected file IDs from reference files
      const selectedFileIds = referenceFiles.map(file => file.id);
      
      console.log('🆔 Starting first question with conversation ID:', currentConversationId);
      console.log('📝 Submitting document chat with params:', {
        query: question.trim(),
        profile: 'profile-default',
        references: selectedFileIds,
        conversationId: currentConversationId,
        newConversation: true // First question is always new conversation
      });

      // Save conversation data immediately
      saveTabData(currentConversationId, question.trim());
      setConversationId(currentConversationId);

      // Initialize conversation history with the first message
      const initialUserMessage: ConversationMessage = {
        id: 'initial-user',
        type: 'user',
        content: question.trim(),
        timestamp: 'Me, ' + new Date().toLocaleString()
      };

      const initialAssistantMessage: ConversationMessage = {
        id: 'initial-assistant',
        type: 'assistant',
        content: question.trim(),
        timestamp: 'Assistant',
        isStreaming: true,
        streamingContent: ''
      };

      setConversationHistory([initialUserMessage, initialAssistantMessage]);
      setUserQuery(question.trim());

      // For document chat, use the document chat endpoint
      localStorage.setItem(`documentchat_query_${tabId}`, question.trim());
      localStorage.setItem(`documentchat_streaming_content_${tabId}`, ''); // Clear previous content
      
      // Start streaming
      await submitDocumentChatQuery(
        question.trim(),
        'profile-default',
        selectedFileIds, // Pass selected file IDs
        (data: string) => {
          // Update streaming content in localStorage
          const currentContent = localStorage.getItem(`documentchat_streaming_content_${tabId}`) || '';
          localStorage.setItem(`documentchat_streaming_content_${tabId}`, currentContent + data);
          
          // Update conversation history
          setConversationHistory(prev => 
            prev.map(msg => 
              msg.id === 'initial-assistant'
                ? { ...msg, streamingContent: currentContent + data }
                : msg
            )
          );
          
          // Trigger a custom event to notify the response component
          window.dispatchEvent(new CustomEvent('documentchat-streaming-update', {
            detail: { tabId, content: currentContent + data }
          }));
        },
        (errorMsg: string) => {
          console.error('Document chat streaming error:', errorMsg);
          error(`Streaming error: ${errorMsg}`);
        },
        () => {
          console.log('Document chat streaming completed');
          // Mark streaming as complete
          localStorage.setItem(`documentchat_streaming_complete_${tabId}`, 'true');
          setConversationHistory(prev => 
            prev.map(msg => 
              msg.id === 'initial-assistant'
                ? { ...msg, isStreaming: false }
                : msg
            )
          );
          window.dispatchEvent(new CustomEvent('documentchat-streaming-complete', {
            detail: { tabId }
          }));
        },
        undefined, // No existing conversation ID for new conversation
        currentConversationId, // Pass the generated conversation ID
        selectedFileIds // Pass selected file IDs
      );

    } catch (err) {
      console.error('Error submitting document chat:', err);
      error('Failed to start document chat. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle submitting follow-up question
  const handleSubmitFollowUp = async () => {
    if (!followUpQuestion.trim() || isSubmitting) {
      return;
    }

    if (!conversationId) {
      error('No conversation ID found. Please start a new conversation.');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Get selected file IDs from reference files
      const selectedFileIds = referenceFiles.map(file => file.id);
      
      console.log('🔄 Submitting follow-up question in existing conversation:', {
        conversationId,
        query: followUpQuestion.trim(),
        selectedFileIds,
        isNewConversation: false // Follow-up questions are NOT new conversations
      });
      
      // Add user message to conversation history
      const newUserMessage: ConversationMessage = {
        id: `user-${Date.now()}`,
        type: 'user',
        content: followUpQuestion.trim(),
        timestamp: new Date().toLocaleString()
      };

      // Add assistant message placeholder
      const newAssistantMessage: ConversationMessage = {
        id: `assistant-${Date.now()}`,
        type: 'assistant',
        content: followUpQuestion.trim(),
        timestamp: 'Assistant',
        isStreaming: true,
        streamingContent: ''
      };

      setConversationHistory(prev => [...prev, newUserMessage, newAssistantMessage]);
      
      // Clear input immediately after submission
      const queryToSubmit = followUpQuestion.trim();
      setFollowUpQuestion('');

      // Start document chat with existing conversation ID (new_conversation = false)
      await submitDocumentChatQuery(
        queryToSubmit,
        'profile-default',
        selectedFileIds, // Pass selected file IDs
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
          console.error('Document chat follow-up streaming error:', errorMsg);
          error(`Streaming error: ${errorMsg}`);
          setIsSubmitting(false);
        },
        () => {
          console.log('Document chat follow-up streaming completed');
          setConversationHistory(prev => 
            prev.map(msg => 
              msg.id === newAssistantMessage.id
                ? { ...msg, isStreaming: false }
                : msg
            )
          );
          setIsSubmitting(false);
        },
        conversationId, // Pass existing conversation ID
        conversationId, // Also pass as the generated conversation ID parameter
        selectedFileIds // Pass selected file IDs
      );
      
    } catch (err) {
      console.error('Error submitting follow-up question:', err);
      error('Failed to submit follow-up question. Please try again.');
      setIsSubmitting(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (conversationHistory.length === 0) {
        // First question
        handleSubmitFirstQuestion(followUpQuestion);
        setFollowUpQuestion('');
      } else {
        // Follow-up question
        handleSubmitFollowUp();
      }
    }
  };

  // Update reference files when rendering a history message
  useEffect(() => {
    if (isHistoryConversation && loadedHistoryData && loadedHistoryData.length > 0) {
      const referenceIds = loadedHistoryData[0].references_selected;
      if (referenceIds && referenceIds.length > 0) {
        const historyReferenceFiles: ReferenceFile[] = referenceIds.map(refId => ({
          id: refId,
          name: getFileNameFromId(refId),
          type: getFileTypeFromId(refId)
        }));
        setReferenceFiles(historyReferenceFiles);
      }
    }
  }, [isHistoryConversation, loadedHistoryData, driveFiles]);

  // Render the main response content for a message
  const renderMessageContent = (message: ConversationMessage) => {
    if (message.type === 'user') {
      return (
        <div className="flex flex-col items-end mb-6">
          <span className="text-xs text-gray-500 font-['Inter',Helvetica] mb-2">
            {message.timestamp}
          </span>
          <div className="bg-gray-100 rounded-lg p-3 max-w-xs">
            <p className="text-sm text-black font-['Inter',Helvetica]">
              {message.content}
            </p>
          </div>
        </div>
      );
    }

    // Assistant message
    const contentToRender = message.streamingContent || '';
    
    if (message.isStreaming && !contentToRender) {
      return (
        <div className="text-gray-500 italic mb-6">
          Loading response...
        </div>
      );
    }

    return (
      <div className="mb-6">
        <div className="p-4">
          <div className="prose max-w-none font-['Inter',Helvetica]">
            <div className="text-sm text-black font-['Inter',Helvetica] mb-4 whitespace-pre-wrap leading-relaxed">
              {contentToRender}
            </div>
            
            {/* Streaming indicator */}
            {message.isStreaming && (
              <span className="inline-block w-2 h-4 bg-gray-400 ml-1 animate-pulse"></span>
            )}
          </div>

          {/* Action Buttons - Only show for completed messages */}
          {!message.isStreaming && (
            <div className="flex items-center justify-between mt-4">
              {/* Save to Notes Button - Left side */}
              <Button
                className="bg-[#E8F4FD] hover:bg-[#d1e9f8] text-gray-700 rounded-full px-6 py-2 flex items-center gap-2 font-['Inter',Helvetica] text-sm border-none"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
                Save to Notes
              </Button>

              {/* Action Icons - Right side */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-8 h-8 text-gray-600 hover:text-gray-800"
                >
                  <ThumbsUpIcon className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-8 h-8 text-gray-600 hover:text-gray-800"
                >
                  <ThumbsDownIcon className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-8 h-8 text-gray-600 hover:text-gray-800"
                >
                  <CopyIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      {/* Fixed Header - No border */}
      <div className="flex items-center justify-between p-4 bg-white z-10">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="p-2"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </Button>
          <h1 className="font-medium text-base text-black font-['Inter',Helvetica]">
            Learning Journey: {isHistoryConversation && loadedHistoryData ? loadedHistoryData[0]?.user_query : (userQuery ? (userQuery.substring(0, 50) + (userQuery.length > 50 ? '...' : '')) : 'Document Chat')}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Button className="bg-[#6B94E4] hover:bg-[#5a82d1] text-white rounded-lg px-4 py-2 flex items-center gap-2 font-['Inter',Helvetica] text-sm">
            Publish to Community
            <ShareIcon className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="p-2"
          >
            <ShareIcon className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="p-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </Button>
        </div>
      </div>

      {/* Main Content Area - FIXED WIDTH to prevent quirky behavior */}
      <div className={`flex-1 flex overflow-hidden ${isSplit ? 'px-8' : 'px-32'}`}>
        {/* Left Sidebar - No border, moved even further in from edge */}
        <div className={`${isSplit ? 'w-[200px]' : 'w-[280px]'} p-4 bg-white flex-shrink-0 ${isSplit ? 'ml-0' : 'ml-16'}`}>
          {/* Upload Buttons */}
          <div className="space-y-2 mb-6">
            <Button
              variant="outline"
              className="w-full h-10 bg-[#ECF1F6] border-[#ADADAD] text-[#ADADAD] rounded-lg flex items-center justify-center gap-2 font-['Inter',Helvetica] text-sm hover:bg-[#e2e8f0]"
            >
              <FolderIcon className="w-4 h-4" />
              {isSplit ? "Select" : "Select From Drive"}
            </Button>
            <Button
              variant="outline"
              className="w-full h-10 bg-[#ECF1F6] border-[#ADADAD] text-[#ADADAD] rounded-lg flex items-center justify-center gap-2 font-['Inter',Helvetica] text-sm hover:bg-[#e2e8f0]"
            >
              <UploadIcon className="w-4 h-4" />
              {isSplit ? "Upload" : "Upload from Device"}
            </Button>
            <Button
              variant="outline"
              className="w-full h-10 bg-[#ECF1F6] border-[#ADADAD] text-[#ADADAD] rounded-lg flex items-center justify-center gap-2 font-['Inter',Helvetica] text-sm hover:bg-[#e2e8f0]"
            >
              <PlusIcon className="w-4 h-4" />
              {isSplit ? "Explore" : "Explore New Source"}
            </Button>
          </div>

          {/* Files Uploaded Section - Now showing actual reference files */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className={`font-medium text-black font-['Inter',Helvetica] ${isSplit ? 'text-xs' : 'text-sm'}`}>
                Files Uploaded
              </h3>
              <div className="flex items-center gap-2">
                <span className={`text-gray-600 font-['Inter',Helvetica] ${isSplit ? 'text-[10px]' : 'text-xs'}`}>Select All</span>
                <input type="checkbox" className="w-4 h-4" defaultChecked />
              </div>
            </div>

            <div className="space-y-2">
              {referenceFiles.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-2">
                  <div className="flex items-center gap-3">
                    {getFileIcon(file.type)}
                    <span className={`text-black font-['Inter',Helvetica] ${isSplit ? 'text-xs' : 'text-sm'}`}>
                      {isSplit ? file.name.substring(0, 15) + '...' : file.name}
                    </span>
                  </div>
                  <input type="checkbox" className="w-4 h-4" defaultChecked />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Chat Area - FIXED WIDTH to prevent quirky behavior */}
        <div className={`flex flex-col h-[calc(100vh-200px)] ${isSplit ? 'w-full ml-4' : 'w-[calc(100%-280px-64px)] mr-16'}`}>
          {/* Scrollable Chat Content */}
          <div className="flex-1 overflow-y-auto">
            {/* Show welcome message if no conversation history */}
            {conversationHistory.length === 0 && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <h2 className="text-xl font-medium text-gray-700 mb-2 font-['Inter',Helvetica]">
                    Welcome to Document Chat
                  </h2>
                  <p className="text-gray-500 font-['Inter',Helvetica]">
                    Ask questions about your uploaded documents
                  </p>
                </div>
              </div>
            )}

            {/* Render conversation history */}
            {conversationHistory.map((message) => (
              <div key={message.id}>
                {renderMessageContent(message)}
              </div>
            ))}
          </div>

          {/* Fixed Bottom Input Area - Enhanced hover effects matching Deep Learn */}
          <div className="p-4 bg-white">
            {/* Source Tags - At the top of input area - Show selected reference files */}
            <div className="flex gap-2 mb-3">
              {referenceFiles.map((file) => (
                <span key={file.id} className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-['Inter',Helvetica]">
                  {file.name}
                </span>
              ))}
              {referenceFiles.length === 0 && (
                <span className="inline-block bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-['Inter',Helvetica]">
                  No files selected
                </span>
              )}
            </div>

            {/* Input Box with enhanced hover effects exactly like Deep Learn */}
            <div className="relative">
              <div className={`relative bg-white border rounded-2xl h-24 p-3 transition-all duration-300 ${
                isInputFocused 
                  ? 'border-[#80A5E4] shadow-[0px_2px_20px_0px_rgba(128,165,228,0.15)]' 
                  : 'border-gray-300'
              }`}>
                <textarea
                  className={`w-full h-full resize-none border-none outline-none bg-transparent font-['Inter',Helvetica] text-sm placeholder:text-gray-400 transition-all duration-300 ${
                    isInputFocused ? 'caret-[#80A5E4]' : ''
                  }`}
                  placeholder="Type your question here..."
                  value={followUpQuestion}
                  onChange={(e) => setFollowUpQuestion(e.target.value)}
                  onFocus={() => setIsInputFocused(true)}
                  onBlur={() => setIsInputFocused(false)}
                  onKeyPress={handleKeyPress}
                  disabled={isSubmitting}
                />

                {/* Submit button - only show when there's text */}
                {followUpQuestion.trim() && (
                  <div className="absolute bottom-3 right-3">
                    <Button
                      onClick={() => {
                        if (conversationHistory.length === 0) {
                          // First question
                          handleSubmitFirstQuestion(followUpQuestion);
                          setFollowUpQuestion('');
                        } else {
                          // Follow-up question
                          handleSubmitFollowUp();
                        }
                      }}
                      disabled={isSubmitting}
                      className="bg-[#80A5E4] hover:bg-[#6b94d6] text-white rounded-lg px-3 py-1 text-xs font-['Inter',Helvetica]"
                    >
                      {isSubmitting ? 'Asking...' : 'Ask'}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DocumentChatResponse;
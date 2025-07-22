import React from 'react';
import { useState } from 'react';
import { useTabContext } from '../../../workspaceFrame/TabContext';
import './DocumentChat.css';
import { getDriveFiles, TransformedDriveItem } from '../../../../../api/workspaces/drive/getFiles';
import { useEffect } from 'react';
import { useToast } from '../../../../../hooks/useToast';
import { UploadModal } from '../../../../../components/workspacePage/uploadModal';
import { getDocumentChatHistory, DocumentChatConversation } from '../../../../../api/workspaces/document_chat/getHistory';

// Interface for document tags
interface DocumentTag {
  id: string;
  name: string;
  type: 'pdf' | 'doc' | 'txt' | 'other';
  file_type?: string; // Add original file_type from backend
}

interface DocumentChatProps {
  isSplit?: boolean;
  onBack?: () => void;
  onViewChange?: (view: string | null) => void;
  tabIdx?: number;
  pageIdx?: number;
  screenId?: string;
}

function DocumentChat({ isSplit = false, onBack, onViewChange, tabIdx = 0, pageIdx = 0, screenId = '' }: DocumentChatProps) {
  const { switchToDocumentChatResponse } = useTabContext();
  const { error } = useToast();
  const [isUploadHovered, setIsUploadHovered] = useState(false);
  const [selectedReferences, setSelectedReferences] = useState<string[]>([]);
  const [profileSelected, setProfileSelected] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDocuments, setSelectedDocuments] = useState<DocumentTag[]>([]);
  const [availableFiles, setAvailableFiles] = useState<TransformedDriveItem[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [historyItems, setHistoryItems] = useState<DocumentChatConversation[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [driveFiles, setDriveFiles] = useState<TransformedDriveItem[]>([]);

  // Load available files from drive when component mounts
  useEffect(() => {
    loadAvailableFiles();
    loadHistoryData();
    loadDriveFiles();
  }, []);

  // Load drive files for file name resolution
  const loadDriveFiles = async () => {
    try {
      const response = await getDriveFiles();
      if (response.success && response.data) {
        setDriveFiles(response.data);
        console.log('📁 Loaded drive files for name resolution:', response.data.length);
      }
    } catch (err) {
      console.error('Error loading drive files for name resolution:', err);
    }
  };

  // Load history data when component mounts
  const loadHistoryData = async () => {
    try {
      setLoadingHistory(true);
      const response = await getDocumentChatHistory();
      
      if (response.success) {
        setHistoryItems(response.document_chat_conversations.items);
        console.log('📂 Loaded document chat history:', response.document_chat_conversations.items.length, 'conversations');
      } else {
        console.warn('Failed to load document chat history');
      }
    } catch (err) {
      console.error('Error loading document chat history:', err);
      // Don't show error to user, just use empty state
    } finally {
      setLoadingHistory(false);
    }
  };

  const loadAvailableFiles = async () => {
    try {
      setLoadingFiles(true);
      const response = await getDriveFiles();
      
      if (response.success && response.data) {
        // Filter only files (not folders) and only processed files
        const processedFiles = response.data.filter(item => 
          item.type === 'file' && 
          item.isProcessed === true
        );
        setAvailableFiles(processedFiles);
        console.log('📁 Loaded available files for document chat:', processedFiles.length);
      } else {
        console.warn('Failed to load drive files');
      }
    } catch (err) {
      console.error('Error loading drive files:', err);
      // Don't show error to user, just use empty state
    } finally {
      setLoadingFiles(false);
    }
  };

  const handleUploadClick = () => {
    // Open the upload modal for file selection
    setIsUploadModalOpen(true);
  };

  const handleModalClose = () => {
    setIsUploadModalOpen(false);
  };

  const handleModalUpload = (files: any[]) => {
    // Process the selected files from the modal
    files.forEach(file => {
      if (file.source === 'drive') {
        // Handle drive files
      const docToAdd: DocumentTag = {
          id: file.id,
          name: file.name,
          type: mapFileTypeToDocumentType(file.fileType || 'pdf'),
          file_type: file.fileType || 'pdf'
      };
      
      if (!selectedDocuments.find(doc => doc.id === docToAdd.id)) {
        setSelectedDocuments(prev => [...prev, docToAdd]);
      }
      } else if (file.source === 'upload' && file.uploadStatus === 'completed') {
        // Handle uploaded files
        const docToAdd: DocumentTag = {
          id: file.fileId || file.id,
          name: file.name,
          type: mapFileTypeToDocumentType(file.fileType || 'pdf'),
          file_type: file.fileType || 'pdf'
      };
      
        if (!selectedDocuments.find(doc => doc.id === docToAdd.id)) {
          setSelectedDocuments(prev => [...prev, docToAdd]);
      }
    }
    });
    
    setIsUploadModalOpen(false);
  };

  const toggleProfile = () => {
    setProfileSelected(!profileSelected);
  };

  const handleStartConversation = () => {
    // Check if any documents are selected
    if (selectedDocuments.length === 0) {
      error('Please select at least one document for chat');
      return;
    }
    
    // Generate a unique tab ID for this specific tab instance
    const tabId = `${pageIdx}-${screenId}-${tabIdx}`;
    
    // Clear ALL existing conversation data for this tab to ensure fresh start
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(`documentchat_`) && key.includes(tabId)) {
        localStorage.removeItem(key);
      }
    });
    
    // Explicitly remove history loaded flags
    localStorage.removeItem(`documentchat_history_loaded_${tabId}`);
    localStorage.removeItem(`documentchat_history_data_${tabId}`);
    
    // Save selected references to localStorage for the response page
    const selectedFileIds = selectedDocuments.map(doc => doc.id);
    
    // Store the selected references and documents for the NEW conversation
    localStorage.setItem(`documentchat_selected_files_${tabId}`, JSON.stringify(selectedFileIds));
    localStorage.setItem(`documentchat_selected_documents_${tabId}`, JSON.stringify(selectedDocuments));
    
    // Mark this as a NEW conversation (not history)
    localStorage.setItem(`documentchat_new_conversation_${tabId}`, 'true');
    
    console.log('🆕 Starting NEW document chat conversation:', {
      tabId,
      selectedFileIds,
      selectedDocuments
    });
    
    switchToDocumentChatResponse(pageIdx, screenId, tabIdx);
  };

  const handleHistoryCardClick = (item: DocumentChatConversation) => {
    // Generate a unique tab ID for this specific tab instance
    const tabId = `${pageIdx}-${screenId}-${tabIdx}`;
    
    // Clear ALL existing conversation data for this tab first
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(`documentchat_`) && key.includes(tabId)) {
        localStorage.removeItem(key);
      }
    });
    
    // Store the conversation ID for loading the full conversation
    localStorage.setItem(`documentchat_conversation_${tabId}`, item.conversation_id);
    
    // Mark this as a history conversation that needs to be loaded
    localStorage.setItem(`documentchat_history_loaded_${tabId}`, 'true');
    
    // Ensure new conversation flag is NOT set for history
    localStorage.removeItem(`documentchat_new_conversation_${tabId}`);
    
    console.log('📂 Loading HISTORY conversation:', {
      tabId,
      conversationId: item.conversation_id,
      title: item.title
    });
    
    // Navigate to the response page
    
    switchToDocumentChatResponse(pageIdx, screenId, tabIdx);
  };

  const removeDocument = (id: string) => {
    setSelectedDocuments(prev => prev.filter(doc => doc.id !== id));
  };

  const getDocumentIcon = (type: string) => {
    // Map file types to icon names (handle specific mappings)
    const getIconName = (type: string) => {
      switch (type) {
        case 'pptx':
          return 'ppt';
        case 'docx':
        case 'txt':
          return 'txt'; // Both docx and txt use txt.svg
        case 'doc':
          return 'txt'; // doc files also use txt.svg
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
        className="w-[18px] h-[17.721px] flex-shrink-0"
        onError={(e) => {
          // Fallback to generic file icon if specific type not found
          const target = e.target as HTMLImageElement;
          target.src = '/workspace/file_icon.svg';
        }}
      />
    );
  };

  // Helper function to map file types to DocumentTag types
  const mapFileTypeToDocumentType = (fileType: string): 'pdf' | 'doc' | 'txt' | 'other' => {
    switch (fileType.toLowerCase()) {
      case 'pdf':
        return 'pdf';
      case 'doc':
      case 'docx':
        return 'doc';
      case 'txt':
      case 'md':
        return 'txt';
      default:
        return 'other';
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

  // Helper function to get real file name from file ID
  const getRealFileName = (fileId: string): string => {
    const driveFile = driveFiles.find(file => file.id === fileId);
    if (driveFile) {
      return driveFile.name;
    }
    // Fallback: show truncated file ID
    return `Document (${fileId.substring(0, 8)}...)`;
  };

  // Helper function to get real file type from file ID
  const getRealFileType = (fileId: string): string => {
    const driveFile = driveFiles.find(file => file.id === fileId);
    if (driveFile && driveFile.fileType) {
      return driveFile.fileType;
    }
    // Fallback to pdf
    return 'pdf';
  };

  // Filter history based on search query
  const filteredHistory = historyItems
    .filter(item =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()); // Sort by latest first

  return (
    <div className="document-chat-container">
      {/* Header Section */}
      <div className="document-chat-header">
        <img
          src="/workspace/documentChat/documentChat.svg"
          alt="Document Chat Icon"
          className="document-chat-header-icon"
        />
        <div className="document-chat-header-text">
          <h1 className="document-chat-title font-outfit">Document Chat</h1>
          <p className="document-chat-subtitle font-outfit">We explain long-heavy documents for you</p>
        </div>
      </div>

      {/* Reference Selection Section */}
      <div className="document-chat-reference-section">
        <div className="document-chat-boxes-container">
          {/* Upload Box */}
          <div 
            className={`document-chat-upload-box ${isUploadHovered ? 'hovered' : ''}`}
            onClick={handleUploadClick}
            onMouseEnter={() => setIsUploadHovered(true)}
            onMouseLeave={() => setIsUploadHovered(false)}
          >
            <img
              src="/workspace/problemHelp/upload.svg"
              alt="Upload Icon"
              className="document-chat-upload-icon"
            />
            <div className="document-chat-upload-text-container">
              <img
                src="/workspace/documentChat/folder.svg"
                alt="Folder Icon"
                className="document-chat-folder-icon"
              />
              <span className="document-chat-upload-text">
                Drag or select references
              </span>
            </div>
          </div>

          {/* Selected References Box */}
          <div className="document-chat-references-box">
            {/* Display the selected documents as reference boxes */}
            <div className="document-chat-references-container">
              {selectedDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="document-chat-reference-box"
                >
                  {getDocumentIcon(doc.type)}
                  <span className="document-chat-reference-name">
                    {doc.name}
                  </span>
                  <img
                    src="/workspace/documentChat/remove.svg"
                    alt="Remove"
                    className="document-chat-remove-icon"
                    onClick={() => removeDocument(doc.id)}
                  />
                </div>
              ))}
              
              {/* Show placeholder when no documents selected */}
              {selectedDocuments.length === 0 && (
                <div className="document-chat-references-placeholder">
                  <span className="text-gray-500 font-['Inter'] text-sm">
                    Selected references will appear here
                  </span>
                </div>
              )}
            </div>
            
            {/* Profile Button */}
            <div className="document-chat-profile-button-container">
              <button 
                className={`document-chat-profile-button ${profileSelected ? 'selected' : ''}`}
                onClick={toggleProfile}
                title="Select Profile" 
              >
                <img 
                  src="/workspace/deepLearn/contacts-line.svg" 
                  alt="Profile" 
                  className="document-chat-profile-button-icon"
                  style={{ filter: profileSelected ? 'brightness(0) invert(1)' : 'brightness(0) saturate(100%) invert(39%) sepia(0%) saturate(0%) hue-rotate(147deg) brightness(94%) contrast(87%)' }}
                />
              </button>
            </div>
            
            {/* Start Button */}
            <div className="document-chat-start-button-container">
              <button 
                className="document-chat-start-button"
                onClick={handleStartConversation}
                title="Start Conversation"
                disabled={selectedDocuments.length === 0}
                style={{ 
                  opacity: selectedDocuments.length === 0 ? 0.5 : 1,
                  cursor: selectedDocuments.length === 0 ? 'not-allowed' : 'pointer'
                }}
              >
                <span className="document-chat-start-text">Start</span>
                <img 
                  src="/workspace/documentChat/enter.svg" 
                  alt="Enter" 
                  className="document-chat-start-icon"
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* History Section */}
      <div className="document-chat-history-section">
        <div className="document-chat-history-header">
          <div className="document-chat-history-title">
            <img 
              src="/workspace/deepLearn/history.svg" 
              alt="History Icon"
              className="deep-learn-tab-button-icon"
              style={{ width: '20px', height: '20px', filter: 'brightness(0) saturate(100%) invert(32%) sepia(9%) saturate(2096%) hue-rotate(182deg) brightness(93%) contrast(87%)' }}
            />
            My History
          </div>
          <div className="document-chat-search-container">
            <img
              src="/workspace/problemHelp/search.svg"
              alt="Search Icon"
              className="document-chat-search-icon"
            />
            <input
              type="text"
              className="document-chat-search-input"
              placeholder="Search in workspace..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* History Content Section */}
      <div className={`document-chat-cards-container ${isSplit ? 'split' : ''}`}>
        {loadingHistory ? (
          // Loading skeleton cards
          Array.from({ length: 9 }).map((_, index) => (
            <div key={`loading-${index}`} className="document-chat-card">
              <div className="w-full h-[58px] bg-gray-200 rounded animate-pulse mb-4"></div>
              <div className="document-chat-card-detail">
                <div className="w-16 h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="document-chat-file-info">
                  <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="w-16 h-3 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          ))
        ) : filteredHistory.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-500">
            <div className="text-lg font-medium mb-2">No document chat history found</div>
            <div className="text-sm text-center max-w-md">
              {searchQuery ? 'Try adjusting your search criteria' : 'Start chatting with documents to see your history here'}
            </div>
          </div>
        ) : (
          filteredHistory.map((item) => (
            <div 
              key={item.conversation_id} 
              className="document-chat-card cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleHistoryCardClick(item)}
            >
              <div className="document-chat-card-title">
                {item.title}
              </div>
              <div className="document-chat-card-detail">
                <div className="document-chat-file-number">
                  {item.references_selected.length} files
                </div>
                <div className="document-chat-file-info">
                  <div className="document-chat-file-name-box">
                    <img
                      src={`/workspace/fileIcons/${getRealFileType(item.references_selected[0]) === 'docx' ? 'txt' : getRealFileType(item.references_selected[0])}.svg`}
                      alt="File"
                      className="document-chat-file-icon"
                      onError={(e) => {
                        // Fallback to generic file icon if specific icon fails to load
                        const target = e.target as HTMLImageElement;
                        target.src = '/workspace/file_icon.svg';
                      }}
                    />
                    <span className="document-chat-file-name">
                      {getRealFileName(item.references_selected[0])}
                    </span>
                  </div>
                  {item.references_selected.length > 1 && (
                    <span className="document-chat-more-files">
                      and {item.references_selected.length - 1} more...
                    </span>
                  )}
                </div>
                <div className="document-chat-card-date">
                  <img
                    src="/workspace/problemHelp/calendar.svg"
                    alt="Calendar"
                    className="document-chat-card-date-icon"
                  />
                  <span className="document-chat-card-date-text">
                    {formatDate(item.created_at)}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={handleModalClose}
        onUpload={handleModalUpload}
      />
    </div>
  );
}

export default DocumentChat;
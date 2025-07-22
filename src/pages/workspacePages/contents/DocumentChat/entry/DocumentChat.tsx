import React from 'react';
import { useState } from 'react';
import { useTabContext } from '../../../workspaceFrame/TabContext';
import './DocumentChat.css';
import { getDriveFiles, DriveFileItem } from '../../../../../api/workspaces/drive/getFiles';
import { useEffect } from 'react';
import { useToast } from '../../../../../hooks/useToast';

// Interface for document tags
interface DocumentTag {
  id: string;
  name: string;
  type: 'pdf' | 'doc' | 'txt' | 'other';
  file_type?: string; // Add original file_type from backend
}

// Sample history data
const SAMPLE_DOCUMENT_HISTORY = [
  {
    id: '1',
    title: 'Illiad and Odyssey by Homer',
    fileNumber: 3,
    fileName: 'climate_research.pdf',
    date: 'Apr 15, 2025, 9:12 AM'
  },
  {
    id: '2',
    title: 'Symposium by Plato',
    fileNumber: 2,
    fileName: 'ml_nlp_guide.docx',
    date: 'Apr 14, 2025, 2:30 PM'
  },
  {
    id: '3',
    title: 'Google Scholar paper summary',
    fileNumber: 5,
    fileName: 'renewable_energy_report.pdf',
    date: 'Apr 13, 2025, 11:18 AM'
  },
  {
    id: '4',
    title: 'Comparative study of blockchain applications in supply chain management',
    fileNumber: 4,
    fileName: 'blockchain_supply_chain.pdf',
    date: 'Apr 12, 2025, 4:05 PM'
  },
  {
    id: '5',
    title: 'Healthcare data privacy regulations and compliance requirements',
    fileNumber: 3,
    fileName: 'healthcare_privacy.docx',
    date: 'Apr 11, 2025, 1:40 PM'
  },
  {
    id: '6',
    title: 'Urban planning strategies for sustainable city development',
    fileNumber: 6,
    fileName: 'urban_planning_guide.pdf',
    date: 'Apr 10, 2025, 3:20 PM'
  },
  {
    id: '7',
    title: 'Quantum computing applications in cryptography and security',
    fileNumber: 2,
    fileName: 'quantum_crypto_research.pdf',
    date: 'Apr 9, 2025, 10:15 AM'
  },
  {
    id: '8',
    title: 'Environmental impact assessment of industrial waste management',
    fileNumber: 4,
    fileName: 'waste_management_study.pdf',
    date: 'Apr 8, 2025, 2:45 PM'
  }
];

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
  const [availableFiles, setAvailableFiles] = useState<DriveFileItem[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);

  // Load available files from drive when component mounts
  useEffect(() => {
    loadAvailableFiles();
  }, []);

  const loadAvailableFiles = async () => {
    try {
      setLoadingFiles(true);
      const response = await getDriveFiles();
      
      if (response.success) {
        // Filter only files (not folders) and only processed files
        const processedFiles = response.drive_files.items.filter(item => 
          item.type === 'file' && 
          item.processed?.embeddings_generated?.done === true
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
    // Handle upload functionality here
    console.log('Upload clicked');
    
    // Find the hardcoded reference file from available files
    const hardcodedFileId = 'file-1bcf6d47fc704e63bf6b754b88668b08';
    const foundFile = availableFiles.find(file => file.id === hardcodedFileId);
    
    if (foundFile) {
      const docToAdd: DocumentTag = {
        id: foundFile.id,
        name: foundFile.name,
        type: mapFileTypeToDocumentType(foundFile.file_type || 'pdf'),
        file_type: foundFile.file_type || 'pdf' // Preserve original file_type
      };
      
      // Check if it's already selected
      if (!selectedDocuments.find(doc => doc.id === docToAdd.id)) {
        setSelectedDocuments(prev => [...prev, docToAdd]);
      }
    } else {
      // Fallback to hardcoded if not found in available files
      const hardcodedDoc: DocumentTag = {
        id: hardcodedFileId,
        name: 'Document File',
        type: 'pdf',
        file_type: 'pdf' // Add original file_type
      };
      
      if (!selectedDocuments.find(doc => doc.id === hardcodedDoc.id)) {
        setSelectedDocuments(prev => [...prev, hardcodedDoc]);
      }
    }
  };

  const toggleProfile = () => {
    setProfileSelected(!profileSelected);
  };

  const handleStartConversation = () => {
    // Save selected references to localStorage for the response page
    const tabId = window.location.pathname + window.location.search;
    const selectedFileIds = selectedDocuments.map(doc => doc.id);
    
    // Store the selected references and documents for the response page
    localStorage.setItem(`documentchat_selected_files_${tabId}`, JSON.stringify(selectedFileIds));
    localStorage.setItem(`documentchat_selected_documents_${tabId}`, JSON.stringify(selectedDocuments));
    
    console.log('💾 Saved selected references for document chat:', selectedFileIds);
    
    switchToDocumentChatResponse(pageIdx, screenId, tabIdx);
  };

  const handleHistoryCardClick = (item: any) => {
    // For history items, get the actual file info
    const tabId = window.location.pathname + window.location.search;
    const hardcodedFileIds = ["file-1bcf6d47fc704e63bf6b754b88668b08"];
    
    // Try to get actual file info
    const foundFile = availableFiles.find(file => file.id === hardcodedFileIds[0]);
    const hardcodedDocs: DocumentTag[] = foundFile ? [{
      id: foundFile.id,
      name: foundFile.name,
      type: mapFileTypeToDocumentType(foundFile.file_type || 'pdf'),
      file_type: foundFile.file_type || 'pdf' // Add the original file_type
    }] : [{
      id: hardcodedFileIds[0],
      name: 'Document File',
      type: 'pdf',
      file_type: 'pdf' // Add the original file_type
    }];
    
    localStorage.setItem(`documentchat_selected_files_${tabId}`, JSON.stringify(hardcodedFileIds));
    localStorage.setItem(`documentchat_selected_documents_${tabId}`, JSON.stringify(hardcodedDocs));
    localStorage.setItem(`documentchat_history_item_${tabId}`, JSON.stringify(item));
    
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
        {SAMPLE_DOCUMENT_HISTORY.map((item) => (
          <div 
            key={item.id} 
            className="document-chat-card cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleHistoryCardClick(item)}
          >
            <div className="document-chat-card-title">
              {item.title}
            </div>
            <div className="document-chat-card-detail">
              <div className="document-chat-file-number">
                {item.fileNumber} files
              </div>
              <div className="document-chat-file-info">
                <div className="document-chat-file-name-box">
                  <img
                    src="/workspace/fileIcons/pdf.svg"
                    alt="File"
                    className="document-chat-file-icon"
                  />
                  <span className="document-chat-file-name">
                    {item.fileName}
                  </span>
                </div>
                <span className="document-chat-more-files">
                  and {item.fileNumber - 1} more...
                </span>
              </div>
              <div className="document-chat-card-date">
                <img
                  src="/workspace/problemHelp/calendar.svg"
                  alt="Calendar"
                  className="document-chat-card-date-icon"
                />
                <span className="document-chat-card-date-text">
                  {item.date}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DocumentChat;
import React from 'react';
import { useState } from 'react';
import './DocumentChat.css';

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
}

function DocumentChat({ isSplit = false, onBack, onViewChange }: DocumentChatProps) {
  const [isUploadHovered, setIsUploadHovered] = useState(false);
  const [selectedReferences, setSelectedReferences] = useState<string[]>([]);
  const [profileSelected, setProfileSelected] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleUploadClick = () => {
    // Handle upload functionality here
    console.log('Upload clicked');
  };

  const toggleProfile = () => {
    setProfileSelected(!profileSelected);
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
            {/* This will be updated with the actual references UI later */}
            <div className="document-chat-references-placeholder">
              <span className="text-gray-500 font-['Inter'] text-sm">
                Selected references will appear here
              </span>
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
                onClick={() => {
                  // Handle start conversation logic here
                  console.log('Start conversation clicked');
                }}
                title="Start Conversation"
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
            onClick={() => {
              // Navigate to document chat response page
              onViewChange?.('document-chat-response');
            }}
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
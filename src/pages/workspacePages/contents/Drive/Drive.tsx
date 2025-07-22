import React, { useState } from 'react';
import { MoreVerticalIcon, SearchIcon } from 'lucide-react';
import './Drive.css';

interface DriveItem {
  id: string;
  name: string;
  type: 'folder' | 'file';
  fileType?: string;
  size?: string;
  fileCount?: number;
}

interface DriveProps {
  onBack?: () => void;
  onViewChange?: (view: string | null) => void;
  tabIdx?: number;
  pageIdx?: number;
  screenId?: string;
}

function Drive({ tabIdx = 0, pageIdx = 0, screenId = '' }: DriveProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Sample data matching the image
  const driveItems: DriveItem[] = [
    {
      id: '1',
      name: 'Lecture 1',
      type: 'folder',
      fileCount: 8
    },
    {
      id: '2',
      name: 'Lecture 2',
      type: 'folder',
      fileCount: 4
    },
    {
      id: '3',
      name: 'Calculus - SYLLABUS',
      type: 'file',
      fileType: 'docx',
      size: '9.4MB'
    },
    {
      id: '4',
      name: 'Problem Set 2',
      type: 'file',
      fileType: 'docx',
      size: '780KB'
    },
    {
      id: '5',
      name: 'Lecture 3',
      type: 'folder',
      fileCount: 4
    },
    {
      id: '6',
      name: 'Answer Key',
      type: 'file',
      fileType: 'docx',
      size: '9.4MB'
    },
    {
      id: '7',
      name: 'my diary',
      type: 'file',
      fileType: 'docx',
      size: '780KB'
    },
    {
      id: '8',
      name: 'Study Guide',
      type: 'file',
      fileType: 'docx',
      size: '1.5MB'
    }
  ];

  const handleItemClick = (item: DriveItem) => {
    if (item.type === 'file') {
      // Handle file click - could navigate to file viewer or editor
      console.log('Opening file:', item.name);
    } else {
      // Handle folder navigation
      console.log('Opening folder:', item.name);
    }
  };

  const handleUpload = () => {
    console.log('Upload clicked');
  };

  const handleImport = () => {
    console.log('Import clicked');
  };

  const handleCreateFolder = () => {
    console.log('Create folder clicked');
  };

  const filteredItems = driveItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="drive-container">
      <div className="drive-content">
        {/* Header Section */}
        <div className="drive-header">
          <div className="drive-header-left">
            <img
              src="/workspace/drive/folder.svg"
              alt="Workspace Drive"
              className="drive-header-icon"
            />
            <div className="drive-header-text">
              <h1 className="drive-title">Workspace Drive</h1>
            </div>
          </div>
          <div className="storage-section">
            <div className="storage-info">0.83 GB of 2.0 GB used</div>
            <div className="storage-bar">
              <div className="storage-progress"></div>
            </div>
          </div>
        </div>

        {/* File Management Section */}
        <div className="file-management-section">
          <button className="file-management-button" onClick={handleUpload}>
            <img src="/workspace/drive/upload.svg" alt="Upload" className="file-management-icon" />
            <span className="file-management-text">Upload</span>
          </button>
          <button className="file-management-button" onClick={handleImport}>
            <img src="/workspace/drive/import.svg" alt="Import" className="file-management-icon" />
            <span className="file-management-text">Import</span>
          </button>
          <button className="file-management-button" onClick={handleCreateFolder}>
            <img src="/workspace/drive/create-folder.svg" alt="Create Folder" className="file-management-icon" />
            <span className="file-management-text">Create Folder</span>
          </button>
        </div>

        {/* Drive Files Section Header */}
        <div className="drive-files-header">
          <div className="breadcrumb">
            <span className="breadcrumb-item">My Drive</span>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-item">PHYS 2801</span>
          </div>
          
          <div className="search-container">
            <SearchIcon className="search-icon" />
            <input
              type="text"
              placeholder="Search in this drive..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Drive Files Grid */}
        <div className="drive-files-grid">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="drive-file-card"
              onClick={() => handleItemClick(item)}
            >
              <img
                src={item.type === 'folder' 
                  ? '/workspace/drive/folder.svg' 
                  : '/workspace/drive/document.svg'
                }
                alt={item.type}
                className="drive-file-icon"
              />
              <button className="drive-file-menu-button" onClick={(e) => e.stopPropagation()}>
                <MoreVerticalIcon size={16} />
              </button>
              
              <div className="drive-file-info">
                <div className="drive-file-title">{item.name}</div>
                <div className="drive-file-right">
                  <div className={`drive-file-tag ${item.type === 'folder' ? 'folder' : ''}`}>
                    {item.type === 'folder' ? 'Folder' : item.fileType}
                  </div>
                  <div className="drive-file-size">
                    {item.type === 'folder' ? `${item.fileCount} Files` : item.size}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Drive;
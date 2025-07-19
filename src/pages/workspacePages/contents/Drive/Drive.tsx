import React, { useState } from 'react';
import { SearchIcon, MoreHorizontalIcon, UploadIcon, FolderPlusIcon, DownloadIcon } from 'lucide-react';
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
}

function Drive({ onBack }: DriveProps) {
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
        {/* Header with title and storage info */}
        <div className="workspace-drive-header">
          <h1 className="workspace-drive-title">Workspace Drive</h1>
          <div className="storage-section">
            <div className="storage-info">0.83 GB of 2.0 GB used</div>
            <div className="storage-bar">
              <div className="storage-progress"></div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button className="action-button upload" onClick={handleUpload}>
            <UploadIcon className="action-button-icon" />
            <span className="action-button-text">Upload</span>
          </button>
          <button className="action-button" onClick={handleImport}>
            <DownloadIcon className="action-button-icon" />
            <span className="action-button-text">Import</span>
          </button>
          <button className="action-button" onClick={handleCreateFolder}>
            <FolderPlusIcon className="action-button-icon" />
            <span className="action-button-text">Create Folder</span>
          </button>
        </div>

        {/* Breadcrumb and Search */}
        <div className="header-controls">
          <div className="breadcrumb-search-container">
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
        </div>

        {/* Files Grid */}
        <div className="files-grid">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="file-item"
              onClick={() => handleItemClick(item)}
            >
              <div className="file-item-header">
                <img
                  src={item.type === 'folder' 
                    ? '/workspace/drive/folder.svg' 
                    : '/workspace/drive/document.svg'
                  }
                  alt={item.type}
                  className="file-icon"
                />
                <button className="file-menu-button" onClick={(e) => e.stopPropagation()}>
                  <MoreHorizontalIcon size={16} />
                </button>
              </div>
              
              <div className="file-content">
                <div className="file-name">{item.name}</div>
                {item.type === 'folder' ? (
                  <>
                    <div className="file-type folder">Folder</div>
                    <div className="file-info">{item.fileCount} Files</div>
                  </>
                ) : (
                  <>
                    <div className="file-type">{item.fileType}</div>
                    <div className="file-info">{item.size}</div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Drive;
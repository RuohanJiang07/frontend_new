import React, { useState, useEffect } from 'react';
import { MoreVerticalIcon, SearchIcon } from 'lucide-react';
import './Drive.css';
import { getDriveFiles, TransformedDriveItem, getFilesByParentId, getFolderPath } from '../../../../api/workspaces/drive/getFiles';

interface DriveProps {
  onBack?: () => void;
  onViewChange?: (view: string | null) => void;
  tabIdx?: number;
  pageIdx?: number;
  screenId?: string;
}

function Drive({ }: DriveProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [driveItems, setDriveItems] = useState<TransformedDriveItem[]>([]);
  const [workspaceName, setWorkspaceName] = useState<string>('My Drive');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentFolderId, setCurrentFolderId] = useState<string>('root');
  const [breadcrumbPath, setBreadcrumbPath] = useState<string[]>([]);

  // Fetch drive files on component mount
  useEffect(() => {
    const fetchDriveFiles = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const result = await getDriveFiles();
        
        if (result.success && result.data) {
          setDriveItems(result.data);
          if (result.workspaceName) {
            setWorkspaceName(result.workspaceName);
          }
        } else {
          setError(result.error || 'Failed to fetch drive files');
        }
      } catch (err) {
        setError('An unexpected error occurred');
        console.error('Error fetching drive files:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDriveFiles();
  }, []);

  // Update breadcrumb path when current folder changes
  useEffect(() => {
    const path = getFolderPath(driveItems, currentFolderId);
    setBreadcrumbPath(path);
  }, [currentFolderId, driveItems]);

  const handleItemClick = (item: TransformedDriveItem) => {
    if (item.type === 'file') {
      // Handle file click - could navigate to file viewer or editor
      console.log('Opening file:', item.name);
    } else {
      // Handle folder navigation
      setCurrentFolderId(item.id);
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

  const handleBackClick = () => {
    if (currentFolderId !== 'root') {
      // Find the current folder to get its parent
      const currentFolder = driveItems.find(item => item.id === currentFolderId);
      if (currentFolder) {
        setCurrentFolderId(currentFolder.parentId);
      }
    }
  };

  const handleBreadcrumbClick = (index: number) => {
    // Navigate to the clicked breadcrumb level
    if (index === -1) {
      // Root level
      setCurrentFolderId('root');
    } else {
      // Find the folder at this breadcrumb level
      const pathItems = [workspaceName, ...breadcrumbPath];
      const targetFolderName = pathItems[index + 1]; // +1 because index 0 is workspace name
      const targetFolder = driveItems.find(item => 
        item.name === targetFolderName && item.type === 'folder'
      );
      if (targetFolder) {
        setCurrentFolderId(targetFolder.id);
      }
    }
  };

  // Get current folder items
  const currentFolderItems = getFilesByParentId(driveItems, currentFolderId);
  
  // Filter items based on search query
  const filteredItems = currentFolderItems.filter(item =>
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
            <span className="breadcrumb-item" style={{ color: '#6B6B6B' }}>
              My Drive
            </span>
            <span className="breadcrumb-separator">/</span>
            <span 
              className="breadcrumb-item" 
              onClick={() => handleBreadcrumbClick(-1)}
              style={{ cursor: 'pointer' }}
            >
              {workspaceName}
            </span>
            {breadcrumbPath.map((pathItem, index) => (
              <React.Fragment key={index}>
                <span className="breadcrumb-separator">/</span>
                <span 
                  className="breadcrumb-item"
                  onClick={() => handleBreadcrumbClick(index)}
                  style={{ cursor: 'pointer' }}
                >
                  {pathItem}
                </span>
              </React.Fragment>
            ))}
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
          {loading ? (
            // Loading skeleton cards
            Array.from({ length: 8 }).map((_, index) => (
              <div key={`loading-${index}`} className="drive-loading-skeleton">
                <div className="drive-loading-icon"></div>
                <div className="drive-loading-info">
                  <div className="drive-loading-title"></div>
                  <div className="drive-loading-right">
                    <div className="drive-loading-tag"></div>
                    <div className="drive-loading-size"></div>
                  </div>
                </div>
              </div>
            ))
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : filteredItems.length === 0 ? (
            <div className="empty-message">No files found in this folder.</div>
          ) : (
            filteredItems.map((item) => (
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
          ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Drive;
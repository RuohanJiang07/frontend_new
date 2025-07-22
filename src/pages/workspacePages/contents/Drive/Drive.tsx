import React, { useState, useEffect, useRef } from 'react';
import { MoreVerticalIcon, SearchIcon, Trash2Icon } from 'lucide-react';
import './Drive.css';
import { getDriveFiles, TransformedDriveItem, getFilesByParentId, getFolderPath } from '../../../../api/workspaces/drive/getFiles';
import { deleteFile } from '../../../../api/workspaces/drive/deleteFiles';
import { createFolder, deleteFolder } from '../../../../api/workspaces/drive/folder';
import { useToast } from '../../../../hooks/useToast';
import DriveUploadModal from '../../../../components/workspacePage/DriveUploadModal';
import CreateFolderModal from '../../../../components/workspacePage/CreateFolderModal';

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
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { success: showSuccess, error: showError } = useToast();

  // Fetch drive files function
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

  // Fetch drive files on component mount
  useEffect(() => {
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
    setIsUploadModalOpen(true);
  };

  const handleImport = () => {
    console.log('Import clicked');
  };

  const handleCreateFolder = () => {
    setIsCreateFolderModalOpen(true);
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

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleMenuToggle = (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === itemId ? null : itemId);
  };

  const handleDeleteFile = async (item: TransformedDriveItem) => {
    if (item.type === 'folder') {
      // Handle folder deletion
      try {
        // Immediately remove from UI
        setDriveItems(prev => prev.filter(file => file.id !== item.id));
        setOpenMenuId(null);
        
        // Call API in background
        const workspaceId = 'efb01627-41f0-4dc4-aeb9-2bff01537139'; // You might want to get this dynamically
        await deleteFolder(workspaceId, item.id);
        showSuccess(`Folder '${item.name}' deleted successfully`);
      } catch (error) {
        // If API call fails, add the folder back to the list
        setDriveItems(prev => [...prev, item]);
        showError(`Failed to delete folder '${item.name}'. Please try again.`);
        console.error('Error deleting folder:', error);
      }
      return;
    }
    
    // Handle file deletion
    try {
      // Immediately remove from UI
      setDriveItems(prev => prev.filter(file => file.id !== item.id));
      setOpenMenuId(null);
      
      // Call API in background
      const workspaceId = 'efb01627-41f0-4dc4-aeb9-2bff01537139'; // You might want to get this dynamically
      await deleteFile(workspaceId, item.id);
      showSuccess(`File '${item.name}' deleted successfully`);
    } catch (error) {
      // If API call fails, add the file back to the list
      setDriveItems(prev => [...prev, item]);
      showError(`Failed to delete '${item.name}'. Please try again.`);
      console.error('Error deleting file:', error);
    }
  };

  const handleUploadComplete = (files: any[]) => {
    // Refresh the drive files after upload
    fetchDriveFiles();
    showSuccess(`Successfully uploaded ${files.length} file(s)`);
  };

  const handleCreateFolderComplete = async (folderName: string) => {
    try {
      const workspaceId = 'efb01627-41f0-4dc4-aeb9-2bff01537139'; // You might want to get this dynamically
      const parentId = currentFolderId === 'root' ? 'root' : currentFolderId;
      
      const result = await createFolder(workspaceId, parentId, folderName);
      
      if (result.success) {
        // Refresh the drive files after creating folder
        fetchDriveFiles();
        showSuccess(`Folder '${folderName}' created successfully`);
      } else {
        showError('Failed to create folder');
      }
    } catch (error) {
      console.error('Error creating folder:', error);
      showError('Failed to create folder. Please try again.');
    }
  };

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

        {/* DriveUploadModal */}
        <DriveUploadModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          onUpload={handleUploadComplete}
          onModalClose={fetchDriveFiles}
        />

        {/* CreateFolderModal */}
        <CreateFolderModal
          isOpen={isCreateFolderModalOpen}
          onClose={() => setIsCreateFolderModalOpen(false)}
          onCreateFolder={handleCreateFolderComplete}
        />

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
              <button 
                className="drive-file-menu-button" 
                onClick={(e) => handleMenuToggle(item.id, e)}
              >
                <MoreVerticalIcon size={16} />
              </button>
              
              {openMenuId === item.id && (
                <div className="drive-file-menu-dropdown" ref={menuRef}>
                  <button
                    className="drive-file-menu-item delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteFile(item);
                    }}
                  >
                    <Trash2Icon size={14} />
                    <span>Delete</span>
                  </button>
                </div>
              )}
              
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
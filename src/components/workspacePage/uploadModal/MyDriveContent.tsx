import React, { useState, useEffect } from 'react';
import { Search, FolderIcon, FileTextIcon, CheckIcon, ChevronRightIcon } from 'lucide-react';
import { getDriveFiles, TransformedDriveItem } from '../../../api/workspaces/drive/getFiles';
import { useToast } from '../../../hooks/useToast';

interface FileItem {
  id: string;
  name: string;
  type: 'folder' | 'file';
  lastModified: string;
  processStatus?: 'processed' | 'processing' | null;
  source: 'drive';
  file_type?: string;
  parent_id: string;
  processed?: {
    text_extracted: {
      done: boolean;
      output_directory: string;
    };
    embeddings_generated: {
      done: boolean;
      output_directory: string;
    };
  };
}

interface BreadcrumbItem {
  id: string;
  name: string;
}

interface MyDriveContentProps {
  onFileSelection: (files: FileItem[]) => void;
  selectedFiles: FileItem[];
  uploadedFileIds?: string[]; // File IDs that were uploaded via upload modal
}

const MyDriveContent: React.FC<MyDriveContentProps> = ({ onFileSelection, selectedFiles, uploadedFileIds = [] }) => {
  const { error } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentFolderId, setCurrentFolderId] = useState('root');
  const [driveFiles, setDriveFiles] = useState<TransformedDriveItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [workspaceName, setWorkspaceName] = useState('');
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);

  // Load drive files on component mount
  useEffect(() => {
    loadDriveFiles();
  }, []);

  const loadDriveFiles = async () => {
    try {
      setLoading(true);
      const response = await getDriveFiles();
      
      if (response.success && response.data) {
        setDriveFiles(response.data);
        setWorkspaceName(response.workspaceName || '');
        // Initialize breadcrumbs with My Drive and workspace name
        setBreadcrumbs([
          { id: 'my-drive', name: 'My Drive' },
          { id: 'root', name: response.workspaceName || '' }
        ]);
        console.log('📁 Loaded drive files:', response.data.length, 'items');
      } else {
        error('Failed to load drive files');
      }
    } catch (err) {
      console.error('Error loading drive files:', err);
      error('Failed to load drive files. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Convert TransformedDriveItem to FileItem format
  const convertToFileItem = (driveFile: TransformedDriveItem): FileItem => {
    // Determine process status based on isProcessed field
    let processStatus: 'processed' | 'processing' | null = null;
    if (driveFile.isProcessed) {
      processStatus = 'processed';
    }

    // Format the uploaded date
    const formatDate = (dateString?: string) => {
      if (!dateString) return 'Unknown';
      
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          year: 'numeric'
        }) + ', ' + date.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        });
      } catch (e) {
        return 'Unknown';
      }
    };

    return {
      id: driveFile.id,
      name: driveFile.name,
      type: driveFile.type,
      lastModified: formatDate(driveFile.uploadedAt),
      processStatus,
      source: 'drive',
      file_type: driveFile.fileType,
      parent_id: driveFile.parentId,
      processed: driveFile.isProcessed ? {
        text_extracted: { done: true, output_directory: '' },
        embeddings_generated: { done: true, output_directory: '' }
      } : undefined
    };
  };

  // Filter files based on search query and current folder
  const filteredFiles = driveFiles
    .filter(file => file.parentId === currentFolderId)
    .filter(file => file.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .map(convertToFileItem);

  const isSelected = (fileId: string) => {
    return selectedFiles.some(f => f.id === fileId);
  };
  
  const isUploadedFile = (fileId: string) => {
    return uploadedFileIds.includes(fileId);
  };

  const toggleFileSelection = (file: FileItem) => {
    // Only allow selection of files, not folders
    if (file.type === 'folder') return;
    
    // Don't allow toggling uploaded files - they should remain selected
    if (isUploadedFile(file.id)) return;
    
    const currentSelected = selectedFiles.filter(f => f.source !== 'drive');
    const driveSelected = selectedFiles.filter(f => f.source === 'drive');
    
    if (isSelected(file.id)) {
      const newSelected = [...currentSelected, ...driveSelected.filter(f => f.id !== file.id)];
      onFileSelection(newSelected);
    } else {
      const newSelected = [...currentSelected, ...driveSelected, file];
      onFileSelection(newSelected);
    }
  };

  // Handle folder navigation
  const handleFolderDoubleClick = (folder: FileItem) => {
    if (folder.type !== 'folder') return;
    
    // Add current folder to breadcrumbs
    setBreadcrumbs(prev => [...prev, { id: folder.id, name: folder.name }]);
    setCurrentFolderId(folder.id);
  };

  // Navigate to a specific breadcrumb
  const navigateToBreadcrumb = (targetId: string) => {
    // Find the index of the target breadcrumb
    const targetIndex = breadcrumbs.findIndex(item => item.id === targetId);
    if (targetIndex === -1) return;

    // Update breadcrumbs to only include items up to and including the target
    setBreadcrumbs(prev => prev.slice(0, targetIndex + 1));
    
    // Set the current folder ID
    if (targetId === 'my-drive') {
      setCurrentFolderId('root');
    } else {
      setCurrentFolderId(targetId);
    }
  };

  // Get appropriate file icon based on file type
  const getFileIcon = (file: FileItem) => {
    if (file.type === 'folder') {
      return (
        <img 
          src="/workspace/drive/folder.svg" 
          alt="folder icon" 
          className="w-5 h-5"
          style={{ width: '20px', height: '20px' }}
        />
      );
    }

    // Use document.svg for all files
    return (
      <img 
        src="/workspace/drive/document.svg" 
        alt="document icon" 
        className="w-5 h-5"
        style={{ width: '20px', height: '20px' }}
      />
    );
  };

  return (
    <div className="flex flex-col h-full" style={{ padding: '18px 28px 0 28px' }}>
      {/* Search Box */}
      <div 
        className="flex items-center gap-1 flex-shrink-0"
        style={{
          width: '694px',
          height: '36px',
          maxWidth: '720px',
          border: '1px solid #B1B1B1',
          borderRadius: '8px',
          padding: '0 12px',
          backgroundColor: '#FFF'
        }}
      >
        <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
        <input
          type="text"
          placeholder="Search for file"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 border-none outline-none bg-transparent text-gray-900 font-['Inter',Helvetica]"
          style={{ fontSize: '16px' }}
        />
      </div>

      {/* Breadcrumb Navigation - 15px below search */}
      <div className="mt-3 flex items-center">
        {breadcrumbs.map((breadcrumb, index) => (
          <React.Fragment key={breadcrumb.id}>
            {breadcrumb.id === 'my-drive' ? (
              // My Drive is not clickable - just display as text
              <span 
                className="font-['Inter',Helvetica] text-gray-600"
                style={{ fontSize: '13px' }}
              >
                {breadcrumb.name}
              </span>
            ) : (
              <button
                onClick={() => navigateToBreadcrumb(breadcrumb.id)}
                className={`font-['Inter',Helvetica] transition-colors ${
                  index === breadcrumbs.length - 1 
                    ? 'text-gray-900 cursor-default' 
                    : 'text-gray-600 hover:text-[#4C6694]'
                }`}
                style={{ fontSize: '13px' }}
                disabled={index === breadcrumbs.length - 1}
              >
                {breadcrumb.name}
              </button>
            )}
            {index < breadcrumbs.length - 1 && (
              <span className="mx-2 text-gray-400" style={{ fontSize: '13px' }}>/</span>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Table - 15px below breadcrumb */}
      <div className="mt-0 flex-1 flex flex-col overflow-hidden">
        {/* Table Header */}
        <div 
          className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700 font-['Inter',Helvetica] flex-shrink-0"
          style={{
            height: '35px',
            borderBottom: '1px solid #D9D9D9',
            padding: '0',
            alignItems: 'center'
          }}
        >
          <div className="col-span-4">File name</div>
          <div className="col-span-4">Date</div>
          <div className="col-span-3">Process Status</div>
          <div className="col-span-1"></div>
        </div>

        {/* Table Body */}
        <div 
          className="flex-1 overflow-y-auto"
          style={{
            msOverflowStyle: 'none',
            scrollbarWidth: 'none'
          }}
        >
          {loading ? (
            // Loading state
            <div className="flex items-center justify-center h-32">
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
              </div>
              <span className="ml-3 text-gray-600 font-['Inter',Helvetica]">Loading files</span>
            </div>
          ) : filteredFiles.length === 0 ? (
            // Empty state
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <FolderIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 font-['Inter',Helvetica]">
                  {searchQuery ? 'No files found matching your search' : 'No files in this folder'}
                </p>
              </div>
            </div>
          ) : (
            // File list
            filteredFiles.map((file) => (
              <div
                key={file.id}
                onClick={() => toggleFileSelection(file)}
                onDoubleClick={() => handleFolderDoubleClick(file)}
                className={`grid grid-cols-12 gap-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                  isSelected(file.id) ? 'bg-blue-50' : ''
                } ${file.type === 'folder' ? 'hover:bg-blue-50' : ''}`}
                style={{
                  height: '38px',
                  borderBottom: '1px solid #D9D9D9',
                  padding: '0',
                  alignItems: 'center'
                }}
              >
                <div className="col-span-4 flex items-center">
                  <div style={{ marginLeft: '7px', marginRight: '12px', flexShrink: 0 }}>
                    {getFileIcon(file)}
                  </div>
                  <span className="text-sm text-gray-900 font-['Inter',Helvetica] truncate flex-1 min-w-0">
                    {file.name}
                  </span>
                </div>
                <div className="col-span-4 flex items-center">
                  <span className="text-sm text-gray-600 font-['Inter',Helvetica]">
                    {file.type === 'folder' ? '' : file.lastModified}
                  </span>
                </div>
                <div className="col-span-3 flex items-center">
                  {file.type === 'folder' ? (
                    <span className="text-sm text-gray-400 font-['Inter',Helvetica]"></span>
                  ) : file.processed && file.processed.text_extracted.done && file.processed.embeddings_generated.done ? (
                    <div className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100">
                      <span className="text-xs font-medium text-blue-600 font-['Inter',Helvetica]">Processed</span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400 font-['Inter',Helvetica]"></span>
                  )}
                </div>
                <div className="col-span-1 flex items-center justify-center">
                  {file.type === 'folder' ? (
                    <span className="text-sm text-gray-400 font-['Inter',Helvetica]"></span>
                  ) : isUploadedFile(file.id) ? (
                    <div className="w-4 h-4 bg-blue-600 rounded flex items-center justify-center">
                      <CheckIcon className="w-3 h-3 text-white" />
                    </div>
                  ) : isSelected(file.id) ? (
                    <div className="w-4 h-4 bg-blue-600 rounded flex items-center justify-center">
                      <CheckIcon className="w-3 h-3 text-white" />
                    </div>
                  ) : (
                    <div className="w-4 h-4 border-2 border-gray-300 rounded"></div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MyDriveContent;
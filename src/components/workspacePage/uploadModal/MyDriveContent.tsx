import React, { useState, useEffect } from 'react';
import { Search, FolderIcon, FileTextIcon, CheckIcon, ChevronRightIcon } from 'lucide-react';
import { getDriveFiles, DriveFileItem } from '../../../api/workspaces/drive/getFiles';
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
  const [driveFiles, setDriveFiles] = useState<DriveFileItem[]>([]);
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
      
      if (response.success) {
        setDriveFiles(response.drive_files.items);
        setWorkspaceName(response.workspace_name);
        // Initialize breadcrumbs with My Drive and workspace name
        setBreadcrumbs([
          { id: 'my-drive', name: 'My Drive' },
          { id: 'root', name: response.workspace_name }
        ]);
        console.log('📁 Loaded drive files:', response.drive_files.items.length, 'items');
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

  // Convert DriveFileItem to FileItem format
  const convertToFileItem = (driveFile: DriveFileItem): FileItem => {
    // Determine process status based on processed field
    let processStatus: 'processed' | 'processing' | null = null;
    if (driveFile.processed) {
      const textDone = driveFile.processed.text_extracted.done;
      const embeddingsDone = driveFile.processed.embeddings_generated.done;
      
      if (textDone && embeddingsDone) {
        processStatus = 'processed';
      } else if (textDone || embeddingsDone) {
        processStatus = 'processing';
      }
    }

    // Format the uploaded date
    const formatDate = (dateString?: string) => {
      if (!dateString) return 'Unknown';
      
      try {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
          return date.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
          });
        } else if (diffDays < 7) {
          return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        } else {
          return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          });
        }
      } catch (e) {
        return 'Unknown';
      }
    };

    return {
      id: driveFile.id,
      name: driveFile.name,
      type: driveFile.type,
      lastModified: formatDate(driveFile.uploaded_at),
      processStatus,
      source: 'drive',
      file_type: driveFile.file_type,
      parent_id: driveFile.parent_id,
      processed: driveFile.processed
    };
  };

  // Filter files based on search query and current folder
  const filteredFiles = driveFiles
    .filter(file => file.parent_id === currentFolderId)
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
      return <FolderIcon className="w-5 h-5 text-blue-600" />;
    }

    // File type specific icons using actual SVG files
    const fileType = file.file_type?.toLowerCase();
    
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
    
    const iconName = fileType ? getIconName(fileType) : null;
    const iconPath = `/workspace/fileIcons/${iconName}.svg`;
    
    // Check if we have a specific icon for this file type (after mapping)
    const supportedIconNames = ['pdf', 'txt', 'ppt', 'md', 'epub'];
    
    if (iconName && supportedIconNames.includes(iconName)) {
      return (
        <img 
          src={iconPath} 
          alt={`${iconName} icon`} 
          className="w-5 h-5"
          onError={(e) => {
            // Fallback to generic file icon if specific icon fails to load
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const fallbackDiv = document.createElement('div');
            fallbackDiv.className = 'w-5 h-5 bg-gray-100 rounded flex items-center justify-center';
            fallbackDiv.innerHTML = `<span class="text-xs font-bold text-gray-600">${fileType?.toUpperCase().slice(0, 3) || 'FILE'}</span>`;
            target.parentElement?.appendChild(fallbackDiv);
          }}
        />
      );
    }

    // Fallback for unsupported file types
    return (
      <div className="w-5 h-5 bg-gray-100 rounded flex items-center justify-center">
        <span className="text-xs font-bold text-gray-600">
          {fileType?.toUpperCase().slice(0, 3) || 'FILE'}
        </span>
      </div>
    );
  };

  // Render T/E processing status icons
  const renderProcessingStatus = (file: FileItem) => {
    if (file.type === 'folder') {
      return <span className="text-sm text-gray-400 font-['Inter',Helvetica]">—</span>;
    }

    if (!file.processed) {
      return (
        <div className="flex items-center gap-1">
          <div className="w-5 h-5 bg-gray-200 rounded flex items-center justify-center">
            <span className="text-xs font-bold text-gray-400">T</span>
          </div>
          <div className="w-5 h-5 bg-gray-200 rounded flex items-center justify-center">
            <span className="text-xs font-bold text-gray-400">E</span>
          </div>
        </div>
      );
    }

    const textDone = file.processed.text_extracted.done;
    const embeddingsDone = file.processed.embeddings_generated.done;

    return (
      <div className="flex items-center gap-1">
        <div className={`w-5 h-5 rounded flex items-center justify-center ${
          textDone ? 'bg-green-100' : 'bg-gray-200'
        }`}>
          <span className={`text-xs font-bold ${
            textDone ? 'text-green-600' : 'text-gray-400'
          }`}>T</span>
        </div>
        <div className={`w-5 h-5 rounded flex items-center justify-center ${
          embeddingsDone ? 'bg-green-100' : 'bg-gray-200'
        }`}>
          <span className={`text-xs font-bold ${
            embeddingsDone ? 'text-green-600' : 'text-gray-400'
          }`}>E</span>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Search Bar */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search for file..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm font-['Inter',Helvetica] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Clickable Breadcrumb Navigation */}
      <div className="px-4 py-2 text-sm border-b border-gray-100">
        <div className="flex items-center">
          {breadcrumbs.map((breadcrumb, index) => (
            <React.Fragment key={breadcrumb.id}>
              <button
                onClick={() => navigateToBreadcrumb(breadcrumb.id)}
                className={`font-['Inter',Helvetica] hover:text-blue-600 transition-colors ${
                  index === breadcrumbs.length - 1 
                    ? 'text-gray-900 font-medium cursor-default' 
                    : 'text-blue-600 hover:underline'
                }`}
                disabled={index === breadcrumbs.length - 1}
              >
                {breadcrumb.name}
              </button>
              {index < breadcrumbs.length - 1 && (
                <ChevronRightIcon className="w-4 h-4 mx-2 text-gray-400" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* File List Header */}
      <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-700 font-['Inter',Helvetica]">
        <div className="col-span-5">File name</div>
        <div className="col-span-2 text-center">Last Modified</div>
        <div className="col-span-2 text-center">Process Status</div>
        <div className="col-span-3 text-center">Selected</div>
      </div>

      {/* File List */}
      <div className="flex-1 overflow-y-auto">
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
              className={`grid grid-cols-12 gap-4 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-100 ${
                isSelected(file.id) ? 'bg-blue-50' : ''
              } ${file.type === 'folder' ? 'hover:bg-blue-50' : ''}`}
            >
              <div className="col-span-5 flex items-center gap-3">
                {getFileIcon(file)}
                <div className="min-w-0 flex-1">
                  <span className="text-sm text-gray-900 font-['Inter',Helvetica] truncate block">
                    {file.name}
                  </span>
                  {file.file_type && (
                    <span className="text-xs text-gray-500 font-['Inter',Helvetica]">
                      {file.file_type.toUpperCase()} file
                    </span>
                  )}
                  {file.type === 'folder' && (
                    <span className="text-xs text-blue-500 font-['Inter',Helvetica]">
                      Double-click to open
                    </span>
                  )}
                  {/* Show indicator for uploaded files */}
                  {isUploadedFile(file.id) && (
                    <span className="ml-2 text-xs text-blue-600 font-['Inter',Helvetica]">
                      (Uploaded)
                    </span>
                  )}
                </div>
              </div>
              <div className="col-span-2 flex items-center justify-center">
                <span className="text-sm text-gray-600 font-['Inter',Helvetica]">
                  {file.type === 'folder' ? '—' : file.lastModified}
                </span>
              </div>
              <div className="col-span-2 flex items-center justify-center">
                {renderProcessingStatus(file)}
              </div>
              <div className="col-span-3 flex items-center justify-center">
                {file.type === 'folder' ? (
                  <span className="text-sm text-gray-400 font-['Inter',Helvetica]">—</span>
                ) : isUploadedFile(file.id) ? (
                  // Uploaded files: gray disabled checkmark
                  <div className="w-5 h-5 bg-gray-400 rounded flex items-center justify-center opacity-60">
                    <CheckIcon className="w-3 h-3 text-white" />
                  </div>
                ) : isSelected(file.id) ? (
                  // Regular selected files: blue checkmark
                  <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center">
                    <CheckIcon className="w-3 h-3 text-white" />
                  </div>
                ) : (
                  // Unselected files: empty checkbox
                  <div className="w-5 h-5 border-2 border-gray-300 rounded"></div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Statistics Footer */}
      {!loading && filteredFiles.length > 0 && (
        <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
          <span className="text-xs text-gray-500 font-['Inter',Helvetica]">
            Showing {filteredFiles.length} items
            {searchQuery && ` matching "${searchQuery}"`}
            {currentFolderId !== 'root' && ` in current folder`}
          </span>
        </div>
      )}
    </div>
  );
};

export default MyDriveContent;
import React, { useState, useEffect } from 'react';
import { Search, FileIcon, CheckIcon, AlertCircleIcon, ExternalLinkIcon } from 'lucide-react';
import { listGoogleDriveFiles, importFileFromGoogleDrive, GoogleDriveFile, connectGoogleDrive } from '../../../api/workspaces/drive/googleDrive';
import { useToast } from '../../../hooks/useToast';
import { Button } from '../../ui/button';

interface GoogleDriveItem {
  id: string;
  name: string;
  type: string;
  lastModified: string;
  source: 'google-drive';
  importStatus?: 'importing' | 'completed' | 'error';
  progress?: number;
  progressMessage?: string;
  fileId?: string;
}

interface GoogleDriveContentProps {
  onFileSelection: (files: GoogleDriveItem[]) => void;
  selectedFiles: GoogleDriveItem[];
}

const GoogleDriveContent: React.FC<GoogleDriveContentProps> = ({ onFileSelection, selectedFiles }) => {
  const { error, success } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [driveFiles, setDriveFiles] = useState<GoogleDriveFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // Load Google Drive files on component mount
  useEffect(() => {
    loadGoogleDriveFiles();
  }, []);

  const loadGoogleDriveFiles = async () => {
    try {
      setLoading(true);
      const files = await listGoogleDriveFiles();
      setDriveFiles(files);
      setIsConnected(true);
      console.log('📁 Loaded Google Drive files:', files.length, 'items');
    } catch (err) {
      console.error('Error loading Google Drive files:', err);
      // Check if the error is due to not being connected
      if (err instanceof Error && (
        err.message.includes('Authentication failed') || 
        err.message.includes('No access token found')
      )) {
        setIsConnected(false);
      } else {
        error('Failed to load Google Drive files. Please try again.');
      }
      setDriveFiles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectGoogleDrive = async () => {
    try {
      setIsConnecting(true);
      await connectGoogleDrive();
      // The page will redirect to Google auth
    } catch (err) {
      console.error('Error connecting to Google Drive:', err);
      error('Failed to connect to Google Drive. Please try again.');
      setIsConnecting(false);
    }
  };

  // Filter files based on search query
  const filteredFiles = driveFiles.filter(file =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isSelected = (fileId: string) => {
    return selectedFiles.some(f => f.id === fileId);
  };

  const isImporting = (fileId: string) => {
    return selectedFiles.some(f => f.id === fileId && f.importStatus === 'importing');
  };

  const toggleFileSelection = async (file: GoogleDriveFile) => {
    // If already importing or selected, don't allow toggling
    if (isImporting(file.id)) return;
    
    if (isSelected(file.id)) {
      // Remove from selection
      const newSelected = selectedFiles.filter(f => f.id !== file.id);
      onFileSelection(newSelected);
    } else {
      // Add to selection and start import
      const newFile: GoogleDriveItem = {
        id: file.id,
        name: file.name,
        type: getMimeTypeCategory(file.mimeType),
        lastModified: formatDate(file.modifiedTime),
        source: 'google-drive',
        importStatus: 'importing',
        progress: 0,
        progressMessage: 'Starting import...'
      };
      
      // Add to selection immediately to show progress
      onFileSelection([...selectedFiles, newFile]);
      
      try {
        // Start the import process
        const importResult = await importFileFromGoogleDrive(file.id);
        
        // Update the file with completed status
        onFileSelection(prev => prev.map(f => {
          if (f.id === file.id) {
            return {
              ...f,
              importStatus: 'completed',
              progress: 100,
              progressMessage: 'Import completed successfully',
              fileId: importResult.file_id
            };
          }
          return f;
        }));
        
        success(`Successfully imported ${file.name}`);
      } catch (err) {
        console.error(`Import error for ${file.name}:`, err);
        error(`Failed to import ${file.name}`);
        
        // Update the file with error status
        onFileSelection(prev => prev.map(f => {
          if (f.id === file.id) {
            return {
              ...f,
              importStatus: 'error',
              progressMessage: 'Import failed'
            };
          }
          return f;
        }));
      }
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

  // Helper function to categorize MIME types
  const getMimeTypeCategory = (mimeType: string): string => {
    if (mimeType === 'application/vnd.google-apps.folder') return 'folder';
    if (mimeType === 'application/pdf') return 'pdf';
    if (mimeType.includes('spreadsheet')) return 'spreadsheet';
    if (mimeType.includes('document')) return 'document';
    if (mimeType.includes('presentation')) return 'presentation';
    if (mimeType.startsWith('image/')) return 'image';
    return 'file';
  };

  // Get appropriate icon for file type
  const getFileIcon = (mimeType: string) => {
    const type = getMimeTypeCategory(mimeType);
    
    // Map file types to icon paths
    const getIconPath = (type: string): string => {
      switch (type) {
        case 'pdf':
          return "/workspace/fileIcons/pdf.svg";
        case 'document':
          return "/workspace/fileIcons/txt.svg";
        case 'presentation':
          return "/workspace/fileIcons/ppt.svg";
        case 'spreadsheet':
          return "/workspace/fileIcons/spreadsheet.svg";
        case 'folder':
          return "/workspace/file_icon.svg";
        default:
          return "/workspace/file_icon.svg";
      }
    };
    
    return (
      <img 
        src={getIconPath(type)} 
        alt={`${type} icon`} 
        className="w-5 h-5"
        onError={(e) => {
          // Fallback to generic file icon if specific icon fails to load
          const target = e.target as HTMLImageElement;
          target.src = "/workspace/file_icon.svg";
        }}
      />
    );
  };

  // Not connected state
  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <div className="w-24 h-24 mb-6 bg-blue-50 rounded-full flex items-center justify-center">
          <ExternalLinkIcon className="w-12 h-12 text-blue-500" />
        </div>
        
        <h3 className="text-xl font-medium text-gray-900 mb-3 font-['Inter',Helvetica] text-center">
          Connect to Google Drive
        </h3>
        
        <p className="text-gray-600 mb-8 text-center max-w-md font-['Inter',Helvetica]">
          Connect your Google Drive account to import files directly into your workspace.
        </p>
        
        <Button
          onClick={handleConnectGoogleDrive}
          disabled={isConnecting}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-['Inter',Helvetica] flex items-center gap-2"
        >
          {isConnecting ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
          ) : (
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none">
              <path d="M15.545 6.558a9.42 9.42 0 0 1 .139 1.626c0 2.434-.87 4.492-2.384 5.885h.002C11.978 15.292 10.158 16 8 16A8 8 0 1 1 8 0a7.689 7.689 0 0 1 5.352 2.082l-2.284 2.284A4.347 4.347 0 0 0 8 3.166c-2.087 0-3.86 1.408-4.492 3.304a4.792 4.792 0 0 0 0 3.063h.003c.635 1.893 2.405 3.301 4.492 3.301 1.078 0 2.004-.276 2.722-.764h-.003a3.702 3.702 0 0 0 1.599-2.431H8v-3.08h7.545z" fill="#FFFFFF"/>
            </svg>
          )}
          {isConnecting ? 'Connecting...' : 'Connect Google Drive'}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search Bar */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search Google Drive files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm font-['Inter',Helvetica] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* File List Header */}
      <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-700 font-['Inter',Helvetica]">
        <div className="col-span-5">File name</div>
        <div className="col-span-3 text-center">Last Modified</div>
        <div className="col-span-2 text-center">Type</div>
        <div className="col-span-2 text-center">Action</div>
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
              <FileIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 font-['Inter',Helvetica]">
                {searchQuery ? 'No files found matching your search' : 'No files in your Google Drive'}
              </p>
            </div>
          </div>
        ) : (
          // File list
          filteredFiles.map((file) => (
            <div
              key={file.id}
              onClick={() => toggleFileSelection(file)}
              className={`grid grid-cols-12 gap-4 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-100 ${
                isSelected(file.id) ? 'bg-blue-50' : ''
              }`}
            >
              <div className="col-span-5 flex items-center gap-3">
                {getFileIcon(file.mimeType)}
                <div className="min-w-0 flex-1">
                  <span className="text-sm text-gray-900 font-['Inter',Helvetica] truncate block">
                    {file.name}
                  </span>
                  <span className="text-xs text-gray-500 font-['Inter',Helvetica]">
                    {file.mimeType.replace('application/vnd.google-apps.', '').toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="col-span-3 flex items-center justify-center">
                <span className="text-sm text-gray-600 font-['Inter',Helvetica]">
                  {formatDate(file.modifiedTime)}
                </span>
              </div>
              <div className="col-span-2 flex items-center justify-center">
                <span className="text-sm text-gray-600 font-['Inter',Helvetica]">
                  {getMimeTypeCategory(file.mimeType).charAt(0).toUpperCase() + getMimeTypeCategory(file.mimeType).slice(1)}
                </span>
              </div>
              <div className="col-span-2 flex items-center justify-center">
                {isImporting(file.id) ? (
                  // Importing spinner
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                  </div>
                ) : isSelected(file.id) ? (
                  // Selected checkmark
                  <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center">
                    <CheckIcon className="w-3 h-3 text-white" />
                  </div>
                ) : (
                  // Import button
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 py-0 text-xs bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFileSelection(file);
                    }}
                  >
                    Import
                  </Button>
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
          </span>
        </div>
      )}
    </div>
  );
};

export default GoogleDriveContent;
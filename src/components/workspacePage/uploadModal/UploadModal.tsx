import React, { useState } from 'react';
import { Button } from '../../ui/button';
import { X, Search, CheckIcon, FolderIcon, FileTextIcon } from 'lucide-react';
import MyDriveContent from './MyDriveContent';
import UploadContent from './UploadContent';
import WebsitesContent from './WebsitesContent';
import PasteContent from './PasteContent';
import GoogleDriveContent from './GoogleDriveContent';

export type SourceType = 'My Drive' | 'Upload' | 'Websites' | 'Paste' | 'Google Drive';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (files: any[]) => void;
}

const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onUpload }) => {
  const [selectedSource, setSelectedSource] = useState<SourceType>('My Drive');
  const [selectedFiles, setSelectedFiles] = useState<any[]>([]);
  
  // Track uploaded file IDs to pass to MyDriveContent
  const uploadedFileIds = selectedFiles
    .filter(f => f.source === 'upload' && f.uploadStatus === 'completed')
    .map(f => f.fileId)
    .filter(Boolean);

  if (!isOpen) return null;

  const sources: SourceType[] = ['My Drive', 'Upload', 'Websites', 'Paste', 'Google Drive'];

  const handleFileSelection = (files: any[]) => {
    setSelectedFiles(files);
  };

  const handleUpload = () => {
    // Only pass completed files to the parent
    const completedFiles = selectedFiles.filter(file => 
      file.uploadStatus === 'completed' || !file.uploadStatus
    );
    onUpload(completedFiles);
    onClose();
    // Clear only the completed files, keep any that are still uploading
    setSelectedFiles(prev => prev.filter(file => 
      file.uploadStatus === 'uploading' || file.uploadStatus === 'processing'
    ));
  };

  const renderContent = () => {
    switch (selectedSource) {
      case 'My Drive':
        return <MyDriveContent onFileSelection={handleFileSelection} selectedFiles={selectedFiles} uploadedFileIds={uploadedFileIds} />;
      case 'Upload':
        return <UploadContent onFileSelection={handleFileSelection} selectedFiles={selectedFiles} />;
      case 'Websites':
        return <WebsitesContent onFileSelection={handleFileSelection} selectedFiles={selectedFiles} />;
      case 'Paste':
        return <PasteContent onFileSelection={handleFileSelection} selectedFiles={selectedFiles} />;
      case 'Google Drive':
        return <GoogleDriveContent onFileSelection={handleFileSelection} selectedFiles={selectedFiles} />;
      default:
        return <MyDriveContent onFileSelection={handleFileSelection} selectedFiles={selectedFiles} uploadedFileIds={uploadedFileIds} />;
    }
  };

  const getSelectedCount = () => {
    // Count drive files that are ready
    const driveCount = selectedFiles.filter(f => 
      f.source === 'drive'
    ).length;
    
    // Count uploaded files that are completed
    const uploadCount = selectedFiles.filter(f => 
      f.source === 'upload' && f.uploadStatus === 'completed'
    ).length;
    
    const websiteCount = selectedFiles.filter(f => f.source === 'website').length;
    const pasteCount = selectedFiles.filter(f => f.source === 'paste').length;
    const uploadingCount = selectedFiles.filter(f => f.uploadStatus === 'uploading' || f.uploadStatus === 'processing').length;
    
    const parts = [];
    if (driveCount > 0) parts.push(`${driveCount} files from Drive`);
    if (uploadCount > 0) parts.push(`${uploadCount} files from Upload`);
    if (websiteCount > 0) parts.push(`${websiteCount} Websites selected`);
    if (pasteCount > 0) parts.push(`${pasteCount} Text content added`);
    if (uploadingCount > 0) parts.push(`${uploadingCount} files uploading`);
    
    return parts.join(', ') || 'No files ready';
  };

  // Check if there are any completed files ready for upload
  const hasCompletedFiles = selectedFiles.some(file => 
    file.source === 'drive' ||
    (file.source === 'upload' && file.uploadStatus === 'completed') ||
    file.source === 'website' ||
    file.source === 'paste'
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-[900px] h-[600px] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-black font-['Inter',Helvetica]">
            File Explorer
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="w-8 h-8 p-0 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar */}
          <div className="w-48 bg-gray-50 border-r border-gray-200 p-4">
            <div className="space-y-1">
              {sources.map((source) => (
                <button
                  key={source}
                  onClick={() => setSelectedSource(source)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 font-['Inter',Helvetica] ${
                    selectedSource === source
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {source === 'My Drive' && <FolderIcon className="w-4 h-4" />}
                  {source === 'Upload' && (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7,10 12,15 17,10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                  )}
                  {source === 'Websites' && (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="2" y1="12" x2="22" y2="12" />
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                    </svg>
                  )}
                  {source === 'Google Drive' && (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <path d="M12 11l-8 14h16l-8-14z" fill="#4285F4" />
                      <path d="M8 3l8 14H0L8 3z" fill="#FBBC05" />
                      <path d="M16 3H8l12 21 4-7-8-14z" fill="#34A853" />
                    </svg>
                  )}
                  {source === 'Paste' && <FileTextIcon className="w-4 h-4" />}
                  <span className="flex-1">{source}</span>
                  {selectedSource === source && (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="9,18 15,12 9,6" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Right Content Area */}
          <div className="flex-1 flex flex-col">
            {renderContent()}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
          <span className="text-sm text-gray-600 font-['Inter',Helvetica]">
            {getSelectedCount()}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="px-4 py-2 font-['Inter',Helvetica]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!hasCompletedFiles}
              className={`px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-['Inter',Helvetica] ${
                !hasCompletedFiles ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {selectedFiles.some(f => f.uploadStatus === 'uploading' || f.uploadStatus === 'processing') 
                ? 'Use Ready Files' 
                : 'Use Selected Files'
              }
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;
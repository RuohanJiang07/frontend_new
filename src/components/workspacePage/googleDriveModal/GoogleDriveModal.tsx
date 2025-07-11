import React, { useState, useEffect } from 'react';
import { Button } from '../../ui/button';
import { X, Search, CheckIcon, FileIcon, ExternalLinkIcon } from 'lucide-react';
import GoogleDriveContent from './GoogleDriveContent';
import { checkGoogleDriveAuthorization } from '../../../api/workspaces/drive/googleDrive';

interface GoogleDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (files: any[]) => void;
}

const GoogleDriveModal: React.FC<GoogleDriveModalProps> = ({ isOpen, onClose, onImport }) => {
  const [selectedFiles, setSelectedFiles] = useState<any[]>([]);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [pageSize, setPageSize] = useState(20);

  // Check Google Drive authorization status when modal opens
  useEffect(() => {
    if (isOpen) {
      checkAuthorizationStatus();
    }
  }, [isOpen]);

  const checkAuthorizationStatus = async () => {
    try {
      setIsCheckingAuth(true);
      const authorized = await checkGoogleDriveAuthorization();
      setIsAuthorized(authorized);
      console.log('Google Drive authorization status:', authorized);
    } catch (err) {
      console.error('Error checking Google Drive authorization:', err);
      setIsAuthorized(false);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const handleFileSelection = (files: any[]) => {
    setSelectedFiles(files);
  };

  const handleImport = () => {
    // Only pass completed files to the parent
    const completedFiles = selectedFiles.filter(file => 
      file.importStatus === 'completed' || !file.importStatus
    );
    onImport(completedFiles);
    onClose();
    // Clear only the completed files, keep any that are still importing
    setSelectedFiles(prev => prev.filter(file => 
      file.importStatus === 'importing'
    ));
  };

  if (!isOpen) return null;

  // Get count of selected files that are ready for import
  const hasCompletedFiles = selectedFiles.some(file => 
    file.importStatus === 'completed' || !file.importStatus
  );

  // Get count of files that are still importing
  const importingCount = selectedFiles.filter(f => 
    f.importStatus === 'importing'
  ).length;

  // Get count of files that are completed
  const completedCount = selectedFiles.filter(f => 
    f.importStatus === 'completed'
  ).length;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-[900px] h-[600px] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-black font-['Inter',Helvetica]">
            Google Drive
            <span className="ml-2 text-sm font-normal text-gray-500">
              Import files directly from your Google Drive
            </span>
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
        <div className="flex-1 overflow-hidden">
          <GoogleDriveContent 
            onFileSelection={handleFileSelection} 
            selectedFiles={selectedFiles} 
            isAuthorized={isAuthorized}
            isCheckingAuth={isCheckingAuth}
            onAuthStatusChange={setIsAuthorized}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
          <span className="text-sm text-gray-600 font-['Inter',Helvetica]">
            {completedCount > 0 && `${completedCount} files ready`}
            {importingCount > 0 && completedCount > 0 && ', '}
            {importingCount > 0 && `${importingCount} files importing`}
            {completedCount === 0 && importingCount === 0 && 'No files selected'}
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
              onClick={handleImport}
              disabled={!hasCompletedFiles}
              className={`px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-['Inter',Helvetica] ${
                !hasCompletedFiles ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {importingCount > 0 
                ? 'Use Ready Files' 
                : 'Import Selected Files'
              }
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleDriveModal;
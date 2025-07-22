import React, { useState } from 'react';
import { Button } from '../../ui/button';
import { X } from 'lucide-react';
import DriveUploadContent from './DriveUploadContent';

interface DriveUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (files: any[]) => void;
  onModalClose: () => void;
}

const DriveUploadModal: React.FC<DriveUploadModalProps> = ({ isOpen, onClose, onUpload, onModalClose }) => {
  const [selectedFiles, setSelectedFiles] = useState<any[]>([]);

  // Clear selected files when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setSelectedFiles([]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileSelection = (files: any[]) => {
    setSelectedFiles(files);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div 
        className="bg-white rounded-[15px] shadow-xl flex flex-col overflow-hidden"
        style={{
          width: '966px',
          height: '505px',
          flexShrink: 0
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between" style={{ padding: '28px 28px 0 28px' }}>
          <h2 
            className="text-black font-bold font-['Inter',Helvetica]"
            style={{ fontSize: '24px' }}
          >
            Upload files from your computer
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              onClose();
              onModalClose(); // Reload drive content
            }}
            className="w-8 h-8 p-0 hover:bg-gray-100 text-gray-600"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#D1D5DB transparent' }}>
            <DriveUploadContent onFileSelection={handleFileSelection} selectedFiles={selectedFiles} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriveUploadModal; 
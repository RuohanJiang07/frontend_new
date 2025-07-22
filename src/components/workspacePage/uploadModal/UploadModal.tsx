import React, { useState } from 'react';
import { Button } from '../../ui/button';
import { X } from 'lucide-react';
import MyDriveContent from './MyDriveContent';
import UploadContent from './UploadContent';
import WebsitesContent from './WebsitesContent';
import PasteContent from './PasteContent';

export type SourceType = 'My Drive' | 'Upload' | 'Websites' | 'Paste';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (files: any[]) => void;
}

const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onUpload }) => {
  const [selectedSource, setSelectedSource] = useState<SourceType>('My Drive');
  const [selectedFiles, setSelectedFiles] = useState<any[]>([]);

  if (!isOpen) return null;

  const sources: SourceType[] = ['My Drive', 'Upload', 'Websites', 'Paste'];

  const handleFileSelection = (files: any[]) => {
    setSelectedFiles(files);
  };

  const handleUpload = () => {
    const completedFiles = selectedFiles.filter(file => 
      file.uploadStatus === 'completed' || !file.uploadStatus
    );
    onUpload(completedFiles);
    onClose();
    setSelectedFiles(prev => prev.filter(file => 
      file.uploadStatus === 'uploading' || file.uploadStatus === 'processing'
    ));
  };

  const renderContent = () => {
    switch (selectedSource) {
      case 'My Drive':
        return <MyDriveContent onFileSelection={handleFileSelection} selectedFiles={selectedFiles} uploadedFileIds={[]} />;
      case 'Upload':
        return <UploadContent onFileSelection={handleFileSelection} selectedFiles={selectedFiles} />;
      case 'Websites':
        return <WebsitesContent onFileSelection={handleFileSelection} selectedFiles={selectedFiles} />;
      case 'Paste':
        return <PasteContent onFileSelection={handleFileSelection} selectedFiles={selectedFiles} />;
      default:
        return <MyDriveContent onFileSelection={handleFileSelection} selectedFiles={selectedFiles} uploadedFileIds={[]} />;
    }
  };

  const getSelectedCount = () => {
    const driveCount = selectedFiles.filter(f => f.source === 'drive').length;
    const uploadCount = selectedFiles.filter(f => f.source === 'upload' && f.uploadStatus === 'completed').length;
    const websiteCount = selectedFiles.filter(f => f.source === 'website').length;
    const pasteCount = selectedFiles.filter(f => f.source === 'paste').length;
    
    const parts = [];
    if (driveCount > 0) parts.push(`${driveCount} files from Drive`);
    if (uploadCount > 0) parts.push(`${uploadCount} file from Computer`);
    if (websiteCount > 0) parts.push(`& ${websiteCount} Websites selected`);
    if (pasteCount > 0) parts.push(`${pasteCount} Text content added`);
    
    return parts.join(', ') || 'No files selected';
  };

  const hasCompletedFiles = selectedFiles.some(file => 
    file.source === 'drive' ||
    (file.source === 'upload' && file.uploadStatus === 'completed') ||
    file.source === 'website' ||
    file.source === 'paste'
  );

  const getSourceIcon = (source: SourceType, isSelected: boolean) => {
    const color = isSelected ? '#4C6694' : '#020618';
    
    switch (source) {
      case 'My Drive':
        return (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2.70898 10.8335C7.5701 10.8335 12.4312 10.8335 17.2923 10.8335" stroke={color} strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M4.54167 3.425L2.7396 9.96392C2.58059 10.5409 2.5 11.1367 2.5 11.7352V15.8333C2.5 16.2754 2.67559 16.6993 2.98816 17.0118C3.30072 17.3244 3.72464 17.5 4.16667 17.5H15.8333C16.2754 17.5 16.6993 17.3244 17.0118 17.0118C17.3244 16.6993 17.5 16.2754 17.5 15.8333V11.7352C17.5 11.1367 17.4194 10.5409 17.2604 9.96392L15.4583 3.425C15.3204 3.14732 15.1076 2.91364 14.8441 2.75023C14.5806 2.58682 14.2767 2.50016 13.9667 2.5H6.03333C5.72326 2.50016 5.41939 2.58682 5.15587 2.75023C4.89235 2.91364 4.67965 3.14732 4.54167 3.425Z" stroke={color} strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M14.166 14.1665H14.9993" stroke={color} strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M10.834 14.1665H11.6673" stroke={color} strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'Upload':
        return (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3.33398 13.337V14.1668C3.33398 15.5475 4.45327 16.6668 5.83398 16.6668H14.1673C15.548 16.6668 16.6673 15.5475 16.6673 14.1668V13.3335" stroke={color} strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M10 12.9167V3.75" stroke={color} strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12.9173 6.66667L10.0007 3.75L7.08398 6.66667" stroke={color} strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'Websites':
        return (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10.001 1.04199C10.6356 1.04201 11.2561 1.10846 11.8545 1.23438C14.7875 1.85165 17.1905 3.90142 18.2988 6.61719C18.7251 7.66165 18.9599 8.80442 18.96 10C18.96 10.6347 18.8935 11.2551 18.7676 11.8535C18.0394 15.3143 15.3153 18.0382 11.8545 18.7666C11.2561 18.8925 10.6356 18.959 10.001 18.959C9.36656 18.959 8.74663 18.8924 8.14844 18.7666C4.68753 18.0384 1.96362 15.3144 1.23535 11.8535C1.10943 11.2551 1.04297 10.6347 1.04297 10C1.04303 8.80353 1.27824 7.66032 1.70508 6.61523C2.81393 3.9006 5.2162 1.85138 8.14844 1.23438C8.74663 1.10855 9.36656 1.04201 10.001 1.04199ZM12.2344 13.7773C11.4667 13.8873 10.7026 13.959 10.001 13.959C9.47442 13.959 8.91268 13.9191 8.34082 13.8525L7.7666 13.7773C8.10098 15.3815 8.53051 16.8525 8.7627 17.6084C9.16548 17.6734 9.57912 17.709 10.001 17.709C10.4227 17.709 10.8366 17.6734 11.2393 17.6084C11.4424 16.9471 11.7953 15.7383 12.1045 14.3721L12.2344 13.7773ZM2.76172 12.6533C3.53968 14.7755 5.22476 16.4608 7.34668 17.2393C7.07643 16.3036 6.7212 14.9584 6.44922 13.5518C5.04247 13.2797 3.69728 12.9236 2.76172 12.6533ZM17.2402 12.6533C16.3046 12.9236 14.9594 13.2797 13.5527 13.5518C13.2807 14.9584 12.9245 16.3036 12.6543 17.2393C14.7767 16.461 16.4621 14.7757 17.2402 12.6533ZM12.6357 8.71484C11.734 8.85922 10.8245 8.95896 10.001 8.95898C9.17738 8.95896 8.26803 8.85925 7.36621 8.71484C7.31999 9.16602 7.29299 9.59871 7.29297 10C7.29297 10.7476 7.38618 11.6002 7.52734 12.4736C8.40084 12.6148 9.25328 12.709 10.001 12.709C10.7486 12.709 11.6012 12.6148 12.4746 12.4736C12.6158 11.6002 12.71 10.7476 12.71 10C12.7099 9.59869 12.682 9.16604 12.6357 8.71484ZM2.66699 7.625C2.42507 8.37256 2.29302 9.17039 2.29297 10C2.29297 10.4221 2.32751 10.8362 2.39258 11.2393C3.14826 11.4714 4.61967 11.899 6.22363 12.2334C6.1137 11.4657 6.04297 10.7016 6.04297 10C6.04299 9.51848 6.07594 9.00878 6.13184 8.49023C4.79263 8.2177 3.53538 7.87777 2.66699 7.625ZM17.334 7.625C16.4654 7.87781 15.2082 8.21778 13.8691 8.49023C13.9251 9.00884 13.9599 9.51843 13.96 10C13.96 10.7016 13.8883 11.4657 13.7783 12.2334C15.3823 11.899 16.8536 11.4704 17.6094 11.2383C17.6743 10.8356 17.71 10.4218 17.71 10C17.7099 9.17021 17.576 8.3727 17.334 7.625ZM10.001 2.29199C9.57922 2.29201 9.16539 2.32564 8.7627 2.39062C8.47048 3.34191 7.86912 5.42386 7.5332 7.47559C8.40402 7.61613 9.25452 7.70896 10.001 7.70898C10.7473 7.70896 11.5981 7.6161 12.4688 7.47559C12.1328 5.42353 11.5304 3.3417 11.2383 2.39062C10.836 2.32577 10.4223 2.29201 10.001 2.29199ZM7.34668 2.76367C5.52951 3.43054 4.03335 4.762 3.15234 6.46484C3.97427 6.70139 5.10517 7.00314 6.30371 7.25C6.58139 5.5642 7.02572 3.87509 7.34668 2.76367ZM12.6553 2.76465C12.9762 3.87608 13.4206 5.56457 13.6982 7.25C14.8963 7.00326 16.0267 6.70136 16.8486 6.46484C15.9676 4.76219 14.4723 3.43146 12.6553 2.76465Z" fill={color}/>
          </svg>
        );
      case 'Paste':
        return (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.3573 10.7175C17.5 10.373 17.5 9.93614 17.5 9.0625C17.5 8.18886 17.5 7.75204 17.3573 7.40747C17.167 6.94804 16.802 6.58303 16.3425 6.39273C15.998 6.25 15.5611 6.25 14.6875 6.25H9.25C8.1999 6.25 7.67485 6.25 7.27377 6.45436C6.92096 6.63413 6.63413 6.92096 6.45436 7.27377C6.25 7.67485 6.25 8.1999 6.25 9.25V14.6875C6.25 15.5611 6.25 15.998 6.39273 16.3425C6.58303 16.802 6.94804 17.167 7.40747 17.3573C7.75204 17.5 8.18886 17.5 9.0625 17.5C9.93614 17.5 10.373 17.5 10.7175 17.3573M17.3573 10.7175C17.167 11.177 16.802 11.542 16.3425 11.7323C15.998 11.875 15.5611 11.875 14.6875 11.875C13.8139 11.875 13.377 11.875 13.0325 12.0177C12.573 12.208 12.208 12.573 12.0177 13.0325C11.875 13.377 11.875 13.8139 11.875 14.6875C11.875 15.5611 11.875 15.998 11.7323 16.3425C11.542 16.802 11.177 17.167 10.7175 17.3573M17.3573 10.7175C16.447 13.8573 14.0211 16.3303 10.8994 17.3007L10.7175 17.3573M13.75 6.25L13.75 5.5C13.75 4.4499 13.75 3.92485 13.5456 3.52377C13.3659 3.17096 13.079 2.88413 12.7262 2.70436C12.3251 2.5 11.8001 2.5 10.75 2.5H5.5C4.4499 2.5 3.92485 2.5 3.52377 2.70436C3.17096 2.88413 2.88413 3.17096 2.70436 3.52377C2.5 3.92485 2.5 4.4499 2.5 5.5V10.75C2.5 11.8001 2.5 12.3251 2.70436 12.7262C2.88413 13.079 3.17096 13.3659 3.52377 13.5456C3.92485 13.75 4.45008 13.75 5.50055 13.75H6.25" stroke={color} strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      default:
        return null;
    }
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
            File Explorer
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="w-8 h-8 p-0 hover:bg-gray-100 text-gray-600"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar */}
          <div className="w-48 border-r border-gray-200" style={{ padding: '18px 16px 16px 16px' }}>
            <div className="space-y-1">
              {sources.map((source) => {
                const isSelected = selectedSource === source;
                return (
                  <button
                    key={source}
                    onClick={() => setSelectedSource(source)}
                    className="w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 font-['Inter',Helvetica]"
                    style={{ 
                      fontSize: '14px',
                      backgroundColor: isSelected ? '#EBEDF4' : 'transparent',
                      color: isSelected ? '#4C6694' : '#374151',
                      border: 'none'
                    }}
                  >
                    {getSourceIcon(source, isSelected)}
                    <span className="flex-1">{source}</span>
                  </button>
                );
              })}
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
              className="px-4 py-2 font-['Inter',Helvetica] bg-gray-100 text-gray-700 hover:bg-gray-200"
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
              Select
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;
import React, { useRef, useState } from 'react';
import { UploadIcon, FileIcon, X, CheckIcon, AlertCircleIcon } from 'lucide-react';
import { uploadFileWithProgress, UploadProgressData } from '../../../api/workspaces/drive/uploadFiles';
import { useToast } from '../../../hooks/useToast';

interface UploadedFile {
  id: string;
  name: string;
  size: string;
  type: string;
  source: 'computer' | 'upload';
  uploadStatus?: 'uploading' | 'processing' | 'completed' | 'error';
  progress?: number;
  progressMessage?: string;
  fileId?: string; // Backend file ID after successful upload
  // Metadata for drive compatibility
  file_type?: string;
  parent_id?: string;
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

interface UploadContentProps {
  onFileSelection: (files: UploadedFile[]) => void;
  selectedFiles: UploadedFile[];
}

const UploadContent: React.FC<UploadContentProps> = ({ onFileSelection, selectedFiles }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const { error: showError, success } = useToast();

  const handleFileUpload = async (files: FileList) => {
    const newFiles: UploadedFile[] = Array.from(files).map((file, index) => ({
      id: `upload-${Date.now()}-${index}`,
      name: file.name,
      size: formatFileSize(file.size),
      type: file.type || 'unknown',
      source: 'computer',
      uploadStatus: 'uploading',
      progress: 0,
      progressMessage: 'Starting upload...'
    }));

    // Add new files to the list immediately with uploading status
    const currentNonComputerFiles = selectedFiles.filter(f => f.source !== 'computer' && f.source !== 'upload');
    const currentComputerFiles = selectedFiles.filter(f => f.source === 'computer');
    const currentUploadFiles = selectedFiles.filter(f => f.source === 'upload');
    const updatedFiles = [...currentNonComputerFiles, ...currentUploadFiles, ...currentComputerFiles, ...newFiles];
    onFileSelection(updatedFiles);

    // Start uploading each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const uploadFile = newFiles[i];
      
      try {
        console.log(`🚀 Starting upload for file: ${file.name}`);
        
        await uploadFileWithProgress(
          file,
          (progressData: UploadProgressData) => {
            // Update progress for this specific file
            onFileSelection(prev => prev.map(f => {
              if (f.id === uploadFile.id) {
                let status: 'uploading' | 'processing' | 'completed' | 'error' = 'uploading';
                
                if (progressData.stage === 'text_extraction' || progressData.stage === 'embedding') {
                  status = 'processing';
                } else if (progressData.stage === 'complete') {
                  status = 'completed';
                }
                
                return {
                  ...f,
                  uploadStatus: status,
                  progress: progressData.progress,
                  progressMessage: progressData.message
                };
              }
              return f;
            }));
          },
          (errorMsg: string) => {
            console.error(`❌ Upload failed for ${file.name}:`, errorMsg);
            showError(`Upload failed for ${file.name}: ${errorMsg}`);
            
            // Mark file as error
            onFileSelection(prev => prev.map(f => {
              if (f.id === uploadFile.id) {
                return {
                  ...f,
                  uploadStatus: 'error' as const,
                  progressMessage: `Error: ${errorMsg}`
                };
              }
              return f;
            }));
          },
          (fileId: string) => {
            console.log(`✅ Upload completed for ${file.name}, fileId: ${fileId}`);
            success(`Successfully uploaded ${file.name}`);
            
            // Mark file as completed, store backend file ID, and convert to drive format
            onFileSelection(prev => prev.map(f => {
              if (f.id === uploadFile.id) {
                // Keep as upload source but mark as completed
                return {
                  ...f,
                  source: 'upload' as const, // Keep as upload source
                  uploadStatus: 'completed' as const,
                  progress: 100,
                  progressMessage: 'Upload completed successfully',
                  fileId: fileId,
                  // Add metadata for drive compatibility
                  file_type: getFileTypeFromName(file.name),
                  parent_id: 'root',
                  processed: {
                    text_extracted: {
                      done: true,
                      output_directory: ''
                    },
                    embeddings_generated: {
                      done: true,
                      output_directory: ''
                    }
                  }
                };
              }
              return f;
            }));
          }
        );
      } catch (error) {
        console.error(`❌ Upload error for ${file.name}:`, error);
        showError(`Failed to upload ${file.name}`);
        
        // Mark file as error
        onFileSelection(prev => prev.map(f => {
          if (f.id === uploadFile.id) {
            return {
              ...f,
              uploadStatus: 'error' as const,
              progressMessage: 'Upload failed'
            };
          }
          return f;
        }));
      }
    }
  };

  // Helper function to extract file type from filename
  const getFileTypeFromName = (filename: string): string => {
    const extension = filename.split('.').pop()?.toLowerCase();
    return extension || 'unknown';
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const removeFile = (fileId: string) => {
    const updatedFiles = selectedFiles.filter(f => f.id !== fileId);
    onFileSelection(updatedFiles);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  const getStatusIcon = (file: UploadedFile) => {
    switch (file.uploadStatus) {
      case 'uploading':
      case 'processing':
        return (
          <div className="flex space-x-1">
            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        );
      case 'completed':
        return <CheckIcon className="w-5 h-5" style={{ color: '#00276C' }} />;
      case 'error':
        return <AlertCircleIcon className="w-5 h-5 text-red-600" />;
      default:
        return <FileIcon className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (file: UploadedFile) => {
    switch (file.uploadStatus) {
      case 'uploading':
        return 'bg-white border-gray-300';
      case 'processing':
        return 'bg-white border-gray-300';
      case 'completed':
        return 'bg-white border-gray-300';
      case 'error':
        return 'bg-white border-red-300';
      default:
        return 'bg-white border-gray-300';
    }
  };

  // Show both computer files (uploading) and completed drive files (uploaded via this modal)
  const relevantFiles = selectedFiles.filter(f => 
    f.source === 'computer' || 
    f.source === 'upload'
  );

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ padding: '16px 24px 24px 24px' }}>
      {/* Title */}
      <h3 
        className="text-left mb-4 font-['Inter',Helvetica]"
        style={{ fontSize: '24px', color: '#000000', fontWeight: '510' }}
      >
        Upload files from your computer
      </h3>

      {/* Upload Area */}
      <div
        className={`rounded-lg p-8 transition-colors ${
          dragOver
            ? 'bg-blue-50'
            : 'hover:bg-gray-50'
        }`}
        style={{
          border: `2px dashed ${dragOver ? '#3B82F6' : '#D1D5DB'}`,
          borderDasharray: '8, 4'
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <UploadIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-sm text-gray-600 mb-4 font-['Inter',Helvetica] text-center">
          Drag and drop files here, or click to browse
        </p>
        <p className="text-xs text-gray-500 mb-4 font-['Inter',Helvetica] text-center">
          Supported formats: PDF, DOC, DOCX, TXT, MD, EPUB, PPTX
        </p>
        <div className="text-center">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 text-white rounded-lg transition-colors font-['Inter',Helvetica]"
            style={{ backgroundColor: '#4C6694' }}
          >
            Choose Files
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.txt,.md,.epub,.pptx"
          className="hidden"
          onChange={(e) => {
            if (e.target.files) {
              handleFileUpload(e.target.files);
            }
          }}
        />
      </div>

      {/* Uploaded Files List with Progress */}
      {relevantFiles.length > 0 && (
        <div className="mt-6 flex-1">
          <h4 className="text-sm font-medium text-gray-900 mb-3 font-['Inter',Helvetica]">
            Files ({relevantFiles.length})
          </h4>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {relevantFiles.map((file) => (
              <div
                key={file.id}
                className={`border rounded-lg p-3 transition-colors ${getStatusColor(file)}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {getStatusIcon(file)}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 font-['Inter',Helvetica] truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500 font-['Inter',Helvetica]">
                        {file.size}
                      </p>
                    </div>
                  </div>
                  {file.uploadStatus !== 'uploading' && file.uploadStatus !== 'processing' && (
                    <button
                      onClick={() => removeFile(file.id)}
                      className="p-1 hover:bg-gray-200 rounded transition-colors flex-shrink-0"
                    >
                      <X className="w-4 h-4 text-gray-500" />
                    </button>
                  )}
                </div>

                {/* Progress Bar and Message */}
                {(file.uploadStatus === 'uploading' || file.uploadStatus === 'processing') && (
                  <div className="space-y-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${file.progress || 0}%`,
                          backgroundColor: '#00276C'
                        }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-600 font-['Inter',Helvetica]">
                      {file.progressMessage || 'Processing...'}
                    </p>
                  </div>
                )}

                                  {/* Status Message for Completed/Error */}
                  {(file.uploadStatus === 'completed' || file.uploadStatus === 'error') && (
                    <div className="space-y-1">
                      <p className={`text-xs font-['Inter',Helvetica] ${
                        file.uploadStatus === 'completed' ? 'text-[#00276C]' : 'text-red-600'
                      }`}>
                        {file.uploadStatus === 'completed' 
                          ? `${file.progressMessage} (Ready to use as reference)`
                          : file.progressMessage
                        }
                      </p>
                    </div>
                  )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* File Format Support */}
      <div className="mt-auto pt-6 border-t border-gray-200">
        <p className="text-xs text-gray-500 font-['Inter',Helvetica]">
          <strong>Note:</strong> Uploaded files are automatically added as selected references and saved to your workspace drive.
        </p>
      </div>
    </div>
  );
};

export default UploadContent;
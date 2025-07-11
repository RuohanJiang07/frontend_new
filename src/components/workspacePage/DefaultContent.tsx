import React, { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { useEffect } from "react";
import {
  CloudIcon,
  FileText,
  PenTool,
  Search,
  SettingsIcon,
  UploadIcon,
  MessageSquare,
} from "lucide-react";
import { getDriveFiles, DriveFileItem } from "../../api/workspaces/drive/getFiles";
import { useToast } from "../../hooks/useToast";
import { Progress } from "../ui/progress";
import DeepLearn from "../../pages/workspacePage/components/DeepLearn/entry/DeepLearn";
import DeepLearnResponse from "../../pages/workspacePage/components/DeepLearn/response/DeepLearnResponse";
import ProblemSolver from "../../pages/workspacePage/components/ProblemHelp/entry/ProblemSolver";
import ProblemHelpResponse from "../../pages/workspacePage/components/ProblemHelp/response/ProblemHelpResponse";
import DocumentChat from "../../pages/workspacePage/components/DocumentChat/entry/DocumentChat";
import Note from "../../pages/workspacePage/components/Note/entry/Note";
import NoteEditor from "../../pages/workspacePage/components/Note/response/NoteEditor";
import Drive from "../../pages/workspacePage/components/Drive/Drive";
import DocumentChatResponse from "../../pages/workspacePage/components/DocumentChat/response/DocumentChatResponse";

interface DefaultContentProps {
  tabId: string;
  isSplit: boolean;
  activeView?: string | null;
  onViewChange?: (view: string | null) => void;
}

interface FileItem {
  id: string;
  name: string;
  type: string;
  icon: string;
}

export const DefaultContent: React.FC<DefaultContentProps> = ({ isSplit, activeView, onViewChange }) => {
  const { error } = useToast();
  const [driveFiles, setDriveFiles] = useState<FileItem[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(true);
  const [fileCount, setFileCount] = useState(0);
  const [totalFileCount, setTotalFileCount] = useState(100);

  // Load drive files on component mount
  useEffect(() => {
    loadDriveFiles();
  }, []);

  const loadDriveFiles = async () => {
    try {
      setIsLoadingFiles(true);
      const response = await getDriveFiles();
      
      if (response.success) {
        // Convert DriveFileItem[] to FileItem[] for display
        const convertedFiles = response.drive_files.items
          .filter(file => file.parent_id === "root") // Only show root level files
          .slice(0, 12) // Limit to 12 files to match the grid
          .map(convertDriveFileToFileItem);
        
        setDriveFiles(convertedFiles);
        setFileCount(response.statistics.file_count);
        setTotalFileCount(100); // Hardcoded total for now
        
        console.log('📁 Loaded drive files for DefaultContent:', convertedFiles.length, 'items');
      } else {
        error('Failed to load drive files');
        setDriveFiles([]);
      }
    } catch (err) {
      console.error('Error loading drive files:', err);
      setDriveFiles([]);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  // Convert DriveFileItem to FileItem format for display
  const convertDriveFileToFileItem = (driveFile: DriveFileItem): FileItem => {
    // Get appropriate icon based on file type
    const getFileIconPath = (type: string, fileType?: string): string => {
      if (type === 'folder') return "/workspace/file_icon.svg";
      
      // Map file types to icon paths
      const fileExtension = fileType?.toLowerCase() || getFileExtensionFromName(driveFile.name);
      
      switch (fileExtension) {
        case 'pdf':
          return "/workspace/fileIcons/pdf.svg";
        case 'txt':
        case 'doc':
        case 'docx':
          return "/workspace/fileIcons/txt.svg";
        case 'ppt':
        case 'pptx':
          return "/workspace/fileIcons/ppt.svg";
        case 'md':
          return "/workspace/fileIcons/md.svg";
        case 'epub':
          return "/workspace/fileIcons/epub.svg";
        default:
          return "/workspace/file_icon.svg";
      }
    };
    
    return {
      id: driveFile.id,
      name: driveFile.name,
      type: driveFile.type,
      icon: getFileIconPath(driveFile.type, driveFile.file_type)
    };
  };

  // Helper function to extract file extension from name
  const getFileExtensionFromName = (filename: string): string => {
    return filename.split('.').pop()?.toLowerCase() || '';
  };

  // Data for AI tools
  const aiTools = [
    {
      title: "Deep Learn",
      icon: "/search.svg",
      description: "place holder place holder\nplace holder place holder",
      component: "deep-learn"
    },
    {
      title: "Smart Note",
      icon: 'pen-tool',
      description: "place holder place holder\nplace holder place holder",
      component: "smart-note"
    },
    {
      title: "Document Chat",
      icon: 'message-square',
      description: "answer questions based\non your documents",
      component: "document-chat"
    },
    {
      title: "Problem Help",
      icon: null,
      description: "place holder place holder\nplace holder place holder",
      component: "problem-help"
    },
  ];

  const handleToolClick = (component: string) => {
    onViewChange?.(component);
  };

  const handleBackToDefault = () => {
    onViewChange?.(null);
  };

  const handleOpenDrive = () => {
    onViewChange?.("drive");
  };

  // Handle back navigation from response pages to entry pages
  const handleBackToEntry = (entryView: string) => {
    onViewChange?.(entryView);
  };

  // Render specific component based on activeView
  if (activeView === "deep-learn") {
    return <DeepLearn isSplit={isSplit} onBack={handleBackToDefault} onViewChange={onViewChange} />;
  }

  if (activeView === "deep-learn-response") {
    return <DeepLearnResponse isSplit={isSplit} onBack={() => handleBackToEntry('deep-learn')} />;
  }

  if (activeView === "problem-help") {
    return <ProblemSolver onBack={handleBackToDefault} onViewChange={onViewChange} />;
  }

  if (activeView === "problem-help-response") {
    return <ProblemHelpResponse onBack={() => handleBackToEntry('problem-help')} />;
  }

  if (activeView === "document-chat") {
    return <DocumentChat isSplit={isSplit} onBack={handleBackToDefault} onViewChange={onViewChange} />;
  }

  if (activeView === "document-chat-response") {
    return <DocumentChatResponse isSplit={isSplit} onBack={() => handleBackToEntry('document-chat')} />;
  }

  if (activeView === "smart-note") {
    return <Note onBack={handleBackToDefault} onViewChange={onViewChange} />;
  }

  if (activeView === "smart-note-editor") {
    return <NoteEditor onBack={() => handleBackToEntry('smart-note')} />;
  }

  if (activeView === "drive") {
    return <Drive onBack={handleBackToDefault} />;
  }

  // Default view
  return (
    <div className="flex flex-col items-center w-full px-8 h-[calc(100vh-88px)] overflow-y-auto">
      <div className={`${isSplit ? 'w-full pt-0' : 'max-w-[800px]'} pt-[30px]`}>
        {/* Header with title and icon */}
        <div className="flex items-center mb-8 w-full -ml-[20px]">
          <img
            className="w-[87px] h-[95px] object-cover"
            alt="Icon pencil"
            src="/workspace/icon_pencil.png"
          />
          <h2 className="ml-5 font-medium text-2xl text-black font-outfit">
            Hyperknow AI Tools
          </h2>
        </div>

        {/* AI Tools section */}
        <div className="flex flex-wrap gap-4 mb-10 justify-center">
          {aiTools.map((tool, index) => (
            <Card
              key={index}
              className={`${isSplit ? 'w-[140px]' : 'w-[158px]'} h-[138px] bg-[#ecf1f6] rounded-lg border-none cursor-pointer hover:shadow-md transition-shadow`}
              onClick={() => handleToolClick(tool.component)}
            >
              <CardContent className="flex flex-col items-center justify-center h-full p-2 pt-5 pb-4">
                {tool.icon === "/search.svg" && (
                  <Search className="w-[35px] h-[35px] mb-3" />
                )}
                {tool.icon === "pen-tool" && (
                  <PenTool className="w-[35px] h-[35px] mb-3" />
                )}
                {tool.icon === "message-square" && (
                  <MessageSquare className="w-[35px] h-[35px] mb-3" />
                )}
                {!tool.icon && tool.title === "Problem Help" && (
                  <span className="text-3xl font-medium mb-3">?</span>
                )}
                <h3 className="font-medium text-base text-black font-outfit">
                  {tool.title}
                </h3>
                <p className="font-medium text-[10px] text-black font-outfit mt-1 text-center">
                  {tool.description.split("\n").map((line, i) => (
                    <React.Fragment key={i}>
                      {line}
                      {i < tool.description.split("\n").length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Workspace Drive section */}
        <div className="mb-8">
          <div className="flex items-center">
            <img
              className="w-[101px] h-[92px] object-cover"
              alt="Icon delete"
              src="/workspace/folders.png"
            />
            <div className="ml-[18px]">
              <h2 className="font-medium text-2xl text-black font-outfit">
                Workspace Drive
              </h2>
              <p className="font-medium text-[13px] text-black font-outfit">
                all filesenabled with smart assistant
              </p>
              <p className="font-medium text-[13px] text-black font-outfit">
                click a file to view, and select a part to explain
              </p>
            </div>
          </div>
        </div>

        {/* Recent files section */}
        <div className="mb-4 ">
          <div className={`flex items-center justify-between mb-4 ${isSplit ? 'pr-[36px]' : ''}`}>
            <h3 className="font-medium text-xl text-black font-outfit tracking-[-0.07px]">
              Recent
            </h3>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="w-[30px] h-[29px] bg-[#e8e8e8] rounded-lg p-0"
              >
                <SettingsIcon className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                className="h-[29px] bg-[#e8e8e8] rounded-lg px-2 py-1.5 flex items-center gap-2"
              >
                <UploadIcon className="w-4 h-4" />
                <span className="font-normal text-sm text-black font-outfit">
                  Upload
                </span>
              </Button>
              <Button
                variant="ghost"
                className="h-[29px] bg-[#e8e8e8] rounded-lg px-2 py-1.5 flex items-center gap-2"
                onClick={handleOpenDrive}
              >
                <CloudIcon className="w-4 h-4" />
                <span className="font-normal text-sm text-black font-outfit">
                  Open Drive
                </span>
              </Button>
            </div>
          </div>

          {/* File grid */}
          <div className={`grid grid-cols-3 ${isSplit ? 'w-[90%]' : 'w-full'} gap-x-4 gap-y-4 `}>
            {isLoadingFiles ? (
              // Loading skeleton
              Array.from({ length: 12 }).map((_, index) => (
                <div
                  key={index}
                  className={`h-[37px] bg-gray-200 animate-pulse ${isSplit ? 'w-[90%]' : 'w-full'} rounded-lg`}
                />
              ))
            ) : driveFiles.length > 0 ? (
              // Real files from drive
              driveFiles.map((file) => (
                <Button
                  key={file.id}
                  variant="ghost"
                  className={`h-[37px] bg-[#e7e7e780] ${isSplit ? 'w-[90%]' : 'w-full'} rounded-lg px-3 py-2 flex items-center justify-start gap-2`}
                >
                  <img
                    className="w-6 h-6"
                    alt={`${file.type} icon`}
                    src={file.icon}
                    onError={(e) => {
                      // Fallback to default icon if specific icon fails to load
                      const target = e.target as HTMLImageElement;
                      target.src = "/workspace/file_icon.svg";
                    }}
                  />
                  <span className="font-medium text-[13px] text-[#1a1a1a] tracking-[-0.13px] leading-[18px] font-outfit truncate">
                    {file.name}
                  </span>
                </Button>
              ))
            ) : (
              // Empty state - show placeholder files
              Array.from({ length: 12 }).map((_, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className={`h-[37px] bg-[#e7e7e780] ${isSplit ? 'w-[90%]' : 'w-full'} rounded-lg px-3 py-2 flex items-center justify-start gap-2`}
                >
                  <img
                    className="w-6 h-6"
                    alt="file icon"
                    src="/workspace/file_icon.svg"
                  />
                  <span className="font-medium text-[13px] text-[#1a1a1a] tracking-[-0.13px] leading-[18px] font-outfit">
                    {index % 3 === 0 ? "Lecture" : index % 3 === 1 ? "Document" : "Note"} {index + 1}
                  </span>
                </Button>
              ))
            )}
          </div>
          {/* Upload progress */}
          <div className="flex items-center justify-end mt-4 gap-2 pr-[30px]">
            <Progress
              value={(fileCount / totalFileCount) * 100}
              className="w-[127px] h-2 bg-white border border-solid border-[#b1b1b1]"
            />
            <span className="font-normal text-[11px] text-[#403f3f] font-outfit">
              {fileCount}/{totalFileCount} Files Uploaded
            </span>
          </div>
        </div>
      </div>
    </div >
  );
};
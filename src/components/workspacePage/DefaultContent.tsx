import React, { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";

import {
  CloudIcon,
  FileText,
  PenTool,
  Search,
  SettingsIcon,
  UploadIcon,
  MessageSquare,
} from "lucide-react";
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

export const DefaultContent: React.FC<DefaultContentProps> = ({ isSplit, activeView, onViewChange }) => {
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

  // Data for lecture files
  const lectureFiles = [
    { id: 1, title: "Lecture 1", icon: "/workspace/file_icon.svg", type: "document" },
    { id: 2, title: "Lecture 2", icon: "/workspace/file_icon.svg", type: "document" },
    { id: 3, title: "Lecture 3", icon: "/workspace/file_icon.svg", type: "document" },
    { id: 4, title: "Lecture 4", icon: "/workspace/file_icon.svg", type: "document" },
    { id: 5, title: "Lecture 5", icon: "/workspace/file_icon.svg", type: "document" },
    { id: 6, title: "Lecture 6", icon: "/workspace/file_icon.svg", type: "document" },
    { id: 7, title: "Lecture 7", icon: "/workspace/file_icon.svg", type: "document" },
    { id: 8, title: "Lecture 8", icon: "/workspace/file_icon.svg", type: "document" },
    { id: 9, title: "Lecture 9", icon: "/workspace/file_icon.svg", type: "document" },
    { id: 10, title: "Lecture 10", icon: "/workspace/file_icon.svg", type: "document" },
    {
      id: 11,
      title: "Syllabus_UC",
      icon: "/workspace/file_icon.svg",
      type: "document",
    },
    {
      id: 12,
      title: "Schedule.jpg",
      icon: "/workspace/file_icon.svg",
      type: "image",
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

  // Render specific component based on activeView
  if (activeView === "deep-learn") {
    return <DeepLearn isSplit={isSplit} onBack={handleBackToDefault} onViewChange={onViewChange} />;
  }

  if (activeView === "deep-learn-response") {
    return <DeepLearnResponse isSplit={isSplit} onBack={handleBackToDefault} />;
  }

  if (activeView === "problem-help") {
    return <ProblemSolver onBack={handleBackToDefault} onViewChange={onViewChange} />;
  }

  if (activeView === "problem-help-response") {
    return <ProblemHelpResponse onBack={handleBackToDefault} />;
  }

  if (activeView === "document-chat") {
    return <DocumentChat isSplit={isSplit} onBack={handleBackToDefault} onViewChange={onViewChange} />;
  }

  if (activeView === "document-chat-response") {
    return <DocumentChatResponse isSplit={isSplit} onBack={handleBackToDefault} />;
  }

  if (activeView === "smart-note") {
    return <Note onBack={handleBackToDefault} onViewChange={onViewChange} />;
  }

  if (activeView === "smart-note-editor") {
    return <NoteEditor onBack={handleBackToDefault} />;
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
            {lectureFiles.map((file, index) => (
              <Button
                key={index}
                variant="ghost"
                className={`h-[37px] bg-[#e7e7e780] ${isSplit ? 'w-[90%]' : 'w-full'} rounded-lg px-3 py-2 flex items-center justify-start gap-2`}
              >
                <img
                  className="w-6 h-6"
                  alt={`${file.type} icon`}
                  src={file.icon}
                />
                <span className="font-medium text-[13px] text-[#1a1a1a] tracking-[-0.13px] leading-[18px] font-outfit">
                  {file.title}
                </span>
              </Button>
            ))}
          </div>
          {/* Upload progress */}
          <div className="flex items-center justify-end mt-4 gap-2 pr-[30px]">
            <Progress
              value={75}
              className="w-[127px] h-2 bg-white border border-solid border-[#b1b1b1]"
            />
            <span className="font-normal text-[11px] text-[#403f3f] font-outfit">
              20/100 Files Uploaded
            </span>
          </div>
        </div>
      </div>
    </div >
  );
};
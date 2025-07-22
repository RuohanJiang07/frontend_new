import React from "react";
import { useTabContext } from "@/pages/workspacePages/workspaceFrame/TabContext";



const aiTools = [
    {
        title: "Deep Learn",
        desc: "Your go-to place to study new concepts",
        tag: "AI-Chatbots",
        icon: "/workspace/default/deep-learn.svg",
        beta: true,
    },
    {
        title: "Document Chat",
        desc: "We explain long-heavy documents",
        tag: "AI-Chatbots",
        icon: "/workspace/default/document-chat.svg",
        beta: true,
    },
    {
        title: "Problem Help",
        desc: "It's ok to not understand every problem",
        tag: "AI-Chatbots",
        icon: "/workspace/default/problem-help.svg",
        beta: true,
    },
    {
        title: "Smart Note",
        desc: "Next generation of note taking",
        tag: "AI-Editors",
        icon: "/workspace/default/smart-note.svg",
        beta: true,
    },
];

const driveFolders = Array(9).fill("Lecture 1");

interface AiPoweredToolsProps {
    tabIdx?: number;
    pageIdx?: number;
    screenId?: string;
}

const AiPoweredTools: React.FC<AiPoweredToolsProps> = ({ tabIdx = 0, pageIdx = 0, screenId = '' }) => {
    const { switchToDeepLearn, switchToDocumentChat, switchToProblemHelp, switchToNote, switchToDrive } = useTabContext();

    const handleDeepLearnClick = () => {
        switchToDeepLearn(pageIdx, screenId, tabIdx);
    };

    const handleDocumentChatClick = () => {
        switchToDocumentChat(pageIdx, screenId, tabIdx);
    };

    const handleProblemHelpClick = () => {
        switchToProblemHelp(pageIdx, screenId, tabIdx);
    };

    const handleSmartNoteClick = () => {
        switchToNote(pageIdx, screenId, tabIdx);
    };

    const handleOpenDriveClick = () => {
        switchToDrive(pageIdx, screenId, tabIdx);
    };

    return (
        <div className="max-w-full flex flex-col items-center pt-20">
            <div>
                {/* AI-Powered Tools */}
                <div className="max-w-full  ">
                    <h2 className="text-[1.6rem] font-semibold text-[#00276C] mb-3">AI-Powered Tools</h2>
                    <div className="flex items-center mb-2 justify-between ">
                        <span className=" text-base  mr-5 text-[0.6rem]">AI-Chatbots</span>
                        <span className="text-[#00000099] text-base ml-6 text-[0.6rem] w-[144px]">AI-Editors</span>
                    </div>
                    <div className="flex gap-6 mb-10">
                        {aiTools.map((tool, idx) => (
                            <div
                                key={tool.title}
                                className={`flex flex-col items-start w-[138px] h-[131px] bg-[#F8F8F8] rounded-[14px] shadow-[0_3px_13px_0_rgba(0,0,0,0.07)] border border-[#ececec] px-3 py-4 relative ${
                                    tool.title === "Deep Learn" || tool.title === "Document Chat" || tool.title === "Problem Help" || tool.title === "Smart Note" ? "cursor-pointer hover:shadow-[0_5px_16px_0_rgba(0,0,0,0.1)] transition-shadow duration-200" : ""
                                }`}
                                onClick={
                                    tool.title === "Deep Learn" ? handleDeepLearnClick : 
                                    tool.title === "Document Chat" ? handleDocumentChatClick : 
                                    tool.title === "Problem Help" ? handleProblemHelpClick :
                                    tool.title === "Smart Note" ? handleSmartNoteClick :
                                    undefined
                                }
                            >
                                <div className="w-11 h-11 flex items-center justify-center mb-2">
                                    <img src={tool.icon} alt={tool.title} className="w-[53px] h-[54px] object-contain" />
                                </div>
                                <div className="font-semibold text-[14px] text-[#222] mb-1 ">
                                    {tool.title}
                                </div>
                                <div className="text-[#6B6B6B] text-[10px] leading-tight">{tool.desc}
                                    {tool.beta && (
                                        <span className="ml-1 px-1 py-0.5 bg-[#909FBB] text-[5px] rounded text-[#FFFFFF] font-medium">Learn more</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Workspace Drive */}
                <div className="max-w-full ">
                    <h2 className="text-[1.6rem] font-semibold text-[#00276C] mb-3">Workspace Drive</h2>
                    <div className="flex  justify-between max-w-full mb-5">
                        <div className=" text-base  mb-2 text-[#00000099]" >Recent</div>
                        <div className="flex items-center max-w-full justify-end">
                            <button className="flex items-center justify-center rounded mr-2 bg-[#ECECEC] border border-[#e0e0e0] h-6 px-3">
                                <img src="/workspace/default/default-settings.svg" alt="Settings" className="w-20 h-20" />
                            </button>
                            <button className="w-[140%] h-6 rounded bg-[#ECECEC] border border-[#e0e0e0] text-[#222] text-xs font-medium mr-2">Upload</button>
                            <button 
                                className="w-[200%] h-6 rounded bg-[#4C6694] text-white text-xs font-medium shadow cursor-pointer hover:bg-[#3a5a7a] transition-colors duration-200" 
                                onClick={handleOpenDriveClick}
                            >
                                Open Drive
                            </button>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-x-5 gap-y-3 mb-6">
                        {driveFolders.map((name, idx) => (
                            <div
                                key={idx}
                                className="flex items-center pt-[0.4rem] pb-[0.4rem] px-[0.6rem] rounded-lg border border-[#e0e0e0] bg-white text-[#515063] text-[12px] leading-[1.7] gap-3"
                            >
                                <img src="/workspace/default/default-folder.svg" alt="Folder" className="w-4 h-4" />
                                <span>
                                    {name}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center justify-end mt-2">
                        <div className="w-[176px] flex items-center">
                            <div className="flex-1 h-1 bg-[#e0e0e0] rounded-full mr-2 relative overflow-hidden">
                                <div className="absolute left-0 top-0 h-1 bg-[#1a2a4c] rounded-full" style={{ width: "20%" }} />
                            </div>
                            <span className="text-[10px] text-[#222]">20/100 Files Uploaded</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AiPoweredTools;
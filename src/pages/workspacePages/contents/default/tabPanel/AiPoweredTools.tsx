import React from "react";
import TextbookPng from "./images/Textbook.png"; // 如果配置了别名
import Book from "./images/Book.png"; // 如果配置了别名
import Evaluation from "./images/Evaluation.png"; // 如果配置了别名
import Presentation from "./images/Presentation.png"; // 如果配置了别名
const aiTools = [
    {
        title: "Deep Learn",
        desc: "Your go-to place to study new concepts",
        tag: "AI-Chatbots",
        icon: Presentation,
        beta: true,
    },
    {
        title: "Document Chat",
        desc: "We explain long-heavy documents for you",
        tag: "AI-Chatbots",
        icon: Book,
        beta: true,
    },
    {
        title: "Problem Help",
        desc: "It's ok to not understand every problem",
        tag: "AI-Chatbots",
        icon: Evaluation,
        beta: true,
    },
    {
        title: "Smart Note",
        desc: "Next generation of note taking",
        tag: "AI-Editors",
        icon: TextbookPng,
        beta: true,
    },
];

const driveFolders = Array(9).fill("Lecture 1");

const AiPoweredTools: React.FC = () => {
    return (
        <div className="max-w-full  flex flex-col items-center bg-white pt-12">
            <div>
                {/* AI-Powered Tools */}
                <div className="max-w-full  ">
                    <h2 className="text-[2rem] font-semibold text-[#00276C] mb-4">AI-Powered Tools</h2>
                    <div className="flex items-center mb-2 justify-between ">
                        <span className=" text-base  mr-6 text-[0.75rem]">AI-Chatbots</span>
                        <span className="text-[#00000099] text-base ml-8 text-[0.75rem] w-[180px]">AI-Editors</span>
                    </div>
                    <div className="flex gap-7 mb-12">
                        {aiTools.map((tool, idx) => (
                            <div
                                key={tool.title}
                                className="flex flex-col items-start w-[11.875rem] h-[164px] bg-[#F8F8F8] rounded-[18px] shadow-[0_4px_16px_0_rgba(0,0,0,0.07)] border border-[#ececec] px-4 py-5 relative"
                            >
                                <div className="w-14 h-14 flex items-center justify-center mb-3">
                                    {/* 用svg或img占位 */}
                                    <img src={tool.icon} alt={tool.title} className="w-[66px] h-[68px] object-contain" />
                                </div>
                                <div className="font-semibold text-[17px] text-[#222] mb-1 ">
                                    {tool.title}

                                </div>
                                <div className="text-[#6B6B6B] text-[12px] leading-tight">{tool.desc}
                                    {tool.beta && (
                                        <span className="ml-2 px-1.5 py-0.5 bg-[#909FBB] text-[6px] rounded text-[#FFFFFF] font-medium">Learn more</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Workspace Drive */}
                <div className="max-w-full ">
                    <h2 className="text-[2rem] font-semibold text-[#00276C] mb-4">Workspace Drive</h2>
                    <div className="flex  justify-between max-w-full mb-6">
                        <div className=" text-base  mb-2 text-[#00000099]" >Recent</div>
                        <div className="flex items-center max-w-full justify-end">
                            <button className=" flex items-center justify-center rounded  mr-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="33" height="32" viewBox="0 0 33 32" fill="none">
                                    <rect x="0.5" y="0.5" width="32" height="31" rx="7.5" fill="#F9F9F9" />
                                    <rect x="0.5" y="0.5" width="32" height="31" rx="7.5" stroke="#DBDBDB" />
                                    <path d="M17.5 19C18.8807 19 20 17.8807 20 16.5C20 15.1193 18.8807 14 17.5 14C16.1193 14 15 15.1193 15 16.5C15 17.8807 16.1193 19 17.5 19Z" stroke="#515063" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                    <path d="M23.3333 18.6667C23.2224 18.918 23.1893 19.1968 23.2383 19.4672C23.2873 19.7375 23.4162 19.9869 23.6083 20.1833L23.6583 20.2333C23.8133 20.3881 23.9362 20.5719 24.0201 20.7743C24.104 20.9766 24.1471 21.1935 24.1471 21.4125C24.1471 21.6315 24.104 21.8484 24.0201 22.0507C23.9362 22.2531 23.8133 22.4369 23.6583 22.5917C23.5035 22.7466 23.3197 22.8696 23.1174 22.9534C22.9151 23.0373 22.6982 23.0805 22.4792 23.0805C22.2601 23.0805 22.0433 23.0373 21.8409 22.9534C21.6386 22.8696 21.4548 22.7466 21.3 22.5917L21.25 22.5417C21.0536 22.3496 20.8042 22.2207 20.5338 22.1717C20.2635 22.1226 19.9847 22.1557 19.7333 22.2667C19.4869 22.3723 19.2767 22.5477 19.1286 22.7713C18.9805 22.9949 18.9011 23.2568 18.9 23.525V23.6667C18.9 24.1087 18.7244 24.5326 18.4118 24.8452C18.0993 25.1577 17.6754 25.3333 17.2333 25.3333C16.7913 25.3333 16.3674 25.1577 16.0548 24.8452C15.7423 24.5326 15.5667 24.1087 15.5667 23.6667V23.5917C15.5602 23.3158 15.4709 23.0483 15.3104 22.8239C15.1499 22.5995 14.9256 22.4286 14.6667 22.3333C14.4153 22.2224 14.1365 22.1893 13.8662 22.2383C13.5958 22.2873 13.3464 22.4162 13.15 22.6083L13.1 22.6583C12.9452 22.8133 12.7614 22.9362 12.5591 23.0201C12.3567 23.104 12.1399 23.1471 11.9208 23.1471C11.7018 23.1471 11.4849 23.104 11.2826 23.0201C11.0803 22.9362 10.8965 22.8133 10.7417 22.6583C10.5867 22.5035 10.4638 22.3197 10.3799 22.1174C10.296 21.9151 10.2529 21.6982 10.2529 21.4792C10.2529 21.2601 10.296 21.0433 10.3799 20.8409C10.4638 20.6386 10.5867 20.4548 10.7417 20.3L10.7917 20.25C10.9838 20.0536 11.1127 19.8042 11.1617 19.5338C11.2107 19.2635 11.1776 18.9847 11.0667 18.7333C10.961 18.4869 10.7856 18.2767 10.5621 18.1286C10.3385 17.9805 10.0765 17.9011 9.80833 17.9H9.66667C9.22464 17.9 8.80072 17.7244 8.48816 17.4118C8.17559 17.0993 8 16.6754 8 16.2333C8 15.7913 8.17559 15.3674 8.48816 15.0548C8.80072 14.7423 9.22464 14.5667 9.66667 14.5667H9.74167C10.0175 14.5602 10.285 14.4709 10.5094 14.3104C10.7338 14.1499 10.9048 13.9256 11 13.6667C11.1109 13.4153 11.144 13.1365 11.095 12.8662C11.046 12.5958 10.9171 12.3464 10.725 12.15L10.675 12.1C10.52 11.9452 10.3971 11.7614 10.3132 11.5591C10.2294 11.3567 10.1862 11.1399 10.1862 10.9208C10.1862 10.7018 10.2294 10.4849 10.3132 10.2826C10.3971 10.0803 10.52 9.89645 10.675 9.74167C10.8298 9.58671 11.0136 9.46377 11.2159 9.3799C11.4183 9.29603 11.6351 9.25286 11.8542 9.25286C12.0732 9.25286 12.2901 9.29603 12.4924 9.3799C12.6947 9.46377 12.8785 9.58671 13.0333 9.74167L13.0833 9.79167C13.2797 9.98378 13.5292 10.1127 13.7995 10.1617C14.0698 10.2107 14.3487 10.1776 14.6 10.0667H14.6667C14.9131 9.96103 15.1233 9.78563 15.2714 9.56205C15.4195 9.33848 15.4989 9.07649 15.5 8.80833V8.66667C15.5 8.22464 15.6756 7.80072 15.9882 7.48816C16.3007 7.17559 16.7246 7 17.1667 7C17.6087 7 18.0326 7.17559 18.3452 7.48816C18.6577 7.80072 18.8333 8.22464 18.8333 8.66667V8.74167C18.8344 9.00982 18.9139 9.27181 19.0619 9.49539C19.21 9.71896 19.4202 9.89436 19.6667 10C19.918 10.1109 20.1968 10.144 20.4672 10.095C20.7375 10.046 20.9869 9.91711 21.1833 9.725L21.2333 9.675C21.3881 9.52004 21.5719 9.39711 21.7743 9.31323C21.9766 9.22936 22.1935 9.18619 22.4125 9.18619C22.6315 9.18619 22.8484 9.22936 23.0507 9.31323C23.2531 9.39711 23.4369 9.52004 23.5917 9.675C23.7466 9.82979 23.8696 10.0136 23.9534 10.2159C24.0373 10.4183 24.0805 10.6351 24.0805 10.8542C24.0805 11.0732 24.0373 11.2901 23.9534 11.4924C23.8696 11.6947 23.7466 11.8785 23.5917 12.0333L23.5417 12.0833C23.3496 12.2797 23.2207 12.5292 23.1717 12.7995C23.1226 13.0698 23.1557 13.3487 23.2667 13.6V13.6667C23.3723 13.9131 23.5477 14.1233 23.7713 14.2714C23.9949 14.4195 24.2568 14.4989 24.525 14.5H24.6667C25.1087 14.5 25.5326 14.6756 25.8452 14.9882C26.1577 15.3007 26.3333 15.7246 26.3333 16.1667C26.3333 16.6087 26.1577 17.0326 25.8452 17.3452C25.5326 17.6577 25.1087 17.8333 24.6667 17.8333H24.5917C24.3235 17.8344 24.0615 17.9139 23.8379 18.0619C23.6144 18.21 23.439 18.4202 23.3333 18.6667Z" stroke="#515063" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                </svg>                           </button>
                            <button className="w-28 h-8 rounded bg-[#ECECEC] border border-[#e0e0e0] text-[#222] text-sm font-medium mr-3">Upload</button>
                            <button className="w-32 h-8 rounded bg-[#4C6694] text-white text-sm font-medium shadow ">Open Drive</button>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-x-6 gap-y-4 mb-8">
                        {driveFolders.map((name, idx) => (
                            <div
                                key={idx}
                                className="flex items-center pt-[0.5rem] pb-[0.5rem] px-[0.75rem] rounded-lg border border-[#e0e0e0] bg-white text-[#515063] text-[15px] leading-[1.7] gap-4"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="16" viewBox="0 0 20 16" fill="none">
                                    <path d="M16.9734 15.9469H3.02344C1.74844 15.9469 0.773438 14.8969 0.773438 13.6969V2.29687C0.773438 1.02187 1.82344 0.046875 3.02344 0.046875H6.02344C7.29844 0.046875 8.27344 1.09687 8.27344 2.29687V2.89687C8.27344 3.04687 8.42344 3.12187 8.49844 3.12187H16.8234C18.0984 3.12187 19.0734 4.17188 19.0734 5.37187V13.6219C19.2234 14.8969 18.1734 15.9469 16.9734 15.9469ZM3.02344 1.54688C2.57344 1.54688 2.27344 1.92187 2.27344 2.29687V13.6219C2.27344 14.0719 2.64844 14.3719 3.02344 14.3719H16.8984C17.3484 14.3719 17.6484 13.9969 17.6484 13.6219V5.37187C17.6484 4.92188 17.2734 4.62187 16.8984 4.62187H8.57344C7.59844 4.62187 6.84844 3.79687 6.84844 2.89687V2.29687C6.84844 1.84687 6.47344 1.54688 6.09844 1.54688H3.02344Z" fill="#515063" />
                                </svg>
                                <span>
                                    {name}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center justify-end mt-2">
                        <div className="w-[220px] flex items-center">
                            <div className="flex-1 h-1 bg-[#e0e0e0] rounded-full mr-2 relative overflow-hidden">
                                <div className="absolute left-0 top-0 h-1 bg-[#1a2a4c] rounded-full" style={{ width: "20%" }} />
                            </div>
                            <span className="text-xs text-[#222]">20/100 Files Uploaded</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AiPoweredTools;
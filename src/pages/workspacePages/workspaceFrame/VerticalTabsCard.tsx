import React, { useState } from 'react';
import { Expand, Maximize, Maximize2, PlusIcon, X } from 'lucide-react';
import { useTabContext } from './TabContext';
import AiPoweredTools from '../contents/default/tabPanel/AiPoweredTools';


interface TabContextItem {
    tab: string;
    components: React.ReactNode;
}

interface VerticalTabsCardProps {
    data: TabContextItem[];
    pageIdx?: number;
    position?: 'left' | 'right';
    showFullscreen?: boolean;
    isFullscreen?: boolean;
    onFullscreen?: () => void;
    onClose?: () => void;
    disableClose?: boolean;
    onlyShowTabList?: boolean; // 新增
    disabledTabList?: boolean; // 新增
    isRight?: boolean; // 是否是右侧tab
}

const VerticalTabsCard: React.FC<VerticalTabsCardProps> = ({
    data,
    isRight = false,
    position = 'left',
    showFullscreen = false,
    isFullscreen = false,
    onFullscreen,
    onClose,
    disableClose = false,
    onlyShowTabList = false, // 新增
    disabledTabList = false,
}) => {
    const [activeIdx, setActiveIdx] = useState(0);
    const { addTab, removeTab, activePage } = useTabContext();

    // 关闭tab
    const handleClose = (e: React.MouseEvent, idx: number) => {
        e.stopPropagation();
        removeTab(activePage, position, idx);
        // 若关闭的是当前激活tab，激活前一个
        if (activeIdx === idx) {
            setActiveIdx(Math.max(0, activeIdx - 1));
        } else if (activeIdx > idx) {
            setActiveIdx(activeIdx - 1);
        }
    };

    // 新增tab
    const handleAdd = () => {
        const newTab = {
            tab: `Tab${data.length + 1}`,
            components: <AiPoweredTools />,
            tabList: [],
        };
        addTab(activePage, position, newTab);
        setActiveIdx(data.length); // 激活新加的tab
    };
    console.log(onlyShowTabList);


    return (
        <div className={`flex max-h-screen bg-[#f7f6f6] relative  transition-all duration-500 ${isRight ? 'gap-2' : ""}`}>
            {/* 左侧竖排tab */}
            <aside className="flex flex-col items-center py-4 bg-transparent">
                <div className="flex flex-col gap-2 w-full items-center">
                    {data.map((item, idx) => (
                        <div
                            key={item.tab + idx}
                            className={`relative flex flex-col items-end w-full`}
                        >
                            <div
                                className={`flex flex-col items-center justify-center w-10 h-14 rounded-tl-[10px] rounded-bl-[10px] transition
                                ${activeIdx === idx
                                        ? 'bg-[#FFFFFF] text-[#1a2a4c]'
                                        : 'bg-[#e5e5e5] text-[#1a2a4c]'}
                                ${disabledTabList ? 'opacity-50 pointer-events-none cursor-not-allowed' : ''}
                                `}
                                style={{
                                    marginTop: idx === 0 ? 0 : 0,
                                    paddingTop: 2,
                                    height: "88px",
                                    width: "28px",
                                    paddingBottom: 2,
                                    position: 'relative',
                                    gap: '4px',
                                }}
                                onClick={() => !disabledTabList && setActiveIdx(idx)}
                            >
                                {/* 关闭按钮 */}
                                {!disabledTabList && (
                                    <span
                                        className="top-1 right-1 w-4 h-4 flex items-center justify-center text-[#222] opacity-70 hover:opacity-100 cursor-pointer"
                                        onClick={e => handleClose(e, idx)}
                                        style={{ fontSize: 12 }}
                                    >
                                        <X className="w-3 h-3" />
                                    </span>
                                )}
                                <span
                                    className="text-[12px] select-none"
                                    style={{
                                        writingMode: 'vertical-rl',
                                        transform: 'rotate(180deg)',
                                        letterSpacing: '0.05em',
                                    }}
                                >
                                    {item.tab}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
                {/* 加号按钮 */}
                <button
                    className="mt-2 w-7 h-7 flex items-center justify-center rounded text-[#b0b0b0] hover:bg-[#f0f0f0] transition"
                    onClick={handleAdd}
                    disabled={disabledTabList}
                    style={disabledTabList ? { opacity: 0.5, pointerEvents: 'none', cursor: 'not-allowed' } : {}}
                >
                    <PlusIcon className="w-5 h-5" />
                </button>
            </aside>

            {/* 右上角全屏和关闭按钮 */}
            {showFullscreen && !onlyShowTabList && (
                <div className="absolute top-4 right-6 flex gap-2 z-20 items-center">
                    {/* 全屏按钮：半屏时渐显，全屏时渐隐 */}
                    <button
                        className={`w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#e0e0e0] transition-opacity duration-500
              `}
                        onClick={onFullscreen}
                        title="全屏"
                    >
                        {
                            isFullscreen ? <Maximize /> : <Expand />
                        }
                    </button>
                    {/* 关闭按钮：全屏时渐显，半屏时渐隐 */}
                    {!disableClose && (
                        <button
                            className={`w-6 h-6 flex items-center justify-center rounded-full bg-[#FF5F56] hover:bg-[#ff7b72] transition-opacity duration-500 border border-[#FF5F56] shadow
                   `}
                            onClick={onClose}
                            title="关闭分屏"
                        >
                            <span className="w-4 h-4 flex items-center justify-center text-white">
                                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="4" y1="4" x2="12" y2="12" stroke="white" />
                                    <line x1="12" y1="4" x2="4" y2="12" stroke="white" />
                                </svg>
                            </span>
                        </button>
                    )}
                </div>
            )}

            {/* 右侧内容区 */}
            {(
                <main className="flex-1 h-[55rem] flex flex-col items-center transition-all duration-500 min-w-[900px]">
                    <div className=" w-full flex-1 bg-white rounded-2xl shadow p-4 ">
                        {data[activeIdx]?.components}
                    </div>
                </main>
            )}
        </div>
    );
};

export default VerticalTabsCard;
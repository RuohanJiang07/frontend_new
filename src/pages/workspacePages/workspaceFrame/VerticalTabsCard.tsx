import React, { useState } from 'react';
import { Expand, Maximize, PlusIcon, X } from 'lucide-react';
import { useTabContext, TabContextItem } from './TabContext';
import AiPoweredTools from '../contents/default/tabPanel/AiPoweredTools';

interface VerticalTabsCardProps {
    data: TabContextItem[];
    screenId: string;
    showFullscreen?: boolean;
    isFullscreen?: boolean;
    onFullscreen?: () => void;
    onClose?: () => void;
    disableClose?: boolean;
    onlyShowTabList?: boolean;
    disabledTabList?: boolean;
    isCollapsed?: boolean; // Whether this screen is collapsed (minimized)
}

const VerticalTabsCard: React.FC<VerticalTabsCardProps> = ({
    data,
    screenId,
    showFullscreen = false,
    isFullscreen = false,
    onFullscreen,
    onClose,
    disableClose = false,
    onlyShowTabList = false,
    disabledTabList = false,
    isCollapsed = false,
}) => {
    const [activeIdx, setActiveIdx] = useState(0);
    const { addTab, removeTab, activePage } = useTabContext();

    // Close tab
    const handleClose = (e: React.MouseEvent, idx: number) => {
        e.stopPropagation();
        removeTab(activePage, screenId, idx);
        // If closing the currently active tab, activate the previous one
        if (activeIdx === idx) {
            setActiveIdx(Math.max(0, activeIdx - 1));
        } else if (activeIdx > idx) {
            setActiveIdx(activeIdx - 1);
        }
    };

    // Add new tab
    const handleAdd = () => {
        const newTab: TabContextItem = {
            tab: `Tab${data.length + 1}`,
            components: <AiPoweredTools />,
            tabList: [],
        };
        addTab(activePage, screenId, newTab);
        setActiveIdx(data.length); // Activate the newly added tab
    };

    // When onlyShowTabList is true, show only the vertical tab list
    if (onlyShowTabList) {
        return (
            <div className="flex max-h-screen bg-[#f7f6f6] relative transition-all duration-500">
                {/* Left vertical tabs */}
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
                                            ? 'bg-[#f0f0f0] text-[#666666]'
                                            : 'bg-[#e0e0e0] text-[#999999]'}
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
                                    {/* Close button */}
                                    {!disabledTabList && (
                                        <span
                                            className="top-1 right-1 w-4 h-4 flex items-center justify-center text-[#666] opacity-50 hover:opacity-70 cursor-pointer"
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
                    {/* Plus button */}
                    <button
                        className="mt-2 w-7 h-7 flex items-center justify-center rounded text-[#999999] hover:bg-[#e0e0e0] transition"
                        onClick={handleAdd}
                        disabled={disabledTabList}
                        style={disabledTabList ? { opacity: 0.5, pointerEvents: 'none', cursor: 'not-allowed' } : {}}
                    >
                        <PlusIcon className="w-5 h-5" />
                    </button>
                </aside>
            </div>
        );
    }

    return (
        <div className={`flex max-h-screen bg-[#f7f6f6] relative transition-all duration-500`}>
            {/* Left vertical tabs */}
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
                                {/* Close button */}
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
                {/* Plus button */}
                <button
                    className="mt-2 w-7 h-7 flex items-center justify-center rounded text-[#b0b0b0] hover:bg-[#f0f0f0] transition"
                    onClick={handleAdd}
                    disabled={disabledTabList}
                    style={disabledTabList ? { opacity: 0.5, pointerEvents: 'none', cursor: 'not-allowed' } : {}}
                >
                    <PlusIcon className="w-5 h-5" />
                </button>
            </aside>

            {/* Top-right fullscreen and close buttons */}
            {showFullscreen && !onlyShowTabList && (
                <div className="absolute top-4 right-6 flex gap-2 z-20 items-center">
                    {/* Fullscreen button: fade in when split, fade out when fullscreen */}
                    <button
                        className={`w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#e0e0e0] transition-opacity duration-500`}
                        onClick={onFullscreen}
                        title="Fullscreen"
                    >
                        {isFullscreen ? (
                            <img src="/workspace/workspaceFrame/minimize.svg" alt="Minimize" className="w-6 h-6" />
                        ) : (
                            <img src="/workspace/workspaceFrame/maximize.svg" alt="Maximize" className="w-6 h-6" />
                        )}
                    </button>
                    {/* Close button: fade in when fullscreen, fade out when split */}
                    {!disableClose && (
                        <button
                            className={`w-6 h-6 flex items-center justify-center rounded-full bg-[#FF5F56] hover:bg-[#ff7b72] transition-opacity duration-500 border border-[#FF5F56] shadow`}
                            onClick={onClose}
                            title="Close split screen"
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

            {/* Right content area */}
            {!isCollapsed && (
                <main className="flex-1 flex flex-col items-center transition-all duration-500 min-h-0">
                    <div className="w-full bg-white rounded-2xl shadow p-4 overflow-y-auto" style={{ height: 'calc(100vh - 6rem)', marginBottom: '0.5rem' }}>
                        {data[activeIdx]?.components}
                    </div>
                </main>
            )}
        </div>
    );
};

export default VerticalTabsCard;
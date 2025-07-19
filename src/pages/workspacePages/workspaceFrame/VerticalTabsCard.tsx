import React, { useState, useEffect } from 'react';
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
    isSplitMode?: boolean; // Whether this is in split screen mode
    isAnimating?: boolean; // Whether any animation is in progress
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
    isSplitMode = false,
    isAnimating = false,
}) => {
    const { addTab, removeTab, activePage } = useTabContext();
    const [activeIdx, setActiveIdx] = useState(0);

    // Ensure activeIdx is always valid when data changes
    useEffect(() => {
        if (activeIdx >= data.length && data.length > 0) {
            setActiveIdx(data.length - 1);
        }
    }, [data.length, activeIdx]);

    const handleClose = (e: React.MouseEvent, idx: number) => {
        e.stopPropagation();
        if (data.length > 1) {
            let newActiveIdx = activeIdx;
            
            // If we're closing the active tab
            if (idx === activeIdx) {
                // If it's the last tab, go to the previous one
                if (idx === data.length - 1) {
                    newActiveIdx = idx - 1;
                } else {
                    // Otherwise, stay at the same index (next tab will shift up)
                    newActiveIdx = idx;
                }
            } else if (idx < activeIdx) {
                // If we're closing a tab before the active one, adjust the index
                newActiveIdx = activeIdx - 1;
            }
            // If we're closing a tab after the active one, no change needed
            
            setActiveIdx(newActiveIdx);
            // Remove tab from the context
            removeTab(activePage, screenId, idx);
        }
    };

    const handleAdd = () => {
        addTab(activePage, screenId, { tab: "New Tab", components: <AiPoweredTools />, tabList: [] });
        // Switch to the newly created tab (it will be the last tab in the list)
        setActiveIdx(data.length);
    };

    // Show only tab list when collapsed
    if (onlyShowTabList) {
        return (
            <div className="flex max-h-screen bg-[#f7f6f6] relative transition-all duration-500">
                <aside className="flex flex-col items-center bg-transparent" style={{ paddingLeft: '6px', paddingTop: '25px' }}>
                    <div className="flex flex-col w-full items-center" style={{ gap: '9px' }}>
                        {data.map((item, idx) => (
                            <div
                                key={item.tab + idx}
                                className={`relative flex flex-col items-end w-full`}
                            >
                                <div
                                    className={`flex flex-col items-start transition
                                    ${activeIdx === idx
                                            ? 'bg-[#FFFFFF] text-[#1a2a4c]'
                                            : 'bg-[#e5e5e5] text-[#1a2a4c]'}
                                    ${disabledTabList ? 'opacity-50 pointer-events-none cursor-not-allowed' : ''}
                                    `}
                                    style={{
                                        display: 'flex',
                                        width: '28px',
                                        padding: '8px 6px',
                                        flexDirection: 'column',
                                        alignItems: 'flex-start',
                                        gap: '8px',
                                        flexShrink: 0,
                                        maxHeight: '130px',
                                        borderRadius: '10px 0 0 10px',
                                        cursor: 'pointer',
                                    }}
                                    onClick={() => !disabledTabList && setActiveIdx(idx)}
                                >
                                    {/* Close button */}
                                    {!disabledTabList && (
                                        <span
                                            className="flex items-center justify-center text-[#666] opacity-50 hover:opacity-70 cursor-pointer"
                                            onClick={e => handleClose(e, idx)}
                                            style={{ width: '14px', height: '14px' }}
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </span>
                                    )}
                                    <span
                                        className="select-none overflow-hidden"
                                        style={{
                                            color: '#000',
                                            fontFamily: 'Inter',
                                            fontSize: '12px',
                                            fontStyle: 'normal',
                                            fontWeight: 400,
                                            lineHeight: 'normal',
                                            writingMode: 'vertical-rl',
                                            transform: 'rotate(180deg)',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                            maxHeight: 'calc(130px - 16px - 14px - 8px)', // 减去padding(16px)、关闭按钮(14px)和gap(8px)
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
                        className="flex items-center justify-center rounded text-[#999999] hover:bg-[#e0e0e0] transition"
                        onClick={handleAdd}
                        disabled={disabledTabList}
                        style={{
                            width: '17px',
                            height: '17px',
                            marginTop: '6px',
                            ...(disabledTabList ? { opacity: 0.5, pointerEvents: 'none', cursor: 'not-allowed' } : {})
                        }}
                    >
                        <PlusIcon className="w-4 h-4" />
                    </button>
                </aside>
            </div>
        );
    }

    return (
        <div className={`flex max-h-screen bg-[#f7f6f6] relative transition-all duration-500`}>
            {/* Left vertical tabs */}
            <aside className="flex flex-col items-center bg-transparent" style={{ paddingLeft: isSplitMode ? '6px' : '15px', paddingTop: '25px' }}>
                <div className="flex flex-col w-full items-center" style={{ gap: '9px' }}>
                    {data.map((item, idx) => (
                        <div
                            key={item.tab + idx}
                            className={`relative flex flex-col items-end w-full`}
                        >
                            <div
                                className={`flex flex-col items-start transition
                                ${activeIdx === idx
                                        ? 'bg-[#FFFFFF] text-[#1a2a4c]'
                                        : 'bg-[#e5e5e5] text-[#1a2a4c]'}
                                ${disabledTabList ? 'opacity-50 pointer-events-none cursor-not-allowed' : ''}
                                `}
                                style={{
                                    display: 'flex',
                                    width: '28px',
                                    padding: '8px 6px',
                                    flexDirection: 'column',
                                    alignItems: 'flex-start',
                                    gap: '8px',
                                    flexShrink: 0,
                                    maxHeight: '130px',
                                    borderRadius: '10px 0 0 10px',
                                    cursor: 'pointer',
                                }}
                                onClick={() => !disabledTabList && setActiveIdx(idx)}
                            >
                                {/* Close button */}
                                {!disabledTabList && (
                                    <span
                                        className="flex items-center justify-center text-[#222] opacity-70 hover:opacity-100 cursor-pointer"
                                        onClick={e => handleClose(e, idx)}
                                        style={{ width: '14px', height: '14px' }}
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </span>
                                )}
                                <span
                                    className="select-none overflow-hidden"
                                    style={{
                                        color: '#000',
                                        fontFamily: 'Inter',
                                        fontSize: '12px',
                                        fontStyle: 'normal',
                                        fontWeight: 400,
                                        lineHeight: 'normal',
                                        writingMode: 'vertical-rl',
                                        transform: 'rotate(180deg)',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        maxHeight: 'calc(130px - 16px - 14px - 8px)', // 减去padding(16px)、关闭按钮(14px)和gap(8px)
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
                    className="flex items-center justify-center rounded text-[#b0b0b0] hover:bg-[#f0f0f0] transition"
                    onClick={handleAdd}
                    disabled={disabledTabList}
                    style={{
                        width: '17px',
                        height: '17px',
                        marginTop: '6px',
                        ...(disabledTabList ? { opacity: 0.5, pointerEvents: 'none', cursor: 'not-allowed' } : {})
                    }}
                >
                    <PlusIcon className="w-4 h-4" />
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
                <main className="flex-1 flex flex-col transition-all duration-500">
                    <div 
                        className="bg-white p-4" 
                        style={{ 
                            // COMPLETELY NEW WIDTH CALCULATION LOGIC
                            width: isAnimating 
                                ? 'calc(100% - 6px - 28px)' // 动画期间：frame宽度减去gap(6px)和tab宽度(28px)
                                : (isSplitMode 
                                    ? (isFullscreen 
                                        ? 'calc(100vw - 43px - 34px)' // 全屏模式：全部宽度减去当前tabs列(43px)和折叠的tabs列(34px)
                                        : 'calc((100vw - 5px) / 2 - 6px - 28px)') // 分屏模式：(屏幕宽度-5px)/2减去tabs列left padding(6px)和tab宽度(28px)
                                    : 'calc(100vw - 43px - 12px - 45px)'), // 单屏模式：屏幕宽度减去tabs列(43px) - gap(12px) - create split screen区域(45px)
                            height: 'calc(99.9vh - 88px)', // 99.9%屏幕高度减去header高度(约88px)
                            flexShrink: 0,
                            borderRadius: '16px',
                            background: '#FFF',
                            boxShadow: '0px 1px 20px 0px rgba(25, 90, 148, 0.10)',
                            marginLeft: '0',
                            alignSelf: 'flex-start', // 左对齐，紧贴tabs列
                            transition: 'width 300ms ease-in-out' // Add transition for width changes
                        }}
                    >
                        {data[activeIdx]?.components}
                    </div>
                </main>
            )}
        </div>
    );
};

export default VerticalTabsCard;
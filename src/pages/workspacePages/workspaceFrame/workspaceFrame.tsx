import React, { useState } from 'react';
import { useTabContext } from './TabContext';
import WorkspaceHeader from './WorkspaceHeader';
import VerticalTabsCard from './VerticalTabsCard';

const ANIMATION_DURATION = 300; // ms

const WorkspaceFrame: React.FC = () => {
    const { 
        pages, 
        activePage, 
        createSplitScreen, 
        closeSplitScreen, 
        toggleFullscreen,
        getActiveScreens 
    } = useTabContext();

    const page = pages[activePage];
    const activeScreens = getActiveScreens(activePage);
    const hasMultipleScreens = activeScreens.length > 1;

    // Animation states
    const [splitting, setSplitting] = useState(false);
    const [closingSplit, setClosingSplit] = useState(false);
    const [closingScreenId, setClosingScreenId] = useState<string | null>(null);
    const [togglingFullscreen, setTogglingFullscreen] = useState(false);
    const [expandingScreenId, setExpandingScreenId] = useState<string | null>(null);

    if (!page) return null;

    // COMPLETELY NEW LAYOUT LOGIC
    const getPanelStyle = (screen: any) => {
        const baseStyle = {
            transition: 'all 300ms ease-in-out',
            minWidth: '0',
            maxWidth: '100%',
            overflow: 'hidden'
        };
        
        const hasFullscreenScreen = activeScreens.some(s => s.state === 'full-screen');
        const isRightScreen = screen.state === 'split-right' || 
                             (activeScreens.length === 2 && activeScreens.indexOf(screen) === 1);
        const isExpanding = expandingScreenId === screen.id;
        const isOtherScreen = expandingScreenId && expandingScreenId !== screen.id;
        
        // Case 1: Closing entire split (when one screen is fullscreen)
        if (closingSplit && !closingScreenId) {
            if (screen.state === 'full-screen') {
                return {
                    ...baseStyle,
                    width: '0%',
                    opacity: 0,
                    zIndex: 30
                };
            } else {
                return {
                    ...baseStyle,
                    width: '100%',
                    zIndex: 20
                };
            }
        }
        
        // Case 2: Closing one screen (when screens are split 50/50)
        if (closingSplit && closingScreenId) {
            if (closingScreenId === screen.id) {
                const isLeftScreen = screen.state === 'split-left';
                return {
                    ...baseStyle,
                    width: '0%',
                    transform: isLeftScreen ? 'translateX(-100%)' : 'translateX(100%)',
                    zIndex: 30
                };
            } else {
                return {
                    ...baseStyle,
                    width: '100%',
                    zIndex: 20
                };
            }
        }
        
        // Case 3: NEW EXPANSION LOGIC - Draggable divider behavior
        if (expandingScreenId && hasMultipleScreens) {
            if (isExpanding) {
                // The expanding screen takes full width minus the collapsed screen width
                return {
                    ...baseStyle,
                    width: 'calc(100% - 34px)', // Full width minus collapsed screen (34px for gap + tab)
                    zIndex: 20
                };
            } else if (isOtherScreen) {
                // The collapsed screen shows only tab bar
                return {
                    ...baseStyle,
                    width: '34px', // Just enough for gap (6px) + tab bar (28px)
                    zIndex: 10
                };
            }
        }
        
        // Normal states
        if (screen.state === 'full-screen') {
            return {
                ...baseStyle,
                width: '100%',
                zIndex: 20
            };
        }
        
        // When there's a fullscreen screen, smoothly collapse others
        if (hasFullscreenScreen && screen.state !== 'full-screen') {
            return {
                ...baseStyle,
                width: '34px', // Just enough for gap (6px) + tab bar (28px)
                zIndex: 10
            };
        }
        
        // Normal split state (50/50) - ensure smooth transition
        if (screen.state === 'split-left' || screen.state === 'split-right') {
            return {
                ...baseStyle,
                width: '50%'
            };
        }
        
        // Default state
        return {
            ...baseStyle,
            width: '100%'
        };
    };

    // Check if screen is fullscreen
    const isScreenFullscreen = (screen: any) => {
        return screen.state === 'full-screen';
    };

    // Check if screen should show only tab list
    const shouldShowOnlyTabList = (screen: any) => {
        if (closingSplit && !closingScreenId && screen.state !== 'full-screen') {
            return false;
        }
        return activeScreens.some(s => s.state === 'full-screen' && s.id !== screen.id);
    };

    // Check if screen is collapsed
    const isScreenCollapsed = (screen: any) => {
        if (closingSplit && !closingScreenId && screen.state !== 'full-screen') {
            return false;
        }
        return activeScreens.some(s => s.state === 'full-screen' && s.id !== screen.id);
    };

    // Check if tab list should be disabled
    const isTabListDisabled = () => {
        return splitting || closingSplit || togglingFullscreen || expandingScreenId !== null;
    };

    // Create split screen animation
    const handleCreateSplit = () => {
        setSplitting(true);
        createSplitScreen(activePage);
        setTimeout(() => {
            setSplitting(false);
        }, ANIMATION_DURATION);
    };

    // Close split screen - handle different cases
    const handleCloseSplit = (screenId: string) => {
        const targetScreen = activeScreens.find(s => s.id === screenId);
        if (!targetScreen) return;

        // Case 1: Close entire split (when one screen is fullscreen)
        if (targetScreen.state === 'full-screen' && hasMultipleScreens) {
            setClosingSplit(true);
            setTimeout(() => {
                closeSplitScreen(activePage, screenId);
                setClosingSplit(false);
            }, ANIMATION_DURATION);
        } 
        // Case 2: Close one screen (when screens are split 50/50)
        else if (targetScreen.state === 'split-left' || targetScreen.state === 'split-right') {
            setClosingSplit(true);
            setClosingScreenId(screenId);
            setTimeout(() => {
                closeSplitScreen(activePage, screenId);
                setClosingSplit(false);
                setClosingScreenId(null);
            }, ANIMATION_DURATION);
        }
    };

    // Handle fullscreen toggle with proper animation
    const handleFullscreenToggle = (screenId: string) => {
        const targetScreen = activeScreens.find(s => s.id === screenId);
        if (!targetScreen) return;

        // If already fullscreen, toggle back to split mode
        if (targetScreen.state === 'full-screen') {
            setTogglingFullscreen(true);
            toggleFullscreen(activePage, screenId);
            setTimeout(() => {
                setTogglingFullscreen(false);
            }, ANIMATION_DURATION);
        } else {
            // Progressive expansion animation
            setExpandingScreenId(screenId);
            setTimeout(() => {
                toggleFullscreen(activePage, screenId);
                setExpandingScreenId(null);
            }, ANIMATION_DURATION);
        }
    };

    // Check if any screen is in fullscreen mode
    const hasFullscreenScreen = activeScreens.some(screen => screen.state === 'full-screen');
    
    return (
        <div className="flex bg-[#f7f6f6] relative">
            <div className="flex-1 flex flex-col">
                <WorkspaceHeader />
                <main className="flex-1 flex flex-col max-w-full relative" style={{ paddingTop: '6px' }}>
                    {/* Split Screen Panel - 总管分屏逻辑 */}
                    <div className="flex min-w-0 relative max-w-full" style={{ 
                        marginRight: hasMultipleScreens ? '5px' : '0', // 分屏状态下，整个frame距离屏幕右边缘有5px gap
                        transition: 'all 300ms ease-in-out'
                    }}>
                        {/* Render all active screens */}
                        {activeScreens.map((screen) => (
                            <div key={screen.id} style={getPanelStyle(screen)}>
                                <VerticalTabsCard
                                    data={screen.tabList}
                                    screenId={screen.id}
                                    showFullscreen={hasMultipleScreens && !closingSplit}
                                    isFullscreen={isScreenFullscreen(screen)}
                                    onFullscreen={() => handleFullscreenToggle(screen.id)}
                                    onClose={() => handleCloseSplit(screen.id)}
                                    disableClose={!hasMultipleScreens}
                                    onlyShowTabList={shouldShowOnlyTabList(screen)}
                                    disabledTabList={isTabListDisabled()}
                                    isCollapsed={isScreenCollapsed(screen)}
                                    isSplitMode={hasMultipleScreens} // 传递分屏状态
                                    isAnimating={splitting || closingSplit || togglingFullscreen || expandingScreenId !== null} // 传递动画状态
                                />
                            </div>
                        ))}
                        
                        {/* Split screen creation button - only show when no split */}
                        {!hasMultipleScreens && (
                            <div style={{ 
                                position: 'absolute', 
                                right: '0', 
                                top: '0', // 与white container完全对齐，不需要top padding
                                width: '45px',
                                height: 'calc(99.9vh - 88px)', // 与white container相同高度
                                zIndex: 50 // 确保在最上层
                            }}>
                                {/* 17px矩形背景 - 最右侧 */}
                                <div style={{
                                    width: '17px',
                                    height: '100%',
                                    borderRadius: '30px 0px 0px 30px',
                                    border: '1px dashed #898989',
                                    borderRight: 'none', // 右侧边不要有stroke
                                    backgroundColor: 'transparent',
                                    position: 'absolute',
                                    right: '0',
                                    top: '0',
                                    zIndex: 1 // 在底层
                                }}></div>
                                
                                {/* Create Split Screen按钮 - 在17px矩形左侧，有1px重叠 */}
                                <button
                                    style={{
                                        writingMode: 'vertical-lr',
                                        letterSpacing: '0.08em',
                                        fontWeight: 500,
                                        fontSize: 12,
                                        color: '#898989',
                                        height: 140,
                                        width: '28px', // 45px - 17px = 28px
                                        border: '1px dashed #898989',
                                        borderLeft: 'none', // 视觉上的右侧边不要有stroke（因为rotate(180deg)）
                                        borderRight: '1px dashed #898989', // 视觉上的左侧边有stroke
                                        borderRadius: '0px 6px 6px 0px', // 右边两个角有圆角（因为transform: rotate(180deg)）
                                        backgroundColor: '#F3F3F3',
                                        transform: 'rotate(180deg)',
                                        cursor: 'pointer',
                                        position: 'absolute',
                                        right: '16px', // 在17px矩形左侧，往右1px（17px - 1px = 16px）
                                        top: '25px', // 距离顶部25px，与white container内容区域对齐
                                        zIndex: 10 // 确保在重叠的上方
                                    }}
                                    onClick={handleCreateSplit}
                                >
                                    Create Split Screen
                                </button>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default WorkspaceFrame; 
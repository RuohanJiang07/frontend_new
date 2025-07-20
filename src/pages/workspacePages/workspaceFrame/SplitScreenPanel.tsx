import React, { useState } from 'react';
import { useTabContext } from './TabContext';
import VerticalTabsCard from './VerticalTabsCard';

const ANIMATION_DURATION = 300; // ms

const SplitScreenPanel: React.FC = () => {
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

    const [splitting, setSplitting] = useState(false); // Whether in split animation
    const [closingSplit, setClosingSplit] = useState(false); // Whether closing split
    const [closingScreenId, setClosingScreenId] = useState<string | null>(null); // Which screen is being closed

    if (!page) return null;

    // Get panel class based on screen state
    const getPanelClass = (screen: any) => {
        const baseClass = "transition-all duration-300";
        const hasFullscreenScreen = activeScreens.some(s => s.state === 'full-screen');
        
        // Case 1: Closing entire split (when one screen is fullscreen)
        if (closingSplit && !closingScreenId) {
            if (screen.state === 'full-screen') {
                // Screen being closed: fade out
                return `flex-[0.0001] min-w-0 max-w-0 overflow-hidden ${baseClass} opacity-0 z-30`;
            } else {
                // Remaining screen: smoothly expand to fullscreen
                return `flex-[10] min-w-0 max-w-full ${baseClass} z-20`;
            }
        }
        
        // Case 2: Closing one screen (when screens are split 50/50)
        if (closingSplit && closingScreenId) {
            if (closingScreenId === screen.id) {
                // Screen being closed: set disappear animation based on position
                if (screen.state === 'split-left') {
                    return `flex-[0.0001] min-w-0 max-w-0 overflow-hidden ${baseClass} transform -translate-x-full`;
                } else {
                    return `flex-[0.0001] min-w-0 max-w-0 overflow-hidden ${baseClass} transform translate-x-full`;
                }
            } else {
                // Remaining screen: expand to fullscreen
                return `flex-[10] min-w-0 max-w-full ${baseClass}`;
            }
        }
        
        // Normal states
        if (screen.state === 'full-screen') {
            return `flex-[10] min-w-0 max-w-full ${baseClass} z-20`;
        }
        
        // When there's a fullscreen screen, collapse others
        if (hasFullscreenScreen && screen.state !== 'full-screen') {
            // Add extra margin only when this screen is on the right side (split-right state)
            // Check if this screen was originally on the right side
            const wasRightScreen = screen.state === 'split-right' || 
                                 (activeScreens.length === 2 && activeScreens.indexOf(screen) === 1);
            const extraMargin = wasRightScreen ? 'ml-[1vh]' : '';
            return `flex-[0.0001] min-w-[32px] max-w-[32px] overflow-hidden ${baseClass} z-10 ${extraMargin}`;
        }
        
        // Normal split state (50/50)
        if (screen.state === 'split-left' || screen.state === 'split-right') {
            return `flex-1 min-w-0 ${baseClass} max-w-full`;
        }
        
        // Default state
        return `flex-1 min-w-0 ${baseClass} max-w-full`;
    };

    // Check if screen is fullscreen
    const isScreenFullscreen = (screen: any) => {
        return screen.state === 'full-screen';
    };

    // Check if screen should show only tab list
    const shouldShowOnlyTabList = (screen: any) => {
        // Show only tab list when this screen is not fullscreen but another screen is
        // But don't show only tab list during closing animation when this screen will become fullscreen
        if (closingSplit && !closingScreenId && screen.state !== 'full-screen') {
            return false; // During closing animation, show full content for remaining screen
        }
        return activeScreens.some(s => s.state === 'full-screen' && s.id !== screen.id);
    };

    // Check if screen is collapsed (should not show content area)
    const isScreenCollapsed = (screen: any) => {
        // Screen is collapsed when it's not fullscreen but another screen is
        // But don't collapse during closing animation when this screen will become fullscreen
        if (closingSplit && !closingScreenId && screen.state !== 'full-screen') {
            return false; // During closing animation, show full content for remaining screen
        }
        return activeScreens.some(s => s.state === 'full-screen' && s.id !== screen.id);
    };

    // Check if tab list should be disabled
    const isTabListDisabled = () => {
        // Only disable tab list during animations
        return splitting || closingSplit;
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

    // Handle fullscreen toggle
    const handleFullscreenToggle = (screenId: string) => {
        toggleFullscreen(activePage, screenId);
    };

    // Check if any screen is in fullscreen mode
    const hasFullscreenScreen = activeScreens.some(screen => screen.state === 'full-screen');
    
    return (
        <div className={`flex min-w-0 relative max-w-full transition-all duration-300 ${hasFullscreenScreen ? 'gap-1' : 'gap-2'} ${!hasFullscreenScreen && hasMultipleScreens ? 'justify-center' : ''}`}>
            {/* Render all active screens */}
            {activeScreens.map((screen) => (
                <div key={screen.id} className={getPanelClass(screen)}>
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
                    />
                </div>
            ))}
            
            {/* Split screen creation button - only show when no split */}
            {!hasMultipleScreens && (
                <div className='flex mr-[-1rem]'>
                    <button
                        className="mt-4"
                        style={{
                            writingMode: 'vertical-lr',
                            letterSpacing: '0.08em',
                            fontWeight: 500,
                            fontSize: 12,
                            color: '#898989',
                            height: 140,
                            width: 32,
                            border: '1px dashed #898989',
                            borderBottomRightRadius: "10px",
                            borderTopRightRadius: '10px',
                            marginTop: '2rem',
                            borderLeft: 'none',
                            marginRight: '-1px',
                            marginLeft: '1vh',
                            backgroundColor: '#F5F5F5',
                            transform: 'rotate(180deg)',
                        }}
                        onClick={handleCreateSplit}
                    >
                        Create Split Screen
                    </button>
                    <div className='h-full w-4'
                        style={{
                            border: '1px dashed #898989',
                            borderBottomLeftRadius: "1rem",
                            borderRight: 'none',
                            borderTopLeftRadius: '1rem',
                        }}
                    >
                    </div>
                </div>
            )}
        </div>
    );
};

export default SplitScreenPanel;
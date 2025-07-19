import { createContext, useContext, useState, ReactNode } from 'react';

import AiPoweredTools from '@/pages/workspacePages/contents/default/tabPanel/AiPoweredTools';
import DeepLearnEntry from '@/pages/workspacePages/contents/DeepLearn/entry/DeepLearn';

// New screen object interface
export interface ScreenObject {
    id: string;
    tabList: TabContextItem[];
    state: 'full-screen' | 'split-left' | 'split-right';
}

export interface TabContextItem {
    tab: string;
    components: React.ReactNode;
    tabList: any[];
}

export interface PageItem {
    title: string;
    screenQueue: ScreenObject[]; // Queue of screen objects
}

interface TabContextType {
    pages: PageItem[];
    activePage: number;
    setActivePage: (idx: number) => void;
    addPage: (title: string) => void;
    closePage: (idx: number) => void;
    addTab: (pageIdx: number, screenId: string, tab: TabContextItem) => void;
    removeTab: (pageIdx: number, screenId: string, tabIdx: number) => void;
    renamePage: (idx: number, newTitle: string) => void;
    
    // New split screen methods
    createSplitScreen: (pageIdx: number) => void;
    closeSplitScreen: (pageIdx: number, screenId: string) => void;
    toggleFullscreen: (pageIdx: number, screenId: string) => void;
    
    // Helper methods
    getScreenById: (pageIdx: number, screenId: string) => ScreenObject | undefined;
    getActiveScreens: (pageIdx: number) => ScreenObject[];
    
    // New method to switch to DeepLearn
    switchToDeepLearn: (pageIdx: number, screenId: string) => void;
}

const TabContext = createContext<TabContextType>({
    pages: [],
    activePage: 0,
    setActivePage: () => { },
    addPage: () => { },
    closePage: () => { },
    addTab: () => { },
    removeTab: () => { },
    renamePage: () => { },
    createSplitScreen: () => { },
    closeSplitScreen: () => { },
    toggleFullscreen: () => { },
    getScreenById: () => undefined,
    getActiveScreens: () => [],
    switchToDeepLearn: () => { },
} as TabContextType);

export const useTabContext = () => {
    const ctx = useContext(TabContext);
    if (!ctx) throw new Error('useTabContext must be used within TabProvider');
    return ctx;
};

export const TabProvider = ({ children }: { children: ReactNode }) => {
    const [pages, setPages] = useState<PageItem[]>([
        {
            title: 'page1',
            screenQueue: [
                {
                    id: 'screen-1',
                    tabList: [
                        { tab: "Tab1-1", components: <AiPoweredTools />, tabList: [] },
                    ],
                    state: 'full-screen'
                }
            ]
        },
        {
            title: 'page2',
            screenQueue: [
                {
                    id: 'screen-1',
                    tabList: [
                        { tab: "Tab2-1", components: <AiPoweredTools />, tabList: [] },
                    ],
                    state: 'full-screen'
                }
            ]
        }
    ]);
    const [activePage, setActivePage] = useState(0);

    // Helper function to generate unique screen ID
    const generateScreenId = (pageIdx: number) => {
        const page = pages[pageIdx];
        const existingIds = page.screenQueue.map(screen => screen.id);
        let counter = 1;
        while (existingIds.includes(`screen-${counter}`)) {
            counter++;
        }
        return `screen-${counter}`;
    };

    // Add a new page
    const addPage = (title: string) => {
        setPages(prev => [
            ...prev,
            {
                title,
                screenQueue: [
                    {
                        id: 'screen-1',
                        tabList: [
                            { tab: "Tab1-1", components: <AiPoweredTools />, tabList: [] },
                        ],
                        state: 'full-screen'
                    }
                ]
            }
        ]);
        setActivePage(pages.length);
    };

    // Close a page
    const closePage = (idx: number) => {
        setPages(prev => {
            const newPages = prev.filter((_, i) => i !== idx);
            if (activePage >= newPages.length) {
                setActivePage(Math.max(0, newPages.length - 1));
            }
            return newPages;
        });
    };

    const renamePage = (idx: number, newTitle: string) => {
        setPages(prev =>
            prev.map((page, i) =>
                i === idx ? { ...page, title: newTitle } : page
            )
        );
    };

    // Add tab to a specific screen
    const addTab = (pageIdx: number, screenId: string, tab: TabContextItem) => {
        setPages(prev => prev.map((page, idx) => {
            if (idx !== pageIdx) return page;
            return {
                ...page,
                screenQueue: page.screenQueue.map(screen =>
                    screen.id === screenId
                        ? { ...screen, tabList: [...screen.tabList, tab] }
                        : screen
                )
            };
        }));
    };

    // Remove tab from a specific screen
    const removeTab = (pageIdx: number, screenId: string, tabIdx: number) => {
        setPages(prev => prev.map((page, idx) => {
            if (idx !== pageIdx) return page;
            return {
                ...page,
                screenQueue: page.screenQueue.map(screen =>
                    screen.id === screenId
                        ? { ...screen, tabList: screen.tabList.filter((_, i) => i !== tabIdx) }
                        : screen
                )
            };
        }));
    };

    // Create split screen - adds a new screen to the queue
    const createSplitScreen = (pageIdx: number) => {
        setPages(prev => prev.map((page, idx) => {
            if (idx !== pageIdx) return page;
            
            const newScreenId = generateScreenId(pageIdx);
            const currentScreens = page.screenQueue;
            
            if (currentScreens.length === 1) {
                // Single screen becomes split-left, new screen becomes split-right
                return {
                    ...page,
                    screenQueue: [
                        { ...currentScreens[0], state: 'split-left' },
                        {
                            id: newScreenId,
                            tabList: [
                                { tab: "Tab1-1", components: <AiPoweredTools />, tabList: [] },
                            ],
                            state: 'split-right'
                        }
                    ]
                };
            } else {
                // Already split, add new screen to the end and adjust states
                const updatedScreens = currentScreens.map((screen, index) => {
                    if (index === 0) return { ...screen, state: 'split-left' as const };
                    if (index === 1) return { ...screen, state: 'split-right' as const };
                    return screen; // Keep other screens as they are
                });
                
                return {
                    ...page,
                    screenQueue: [
                        ...updatedScreens,
                        {
                            id: newScreenId,
                            tabList: [
                                { tab: "Tab1-1", components: <AiPoweredTools />, tabList: [] },
                            ],
                            state: 'split-right'
                        }
                    ]
                };
            }
        }));
    };

    // Close split screen - removes a screen from the queue
    const closeSplitScreen = (pageIdx: number, screenId: string) => {
        setPages(prev => prev.map((page, idx) => {
            if (idx !== pageIdx) return page;
            
            const currentScreens = page.screenQueue;
            // const screenToRemove = currentScreens.find(screen => screen.id === screenId);
            const remainingScreens = currentScreens.filter(screen => screen.id !== screenId);
            
            if (remainingScreens.length === 0) {
                // No screens left, create a default one
                return {
                    ...page,
                    screenQueue: [
                        {
                            id: 'screen-1',
                            tabList: [
                                { tab: "Tab1-1", components: <AiPoweredTools />, tabList: [] },
                            ],
                            state: 'full-screen'
                        }
                    ]
                };
            } else if (remainingScreens.length === 1) {
                // One screen left, make it full-screen
                return {
                    ...page,
                    screenQueue: [
                        { ...remainingScreens[0], state: 'full-screen' }
                    ]
                };
            } else {
                // Multiple screens left, adjust states
                const updatedScreens = remainingScreens.map((screen, index) => {
                    if (index === 0) return { ...screen, state: 'split-left' as const };
                    if (index === 1) return { ...screen, state: 'split-right' as const };
                    return screen; // Keep other screens as they are
                });
                
                return {
                    ...page,
                    screenQueue: updatedScreens
                };
            }
        }));
    };

    // Toggle fullscreen for a specific screen
    const toggleFullscreen = (pageIdx: number, screenId: string) => {
        setPages(prev => prev.map((page, idx) => {
            if (idx !== pageIdx) return page;
            
            const currentScreens = page.screenQueue;
            const targetScreen = currentScreens.find(screen => screen.id === screenId);
            
            if (!targetScreen) return page;
            
            if (targetScreen.state === 'full-screen') {
                // If currently full-screen and there are other screens, go back to split
                if (currentScreens.length > 1) {
                    return {
                        ...page,
                        screenQueue: currentScreens.map((screen, index) => {
                            if (screen.id === screenId) {
                                return { ...screen, state: 'split-left' as const };
                            } else if (index === 0) {
                                return { ...screen, state: 'split-left' as const };
                            } else if (index === 1) {
                                return { ...screen, state: 'split-right' as const };
                            }
                            return screen;
                        })
                    };
                }
            } else {
                // If in split mode, make this screen full-screen
                return {
                    ...page,
                    screenQueue: currentScreens.map(screen => {
                        if (screen.id === screenId) {
                            return { ...screen, state: 'full-screen' as const };
                        } else {
                            // Other screens keep their current state but will be collapsed by the UI logic
                            return screen;
                        }
                    })
                };
            }
            
            return page;
        }));
    };

    // Helper method to get screen by ID
    const getScreenById = (pageIdx: number, screenId: string) => {
        const page = pages[pageIdx];
        return page?.screenQueue.find(screen => screen.id === screenId);
    };

    // Helper method to get active screens for a page
    const getActiveScreens = (pageIdx: number) => {
        const page = pages[pageIdx];
        return page?.screenQueue || [];
    };

    // New method to switch to DeepLearn
    const switchToDeepLearn = (pageIdx: number, screenId: string) => {
        setPages(prev => prev.map((page, idx) => {
            if (idx !== pageIdx) return page;
            
            const currentScreens = page.screenQueue;
            const targetScreen = currentScreens.find(screen => screen.id === screenId);
            
            if (!targetScreen) return page;

            // Check if already showing DeepLearn
            const isAlreadyDeepLearn = targetScreen.tabList.some(tab => 
                tab.tab === "Deep Learn"
            );
            
            if (isAlreadyDeepLearn) {
                return page;
            }

            // Replace the first tab with DeepLearn
            return {
                ...page,
                screenQueue: currentScreens.map(screen => {
                    if (screen.id === screenId) {
                        return {
                            ...screen,
                            tabList: [
                                { 
                                    tab: "Deep Learn", 
                                    components: <DeepLearnEntry />, 
                                    tabList: [] 
                                }
                            ]
                        };
                    }
                    return screen;
                })
            };
        }));
    };

    return (
        <TabContext.Provider
            value={{
                pages,
                activePage,
                setActivePage,
                addPage,
                closePage,
                addTab,
                removeTab,
                renamePage,
                createSplitScreen,
                closeSplitScreen,
                toggleFullscreen,
                getScreenById,
                getActiveScreens,
                switchToDeepLearn,
            }}
        >
            {children}
        </TabContext.Provider>
    );
};
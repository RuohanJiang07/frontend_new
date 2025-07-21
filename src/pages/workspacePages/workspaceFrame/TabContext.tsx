import { createContext, useContext, useState, ReactNode } from 'react';

import AiPoweredTools from '@/pages/workspacePages/contents/default/AiPoweredTools';
import DeepLearnEntry from '@/pages/workspacePages/contents/DeepLearn/entry/DeepLearn';
import DeepLearnResponse from '@/pages/workspacePages/contents/DeepLearn/response/DeepLearnResponse';
import DocumentChatEntry from '@/pages/workspacePages/contents/DocumentChat/entry/DocumentChat';
import DocumentChatResponse from '@/pages/workspacePages/contents/DocumentChat/response/DocumentChatResponse';
import ProblemHelpEntry from '@/pages/workspacePages/contents/ProblemHelp/entry/ProblemHelp';
import ProblemHelpResponse from '@/pages/workspacePages/contents/ProblemHelp/response/ProblemHelpResponse';
import NoteEntry from '@/pages/workspacePages/contents/Note/entry/Note';
import NoteResponse from '@/pages/workspacePages/contents/Note/response/NoteResponse';

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
    
    // Active screen and tab tracking
    activeScreenId: string | null;
    setActiveScreenId: (screenId: string | null) => void;
    activeTabIndices: Record<number, Record<string, number>>; // pageIdx -> (screenId -> active tab index)
    setActiveTabIndex: (screenId: string, tabIndex: number) => void;
    
    // New method to switch to DeepLearn
    switchToDeepLearn: (pageIdx: number, screenId: string, tabIdx: number) => void;
    // New method to switch to DeepLearnResponse
    switchToDeepLearnResponse: (pageIdx: number, screenId: string, tabIdx: number) => void;
    // New method to switch to DocumentChat
    switchToDocumentChat: (pageIdx: number, screenId: string, tabIdx: number) => void;
    // New method to switch to DocumentChatResponse
    switchToDocumentChatResponse: (pageIdx: number, screenId: string, tabIdx: number) => void;
    // New method to switch to ProblemHelp
    switchToProblemHelp: (pageIdx: number, screenId: string, tabIdx: number) => void;
    // New method to switch to ProblemHelpResponse
    switchToProblemHelpResponse: (pageIdx: number, screenId: string, tabIdx: number) => void;
    // New method to switch to Note
    switchToNote: (pageIdx: number, screenId: string, tabIdx: number) => void;
    // New method to switch to NoteResponse
    switchToNoteResponse: (pageIdx: number, screenId: string, tabIdx: number) => void;
    
    // Helper methods for UI state
    canClosePage: (pageIdx: number) => boolean;
    canCloseTab: (pageIdx: number, screenId: string, tabIdx: number) => boolean;
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
    activeScreenId: null,
    setActiveScreenId: () => { },
    activeTabIndices: {},
    setActiveTabIndex: () => { },
    switchToDeepLearn: () => { },
    switchToDeepLearnResponse: () => { },
    switchToDocumentChat: () => { },
    switchToDocumentChatResponse: () => { },
    switchToProblemHelp: () => { },
    switchToProblemHelpResponse: () => { },
    switchToNote: () => { },
    switchToNoteResponse: () => { },
    canClosePage: () => false,
    canCloseTab: () => false,
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
    const [activeScreenId, setActiveScreenId] = useState<string | null>('screen-1');
    const [activeTabIndices, setActiveTabIndices] = useState<Record<number, Record<string, number>>>({ 0: { 'screen-1': 0 } });

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
        const newPageIdx = pages.length;
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
        setActivePage(newPageIdx);
        // Initialize active tab indices for the new page
        setActiveTabIndices(prev => ({
            ...prev,
            [newPageIdx]: { 'screen-1': 0 }
        }));
        setActiveScreenId('screen-1');
    };

    // Close a page
    const closePage = (idx: number) => {
        // Prevent closing the last window
        if (pages.length <= 1) {
            return;
        }
        
        setPages(prev => {
            const newPages = prev.filter((_, i) => i !== idx);
            if (activePage >= newPages.length) {
                setActivePage(Math.max(0, newPages.length - 1));
            }
            return newPages;
        });
        
        // Clean up active tab indices for the closed page
        setActiveTabIndices(prev => {
            const newIndices = { ...prev };
            delete newIndices[idx];
            return newIndices;
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
            
            // Check if this is the last tab in the entire window (all screens combined)
            const totalTabsInWindow = page.screenQueue.reduce((total, screen) => total + screen.tabList.length, 0);
            if (totalTabsInWindow <= 1) {
                return page; // Don't remove the last tab
            }
            
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
                // Set the new screen as active
                setActiveScreenId(newScreenId);
                setActiveTabIndex(newScreenId, 0);
                
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
                
                // Set the new screen as active
                setActiveScreenId(newScreenId);
                setActiveTabIndex(newScreenId, 0);
                
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
            
            // If we're closing the active screen, switch to the first remaining screen
            if (activeScreenId === screenId && remainingScreens.length > 0) {
                setActiveScreenId(remainingScreens[0].id);
                setActiveTabIndex(remainingScreens[0].id, 0);
            }
            
            // Clean up active tab indices for the closed screen
            setActiveTabIndices(prev => {
                const newIndices = { ...prev };
                if (newIndices[pageIdx]) {
                    const newPageIndices = { ...newIndices[pageIdx] };
                    delete newPageIndices[screenId];
                    newIndices[pageIdx] = newPageIndices;
                }
                return newIndices;
            });
            
            if (remainingScreens.length === 0) {
                // No screens left, create a default one
                const newScreenId = 'screen-1';
                setActiveScreenId(newScreenId);
                setActiveTabIndex(newScreenId, 0);
                
                return {
                    ...page,
                    screenQueue: [
                        {
                            id: newScreenId,
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
    const switchToDeepLearn = (pageIdx: number, screenId: string, tabIdx: number) => {
        setPages(prev => prev.map((page, idx) => {
            if (idx !== pageIdx) return page;
            return {
                ...page,
                screenQueue: page.screenQueue.map(screen => {
                    if (screen.id !== screenId) return screen;
                    const newTabList = screen.tabList.map((tab, i) =>
                        i === tabIdx
                            ? { ...tab, tab: "Deep Learn", components: <DeepLearnEntry /> }
                            : tab
                    );
                    return { ...screen, tabList: newTabList };
                })
            };
        }));
    };

    // New method to switch to DeepLearnResponse
    const switchToDeepLearnResponse = (pageIdx: number, screenId: string, tabIdx: number) => {
        setPages(prev => prev.map((page, idx) => {
            if (idx !== pageIdx) return page;
            return {
                ...page,
                screenQueue: page.screenQueue.map(screen => {
                    if (screen.id !== screenId) return screen;
                    const newTabList = screen.tabList.map((tab, i) =>
                        i === tabIdx
                            ? { ...tab, tab: "Deep Learn Response", components: <DeepLearnResponse /> }
                            : tab
                    );
                    return { ...screen, tabList: newTabList };
                })
            };
        }));
    };

    // New method to switch to DocumentChat
    const switchToDocumentChat = (pageIdx: number, screenId: string, tabIdx: number) => {
        setPages(prev => prev.map((page, idx) => {
            if (idx !== pageIdx) return page;
            return {
                ...page,
                screenQueue: page.screenQueue.map(screen => {
                    if (screen.id !== screenId) return screen;
                    const newTabList = screen.tabList.map((tab, i) =>
                        i === tabIdx
                            ? { ...tab, tab: "Document Chat", components: <DocumentChatEntry /> }
                            : tab
                    );
                    return { ...screen, tabList: newTabList };
                })
            };
        }));
    };

    // New method to switch to DocumentChatResponse
    const switchToDocumentChatResponse = (pageIdx: number, screenId: string, tabIdx: number) => {
        setPages(prev => prev.map((page, idx) => {
            if (idx !== pageIdx) return page;
            return {
                ...page,
                screenQueue: page.screenQueue.map(screen => {
                    if (screen.id !== screenId) return screen;
                    const newTabList = screen.tabList.map((tab, i) =>
                        i === tabIdx
                            ? { ...tab, tab: "Document Chat Response", components: <DocumentChatResponse /> }
                            : tab
                    );
                    return { ...screen, tabList: newTabList };
                })
            };
        }));
    };

    // New method to switch to ProblemHelp
    const switchToProblemHelp = (pageIdx: number, screenId: string, tabIdx: number) => {
        setPages(prev => prev.map((page, idx) => {
            if (idx !== pageIdx) return page;
            return {
                ...page,
                screenQueue: page.screenQueue.map(screen => {
                    if (screen.id !== screenId) return screen;
                    const newTabList = screen.tabList.map((tab, i) =>
                        i === tabIdx
                            ? { ...tab, tab: "Problem Help", components: <ProblemHelpEntry /> }
                            : tab
                    );
                    return { ...screen, tabList: newTabList };
                })
            };
        }));
    };

    // New method to switch to ProblemHelpResponse
    const switchToProblemHelpResponse = (pageIdx: number, screenId: string, tabIdx: number) => {
        setPages(prev => prev.map((page, idx) => {
            if (idx !== pageIdx) return page;
            return {
                ...page,
                screenQueue: page.screenQueue.map(screen => {
                    if (screen.id !== screenId) return screen;
                    const newTabList = screen.tabList.map((tab, i) =>
                        i === tabIdx
                            ? { ...tab, tab: "Problem Help Response", components: <ProblemHelpResponse onBack={() => {}} /> }
                            : tab
                    );
                    return { ...screen, tabList: newTabList };
                })
            };
        }));
    };

    // New method to switch to Note
    const switchToNote = (pageIdx: number, screenId: string, tabIdx: number) => {
        setPages(prev => prev.map((page, idx) => {
            if (idx !== pageIdx) return page;
            return {
                ...page,
                screenQueue: page.screenQueue.map(screen => {
                    if (screen.id !== screenId) return screen;
                    const newTabList = screen.tabList.map((tab, i) =>
                        i === tabIdx
                            ? { ...tab, tab: "Smart Note", components: <NoteEntry /> }
                            : tab
                    );
                    return { ...screen, tabList: newTabList };
                })
            };
        }));
    };

    // New method to switch to NoteResponse
    const switchToNoteResponse = (pageIdx: number, screenId: string, tabIdx: number) => {
        setPages(prev => prev.map((page, idx) => {
            if (idx !== pageIdx) return page;
            return {
                ...page,
                screenQueue: page.screenQueue.map(screen => {
                    if (screen.id !== screenId) return screen;
                    const newTabList = screen.tabList.map((tab, i) =>
                        i === tabIdx
                            ? { ...tab, tab: "Note Editor", components: <NoteResponse /> }
                            : tab
                    );
                    return { ...screen, tabList: newTabList };
                })
            };
        }));
    };

    // Helper method to check if a page can be closed
    const canClosePage = (pageIdx: number) => {
        return pages.length > 1;
    };

    // Helper method to check if a tab can be closed
    const canCloseTab = (pageIdx: number, screenId: string, tabIdx: number) => {
        const page = pages[pageIdx];
        if (!page) return false;
        
        // Check if this is the last tab in the entire window (all screens combined)
        const totalTabsInWindow = page.screenQueue.reduce((total, screen) => total + screen.tabList.length, 0);
        if (totalTabsInWindow <= 1) {
            return false; // Don't allow closing the last tab in the entire window
        }
        
        // Check if this is the last tab in the specific screen
        const targetScreen = page.screenQueue.find(screen => screen.id === screenId);
        if (targetScreen && targetScreen.tabList.length <= 1) {
            // Allow closing the last tab in a screen if there are multiple screens
            // (it will trigger split screen closing)
            return page.screenQueue.length > 1;
        }
        
        return true;
    };

    // Helper method to set active tab index for a screen
    const setActiveTabIndex = (screenId: string, tabIndex: number) => {
        setActiveTabIndices(prev => ({
            ...prev,
            [activePage]: {
                ...(prev[activePage] || {}),
                [screenId]: tabIndex
            }
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
                activeScreenId,
                setActiveScreenId,
                activeTabIndices,
                setActiveTabIndex,
                switchToDeepLearn,
                switchToDeepLearnResponse,
                switchToDocumentChat,
                switchToDocumentChatResponse,
                switchToProblemHelp,
                switchToProblemHelpResponse,
                switchToNote,
                switchToNoteResponse,
                canClosePage,
                canCloseTab,
            }}
        >
            {children}
        </TabContext.Provider>
    );
};
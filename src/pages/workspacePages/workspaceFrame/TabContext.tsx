import { createContext, useContext, useState, ReactNode } from 'react';

import AiPoweredTools from '@/pages/workspacePages/contents/default/tabPanel/AiPoweredTools';

export interface PageItem {
    title: string;
    children: any[];
    split?: boolean; // 新增，记录分屏状态
}

interface TabContextType {
    pages: PageItem[];
    activePage: number;
    setActivePage: (idx: number) => void;
    addPage: (title: string) => void;
    closePage: (idx: number) => void;
    addTab: (pageIdx: number, position: 'left' | 'right', tab: any) => void;
    removeTab: (pageIdx: number, position: 'left' | 'right', tabIdx: number) => void;
    renamePage: (idx: number, newTitle: string) => void; // 新增
    setPageSplit: (idx: number, split: boolean) => void; // 新增
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
    setPageSplit: () => { }, // 新增
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
            split: false, // 新增
            children: [
                {
                    position: "left", tabList: [
                        { tab: "Tab1-1", components: <AiPoweredTools />, tabList: [] },

                    ]
                },
                {
                    position: "right", tabList: [
                        { tab: "Tab1-1", components: <AiPoweredTools />, tabList: [] },

                    ]
                },
            ]
        },
        {
            title: 'page1',
            split: false, // 新增
            children: [
                {
                    position: "left", tabList: [
                        { tab: "Tab1-1", components: <AiPoweredTools />, tabList: [] },

                    ]
                },
                {
                    position: "right", tabList: [
                        { tab: "Tab1-1", components: <AiPoweredTools />, tabList: [] },

                    ]
                },
            ]
        }
    ]);
    const [activePage, setActivePage] = useState(0);

    // 新增一个 page
    const addPage = (title: string) => {
        setPages(prev => [
            ...prev,
            {
                title,
                children: [
                    {
                        position: "left", tabList: [
                            { tab: "Tab1-1", components: <AiPoweredTools />, tabList: [] },

                        ]
                    },
                    {
                        position: "right", tabList: [
                            { tab: "Tab1-1", components: <AiPoweredTools />, tabList: [] },

                        ]
                    },
                ]
            }
        ]);
        setActivePage(pages.length); // 切换到新建的page
    };

    // 删除一个 page
    const closePage = (idx: number) => {
        setPages(prev => {
            const newPages = prev.filter((_, i) => i !== idx);
            // 修正activePage
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
    // 新增tab
    const addTab = (pageIdx: number, position: 'left' | 'right', tab: any) => {
        setPages(prev => prev.map((page, idx) => {
            if (idx !== pageIdx) return page;
            return {
                ...page,
                children: page.children.map((child: any) =>
                    child.position === position
                        ? { ...child, tabList: [...child.tabList, tab] }
                        : child
                )
            };
        }));
    };

    // 删除tab
    const removeTab = (pageIdx: number, position: 'left' | 'right', tabIdx: number) => {
        setPages(prev => prev.map((page, idx) => {
            if (idx !== pageIdx) return page;
            return {
                ...page,
                children: page.children.map((child: any) =>
                    child.position === position
                        ? { ...child, tabList: child.tabList.filter((_: any, i: number) => i !== tabIdx) }
                        : child
                )
            };
        }));
    };

    const setPageSplit = (idx: number, split: boolean) => {
        setPages(prev =>
            prev.map((page, i) =>
                i === idx ? { ...page, split } : page
            )
        );
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
                setPageSplit,
            }}
        >
            {children}
        </TabContext.Provider>
    );
};
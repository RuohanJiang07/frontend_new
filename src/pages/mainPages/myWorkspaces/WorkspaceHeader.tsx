import { ChevronLeft, ChevronRight, Plus, MoreVertical, ChevronDownIcon } from 'lucide-react';
import { useTabContext } from './TabContext';
import React, { useState } from 'react';

import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@radix-ui/react-dropdown-menu';
import { Button } from '../../../components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@radix-ui/react-avatar';

import { useNavigate } from 'react-router-dom';

export default function WorkspaceHeader() {
    const {
        pages,
        activePage,
        setActivePage,
        addPage,
        renamePage,
        closePage,
    } = useTabContext();
    const navigate = useNavigate();
    // 控制菜单显示
    const [menuIdx, setMenuIdx] = useState<number | null>(null);
    const [editingIdx, setEditingIdx] = useState<number | null>(null);
    const [editValue, setEditValue] = useState('');
    const [tabScroll, setTabScroll] = useState(0);

    // 可见tab数量
    const VISIBLE_COUNT = 3;
    const canScrollLeft = tabScroll > 0;
    const canScrollRight = tabScroll + VISIBLE_COUNT < pages.length;

    // 当前可见tab
    const visibleTabs = pages.slice(tabScroll, tabScroll + VISIBLE_COUNT);

    // 处理重命名
    const handleRename = (idx: number) => {
        renamePage(idx, editValue.trim() || pages[idx].title);
        setEditingIdx(null);
        setMenuIdx(null);
    };

    const handleLoginClick = () => {
        navigate('/login');
    };

    return (
        <div className="w-full flex items-center px-6 py-2  border-b shadow-sm">
            {/* 返回+课程名 */}
            <div className="flex items-center   mr-6">
                <ChevronLeft className="w-5 h-5 cursor-pointer" />
                <span className="ml-2 font-semibold text-[17px]">PHYS 2801 Physics</span>
                <span className="ml-2 px-2 py-0.5 bg-[#e6edfa] text-xs rounded text-[#1a2a4c]">Workspace</span>
            </div>
            {/* tab列表 */}
            <div className="flex items-center flex-1 justify-center ">
                <div
                    className="flex items-center px-4 py-2 bg-[#ECECEC] rounded-[20px]"

                >
                    {/* 左箭头 */}
                    <button
                        className="mr-1 rounded-full hover:bg-[#f7f6f6] transition p-1"
                        onClick={() => setTabScroll(tabScroll - 1)}
                        disabled={!canScrollLeft}
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    {/* tab列表（只显示visibleTabs） */}
                    {visibleTabs.map((tab, idx) => {
                        const realIdx = tabScroll + idx;
                        return (
                            <div
                                style={{ width: 148 }}
                                key={tab.title + realIdx}
                                className={`relative flex items-center justify-between mx-1 px-6 py-1 rounded-full cursor-pointer transition
                                ${activePage === realIdx
                                        ? 'bg-[#FFFFFF]  font-semibold'
                                        : ''}
                                hover:bg-[#f7f6f6]
                            `}
                                onClick={() => setActivePage(realIdx)}
                            >
                                {/* 重命名输入框 */}
                                {editingIdx === realIdx ? (
                                    <input
                                        className="bg-transparent outline-none w-full text-center text-[15px] font-medium"
                                        value={editValue}
                                        autoFocus
                                        onChange={e => setEditValue(e.target.value)}
                                        onBlur={() => handleRename(realIdx)}
                                        onKeyDown={e => {
                                            if (e.key === 'Enter') handleRename(realIdx);
                                            if (e.key === 'Escape') setEditingIdx(null);
                                        }}

                                    />
                                ) : (
                                    <span className="truncate text-[15px]" title={tab.title}>{tab.title}</span>
                                )}
                                {/* ...菜单 */}
                                <div className="relative">
                                    <button
                                        className="p-1 rounded-full hover:bg-[#ececec] transition"
                                        onClick={e => {
                                            e.stopPropagation();
                                            setMenuIdx(menuIdx === idx ? null : idx);
                                            setEditValue(tab.title);
                                        }}
                                    >
                                        <MoreVertical className="w-4 h-4" />
                                    </button>
                                    {/* 菜单弹窗 */}
                                    {menuIdx === idx && (
                                        <div className="absolute top-7 left-1 z-30 w-24 bg-white border rounded shadow py-1 px-1 text-sm">
                                            <div
                                                className="px-3 py-1 hover:bg-[#f7f6f6] cursor-pointer rounded"
                                                onClick={e => {
                                                    e.stopPropagation();
                                                    setEditingIdx(idx);
                                                    setMenuIdx(null);
                                                    setTimeout(() => {
                                                        const input = document.querySelector<HTMLInputElement>('input[autoFocus]');
                                                        input?.focus();
                                                    }, 0);
                                                }}
                                            >
                                                Rename
                                            </div>
                                            <div
                                                className="px-3 py-1 hover:bg-[#f7f6f6] cursor-pointer text-red-500 rounded"
                                                onClick={e => {
                                                    e.stopPropagation();
                                                    closePage(idx);
                                                    setMenuIdx(null);
                                                }}
                                            >
                                                Delete
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                    {/* 右箭头 */}
                    <button
                        className="ml-1 rounded-full hover:bg-[#f7f6f6] transition p-1"
                        onClick={() => setTabScroll(tabScroll + 1)}
                        disabled={!canScrollRight}
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                    {/* 新建tab按钮 */}
                    <button
                        className="ml-2 px-2 py-2 rounded-full hover:bg-[#f7f6f6] transition"
                        onClick={() => {
                            addPage('New Tab');
                            setTimeout(() => {
                                setEditingIdx(pages.length);
                                setEditValue('New Tab');
                                // 自动滑到最后
                                setTabScroll(Math.max(0, pages.length - VISIBLE_COUNT + 1));
                            }, 0);
                        }}
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                </div>
            </div>
            {/* 搜索+用户 */}
            <div className="flex items-center ml-6 gap-3">
                <input
                    className="h-8 w-56 rounded bg-[#f7f6f6] px-3 text-sm border border-[#e0e0e0]"
                    placeholder="Search in workspace..."
                />
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="outline"
                            className="rounded-[20px] border-[#bcbcbc] h-9 px-2"
                            onClick={handleLoginClick}
                        >
                            <div className="flex items-center gap-2 bg-transparent">
                                <Avatar className="w-6 h-6">
                                    <AvatarImage
                                        src="/main/landing_page/avatars.png"
                                        alt="John Doe"
                                    />
                                    <AvatarFallback>JD</AvatarFallback>
                                </Avatar>
                                <span className="font-['IBM_Plex_Sans'] text-sm">
                                    John Doe
                                </span>
                                <ChevronDownIcon className="w-3.5 h-3.5" />
                            </div>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className='dropdown-content'>
                        <DropdownMenuItem className='dropdown-item'>Profile</DropdownMenuItem>
                        <DropdownMenuItem className='dropdown-item'>Settings</DropdownMenuItem>
                        <DropdownMenuItem className='dropdown-item' onClick={handleLoginClick}>Login</DropdownMenuItem>
                        <DropdownMenuItem className='dropdown-item'>Logout</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}
import { ChevronLeft, ChevronRight, Plus, MoreVertical, ChevronDownIcon, ArrowLeft } from 'lucide-react';


import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@radix-ui/react-dropdown-menu';
import { Button } from '../../../components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@radix-ui/react-avatar';

import { useNavigate } from 'react-router-dom';
import { useTabContext } from './TabContext';
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

const TAB_WIDTH = 148;

export default function WorkspaceHeader() {
    const {
        pages,
        activePage,
        setActivePage,
        addPage,
        renamePage,
        closePage,
        canClosePage,
    } = useTabContext();
    const navigate = useNavigate();
    // 控制菜单显示
    const [menuIdx, setMenuIdx] = useState<number | null>(null);
    const [editingIdx, setEditingIdx] = useState<number | null>(null);
    const [editValue, setEditValue] = useState('');
    const [tabScroll, setTabScroll] = useState(0);
    const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
    const menuRef = useRef<HTMLDivElement>(null);
    // 可见tab数量
    const VISIBLE_COUNT = 3;
    const canScrollLeft = tabScroll > 0;
    const canScrollRight = tabScroll + VISIBLE_COUNT < pages.length;
    // const trackOffset = tabScroll * TAB_WIDTH; // 暂时注释掉未使用的变量
    // 当前可见tab
    const visibleTabs = pages.slice(tabScroll, tabScroll + VISIBLE_COUNT);

    // 处理重命名
    const handleRename = (idx: number) => {
        renamePage(idx, editValue.trim() || pages[idx].title);
        setEditingIdx(null);
        setMenuIdx(null);
    };

    // 关闭tab后自动调整tabScroll
    const handleClosePage = (idx: number) => {
        closePage(idx);
        setMenuIdx(null);
        setTimeout(() => {
            // 关闭后pages.length会变小
            const maxScroll = Math.max(0, pages.length - VISIBLE_COUNT - 1);
            if (tabScroll > maxScroll) {
                setTabScroll(maxScroll);
            }
        }, 0);
    };

    const handleLoginClick = () => {
        navigate('/login');
    };

    // Handle clicking outside the menu to close it
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMenuIdx(null);
            }
        };

        if (menuIdx !== null) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [menuIdx]);

    return (
        <div className="w-full flex items-center px-6 py-2 pt-3">
            {/* 返回+课程名 */}
            <div className="flex items-center   mr-6">
                <ArrowLeft 
                    className="w-5 h-5 cursor-pointer" 
                    onClick={() => navigate('/workspaces')}
                />

                <span className="ml-2 font-semibold text-[17px]">PHYS 2801 Physics</span>
                <span className="ml-2 px-2 py-0.5 bg-[#e6edfa] text-xs rounded text-[#1a2a4c]">Workspace</span>
            </div>
            {/* tab列表 */}
            <div className=" flex-1">
                <div
                    className="flex items-center justify-center  "

                >
                    {/* 左箭头 */}
                    <button
                        className="mr-1 rounded-full hover:bg-[#f7f6f6] transition p-1"
                        onClick={() => setTabScroll(Math.max(0, tabScroll - VISIBLE_COUNT))}
                        disabled={!canScrollLeft}
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <div className='flex items-center justify-between bg-[#ECECEC] rounded-[20px] px-2 py-1.5 w-[480px]'>
                        {/* tab列表（只显示visibleTabs） */}
                        <div style={{ width: TAB_WIDTH * VISIBLE_COUNT, overflowX: 'auto' }}>
                            <div className='flex items-center  gap-1 transition-transform duration-50'
                            >
                                {visibleTabs.map((tab, idx) => {
                                    const realIdx = tabScroll + idx;
                                    return (
                                        <div
                                            style={{ width: 148 }}
                                            key={tab.title + realIdx}
                                            className={`relative flex items-center mx-0.5 px-2 py-0.5  rounded-full cursor-pointer transition
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
                                                    className="bg-transparent outline-none focus:outline-none w-full text-center text-[15px] font-medium"
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
                                                <span className="flex-1 text-center text-[15px] truncate" title={tab.title}>{tab.title}</span>
                                            )}
                                            {/* ...菜单 */}
                                            <div className="relative flex-shrink-0">
                                                <button
                                                    className="p-1 rounded-full hover:bg-[#ececec] transition"
                                                    onClick={e => {
                                                        e.stopPropagation();
                                                        setMenuIdx(menuIdx === idx ? null : idx);
                                                        setEditValue(tab.title);
                                                        // 记录按钮的屏幕位置
                                                        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                                                        setMenuPosition({
                                                            top: rect.bottom + 4, // 4px下移，避免贴边
                                                            left: rect.left,
                                                        });
                                                    }}
                                                >
                                                    <MoreVertical className="w-4 h-4" />
                                                </button>
                                                {menuIdx === idx && createPortal(
                                                    <div
                                                        ref={menuRef}
                                                        className="absolute top-7 left-1 z-50 w-24 bg-white border rounded shadow py-1 px-1 text-sm"
                                                        style={{
                                                            position: 'fixed',
                                                            // 计算弹窗的绝对位置
                                                            top: menuPosition.top,
                                                            left: menuPosition.left,
                                                        }}
                                                    >
                                                        {/* ...菜单内容... */}

                                                        <div
                                                            className="px-3 py-1 hover:bg-[#f7f6f6] cursor-pointer rounded"
                                                            onClick={e => {
                                                                e.stopPropagation();
                                                                setEditingIdx(realIdx);
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
                                                            className={`px-3 py-1 rounded ${
                                                                canClosePage(realIdx) 
                                                                    ? 'hover:bg-[#f7f6f6] cursor-pointer text-red-500' 
                                                                    : 'text-gray-400 cursor-not-allowed'
                                                            }`}
                                                            onClick={e => {
                                                                e.stopPropagation();
                                                                if (canClosePage(realIdx)) {
                                                                    handleClosePage(realIdx);
                                                                }
                                                            }}
                                                        >
                                                            Delete
                                                        </div>

                                                    </div>,
                                                    document.body
                                                )}

                                            </div>
                                        </div>
                                    );
                                })}

                            </div>
                        </div>
                        {/* 新建tab按钮 */}
                        <button
                            className="ml-1 px-2 py-1.5 rounded-full hover:bg-[#f7f6f6] transition"
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
                    {/* 右箭头 */}
                    <button
                        className="ml-1 rounded-full hover:bg-[#f7f6f6] transition p-1"
                        onClick={() => setTabScroll(Math.min(pages.length - VISIBLE_COUNT, tabScroll + VISIBLE_COUNT))}
                        disabled={!canScrollRight}
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>

                </div>
            </div>
            {/* 搜索+用户 */}
            <div className="flex items-center ml-6 gap-3">
                <div className="relative">
                    <input
                        className="h-8 w-56 rounded bg-[#f7f6f6] px-3 pl-9 text-sm border border-[#e0e0e0] focus:outline-none"
                        placeholder="Search in workspace..."
                    />
                    {/* 搜索图标 */}
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#bcbcbc]">
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="7" cy="7" r="5" />
                            <line x1="11" y1="11" x2="15" y2="15" />
                        </svg>
                    </span>
                </div>
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
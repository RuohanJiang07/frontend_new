import { useTabContext } from '@/pages/mainPages/myWorkspaces/TabContext';
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';

export default function WorkspaceHeader({
    workspaceName = "PHYS 2801 Physics",
    tabs = [],
    activeTab = 0,
    onTabClick,
    onTabClose,
    onTabRename,
    onTabAdd,
    onPrev,
    onNext,
    userName = "John Doe"
}) {
    const {
        pages,
        activePage,
    } = useTabContext();
    console.log(pages, 'pages');

    return (
        <div className="w-full flex items-center px-6 py-2 bg-white border-b shadow-sm">
            {/* 返回+课程名 */}
            <div className="flex items-center mr-6">
                <ChevronLeft className="w-5 h-5 cursor-pointer" />
                <span className="ml-2 font-semibold text-[17px]">{workspaceName}</span>
                <span className="ml-2 px-2 py-0.5 bg-[#e6edfa] text-xs rounded text-[#1a2a4c]">Workspace</span>
            </div>
            {/* tab列表 */}
            <div className="flex items-center flex-1 overflow-x-auto">
                <button onClick={onPrev}><ChevronLeft className="w-4 h-4" /></button>
                {tabs.map((tab, idx) => (
                    <div
                        key={tab.id}
                        className={`flex items-center mx-1 px-3 py-1 rounded-full cursor-pointer transition
              ${activeTab === idx ? 'bg-[#f7f6f6] border border-[#d0d0d0]' : 'bg-white border border-transparent'}
            `}
                        onClick={() => onTabClick(idx)}
                    >
                        <input
                            className="bg-transparent outline-none w-24 text-center"
                            value={tab.name}
                            onChange={e => onTabRename(idx, e.target.value)}
                            style={{ fontWeight: activeTab === idx ? 600 : 400 }}
                        />
                        <button className="ml-1" onClick={e => { e.stopPropagation(); onTabClose(idx); }}>
                            <X className="w-3 h-3 text-[#b0b0b0] hover:text-red-400" />
                        </button>
                    </div>
                ))}
                <button className="ml-2" onClick={onTabAdd}><Plus className="w-4 h-4" /></button>
                <button><ChevronRight className="w-4 h-4" /></button>
            </div>
            {/* 搜索+用户 */}
            <div className="flex items-center ml-6 gap-3">
                <input
                    className="h-8 w-56 rounded bg-[#f7f6f6] px-3 text-sm border border-[#e0e0e0]"
                    placeholder="Search in workspace..."
                />
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#f7f6f6]">
                    <span className="text-sm">{userName}</span>
                </div>
            </div>
        </div>
    );
}
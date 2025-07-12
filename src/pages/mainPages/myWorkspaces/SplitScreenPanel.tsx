import React, { useState } from 'react';
import { useTabContext } from './TabContext';
import VerticalTabsCard from './VerticalTabsCard';

const ANIMATION_DURATION = 250; // ms

const SplitScreenPanel: React.FC = () => {
    const { pages, activePage } = useTabContext();

    const [split, setSplit] = useState(false); // 是否分屏
    const [fullscreen, setFullscreen] = useState<'left' | 'right' | null>(null); // 哪一侧全屏
    const [splitting, setSplitting] = useState(false); // 是否处于分屏动画中

    if (!pages[activePage]) return null;
    const page = pages[activePage];

    // 动画样式
    const getPanelClass = (side: 'left' | 'right') => {
        if (!split) return "flex-1 min-w-0 transition-all duration-500";
        if (fullscreen === side) return "flex-[100] min-w-0 transition-all duration-500 z-20";
        if (fullscreen === null) return "flex-1 min-w-0 transition-all duration-500";
        // 被挤压的那一侧
        return "flex-[0.0001] min-w-[32px] max-w-[40px] overflow-hidden transition-all duration-250 z-10 pointer-events-none";
    };

    // 创建分屏动画
    const handleCreateSplit = () => {

        setSplitting(true);
        setSplit(true);
        setFullscreen('left'); // 先让左侧全屏，右侧只显示tablist
        setTimeout(() => {
            setFullscreen(null); // 还原为正常分屏
            setSplitting(false);
        }, ANIMATION_DURATION);
    };

    return (
        <div className={`flex w-full min-w-0 flex-1 relative transition-all duration-500 ${fullscreen ? 'gap-1' : 'gap-2'}`}>
            {/* 左栏 */}
            <div className={getPanelClass('left')}>
                <VerticalTabsCard
                    data={page.children[0].tabList}
                    position="left"
                    showFullscreen={split}
                    isFullscreen={fullscreen === 'left'}
                    onFullscreen={() => setFullscreen(fullscreen === 'left' ? null : 'left')}
                    onClose={() => {
                        if (split) setSplit(false);
                        setFullscreen(null);
                    }}
                    disableClose={!split}
                    onlyShowTabList={fullscreen === 'right'} // 右侧全屏时左侧只显示tablist
                    disabledTabList={fullscreen === 'right'} // 右侧全屏时左侧tablist禁用
                />
            </div>
            {split && (
                <div className={getPanelClass('right')}>
                    <VerticalTabsCard
                        data={page.children[1].tabList}
                        position="right"
                        showFullscreen={split}
                        isFullscreen={fullscreen === 'right'}
                        onFullscreen={() => setFullscreen(fullscreen === 'right' ? null : 'right')}
                        onClose={() => {
                            setSplit(false);
                            setFullscreen(null);
                        }}
                        disableClose={false}
                        onlyShowTabList={splitting || fullscreen === 'left'} // 分屏动画或左侧全屏时只显示tablist
                        disabledTabList={fullscreen === 'left'} // 左侧全屏时右侧tablist禁用
                    />
                </div>
            )}
            {/* 分屏按钮 */}
            {!split && (
                <div>
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
                        }}
                        onClick={handleCreateSplit}
                    >
                        Create Split Screen
                    </button>
                </div>
            )}
            {/* 分屏弹窗 */}
            {/* ...如有弹窗内容... */}
        </div>
    );
};

export default SplitScreenPanel;
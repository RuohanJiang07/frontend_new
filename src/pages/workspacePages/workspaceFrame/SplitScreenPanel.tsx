import React, { useState } from 'react';
import { useTabContext } from './TabContext';
import VerticalTabsCard from './VerticalTabsCard';


const ANIMATION_DURATION = 250; // ms

const SplitScreenPanel: React.FC = () => {
    const { pages, activePage, setPageSplit } = useTabContext();

    const page = pages[activePage];
    const split = !!page.split; // 取出当前page的分屏状态

    const [fullscreen, setFullscreen] = useState<'left' | 'right' | null>(null); // 哪一侧全屏
    const [splitting, setSplitting] = useState(false); // 是否处于分屏动画中

    if (!pages[activePage]) return null;

    // 动画样式
    // 优化 getPanelClass
    const getPanelClass = (side: 'left' | 'right') => {
        if (!split) return "flex-1 min-w-0 max-w-full transition-[flex-grow] duration-500";
        if (fullscreen === side) return "flex-[10] min-w-0 max-w-full transition-[flex-grow] duration-500 z-20";
        if (fullscreen === null) return "transition-[flex-grow] duration-500 max-w-full";
        // 被挤压的那一侧
        return "flex-[0.0001] min-w-[28px] max-w-[800px] overflow-hidden transition-all duration-500 z-10 pointer-events-none max-w-full ";
    };
    // 获取当前页面的分屏状态
    const getPanelStatus = (side: 'left' | 'right') => {
        if (!split) return false;
        if (fullscreen === side) return true;
        if (fullscreen === null) return false;
        // 被挤压的那一侧
        return false;
    };
    // 创建分屏动画
    const handleCreateSplit = () => {

        setSplitting(true);
        setPageSplit(activePage, true); // 记录分屏状态
        setFullscreen('left'); // 先让左侧全屏，右侧只显示tablist
        setTimeout(() => {
            setFullscreen(null); // 还原为正常分屏
            setSplitting(false);
        }, ANIMATION_DURATION);
    };

    // 关闭分屏

    const handleCloseSplit = () => {
        // 1. 先让右侧全屏（或左侧全屏），触发收缩动画
        setFullscreen('right'); // 你也可以用 'left'，看你想让哪边收缩
        setSplitting(true);

        // 2. 动画结束后再真正关闭分屏
        setTimeout(() => {
            setPageSplit(activePage, false); // 记录分屏状态
            setSplitting(false);
            setFullscreen(null);
        }, ANIMATION_DURATION);
    };

    return (
        <div className={`flex  min-w-0  relative max-w-full transition-all duration-500 ${fullscreen ? 'gap-2.5' : 'gap-[14px]'}`}>
            {/* 左栏 */}
            <div className={getPanelClass('left')}>
                <VerticalTabsCard
                    data={page.children[0].tabList}
                    position="left"
                    showFullscreen={split}
                    isFullscreen={getPanelStatus('left')}
                    onFullscreen={() => setFullscreen(fullscreen === 'left' ? null : 'left')}
                    onClose={handleCloseSplit}
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
                        isFullscreen={getPanelStatus('right')}
                        onFullscreen={() => setFullscreen(fullscreen === 'right' ? null : 'right')}
                        onClose={handleCloseSplit}
                        disableClose={false}
                        isRight={split && fullscreen !== 'right' && fullscreen !== null} // 右侧全屏时不允许关闭
                        onlyShowTabList={splitting || fullscreen === 'left'} // 分屏动画或左侧全屏时只显示tablist
                        disabledTabList={fullscreen === 'left'} // 左侧全屏时右侧tablist禁用
                    />
                </div>
            )}
            {/* 分屏按钮 */}
            {!split && (
                <div
                    className='flex mr-[-1rem]'
                >
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
                            borderLeft: 'none', // 去掉右边框
                            marginRight: '-1px',
                            backgroundColor: '#F5F5F5',
                            transform: 'rotate(180deg)', // 关键：旋转180度
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
            {/* 分屏弹窗 */}
            {/* ...如有弹窗内容... */}
        </div>
    );
};

export default SplitScreenPanel;
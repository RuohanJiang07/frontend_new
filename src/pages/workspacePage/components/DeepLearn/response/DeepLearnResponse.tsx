import React, { useState } from 'react';
import { Button } from '../../../../../components/ui/button';
import ForceGraph2D, { LinkObject, NodeObject } from 'react-force-graph-2d';
import {
  ArrowLeftIcon,
  GlobeIcon,
  FolderIcon,
  PlayIcon,
  ExternalLinkIcon
} from 'lucide-react';

interface DeepLearnResponseProps {
  onBack: () => void;
  isSplit?: boolean;
}

interface CustomNode extends NodeObject {
  id: string;
  x?: number;
  y?: number;
  color?: string;
  __bckgDimensions?: [number, number];
}

const myData: { nodes: CustomNode[]; links: LinkObject[] } = {
  nodes: [
    { id: 'Black Hole' },
    { id: 'White dwarf' },
    { id: 'Type I Supernova' },
    { id: 'Gravity Wave' },
    { id: 'Stretched Horizon' },
    { id: 'Cosmology' },
  ],
  links: [
    { source: 'Black Hole', target: 'White dwarf' },
    { source: 'Black Hole', target: 'Type I Supernova' },
    { source: 'Type I Supernova', target: 'White dwarf' },
    { source: 'Type I Supernova', target: 'Gravity Wave' },
    { source: 'Black Hole', target: 'Stretched Horizon' },
    { source: 'Black Hole', target: 'Cosmology' },
  ],
};

// 回答标题区域组件 - 缩小上下间距
const AnswerHeader: React.FC<{ title: string; tag: string; isSplit?: boolean }> = ({ title, tag, isSplit = false }) => (
  <div className={`mt-3 ${isSplit ? 'w-full' : 'w-[649px]'} mx-auto`}>
    <div className="flex items-center ml-0">
      <span className="text-black text-[13px] font-medium font-normal leading-normal">
        {title}
      </span>
      <span className="flex items-center justify-center ml-[9px] w-[61px] h-4 flex-shrink-0 rounded-lg border border-[#D9D9D9] bg-[#F9F9F9] text-[#6B6B6B] text-[9px] font-medium font-normal leading-normal">
        {tag}
      </span>
    </div>
    <div className={`mt-1.5 ${isSplit ? 'w-full' : 'w-[649px]'} h-[1.5px] bg-[#D9D9D9] rounded`} />
  </div>
);

// Source Webpages 区域占位组件 - 学习参考代码的样式
const SourceWebpagesPlaceholders: React.FC<{ isSplit?: boolean }> = ({ isSplit = false }) => (
  <div className={`flex justify-center mt-3 ${isSplit ? 'w-full' : 'w-[649px]'} mx-auto`}>
    {[0, 1, 2, 3].map((i) => (
      <div
        key={i}
        className={`${isSplit ? 'w-20 h-[50px]' : 'w-[114px] h-[73px]'} flex-shrink-0 rounded-lg border border-[rgba(179,179,179,0.58)] bg-[rgba(236,241,246,0.55)] shadow-[0px_1px_15px_0px_rgba(73,127,255,0.10)] ${i < 3 ? (isSplit ? 'mr-3' : 'mr-[18px]') : 'mr-0'}`}
      />
    ))}
    {/* More 按钮 placeholder */}
    <div className={`${isSplit ? 'w-[55px] h-[50px]' : 'w-[77px] h-[73px]'} flex-shrink-0 rounded-lg border border-[rgba(179,179,179,0.58)] bg-[rgba(236,241,246,0.55)] shadow-[0px_1px_15px_0px_rgba(73,127,255,0.10)] ${isSplit ? 'ml-3' : 'ml-[18px]'}`} />
  </div>
);

// 用户提问气泡组件 - 学习参考代码的样式
const UserQuestionBubble: React.FC<{
  content: string;
  time: string;
  className?: string;
  isSplit?: boolean;
}> = ({ content, time, className = "", isSplit = false }) => (
  <div className={`flex flex-col items-end mb-6 ${isSplit ? 'w-full' : 'w-[649px]'} mx-auto ${className}`}>
    <span className="font-medium text-[#636363] font-['Inter'] text-[10px] font-normal font-medium leading-normal mb-0.5 self-end">
      {time}
    </span>
    <div className={`flex items-center justify-center ${isSplit ? 'w-[140px]' : 'w-[163px]'} h-[34px] flex-shrink-0 rounded-[10px] bg-[#ECF1F6] self-end`}>
      <span className={`text-black font-['Inter'] ${isSplit ? 'text-[11px]' : 'text-[13px]'} font-medium font-normal leading-normal`}>
        {content}
      </span>
    </div>
  </div>
);

// 正文解释部分组件 - 学习参考代码的样式
const AnswerBody: React.FC<{ children: React.ReactNode; isSplit?: boolean }> = ({ children, isSplit = false }) => (
  <div className={`${isSplit ? 'w-full' : 'w-[649px]'} mx-auto mt-[18px]`}>
    <div className={`text-black ${isSplit ? 'text-[11px]' : 'text-[12px]'} font-normal font-normal leading-normal font-['Inter'] text-left`}>
      {children}
    </div>
    <div className={`mt-4 ${isSplit ? 'w-full' : 'w-[649px]'} h-[1.5px] bg-[#D9D9D9] rounded`} />
  </div>
);

// Follow Up Response 组件 - 学习参考代码的样式
const FollowUpResponse: React.FC<{ time: string; isSplit?: boolean }> = ({ time, isSplit = false }) => (
  <div className={`flex flex-col mt-[45px] ${isSplit ? 'w-full' : 'w-[649px]'} mx-auto`}>
    {/* Meta 信息行 */}
    <div className="flex items-center mb-1">
      <span className="flex items-center justify-center w-14 h-4 flex-shrink-0 rounded-lg border border-[#D9D9D9] bg-[#F9F9F9] text-[#6B6B6B] font-['Inter'] text-[9px] font-medium leading-normal">
        Follow Up
      </span>
      <span className="ml-1 text-[#636363] font-['Inter'] text-[10px] font-medium leading-normal">
        {time}
      </span>
    </div>

    {/* Follow Up 对话框 */}
    <div className="w-full rounded-[10px] bg-[#ECF1F6] flex-shrink-0 p-3">
      <div className={`text-black font-['Inter'] ${isSplit ? 'text-[11px]' : 'text-[13px]'} font-normal  leading-normal`}>
        悖论的核心矛盾
        量子决定性：给定量子系统的当前状态，未来状态可以被唯一确定；反之亦然。
        可逆性：量子力学演化是幺正的，即信息不会被破坏或丢失。
        霍金辐射的"无信息"：霍金辐射看似不携带黑洞内部的信息，信息似乎永久丢失。

        解决思路与主要理论
        2.1 全息原理与AdS/CFT对偶
        全息原理（Holographic Principle）认为，描述一个空间区域的所有物理信息，可以被编码在该区域的边界上（如黑洞的事件视界）。AdS/CFT对偶是这一原理的数学实现，它指出，一个五维反德西特空间（AdS）中的量子引力理论，等价于其四维边界上的共形场论（CFT）。在这种框架下，黑洞内部的信息可以被"映射"到边界上，从而避免信息丢失。

        全息原理的提出，解决了黑洞信息悖论的部分难题，并提供了新的理论工具。它表明，信息实际上并未丢失，而是以某种方式被"编码"在黑洞边界或外部宇宙中。
      </div>
    </div>
  </div>
);

function DeepLearnResponse({ onBack, isSplit = false }: DeepLearnResponseProps) {
  const [selectedMode, setSelectedMode] = useState<'deep-learn' | 'quick-search'>('deep-learn');
  const [hoverNode, setHoverNode] = useState<CustomNode | null>(null);

  return (
    <div className="h-[calc(100vh-88px)] flex flex-col bg-white overflow-hidden">
      {/* Header - 缩小上下padding */}
      <div className="flex items-center justify-between px-4 py-2 bg-white flex-shrink-0">
        <div className="flex items-center gap-[13px]">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="p-0 w-5 h-5 flex-shrink-0"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </Button>
          <h1 className="font-['Inter',Helvetica] text-[14px] font-medium text-black leading-normal">
            Learning Journey: Exploration of Black Hole and its Related Concepts
          </h1>
        </div>

        <div className="flex items-center gap-[23px]">
          {/* Publish to Community 按钮 - 学习参考代码的样式 */}
          <button className="flex items-center justify-between w-[163px] h-[25px] flex-shrink-0 rounded-lg bg-[#80A5E4] px-3 py-0 font-['Inter'] text-[12px] font-medium text-white leading-normal">
            <span className="whitespace-nowrap">Publish to Community</span>
            <span className="ml-1 flex items-center">
              {/* Publish SVG */}
              <img
                src="/workspace/publish_icon.svg"
                alt="Publish Icon"
                className="w-[18px] h-[17px]"
              />
            </span>
          </button>

          {/* 分享按钮 - 学习参考代码的样式 */}
          <button
            className="flex items-center justify-center w-[18px] h-[18px] flex-shrink-0 mr-[18px]"
            aria-label="Share"
          >
            <img
              src="/workspace/share_icon.svg"
              alt="Share Icon"
              className="w-5 h-5"
            />
          </button>

          {/* 打印按钮 - 调整间距和图标粗细 */}
          <button
            className="flex items-center justify-center w-[18px] h-[18px] flex-shrink-0"
            aria-label="Print"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6,9 6,2 18,2 18,9" />
              <path d="M6,18H4a2,2,0,0,1-2-2V11a2,2,0,0,1,2-2H20a2,2,0,0,1,2,2v5a2,2,0,0,1-2,2H18" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Content Area - 修复布局，防止页面滚动 */}
      <div className={`flex-1 flex overflow-hidden ${isSplit ? 'w-[95%]' : 'w-[70%]'}  self-center`}>
        {/* 整个内容区域居中 - 使用justify-center让内容组合在屏幕中央 */}
        <div className="flex-1 flex justify-center overflow-hidden">
          {/* 文字+sidebar组合 - 固定总宽度，在屏幕中央 */}
          <div className={`flex gap-6  ${isSplit ? 'max-w-[849px]' : 'max-w-[975px]'}`}>
            {/* Main Content - Scrollable - 固定宽度649px */}
            <div className={`${isSplit ? 'max-w-[449px]' : 'w-[649px]'}`}>
              <div className="h-[calc(100vh-280px)] overflow-y-auto py-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] flex-shrink-0">
                {/* User Question - 学习参考代码的conversation样式 */}
                <UserQuestionBubble content="黑洞信息悖论如何解决？" time="Me, Jun 1, 9:50 PM" isSplit={isSplit} />

                {/* AI Response - 学习参考代码的conversation样式 */}
                <div className="prose max-w-none font-['Inter',Helvetica] text-sm leading-relaxed">
                  <AnswerHeader title="黑洞信息悖论如何解决？" tag="Deep Learn" isSplit={isSplit} />
                  <SourceWebpagesPlaceholders isSplit={isSplit} />
                  <AnswerBody isSplit={isSplit}>
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-semibold text-base mb-3">1. 黑洞信息悖论的由来</h3>
                        <p className="mb-4">
                          黑洞信息悖论（Black Hole Information Paradox）源于量子力学与广义相对论在黑洞物理中的冲突。根据广义相对论，黑洞是一个引力极强、任何物质和辐射都无法逃逸的时空区域。1970年代，霍金（Stephen Hawking）将量子场论应用于黑洞附近，发现黑洞会通过量子效应向外辐射能量，这被称为"霍金辐射"。
                        </p>
                        <p className="mb-4">
                          霍金的计算表明，霍金辐射的性质仅与黑洞的总质量、电荷和角动量有关，而与黑洞形成时的初始状态（即落入黑洞的物质信息）无关。这意味着，多个不同的初始状态可以演化成相同的最终状态，而这些初始状态的详细信息会在黑洞蒸发过程中"丢失"，这与量子力学中的"信息守恒"原理（即系统的波函数演化是幺正的，信息不会无故消失）相矛盾。
                        </p>
                      </div>

                      <div>
                        <h3 className="font-semibold text-base mb-3">2. 悖论的核心矛盾</h3>
                        <ul className="list-disc pl-6 mb-4 space-y-2">
                          <li><strong>量子决定性</strong>：给定量子系统的当前状态，未来状态可以被唯一确定；反之亦然。</li>
                          <li><strong>可逆性</strong>：量子力学演化是幺正的，即信息不会被破坏或丢失。</li>
                          <li><strong>霍金辐射的"无信息"</strong>：霍金辐射看似不携带黑洞内部的信息，信息似乎永久丢失。</li>
                        </ul>
                      </div>

                      <div>
                        <h3 className="font-semibold text-base mb-3">解决思路与主要理论</h3>

                        <h4 className="font-medium text-sm mb-2">2.1 全息原理与AdS/CFT对偶</h4>
                        <p className="mb-4">
                          全息原理（Holographic Principle）认为，描述一个空间区域的所有物理信息，可以被编码在该区域的边界上（如黑洞的事件视界）。AdS/CFT对偶是这一原理的数学实现，它指出，一个五维反德西特时空（AdS）中的量子引力理论，等价于其四维边界上的共形场论（CFT）。在这种框架下，黑洞内部的信息可以被"映射"到边界上，从而避免信息丢失。
                        </p>
                        <p className="mb-4">
                          全息原理的提出，解决了黑洞信息悖论的部分难题，并提供了新的理论工具。它表明，信息实际上并未丢失，而是以某种方式被"编码"在黑洞边界或外部宇宙中。
                        </p>

                        <h4 className="font-medium text-sm mb-2">2.2 佩奇曲线与量子纠缠</h4>
                        <p className="mb-4">
                          佩奇（Don Page）提出，如果黑洞与外界之间的纠缠随时间变化遵循"佩奇曲线"，则说明信息会从黑洞中释放出来。这条曲线早期随辐射增加而上升，达到峰值（佩奇时间）后下降，最终归零，意味着信息被完整保留。
                        </p>
                        <p className="mb-4">
                          近年来，物理学家通过弦论、全息原理等方法，证明了黑洞的纠缠确实遵循佩奇曲线，信息会随着霍金辐射逐渐释放出来。
                        </p>

                        <h4 className="font-medium text-sm mb-2">2.3 ER=EPR假想</h4>
                        <p className="mb-4">
                          ER=EPR假想将爱因斯坦-罗森桥（ER，即虫洞）与量子纠缠（EPR，爱因斯坦-波多尔斯基-罗森悖论）联系起来，认为黑洞内部和外部的粒子通过虫洞连接，形成量子纠缠。这样，落入黑洞的信息会被保存在外部粒子中，并通过虫洞与内部粒子保持联系，从而避免了信息的丢失或复制。
                        </p>
                        <p className="mb-4">
                          这一假想为信息如何在黑洞内外传递提供了新的视角，但目前尚未被实验证实。
                        </p>

                        <h4 className="font-medium text-sm mb-2">4. 信息量子热力学</h4>
                        <p className="mb-4">
                          有理论提出，信息本身不是先天固有的，而是后天生成的，物质与信息相互关联。落入黑洞的物质信息会转化为热辐射、热熵等量子态，通过量子信息科学和经典热力学的结合，信息得以保留。
                        </p>
                      </div>
                    </div>
                  </AnswerBody>

                  {/* 新一轮提问，vertical spacing 40px - 学习参考代码的样式 */}
                  <UserQuestionBubble
                    content="黑洞信息悖论如何解决？"
                    time="Me, Jun 1, 9:55 PM"
                    className="mt-10"
                    isSplit={isSplit}
                  />

                  {/* Follow Up Response - 学习参考代码的样式 */}
                  <FollowUpResponse time="Jun 1, 9:58 PM" isSplit={isSplit} />


                </div>
              </div>
              {/* Fixed Bottom Input Box - 与文字对齐，使用相同的649px宽度，并计算正确的偏移量 */}
              <div
                className=" bg-white border border-gray-300 rounded-2xl px-4 py-2 shadow-sm h-[120px] text-[12px] flex flex-col justify-between"

              >
                <div className="flex items-center justify-between ">
                  <div className="flex items-center gap-4">
                    <span className="text-gray-700 font-['Inter',Helvetica] text-[12px]">Start a</span>
                    <button className="bg-[#F9F9F9] border border-[#D9D9D9] text-[#4A4A4A] rounded-xl px-2 py-0.5 font-['Inter',Helvetica] text-[12px] hover:bg-gray-100">
                      Follow Up
                    </button>
                    <span className="text-gray-500 font-['Inter',Helvetica] text-[12px]">or</span>
                    <button className="bg-[#F9F9F9] border border-[#D9D9D9] text-[#4A4A4A] rounded-xl px-2 py-0.5 font-['Inter',Helvetica] text-[12px] hover:bg-gray-100">
                      New Topic
                    </button>
                  </div>
                </div>

                <div className="space-y-0">
                  <div className="text-sm text-gray-600 font-['Inter',Helvetica]">
                    Note: If already selected
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 font-['Inter',Helvetica]">Change to</span>
                      <button className="bg-[#F9F9F9] border border-[#D9D9D9] text-[#4A4A4A] rounded-xl px-2 py-0.5 text-[12px] font-['Inter',Helvetica] hover:bg-gray-100">
                        New Topic
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <GlobeIcon className="w-4 h-4 text-gray-500" />

                      {/* Deep Learn / Quick Search Toggle */}
                      <div
                        className="w-[180px] h-[30px] bg-[#ECF1F6] rounded-[16.5px] flex items-center cursor-pointer relative"
                        onClick={() => setSelectedMode(selectedMode === 'deep-learn' ? 'quick-search' : 'deep-learn')}
                      >
                        <div
                          className={`absolute top-1 w-[84px] h-[22px] bg-white rounded-[14px] transition-all duration-300 ease-in-out z-10 ${selectedMode === 'deep-learn' ? 'left-1.5' : 'left-[94px]'
                            }`}
                        />
                        <div className="absolute left-4 h-full flex items-center z-20">
                          <span className="text-[#6B6B6B] font-['Inter',Helvetica] text-xs font-medium">Deep Learn</span>
                        </div>
                        <div className="absolute right-3 h-full flex items-center z-20">
                          <span className="text-[#6B6B6B] font-['Inter',Helvetica] text-xs font-medium">Quick Search</span>
                        </div>
                      </div>

                      <Button variant="ghost" size="icon" className="w-8 h-8 text-gray-600">
                        <FolderIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sidebar - 紧贴左侧文字，缩小间距 */}
            <div className={`${isSplit ? 'pr-[-100px]' : 'p-0'} flex flex-col gap-[22px] py-6 flex-shrink-0 overflow-hidden`}>
              {/* Fixed Right Sidebar - Related Contents - 缩小顶部间距 */}
              <div className="flex flex-col flex-1 max-w-[220px] rounded-[13px] border border-[rgba(73,127,255,0.22)] bg-white shadow-[0px_1px_30px_2px_rgba(73,127,255,0.05)] overflow-hidden mt-3">
                {/* Title Section - 修复边框对齐问题 */}
                <div className="flex-shrink-0 w-full h-[58.722px] rounded-t-[13px] bg-[#ECF1F6] p-3 flex flex-col justify-between">
                  {/* First row - Icon and "Related Contents" text */}
                  <div className="flex items-center">
                    <img
                      src="/workspace/related_content_icon.svg"
                      alt="Related Contents Icon"
                      className="flex-shrink-0 mr-2 w-[18.432px] h-[18px]"
                    />
                    <span className="text-[#0064A2] font-['Inter'] text-[12px] font-medium leading-normal">
                      Related Contents
                    </span>
                  </div>

                  {/* Second row - "See more on this topic" text */}
                  <div className="ml-1">
                    <span className="text-black font-['Inter'] text-[14px] font-semibold leading-normal">
                      See more on this topic
                    </span>
                  </div>
                </div>

                {/* Scrollable Content Section - 添加Related Contents内容 */}
                <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  <div className="bg-white p-3">
                    {/* Related Videos */}
                    <div className="mb-4">
                      <h4 className="font-medium text-xs text-black mb-2">Related Videos</h4>
                      <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
                        <div className="w-full h-20 bg-gradient-to-r from-yellow-400 via-blue-500 to-yellow-400 relative flex items-center justify-center">
                          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                          <div className="text-center z-10">
                            <div className="text-yellow-300 font-bold text-xs mb-1">QUANTUM</div>
                            <div className="flex items-center justify-center mb-1">
                              <div className="w-4 h-4 bg-red-600 rounded-full flex items-center justify-center mr-1">
                                <div className="w-2 h-2 bg-black rounded-full"></div>
                              </div>
                              <div className="text-blue-400 text-xs">⚡ ⚡</div>
                            </div>
                            <div className="text-white font-bold text-xs">ENTANGLEMENT</div>
                          </div>
                        </div>
                        <div className="p-2">
                          <p className="text-[10px] text-black mb-1 font-medium">Quantum Entanglement: Explained in REALLY SIMPLE Words</p>
                          <div className="flex items-center gap-1">
                            <div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div>
                            <p className="text-[9px] text-red-600 font-medium">Science ABC</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Related Webpages */}
                    <div className="mb-4">
                      <h4 className="font-medium text-xs text-black mb-2">Related Webpages</h4>
                      <div className="grid grid-cols-2 gap-1.5">
                        <div className="bg-[#F0F0F0] rounded-lg p-2">
                          <div className="text-[9px] font-medium text-black mb-1">ScienceDirect discusses quantum entanglement.</div>
                          <div className="text-[8px] text-gray-600 mb-1">Explore the phenomenon crucial for quantum information processing applications.</div>
                          <div className="text-[8px] text-black mb-1">Quantum Entanglement - an o...</div>
                          <div className="text-[8px] text-orange-600">📄 ScienceDirect.com</div>
                        </div>
                        <div className="bg-[#F0F0F0] rounded-lg p-2">
                          <div className="text-[9px] font-medium text-black mb-1">NASA's take entanglement</div>
                          <div className="text-[8px] text-gray-600 mb-1">Learn about nature of par common orig</div>
                          <div className="text-[8px] text-black mb-1">What is Qua</div>
                          <div className="text-[8px] text-blue-600">🌐 NASA Sc</div>
                        </div>
                      </div>
                    </div>

                    {/* Related Concepts */}
                    <div>
                      <h4 className="font-medium text-xs text-black mb-2">Related Concepts</h4>
                      <div className="space-y-2">
                        <div>
                          <div className="text-[9px] font-medium text-black mb-1">Understand the fundamental principles of quantum entanglement.</div>
                          <div className="bg-[#D5EBF3] text-[#1e40af] px-1.5 py-0.5 rounded text-[8px] inline-block">
                            Interconnected Fate
                          </div>
                        </div>
                        <div className="bg-[#E8D5F3] text-[#6b21a8] px-1.5 py-0.5 rounded text-[8px] inline-block">
                          Instantaneous Correlation
                        </div>
                        <div className="bg-[#D5F3E8] text-[#059669] px-1.5 py-0.5 rounded text-[8px] inline-block">
                          Randomness
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fixed Right Sidebar - Concept Map - 修复边框对齐 */}
              <div className="flex flex-col max-w-[220px] h-[228.464px] flex-shrink-0 rounded-[13px] border border-[rgba(157,155,179,0.30)] bg-white shadow-[0px_1px_30px_2px_rgba(242,242,242,0.63)] overflow-hidden">
                {/* Header Section - 修复边框对齐问题 */}
                <div className="flex-shrink-0 w-full h-[59.736px] bg-[rgba(228,231,239,0.62)] rounded-t-[13px] p-3 flex flex-col justify-between">
                  {/* First row - Icon and "Concept Map" text */}
                  <div className="flex items-center">
                    <img
                      src="/workspace/concept_map_icon.svg"
                      alt="Concept Map Icon"
                      className="mr-2 w-[17px] h-[17px]"
                    />
                    <span className="text-[#63626B] font-['Inter'] text-[12px] font-medium leading-normal">
                      Concept Map
                    </span>
                  </div>

                  {/* Second row - "Your Learning Roadmap" text */}
                  <div className="ml-1">
                    <span className="text-black font-['Inter'] text-[14px] font-semibold leading-normal">
                      Your Learning Roadmap
                    </span>
                  </div>
                </div>

                {/* Content Section - Scaled Concept Map */}
                <div className="flex-1 overflow-hidden">
                  <div className="w-full h-full bg-white">
                    <ForceGraph2D
                      graphData={myData}
                      width={256}
                      height={168}
                      nodeAutoColorBy="group"
                      onNodeHover={(node: NodeObject | null) => {
                        setHoverNode(node as CustomNode | null);
                      }}
                      nodeCanvasObject={(node: CustomNode, ctx, globalScale) => {
                        const label = node.id;
                        const fontSize = 10 / globalScale;
                        ctx.font = `${fontSize}px Sans-Serif`;

                        const textWidth = ctx.measureText(label).width;
                        const bckgDimensions: [number, number] = [
                          textWidth + fontSize * 0.2,
                          fontSize + fontSize * 0.2,
                        ];
                        const x = node.x ?? 0;
                        const y = node.y ?? 0;

                        if (hoverNode?.id === node.id) {
                          ctx.save();
                          ctx.shadowColor = node.color || '#4f46e5';
                          ctx.shadowBlur = 15;
                          ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
                          ctx.fillRect(x - bckgDimensions[0] / 2, y - bckgDimensions[1] / 2, ...bckgDimensions);
                          ctx.restore();
                        } else {
                          ctx.fillStyle = 'rgba(255, 255, 255, 0)';
                          ctx.fillRect(x - bckgDimensions[0] / 2, y - bckgDimensions[1] / 2, ...bckgDimensions);
                        }

                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillStyle = node.color ?? '#000';
                        ctx.fillText(label, x, y);

                        node.__bckgDimensions = bckgDimensions;
                      }}
                      linkPointerAreaPaint={(node: CustomNode, color, ctx) => {
                        const bckg = node.__bckgDimensions;
                        if (bckg) {
                          ctx.fillStyle = color;
                          ctx.fillRect(
                            (node.x ?? 0) - bckg[0] / 2,
                            (node.y ?? 0) - bckg[1] / 2,
                            ...bckg
                          );
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


    </div >
  );
}

export default DeepLearnResponse;
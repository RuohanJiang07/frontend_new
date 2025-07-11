import { Tabs, TabsList, TabsTrigger } from '@radix-ui/react-tabs';
import { GlobeIcon, PaperclipIcon, FolderIcon, ChevronDownIcon } from 'lucide-react';
import { Button } from '../../../../../components/ui/button';
import { Card, CardContent } from '../../../../../components/ui/card';
import { useState } from 'react';
import DeepLearnResponse from '../response/DeepLearnResponse';

interface DeepLearnProps {
  isSplit?: boolean;
  onBack?: () => void;
  onViewChange?: (view: string | null) => void;
}

const learningCards = [
  {
    id: 1,
    title: "Physical Understanding of Schrödinger Equation",
    tag: "Schrödinger Equation",
    tagColor: "bg-[#ffdd89]",
    image: "https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=400",
  },
  {
    id: 2,
    title: "Medieval History and Story of the Crusades",
    tag: "The Crusades",
    tagColor: "bg-[#96d8ff]",
    image: "https://images.pexels.com/photos/161154/book-read-literature-pages-161154.jpeg?auto=compress&cs=tinysrgb&w=400",
  },
  {
    id: 3,
    title: "CRISPR Technology in the Context of Gene Editing and Specific Approach",
    tag: "CRISPR",
    tagColor: "bg-[#c2dcdc]",
    image: "https://images.pexels.com/photos/2280549/pexels-photo-2280549.jpeg?auto=compress&cs=tinysrgb&w=400",
  },
  {
    id: 4,
    title: "How to Make Oxygen from metals?",
    tag: "Oxygen",
    tagColor: "bg-[#96d8ff]",
    image: "https://images.pexels.com/photos/2280571/pexels-photo-2280571.jpeg?auto=compress&cs=tinysrgb&w=400",
  },
  {
    id: 5,
    title: "Explain to Me the Mechanism of Neuron Networks",
    tag: "Neuron Net",
    tagColor: "bg-[#f9aaaa]",
    image: "https://images.pexels.com/photos/8386434/pexels-photo-8386434.jpeg?auto=compress&cs=tinysrgb&w=400",
  },
  {
    id: 6,
    title: "Medieval History and Story of the Crusades",
    tag: "The Crusades",
    tagColor: "bg-[#96d8ff]",
    image: "https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=400",
  },
  {
    id: 7,
    title: "Explain to Me the Mechanism of Neuron Networks",
    tag: "Neuron Net",
    tagColor: "bg-[#f9aaaa]",
    image: "https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=400",
  },
  {
    id: 8,
    title: "Medieval History and Story of the Crusades",
    tag: "The Crusades",
    tagColor: "bg-[#c88eff]",
    image: "https://images.pexels.com/photos/256541/pexels-photo-256541.jpeg?auto=compress&cs=tinysrgb&w=400",
  },
];

function DeepLearn({ isSplit = false, onBack, onViewChange }: DeepLearnProps) {
  const [selectedMode, setSelectedMode] = useState<'deep-learn' | 'quick-search'>('deep-learn');
  const [selectedTab, setSelectedTab] = useState<'trending' | 'history'>('trending');
  const [inputText, setInputText] = useState('');
  const [additionalComments, setAdditionalComments] = useState('');

  const handleCardClick = (cardId: number) => {
    // Notify parent component to change view to response
    onViewChange?.('deep-learn-response');
  };

  const handleBackToEntry = () => {
    // Notify parent component to go back to default view
    onViewChange?.(null);
  };

  // If we're in response view, render the response component
  // This will be handled by the parent component based on activeView
  return (
    <div className=" overflow-y-auto h-[calc(100vh-88px)]">
      <main className="flex-1 p-12 max-w-7xl mx-auto">
        {/* Header with icon and title */}
        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center gap-4">
            <img
              className="w-12 h-10"
              alt="Hyperknow logo"
              src="/main/landing_page/hyperknow_logo 1.svg"
            />
            <div>
              <h2 className="font-['Outfit',Helvetica] font-medium text-black text-2xl">
                Deep Learn
              </h2>
              <p className="font-['Outfit',Helvetica] font-medium text-black text-[13px]">
                making true understanding unprecedentedly easy
              </p>
            </div>
          </div>
        </div>

        {/* Network icon + Deep Learn/Quick Search toggle - 与input box右对齐 */}
        <div className="w-full max-w-4xl mx-auto flex justify-end items-center gap-3 mb-4">
          <GlobeIcon className="w-6 h-6 text-gray-600" />

          {/* Deep Learn / Quick Search 可选择切换 */}
          <div
            className="w-[200px] h-[35px] bg-[#ECF1F6] rounded-[17.5px] flex items-center cursor-pointer relative"
            onClick={() => setSelectedMode(selectedMode === 'deep-learn' ? 'quick-search' : 'deep-learn')}
          >
            <div
              className={`absolute top-1 w-[90px] h-[27px] bg-white rounded-[13.5px] transition-all duration-300 ease-in-out z-10 shadow-sm ${selectedMode === 'deep-learn' ? 'left-1' : 'left-[108px]'
                }`}
            />
            <div className="absolute left-4 h-full flex items-center z-20">
              <span className="font-['Inter',Helvetica] font-medium text-[#898989] text-xs">
                Deep Learn
              </span>
            </div>
            <div className="absolute right-4 h-full flex items-center z-20">
              <span className="font-['Inter',Helvetica] font-medium text-[#898989] text-xs">
                Quick Search
              </span>
            </div>
          </div>
        </div>

        {/* Search Input Section - 多行支持，无滚动条 */}
        <div className="flex justify-center mb-4">
          <Card className="w-full max-w-4xl h-[155px] rounded-[13px] border-[#d0d9e3] shadow-[0px_3px_60px_1px_#4870d00d]">
            <CardContent className="p-5 h-full flex flex-col">
              {/* 主要输入框 - 支持多行，无滚动条 */}
              <textarea
                className="flex-1 text-base font-medium font-['Inter',Helvetica] text-[#969696] border-0 resize-none outline-none bg-transparent placeholder:text-[#969696] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                placeholder="Enter the topic you'd like to learn..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-6">
                <textarea
                  className="w-full sm:w-[391px] h-[30px] bg-[#ecf1f6] rounded-[5px] text-xs font-medium font-['Inter',Helvetica] text-[#898989] border-0 resize-none outline-none px-3 py-2 placeholder:text-[#898989] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                  placeholder="Enter additional comments..."
                  value={additionalComments}
                  onChange={(e) => setAdditionalComments(e.target.value)}
                />

                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-[25px] bg-[#edf2f7] rounded-lg text-xs font-medium text-[#6b6b6b] flex items-center gap-1"
                  >
                    <PaperclipIcon className="h-[18px] w-[18px]" />
                    Profile
                    <ChevronDownIcon className="w-3 h-3" />
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="h-[25px] bg-[#ecf1f6] rounded-lg text-xs font-medium text-[#6b6b6b] flex items-center gap-1"
                  >
                    <FolderIcon className="h-[19px] w-[19px]" />
                    <span className="hidden sm:inline">Reference From Drive</span>
                    <span className="sm:hidden">Drive</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trending/History tabs - 与input box左对齐 */}
        <div className="w-full max-w-4xl mx-auto flex justify-start mb-8">
          <div className="w-[140px] h-[32px] bg-[#ECF1F6] rounded-lg flex items-center relative cursor-pointer">
            <div
              className={`absolute top-1 w-[65px] h-[24px] bg-white rounded transition-all duration-300 ease-in-out z-10 shadow-sm ${selectedTab === 'trending' ? 'left-1' : 'left-[72px]'
                }`}
            />
            <div
              className="absolute left-3 h-full flex items-center z-20 cursor-pointer"
              onClick={() => setSelectedTab('trending')}
            >
              <span className="font-['Inter',Helvetica] font-medium text-[#898989] text-xs">
                Trending
              </span>
            </div>
            <div
              className="absolute right-3 h-full flex items-center z-20 cursor-pointer"
              onClick={() => setSelectedTab('history')}
            >
              <span className="font-['Inter',Helvetica] font-medium text-[#898989] text-xs">
                History
              </span>
            </div>
          </div>
        </div>

        {/* Learning cards grid - 确保每行4个卡片 */}
        <div className="grid grid-cols-4 gap-x-3 gap-y-6 max-w-[860px] mx-auto">
          {learningCards.map((card) => (
            <Card
              key={card.id}
              className="w-[203px] rounded-[10px] shadow-[0px_3px_60px_1px_#476fcf21] overflow-hidden hover:shadow-[0px_6px_80px_2px_#476fcf35] transition-all duration-200 cursor-pointer"
              onClick={() => handleCardClick(card.id)}
            >
              <CardContent className="p-0">
                <div className="flex justify-center pt-[15px]">
                  <img
                    className="w-[163px] h-[106px] object-cover rounded"
                    alt="Topic illustration"
                    src={card.image}
                  />
                </div>

                <div className="p-3.5 pt-6">
                  <h3 className="font-['Inter',Helvetica] font-medium text-[#0064a2] text-[13px] mb-4 line-clamp-3">
                    {card.title}
                  </h3>

                  <div
                    className={`${card.tagColor} rounded-[10px] px-2.5 py-1 inline-block`}
                  >
                    <span className="font-['Inter',Helvetica] font-medium text-white text-[11px]">
                      {card.tag}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}

export default DeepLearn
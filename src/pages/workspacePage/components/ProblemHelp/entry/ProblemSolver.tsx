import React, { useState } from 'react';
import { Button } from '../../../../../components/ui/button';
import {
  ChevronDownIcon,
  UserIcon,
  PaperclipIcon,
  SearchIcon,
  UploadIcon
} from 'lucide-react';
import ProblemHelpResponse from '../response/ProblemHelpResponse';

interface ProblemHistoryItem {
  id: number;
  problem: string;
  date: string;
  type: 'Step-by-step' | 'Solution';
}

interface ProblemSolverProps {
  onBack?: () => void;
  onViewChange?: (view: string | null) => void;
}

function ProblemSolver({ onBack, onViewChange }: ProblemSolverProps) {
  const [problemText, setProblemText] = useState('');
  const [selectedModel, setSelectedModel] = useState('GPT-4o');
  const [selectedMode, setSelectedMode] = useState<'step-by-step' | 'solution'>('step-by-step');
  const [sortBy, setSortBy] = useState('Date/Type');

  // Sample history data
  const historyItems: ProblemHistoryItem[] = [
    {
      id: 1,
      problem: "What's the derivation of x^2",
      date: "Apr 18, 2025, 12:56 PM",
      type: "Step-by-step"
    },
    {
      id: 2,
      problem: "Why does a rainbow contain a pure spread...",
      date: "Apr 18, 2025, 12:56 PM",
      type: "Solution"
    },
    {
      id: 3,
      problem: "Why does a rainbow contain a pure spread...",
      date: "Apr 18, 2025, 12:56 PM",
      type: "Solution"
    },
    {
      id: 4,
      problem: "What's the derivation of x^2",
      date: "Apr 18, 2025, 12:56 PM",
      type: "Step-by-step"
    },
    {
      id: 5,
      problem: "Why does a rainbow contain a pure spread...",
      date: "Apr 18, 2025, 12:56 PM",
      type: "Step-by-step"
    },
    {
      id: 6,
      problem: "Why does a rainbow contain a pure spread...",
      date: "Apr 18, 2025, 12:56 PM",
      type: "Solution"
    },
    {
      id: 7,
      problem: "What's the derivation of x^2",
      date: "Apr 18, 2025, 12:56 PM",
      type: "Step-by-step"
    }
  ];

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;
  const totalPages = Math.ceil(historyItems.length / itemsPerPage);

  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return historyItems.slice(startIndex, endIndex);
  };

  const handleHistoryItemClick = (item: ProblemHistoryItem) => {
    // Notify parent component to change view to response
    onViewChange?.('problem-help-response');
  };

  const handleBackToEntry = () => {
    // Notify parent component to go back to default view
    onViewChange?.(null);
  };

  // If we're in response view, render the response component
  // This will be handled by the parent component based on activeView
  return (
    <div className="h-[calc(100vh-88px)] flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <main className="flex-1 p-12 max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-center mb-[55px]">
            <div className="flex items-center gap-4">
              <img
                className="w-12 h-10"
                alt="Hyperknow logo"
                src="/main/landing_page/hyperknow_logo 1.svg"
              />
              <div>
                <h2 className="font-['Outfit',Helvetica] font-medium text-black text-2xl">
                  Problem Help
                </h2>
                <p className="font-['Outfit',Helvetica] font-medium text-black text-[13px]">
                  get step-by-step help for problem sets
                </p>
              </div>
            </div>
          </div>

          {/* Upload area */}
          <div className="flex justify-center mb-6">
            <div className="flex w-[661px] h-[100px] p-6 flex-col justify-center items-center gap-2 border-2 border-dashed border-[#0064A2] bg-[rgba(226,238,252,0.60)] rounded-lg">
              <UploadIcon className="w-9 h-9 text-[#B3B3B3]" strokeWidth={2} />
              <p className="text-[#6B6B6B] text-center font-['Inter',Helvetica] text-sm font-normal leading-5">
                Drag or upload additional context here
              </p>
            </div>
          </div>

          {/* Input box */}
          <div className="flex justify-center relative mt-5">
            <div className="w-[720px] h-36 border border-[#D0DAE4] bg-white rounded-[13px] shadow-[0px_3px_60px_1px_rgba(72,112,208,0.05)] relative">
              <textarea
                className="w-full h-full resize-none bg-transparent outline-none border-none rounded-[13px] p-4 text-[#6B6B6B] font-['Inter',Helvetica] text-base font-medium placeholder:text-[#6B6B6B]"
                placeholder="Paste or type your problem here..."
                value={problemText}
                onChange={(e) => setProblemText(e.target.value)}
              />

              {/* GPT-4o button */}
              <Button
                variant="outline"
                size="sm"
                className="absolute bottom-3 left-3 w-[106px] h-[25px] bg-[rgba(236,241,246,0.63)] border-none rounded-lg flex items-center justify-center gap-1 p-0 hover:bg-[rgba(236,241,246,0.8)]"
              >
                <div className="w-4 h-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8.00033 10.0001C8.55588 10.0001 9.0281 9.80564 9.41699 9.41675C9.80588 9.02786 10.0003 8.55564 10.0003 8.00008C10.0003 7.44453 9.80588 6.9723 9.41699 6.58341C9.0281 6.19453 8.55588 6.00008 8.00033 6.00008C7.44477 6.00008 6.97255 6.19453 6.58366 6.58341C6.19477 6.9723 6.00033 7.44453 6.00033 8.00008C6.00033 8.55564 6.19477 9.02786 6.58366 9.41675C6.97255 9.80564 7.44477 10.0001 8.00033 10.0001ZM8.00033 11.3334C7.0781 11.3334 6.29199 11.0084 5.64199 10.3584C4.99199 9.70841 4.66699 8.9223 4.66699 8.00008C4.66699 7.07786 4.99199 6.29175 5.64199 5.64175C6.29199 4.99175 7.0781 4.66675 8.00033 4.66675C8.92255 4.66675 9.70866 4.99175 10.3587 5.64175C11.0087 6.29175 11.3337 7.07786 11.3337 8.00008C11.3337 8.9223 11.0087 9.70841 10.3587 10.3584C9.70866 11.0084 8.92255 11.3334 8.00033 11.3334ZM3.33366 8.66675H0.666992V7.33341H3.33366V8.66675ZM15.3337 8.66675H12.667V7.33341H15.3337V8.66675ZM7.33366 3.33341V0.666748H8.66699V3.33341H7.33366ZM7.33366 15.3334V12.6667H8.66699V15.3334H7.33366ZM4.26699 5.16675L2.58366 3.55008L3.53366 2.56675L5.13366 4.23341L4.26699 5.16675ZM12.467 13.4334L10.8503 11.7501L11.7337 10.8334L13.417 12.4501L12.467 13.4334ZM10.8337 4.26675L12.4503 2.58341L13.4337 3.53341L11.767 5.13341L10.8337 4.26675ZM2.56699 12.4667L4.25033 10.8501L5.16699 11.7334L3.55033 13.4167L2.56699 12.4667Z" fill="#6B6B6B" />
                  </svg>
                </div>
                <span className="text-[#6B6B6B] font-['Inter',Helvetica] text-xs font-medium">GPT-4o</span>
                <ChevronDownIcon className="w-3 h-3 text-[#6B6B6B]" />
              </Button>

              {/* Mode selection toggle */}
              <div
                className="absolute bottom-3 left-[130px] w-[168px] h-[30px] bg-[#ECF1F6] rounded-[16.5px] flex items-center cursor-pointer"
                onClick={() => setSelectedMode(selectedMode === 'step-by-step' ? 'solution' : 'step-by-step')}
              >
                <div
                  className={`absolute top-1 w-24 h-[22px] bg-white rounded-[14px] transition-all duration-300 ease-in-out z-10 ${selectedMode === 'step-by-step' ? 'left-1.5' : 'left-[66px]'
                    }`}
                />
                <div className="absolute left-4 h-full flex items-center z-20">
                  <span className="text-[#6B6B6B] font-['Inter',Helvetica] text-xs font-medium">Step-by-step</span>
                </div>
                <div className="absolute right-3.5 h-full flex items-center z-20">
                  <span className="text-[#6B6B6B] font-['Inter',Helvetica] text-xs font-medium">Solution</span>
                </div>
              </div>

              {/* Profile selection button */}
              <Button
                variant="outline"
                size="sm"
                className="absolute bottom-3 right-[18px] w-[81px] h-[25px] bg-[#EDF2F7] border-none rounded-lg flex items-center justify-center gap-1 p-0 hover:bg-[#e2e8f0]"
              >
                <UserIcon className="w-3 h-3 text-[#6B6B6B]" />
                <span className="text-[#6B6B6B] font-['Inter',Helvetica] text-xs font-medium">Profile</span>
                <ChevronDownIcon className="w-3 h-3 text-[#6B6B6B]" />
              </Button>
            </div>
          </div>

          {/* History section - moved closer to search box */}
          <div className="w-full max-w-4xl mx-auto mt-4">
            {/* History header and controls */}
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-black font-['Inter',Helvetica] text-xl font-medium">
                History
              </h3>

              <div className="flex items-center gap-2">
                {/* DA button */}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-[30px] h-[29px] bg-[#ECF1F6] border-none rounded-lg flex items-center justify-center p-0"
                >
                  <span className="text-[#6B6B6B] font-['Inter',Helvetica] text-xs font-medium">DA</span>
                </Button>

                {/* Sort button */}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-[120px] h-[29px] bg-[#ECF1F6] border-none rounded-lg flex items-center justify-center p-0"
                >
                  <span className="text-[#6B6B6B] font-['Inter',Helvetica] text-xs font-medium">Date/Type</span>
                </Button>

                {/* Search bar */}
                <div className="w-[172px] h-[29px] bg-[#ECF1F6] rounded-lg flex items-center px-2">
                  <SearchIcon className="w-4 h-4 text-[#6B6B6B]" />
                  <span className="ml-2 text-[#6B6B6B] font-['Inter',Helvetica] text-xs">Search...</span>
                </div>
              </div>
            </div>

            {/* Table with exact styling from screenshot */}
            <div className="w-full bg-white">
              {/* Column headers - moved up closer */}
              <div className="grid grid-cols-12 gap-4 py-2 border-b border-gray-200">
                <div className="col-span-6 px-4">
                  <span className="text-black font-['Inter',Helvetica] text-base font-normal">Problem</span>
                </div>
                <div className="col-span-3 px-4">
                  <span className="text-black font-['Inter',Helvetica] text-base font-normal">Date</span>
                </div>
                <div className="col-span-3 px-4">
                  <span className="text-black font-['Inter',Helvetica] text-base font-normal">Type</span>
                </div>
              </div>

              {/* History rows */}
              <div className="divide-y divide-gray-100">
                {getCurrentPageItems().map((item, index) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-12 gap-4 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleHistoryItemClick(item)}
                  >
                    <div className="col-span-6 flex items-center gap-3 px-4">
                      <PaperclipIcon className="w-4 h-4 text-gray-600 flex-shrink-0" />
                      <span className="text-black font-['Inter',Helvetica] text-base font-normal">
                        {item.problem}
                      </span>
                    </div>
                    <div className="col-span-3 flex items-center px-4">
                      <span className="text-black font-['Inter',Helvetica] text-base font-normal">
                        {item.date}
                      </span>
                    </div>
                    <div className="col-span-3 flex items-center px-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-lg text-sm font-medium font-['Inter',Helvetica] ${item.type === 'Step-by-step'
                          ? 'bg-[#D5EBF3] text-[#1e40af]'
                          : 'bg-[#D5DAF3] text-[#6b21a8]'
                          }`}
                      >
                        {item.type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pagination - exact styling from image */}
            <div className="flex items-center justify-center gap-1 mt-8">
              {Array.from({ length: Math.min(6, totalPages) }, (_, i) => i + 1).map((page) => (
                <div
                  key={page}
                  className={`w-8 h-8 flex items-center justify-center cursor-pointer text-sm font-['Inter',Helvetica] ${page === currentPage
                    ? 'bg-[#ECF1F6] text-black rounded'
                    : 'text-gray-600 hover:bg-gray-100 rounded'
                    }`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </div>
              ))}
              {totalPages > 6 && (
                <div
                  className="px-3 h-8 flex items-center justify-center cursor-pointer text-sm font-['Inter',Helvetica] text-gray-600 hover:bg-gray-100 rounded"
                  onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
                >
                  Next
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default ProblemSolver;
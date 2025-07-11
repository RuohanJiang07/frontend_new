import React, { useState } from 'react';
import { Button } from '../../../../../components/ui/button';
import {
  ArrowLeftIcon,
  ShareIcon,
  ThumbsUpIcon,
  ThumbsDownIcon,
  CopyIcon,
  FolderIcon,
  UploadIcon,
  PlusIcon
} from 'lucide-react';

interface DocumentChatResponseProps {
  onBack: () => void;
  isSplit?: boolean;
}

function DocumentChatResponse({ onBack, isSplit = false }: DocumentChatResponseProps) {
  const [question, setQuestion] = useState('');

  // Sample uploaded files
  const uploadedFiles = [
    {
      id: 1,
      name: 'Introduction to Mechanics, K.K',
      type: 'pdf'
    },
    {
      id: 2,
      name: 'Cosmology and its origins, Cambridge',
      type: 'pdf'
    },
    {
      id: 3,
      name: 'NASA ADS Library Investigations',
      type: 'doc'
    }
  ];

  const getFileIcon = (type: string) => {
    if (type === 'pdf') {
      // Red version of the docs icon (same as docs but red stroke)
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2">
          <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    }
    // Note icon similar to NotePage (blue stroke)
    return (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2">
        <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    );
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuestion(suggestion);
  };

  return (
    <div className=" flex flex-col bg-white">
      {/* Fixed Header - No border */}
      <div className="flex items-center justify-between p-4 bg-white z-10">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="p-2"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </Button>
          <h1 className="font-medium text-base text-black font-['Inter',Helvetica]">
            Learning Journey: Exploration of Black Hole and its Related Concepts
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Button className="bg-[#6B94E4] hover:bg-[#5a82d1] text-white rounded-lg px-4 py-2 flex items-center gap-2 font-['Inter',Helvetica] text-sm">
            Publish to Community
            <ShareIcon className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="p-2"
          >
            <ShareIcon className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="p-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </Button>
        </div>
      </div>

      {/* Main Content Area - with doubled side margins for even more centered content */}
      <div className={`flex-1 flex overflow-hidden ${isSplit ? 'px-8' : 'px-32'}`}>
        {/* Left Sidebar - No border, moved even further in from edge */}
        <div className={`${isSplit ? 'w-[200px]' : 'w-[280px]'} p-4 bg-white flex-shrink-0 ${isSplit ? 'ml-0' : 'ml-16'}`}>
          {/* Upload Buttons */}
          <div className="space-y-2 mb-6">
            <Button
              variant="outline"
              className="w-full h-10 bg-[#ECF1F6] border-[#ADADAD] text-[#ADADAD] rounded-lg flex items-center justify-center gap-2 font-['Inter',Helvetica] text-sm hover:bg-[#e2e8f0]"
            >
              <FolderIcon className="w-4 h-4" />
              {isSplit ? "Select" : "Select From Drive"}
            </Button>
            <Button
              variant="outline"
              className="w-full h-10 bg-[#ECF1F6] border-[#ADADAD] text-[#ADADAD] rounded-lg flex items-center justify-center gap-2 font-['Inter',Helvetica] text-sm hover:bg-[#e2e8f0]"
            >
              <UploadIcon className="w-4 h-4" />
              {isSplit ? "Upload" : "Upload from Device"}
            </Button>
            <Button
              variant="outline"
              className="w-full h-10 bg-[#ECF1F6] border-[#ADADAD] text-[#ADADAD] rounded-lg flex items-center justify-center gap-2 font-['Inter',Helvetica] text-sm hover:bg-[#e2e8f0]"
            >
              <PlusIcon className="w-4 h-4" />
              {isSplit ? "Explore" : "Explore New Source"}
            </Button>
          </div>

          {/* Files Uploaded Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className={`font-medium text-black font-['Inter',Helvetica] ${isSplit ? 'text-xs' : 'text-sm'}`}>
                Files Uploaded
              </h3>
              <div className="flex items-center gap-2">
                <span className={`text-gray-600 font-['Inter',Helvetica] ${isSplit ? 'text-[10px]' : 'text-xs'}`}>Select All</span>
                <input type="checkbox" className="w-4 h-4" />
              </div>
            </div>

            <div className="space-y-2">
              {uploadedFiles.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-2">
                  <div className="flex items-center gap-3">
                    {getFileIcon(file.type)}
                    <span className={`text-black font-['Inter',Helvetica] ${isSplit ? 'text-xs' : 'text-sm'}`}>
                      {isSplit ? file.name.substring(0, 15) + '...' : file.name}
                    </span>
                  </div>
                  <input type="checkbox" className="w-4 h-4" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Chat Area - moved even further in from right edge */}
        <div className={`flex flex-col h-[calc(100vh-200px)] ${isSplit ? 'w-full ml-4' : 'mr-16'}`}>
          {/* User Question - Time above message */}
          <div className="flex flex-col items-end mb-6 pt-6">
            <span className="text-xs text-gray-500 font-['Inter',Helvetica] mb-2">
              Me, Jun 1, 9:50 PM
            </span>
            <div className="bg-gray-100 rounded-lg p-3 max-w-xs">
              <p className="text-sm text-black font-['Inter',Helvetica]">
                黑洞信息悖论如何解决？
              </p>
            </div>
          </div>

          {/* Scrollable Chat Content */}
          <div className="flex-1 overflow-y-auto">
            {/* AI Response - No border/box, just content */}
            <div className="mb-6">
              <div className="p-4">
                <div className="prose max-w-none">
                  <p className="text-sm text-black font-['Inter',Helvetica] mb-4">
                    Based on the provided sources, Chen Duxiu did not write a "book" discussed in these excerpts, but rather an article titled "On Theater" <span className="inline-flex items-center justify-center w-4 h-4 bg-gray-200 rounded-full text-xs">1</span>. This article was written under his pen name, <strong>Sanai</strong>, and was first published in <strong>1904</strong> <span className="inline-flex items-center justify-center w-4 h-4 bg-gray-200 rounded-full text-xs">1</span>.
                  </p>

                  <p className="text-sm text-black font-['Inter',Helvetica] mb-4">
                    The article "On Theater" is primarily about Chen Duxiu's views on the <strong>importance and potential of theater as a tool for social change and education</strong> in China <span className="inline-flex items-center justify-center w-4 h-4 bg-gray-200 rounded-full text-xs">1</span> <span className="inline-flex items-center justify-center w-4 h-4 bg-gray-200 rounded-full text-xs">2</span>. He considered theater to be an <strong>important didactic tool</strong> <span className="inline-flex items-center justify-center w-4 h-4 bg-gray-200 rounded-full text-xs">1</span>. In his view, "theater is in fact a great big school for all the people under heaven; theater workers are in fact influential teachers of the people" <span className="inline-flex items-center justify-center w-4 h-4 bg-gray-200 rounded-full text-xs">1</span> <span className="inline-flex items-center justify-center w-4 h-4 bg-gray-200 rounded-full text-xs">2</span>.
                  </p>

                  <p className="text-sm text-black font-['Inter',Helvetica] mb-4">
                    Chen Duxiu argued that theater is an art form that people love and that can easily reach their minds and hearts, having the power to strongly influence their thoughts and emotions quickly <span className="inline-flex items-center justify-center w-4 h-4 bg-gray-200 rounded-full text-xs">2</span>. He contrasted this view with that of "pedantic and stuffy scholars" who looked down upon theater and actors, considering them vulgar, bawdy, licentious, wasteful, and useless <span className="inline-flex items-center justify-center w-4 h-4 bg-gray-200 rounded-full text-xs">3</span>. Chen argued that judging a person based on their profession rather than moral character is prejudiced <span className="inline-flex items-center justify-center w-4 h-4 bg-gray-200 rounded-full text-xs">3</span>. He noted that in Western countries, actors were considered equals to the learned, as theater was believed important for fostering morals and values <span className="inline-flex items-center justify-center w-4 h-4 bg-gray-200 rounded-full text-xs">3</span>.
                  </p>
                  <p className="text-sm text-black font-['Inter',Helvetica] mb-4">
                    Chen Duxiu argued that theater is an art form that people love and that can easily reach their minds and hearts, having the power to strongly influence their thoughts and emotions quickly <span className="inline-flex items-center justify-center w-4 h-4 bg-gray-200 rounded-full text-xs">2</span>. He contrasted this view with that of "pedantic and stuffy scholars" who looked down upon theater and actors, considering them vulgar, bawdy, licentious, wasteful, and useless <span className="inline-flex items-center justify-center w-4 h-4 bg-gray-200 rounded-full text-xs">3</span>. Chen argued that judging a person based on their profession rather than moral character is prejudiced <span className="inline-flex items-center justify-center w-4 h-4 bg-gray-200 rounded-full text-xs">3</span>. He noted that in Western countries, actors were considered equals to the learned, as theater was believed important for fostering morals and values <span className="inline-flex items-center justify-center w-4 h-4 bg-gray-200 rounded-full text-xs">3</span>.
                  </p>
                  <p className="text-sm text-black font-['Inter',Helvetica] mb-4">
                    Chen Duxiu argued that theater is an art form that people love and that can easily reach their minds and hearts, having the power to strongly influence their thoughts and emotions quickly <span className="inline-flex items-center justify-center w-4 h-4 bg-gray-200 rounded-full text-xs">2</span>. He contrasted this view with that of "pedantic and stuffy scholars" who looked down upon theater and actors, considering them vulgar, bawdy, licentious, wasteful, and useless <span className="inline-flex items-center justify-center w-4 h-4 bg-gray-200 rounded-full text-xs">3</span>. Chen argued that judging a person based on their profession rather than moral character is prejudiced <span className="inline-flex items-center justify-center w-4 h-4 bg-gray-200 rounded-full text-xs">3</span>. He noted that in Western countries, actors were considered equals to the learned, as theater was believed important for fostering morals and values <span className="inline-flex items-center justify-center w-4 h-4 bg-gray-200 rounded-full text-xs">3</span>.
                  </p>
                  <p className="text-sm text-black font-['Inter',Helvetica] mb-4">
                    Chen Duxiu argued that theater is an art form that people love and that can easily reach their minds and hearts, having the power to strongly influence their thoughts and emotions quickly <span className="inline-flex items-center justify-center w-4 h-4 bg-gray-200 rounded-full text-xs">2</span>. He contrasted this view with that of "pedantic and stuffy scholars" who looked down upon theater and actors, considering them vulgar, bawdy, licentious, wasteful, and useless <span className="inline-flex items-center justify-center w-4 h-4 bg-gray-200 rounded-full text-xs">3</span>. Chen argued that judging a person based on their profession rather than moral character is prejudiced <span className="inline-flex items-center justify-center w-4 h-4 bg-gray-200 rounded-full text-xs">3</span>. He noted that in Western countries, actors were considered equals to the learned, as theater was believed important for fostering morals and values <span className="inline-flex items-center justify-center w-4 h-4 bg-gray-200 rounded-full text-xs">3</span>.
                  </p>
                </div>

                {/* Action Buttons - Save to Notes on left, other buttons on right */}
                <div className="flex items-center justify-between mt-4">
                  {/* Save to Notes Button - Left side */}
                  <Button
                    className="bg-[#E8F4FD] hover:bg-[#d1e9f8] text-gray-700 rounded-full px-6 py-2 flex items-center gap-2 font-['Inter',Helvetica] text-sm border-none"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                    </svg>
                    Save to Notes
                  </Button>

                  {/* Action Icons - Right side */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-8 h-8 text-gray-600 hover:text-gray-800"
                    >
                      <ThumbsUpIcon className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-8 h-8 text-gray-600 hover:text-gray-800"
                    >
                      <ThumbsDownIcon className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-8 h-8 text-gray-600 hover:text-gray-800"
                    >
                      <CopyIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Fixed Bottom Input Area - No border */}
          <div className="p-4 bg-white">
            {/* Source Tags - At the top of input area */}
            <div className="flex gap-2 mb-3">
              <span className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-['Inter',Helvetica]">
                Cosmology and Its Origins
              </span>
              <span className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-['Inter',Helvetica]">
                Introduction to Mechanics, K.K
              </span>
            </div>

            {/* Input Box with Suggestions Inside - No border */}
            <div className="relative">
              <textarea
                className="w-full h-24 border-0 rounded-lg p-3 pb-12 resize-none outline-none bg-gray-50 font-['Inter',Helvetica] text-sm"
                placeholder="Type your question here..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />

              {/* Suggestion Buttons Inside Input Box */}
              <div className={`absolute bottom-3 left-3 flex gap-2 ${isSplit ? 'flex-wrap' : ''}`}>
                <Button
                  variant="outline"
                  size="sm"
                  className={`text-xs text-gray-600 border-gray-300 rounded-full px-3 py-1 font-['Inter',Helvetica] hover:bg-gray-50 ${isSplit ? 'text-[10px] px-2' : ''}`}
                  onClick={() => handleSuggestionClick("What's the content of this file?")}
                >
                  {isSplit ? "What's in this file?" : "What's the content of this file?"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className={`text-xs text-gray-600 border-gray-300 rounded-full px-3 py-1 font-['Inter',Helvetica] hover:bg-gray-50 ${isSplit ? 'text-[10px] px-2' : ''}`}
                  onClick={() => handleSuggestionClick("Tell me more about Black Holes.")}
                >
                  {isSplit ? "Tell me about Black Holes" : "Tell me more about Black Holes."}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DocumentChatResponse;
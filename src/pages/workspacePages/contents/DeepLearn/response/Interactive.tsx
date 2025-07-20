import React, { useState, useEffect } from 'react';
import { PlayIcon } from 'lucide-react';
import { InteractiveResponse } from '../../../../../api/workspaces/deep_learning/deepLearn_deeplearn';
import { ConceptMap } from '../../../../../components/workspacePage/conceptMap';

interface InteractiveProps {
  isSplit?: boolean;
}

// Helper function to extract YouTube video ID from URL
const getYouTubeVideoId = (url: string): string | null => {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

// Helper function to get YouTube thumbnail URL
const getYouTubeThumbnail = (url: string): string => {
  const videoId = getYouTubeVideoId(url);
  if (videoId) {
    // Use maxresdefault for high quality, fallback to hqdefault if needed
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  }
  // Fallback to a placeholder if not a YouTube URL
  return 'https://images.pexels.com/photos/1181298/pexels-photo-1181298.jpeg?auto=compress&cs=tinysrgb&w=400';
};

function Interactive({ isSplit = false }: InteractiveProps) {
  const [interactiveData, setInteractiveData] = useState<InteractiveResponse | null>(null);
  const [isLoadingInteractive, setIsLoadingInteractive] = useState(true);

  // Load interactive data and listen for updates
  useEffect(() => {
    const tabId = window.location.pathname + window.location.search;
    const savedInteractiveData = localStorage.getItem(`deeplearn_interactive_${tabId}`);

    if (savedInteractiveData) {
      try {
        const parsedInteractiveData = JSON.parse(savedInteractiveData);
        setInteractiveData(parsedInteractiveData);
        setIsLoadingInteractive(false);
      } catch (e) {
        console.error('Failed to parse interactive data:', e);
        setIsLoadingInteractive(false);
      }
    } else {
      setIsLoadingInteractive(false);
    }

    const handleInteractiveUpdate = (event: CustomEvent) => {
      if (event.detail.tabId === tabId) {
        setInteractiveData(event.detail.data);
        setIsLoadingInteractive(false);
      }
    };

    window.addEventListener('deeplearn-interactive-update', handleInteractiveUpdate as EventListener);

    return () => {
      window.removeEventListener('deeplearn-interactive-update', handleInteractiveUpdate as EventListener);
    };
  }, []);

  return (
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
            {isLoadingInteractive ? (
              <div className="text-center py-4">
                <div className="text-gray-500 text-sm">Loading...</div>
              </div>
            ) : interactiveData ? (
              <>
                {/* Related Videos */}
                {interactiveData.interactive_content.recommended_videos.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium text-xs text-black mb-2">Related Videos</h4>
                    <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
                      <div className="w-full h-20 relative overflow-hidden">
                        <img
                          src={getYouTubeThumbnail(interactiveData.interactive_content.recommended_videos[0].url)}
                          alt="Video thumbnail"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback to gradient background if thumbnail fails to load
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              parent.className += ' bg-gradient-to-r from-yellow-400 via-blue-500 to-yellow-400';
                            }
                          }}
                        />
                        {/* Play button overlay */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-12 h-12 bg-black bg-opacity-70 rounded-full flex items-center justify-center">
                            <PlayIcon className="w-6 h-6 text-white ml-1" />
                          </div>
                        </div>
                        {/* 移除 YouTube logo overlay - 不再显示 YouTube 红框标识 */}
                      </div>
                      <div className="p-2">
                        <p className="text-[10px] text-black mb-1 font-medium line-clamp-2">
                          {interactiveData.interactive_content.recommended_videos[0].title}
                        </p>
                        {/* 移除 channel 显示部分 - 因为后端不再返回 channel 信息 */}
                      </div>
                    </div>
                  </div>
                )}

                {/* Related Webpages */}
                {interactiveData.interactive_content.related_webpages.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium text-xs text-black mb-2">Related Webpages</h4>
                    <div className="grid grid-cols-2 gap-1.5">
                      {interactiveData.interactive_content.related_webpages.slice(0, 2).map((webpage, index) => (
                        <div key={index} className="bg-[#F0F0F0] rounded-lg p-2">
                          <div className="text-[9px] font-medium text-black mb-1 line-clamp-2">
                            {webpage.title}
                          </div>
                          <div className="text-[8px] text-gray-600 mb-1 line-clamp-2">
                            {webpage.description}
                          </div>
                          <div className="text-[8px] text-blue-600 truncate">
                            🌐 {new URL(webpage.url).hostname}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Related Concepts */}
                {interactiveData.interactive_content.related_concepts.length > 0 && (
                  <div>
                    <h4 className="font-medium text-xs text-black mb-2">Related Concepts</h4>
                    <div className="space-y-2">
                      {interactiveData.interactive_content.related_concepts.slice(0, 3).map((concept, index) => (
                        <div key={index}>
                          <div className="text-[9px] font-medium text-black mb-1">
                            {concept.explanation}
                          </div>
                          <div className={`${
                            index === 0 ? 'bg-[#D5EBF3] text-[#1e40af]' :
                            index === 1 ? 'bg-[#E8D5F3] text-[#6b21a8]' :
                            'bg-[#D5F3E8] text-[#059669]'
                          } px-1.5 py-0.5 rounded text-[8px] inline-block`}>
                            {concept.concept}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* Show empty state when no interactive data */
              <div className="text-center py-8 text-gray-400">
                <p className="text-xs">Related content will appear here...</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fixed Right Sidebar - Concept Map - Use the separated component */}
      <ConceptMap />
    </div>
  );
}

export default Interactive;
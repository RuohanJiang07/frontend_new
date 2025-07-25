import React, { useState, useEffect } from 'react';
import { useTabContext } from '../../../workspaceFrame/TabContext';
import { submitQuickSearchQuery } from '../../../../../api/workspaces/deep_learn/deepLearn_quicksearch';
import { submitDeepLearnDeepQuery, DeepLearnStreamingData } from '../../../../../api/workspaces/deep_learn/deepLearn_deeplearn';
import { submitFollowUpQuery } from '../../../../../api/workspaces/deep_learn/deepLearn_followup';
import { MarkdownRenderer } from '../../../../../components/ui/markdown';
import { deepLearnStorageManager } from './deepLearnStorageManager';
import './DeepLearnResponse.css';

interface DeepLearnResponseProps {
  isSplit?: boolean;
  onBack?: () => void;
  tabIdx?: number;
  pageIdx?: number;
  screenId?: string;
}

interface ConversationMessage {
  id: string;
  type: 'question' | 'answer';
  content: string;
  timestamp: string;
  mode: 'deep-learn' | 'quick-search';
  isStreaming?: boolean;
  chunkIndex?: number; // Add chunk index to each message
}



interface InteractiveData {
  success: boolean;
  conversation_title: string;
  topic: string;
  roadmap_node_index: number;
  concept_map: {
    nodes: Array<{
      id: number;
      label: string;
      neighbors: number[];
    }>;
  };
  interactive_content: {
    conversation_title: string;
    recommended_videos: Array<{
      title: string;
      url: string;
      thumbnail: string;
      channel: string;
    }>;
    related_webpages: Array<{
      title: string;
      url: string;
      description: string;
    }>;
    related_concepts: Array<{
      concept: string;
      explanation: string;
    }>;
  };
  files_updated: {
    conversation_json: string;
    concept_map_json: string;
  };
  timestamp: string;
}

const DeepLearnResponse: React.FC<DeepLearnResponseProps> = ({ isSplit = false, onBack, tabIdx = 0, pageIdx = 0, screenId = '' }) => {
  const { switchToDeepLearn, getActiveScreens, activePage } = useTabContext();
  
  // Helper function to update conversation message content
  const updateConversationMessage = (messageId: string, content: string, isStreaming?: boolean) => {
    setConversation(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, content, isStreaming }
        : msg
    ));
  };
  
  // Helper function to append content to streaming message
  const appendToStreamingMessage = (messageId: string, data: string) => {
    setConversation(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, content: msg.content + data }
        : msg
    ));
  };
  
  // Helper function to handle API errors
  const handleApiError = (messageId: string, error: string) => {
    console.error('API error:', error);
    setIsLoading(false);
    setIsInteractiveLoading(false);
    updateConversationMessage(messageId, `Error: ${error}`, false);
  };
  
  // Helper function to complete streaming
  const completeStreaming = (messageId: string) => {
    setIsLoading(false);
    setConversation(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, isStreaming: false }
        : msg
    ));
  };
  
  // Detect if we're in split screen mode
  const activeScreens = getActiveScreens(activePage);
  const isInSplitMode = activeScreens.length > 1 && !activeScreens.some(screen => screen.state === 'full-screen');
  
  const [profileSelected, setProfileSelected] = useState(false);
  const [referenceSelected, setReferenceSelected] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [hasFirstQuestion, setHasFirstQuestion] = useState(false);
  const [selectedMode, setSelectedMode] = useState<'follow-up' | 'new-topic' | null>(null);
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const [selectedResponseMode, setSelectedResponseMode] = useState<'deep-learn' | 'quick-search'>('deep-learn');
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [interactiveData, setInteractiveData] = useState<InteractiveData | null>(null);
  const [isInteractiveLoading, setIsInteractiveLoading] = useState(true); // Start with loading true
  const [currentConversationId, setCurrentConversationId] = useState<string>(''); // Store current conversation ID
  const [currentChunkIndex, setCurrentChunkIndex] = useState<number>(0); // Track current creation chunk
  const [focusedChunkIndex, setFocusedChunkIndex] = useState<number>(0); // Track currently focused/viewed chunk
  const [chunkCreated, setChunkCreated] = useState<boolean>(false); // Prevent duplicate chunk creation
  const [currentInteractiveIndex, setCurrentInteractiveIndex] = useState<number>(-1); // Track which interactive content index is currently displayed
  const [currentRoadmapNodeIndex, setCurrentRoadmapNodeIndex] = useState<number>(-1); // Track which roadmap node should be highlighted
  const [deepLearnProgress, setDeepLearnProgress] = useState<{
    current: number;
    total: number;
    percentage: number;
    status: string;
  } | null>(null);
  
  // Debug state for separator scores
  const [separatorScores, setSeparatorScores] = useState<Array<{
    chunkIndex: number;
    messageId: string;
    visibility: number;
    centerScore: number;
    finalScore: number;
    distance: number;
    isBest: boolean;
  }>>([]);
  
  // Concept map hover state
  const [hoverConceptNode, setHoverConceptNode] = useState<{id: number; label: string} | null>(null);
  
  // Persistent roadmap state - only updates with new roadmap data
  const [savedRoadmap, setSavedRoadmap] = useState<{
    nodes: Array<{
      id: number;
      label: string;
      neighbors: number[];
    }>;
  } | null>(null);
  
  // Initialize loading state and debug on mount
  useEffect(() => {
    console.log('🔧 Ensuring loading state is true on mount');
    console.log('🚀 DeepLearnResponse component mounted, isInteractiveLoading:', isInteractiveLoading);
    setIsInteractiveLoading(true);
    // Initialize focused chunk to 0 (first chunk)
    setFocusedChunkIndex(0);
    
    // Clear any existing interactive data to ensure fresh start
    const tabId = `${pageIdx}-${screenId}-${tabIdx}`;
    localStorage.removeItem(`deeplearn_interactive_${tabId}`);
    console.log(`🧹 Cleared any existing interactive data on mount for tab: ${tabId}`);
  }, [pageIdx, screenId, tabIdx]);
  
  // Debug loading state changes
  useEffect(() => {
    console.log('🔄 Interactive loading state changed:', isInteractiveLoading);
  }, [isInteractiveLoading]);

  // Viewport focus tracking with IntersectionObserver - IMPROVED VERSION
  useEffect(() => {
    // Use fewer, more meaningful thresholds for cleaner detection
    const observerOptions = {
      root: null, // Use viewport as root
      rootMargin: '0px',
      threshold: [0.3, 0.5, 0.7, 1.0] // Focus on higher visibility thresholds
    };

    let updateTimeout: number;

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      // Debounce updates to avoid too frequent changes
      clearTimeout(updateTimeout);
      updateTimeout = setTimeout(() => {
        // Create a map to track visibility data for each chunk  
        const chunkVisibility = new Map<number, { 
          maxRatio: number, 
          totalRatio: number, 
          count: number,
          centerDistance: number // Track distance from viewport center
        }>();

        const viewportHeight = window.innerHeight;
        const viewportCenter = viewportHeight / 2;

        // Process ALL markers, not just intersecting ones
        const allMarkers = document.querySelectorAll('.deep-learn-response-visible-marker[data-chunk-index]');
        
        Array.from(allMarkers).forEach(element => {
          const rect = element.getBoundingClientRect();
          const isInViewport = rect.bottom > 0 && rect.top < viewportHeight;
          
          if (isInViewport) {
            const chunkIndex = parseInt(element.getAttribute('data-chunk-index') || '0');
            
            if (!chunkVisibility.has(chunkIndex)) {
              chunkVisibility.set(chunkIndex, { 
                maxRatio: 1.0, // Always consider fully visible
                totalRatio: 1.0,
                count: 1,
                centerDistance: Infinity
              });
            }
            
            const chunkData = chunkVisibility.get(chunkIndex)!;
            
            // Calculate distance from viewport center
            const elementCenter = rect.top + rect.height / 2;
            const distance = Math.abs(elementCenter - viewportCenter);
            chunkData.centerDistance = Math.min(chunkData.centerDistance, distance);
          }
        });

        // Find the chunk with best visibility and center positioning
        let bestChunkIndex = -1;
        let bestScore = 0;
        const debugScores: Array<{
          chunkIndex: number;
          messageId: string;
          visibility: number;
          centerScore: number;
          finalScore: number;
          distance: number;
          isBest: boolean;
        }> = [];

        chunkVisibility.forEach((data, chunkIndex) => {
          // Remove visibility check - purely center-distance based
          
          // Calculate center proximity score (closer to center = higher score)
          const centerScore = Math.max(0, 1 - (data.centerDistance / viewportHeight));
          
          // Focus purely on center proximity - closest to center wins
          const score = centerScore;
          
          // Find the message ID for this chunk
          const marker = document.querySelector(`.deep-learn-response-visible-marker[data-chunk-index="${chunkIndex}"]`);
          const messageId = marker?.getAttribute('data-message-id') || 'unknown';
          
          // Add to debug scores
          debugScores.push({
            chunkIndex,
            messageId,
            visibility: data.maxRatio,
            centerScore,
            finalScore: score,
            distance: data.centerDistance,
            isBest: false // Will be updated below
          });
          
          if (score > bestScore) {
            bestChunkIndex = chunkIndex;
            bestScore = score;
          }
        });
        
        // Mark the best chunk in debug scores
        debugScores.forEach(item => {
          item.isBest = item.chunkIndex === bestChunkIndex;
        });
        
        // Update debug state
        setSeparatorScores(debugScores.sort((a, b) => a.chunkIndex - b.chunkIndex));

        // Update focused chunk if it changed and we found a valid chunk
        if (bestChunkIndex !== -1 && bestChunkIndex !== focusedChunkIndex) {
          const bestData = chunkVisibility.get(bestChunkIndex);
          if (bestData) {
            const centerScore = Math.max(0, 1 - (bestData.centerDistance / viewportHeight));
            console.log(`👁️ Focus changed to chunk ${bestChunkIndex} (visibility: ${(bestData.maxRatio * 100).toFixed(1)}%, center: ${(centerScore * 100).toFixed(1)}%, score: ${(bestScore * 100).toFixed(1)}%)`);
            setFocusedChunkIndex(bestChunkIndex);
          }
        }
      }, 10); // ~60fps sample rate for smooth detection
    };

    const observer = new IntersectionObserver(handleIntersection, observerOptions);

    // Add scroll listener to continuously update center distances (for when visibility = 100%)
    const handleScroll = () => {
      clearTimeout(updateTimeout);
      updateTimeout = setTimeout(() => {
        // Force a manual update of all visible markers' center distances
        const visibleMarkers = document.querySelectorAll('.deep-learn-response-visible-marker[data-chunk-index]');
        const chunkVisibility = new Map<number, { 
          maxRatio: number, 
          totalRatio: number, 
          count: number,
          centerDistance: number
        }>();

        const viewportHeight = window.innerHeight;
        const viewportCenter = viewportHeight / 2;

        Array.from(visibleMarkers).forEach(marker => {
          const rect = marker.getBoundingClientRect();
          const isVisible = rect.top < viewportHeight && rect.bottom > 0;
          
          if (isVisible) {
            const chunkIndex = parseInt(marker.getAttribute('data-chunk-index') || '0');
            const elementCenter = rect.top + rect.height / 2;
            const distance = Math.abs(elementCenter - viewportCenter);
            
            // Calculate intersection ratio manually
            const visibleHeight = Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0);
            const intersectionRatio = Math.max(0, Math.min(1, visibleHeight / rect.height));
            
            if (!chunkVisibility.has(chunkIndex)) {
              chunkVisibility.set(chunkIndex, { 
                maxRatio: 0, 
                totalRatio: 0, 
                count: 0,
                centerDistance: Infinity
              });
            }
            
            const chunkData = chunkVisibility.get(chunkIndex)!;
            chunkData.maxRatio = Math.max(chunkData.maxRatio, intersectionRatio);
            chunkData.centerDistance = Math.min(chunkData.centerDistance, distance);
          }
        });

        // Same scoring logic as before
        let bestChunkIndex = -1;
        let bestScore = 0;
        const debugScores: Array<{
          chunkIndex: number;
          messageId: string;
          visibility: number;
          centerScore: number;
          finalScore: number;
          distance: number;
          isBest: boolean;
        }> = [];

                 chunkVisibility.forEach((data, chunkIndex) => {
           // Remove visibility check - purely center-distance based
           
           const centerScore = Math.max(0, 1 - (data.centerDistance / viewportHeight));
           const score = centerScore;
          
          const marker = document.querySelector(`.deep-learn-response-visible-marker[data-chunk-index="${chunkIndex}"]`);
          const messageId = marker?.getAttribute('data-message-id') || 'unknown';
          
          debugScores.push({
            chunkIndex,
            messageId,
            visibility: data.maxRatio,
            centerScore,
            finalScore: score,
            distance: data.centerDistance,
            isBest: false
          });
          
          if (score > bestScore) {
            bestChunkIndex = chunkIndex;
            bestScore = score;
          }
        });
        
        debugScores.forEach(item => {
          item.isBest = item.chunkIndex === bestChunkIndex;
        });
        
        setSeparatorScores(debugScores.sort((a, b) => a.chunkIndex - b.chunkIndex));

        if (bestChunkIndex !== -1 && bestChunkIndex !== focusedChunkIndex) {
          console.log(`👁️ Focus changed to chunk ${bestChunkIndex} via scroll listener`);
          setFocusedChunkIndex(bestChunkIndex);
        }
      }, 1);
    };

    // Small delay to ensure DOM is ready
    const setupObserver = () => {
      // Observe all visible markers (both start and end)
      const visibleMarkers = document.querySelectorAll('.deep-learn-response-visible-marker[data-chunk-index]');
      visibleMarkers.forEach(marker => observer.observe(marker));
      
      console.log(`🔍 Started observing ${visibleMarkers.length} visible markers for focus tracking`);
      console.log(`📊 Marker visibility map:`, Array.from(visibleMarkers).map(el => ({
        chunkIndex: el.getAttribute('data-chunk-index'),
        messageId: el.getAttribute('data-message-id'),
        type: el.getAttribute('data-message-id')?.includes('start') ? 'START' : 'END',
        element: el.className
      })));
    };

    // Setup observer with a small delay to ensure DOM is ready
    const setupTimeout = setTimeout(setupObserver, 100);

    // Add scroll listener for continuous updates
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      clearTimeout(updateTimeout);
      clearTimeout(setupTimeout);
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
      console.log('🧹 Cleaned up intersection observer and scroll listener');
    };
  }, [conversation, focusedChunkIndex]); // Re-run when conversation changes (including content changes)

  // Interactive content switching logic based on focused chunk changes
  useEffect(() => {
    // Only proceed if we have a valid focused chunk index and conversation data
    if (focusedChunkIndex < 0) {
      console.log('⚠️ Invalid focused chunk index, skipping interactive content switch');
      return;
    }

    // Don't switch interactive content if we're currently loading interactive data
    if (isInteractiveLoading) {
      console.log('⏳ Interactive content is currently loading - skipping switch to avoid interference');
      return;
    }

    const tabId = `${pageIdx}-${screenId}-${tabIdx}`;
    const conversationData = deepLearnStorageManager.getConversationData(tabId);
    
    if (!conversationData) {
      console.log('⚠️ No conversation data found, skipping interactive content switch');
      return;
    }

    // Find the chunk with the current focused index
    const focusedChunk = conversationData.chunks.find(chunk => chunk.index === focusedChunkIndex);
    
    if (!focusedChunk) {
      console.log(`⚠️ No chunk found with index ${focusedChunkIndex}, skipping interactive content switch`);
      return;
    }

    const targetInteractiveIndex = focusedChunk.point_to_prev_interactive_index;
    
    console.log(`🔄 Interactive content switch triggered for focused chunk ${focusedChunkIndex}:`, {
      search_type: focusedChunk.search_type,
      point_to_prev_interactive_index: targetInteractiveIndex,
      currentInteractiveIndex: currentInteractiveIndex,
      needsSwitch: targetInteractiveIndex !== currentInteractiveIndex
    });

    // Check if we need to switch interactive content
    if (targetInteractiveIndex === currentInteractiveIndex) {
      console.log(`✅ Interactive content already correct (index ${targetInteractiveIndex}) - no switch needed`);
      return;
    }

    // Find the chunk that contains the interactive content we need
    const interactiveChunk = conversationData.chunks.find(chunk => chunk.index === targetInteractiveIndex);
    
    if (!interactiveChunk) {
      console.log(`⚠️ No interactive chunk found with index ${targetInteractiveIndex} - keeping current content`);
      return;
    }

    if (!interactiveChunk.interactive) {
      console.log(`⚠️ Interactive chunk ${targetInteractiveIndex} has no interactive content - keeping current content`);
      return;
    }

    console.log(`🎯 Switching to interactive content from chunk ${targetInteractiveIndex}:`, {
      videoCount: interactiveChunk.interactive.recommended_videos?.length || 0,
      webpageCount: interactiveChunk.interactive.related_webpages?.length || 0,
      conceptCount: interactiveChunk.interactive.related_concepts?.length || 0
    });

    // Convert the stored interactive data to the expected format
    const interactiveDataToDisplay: InteractiveData = {
      success: true,
      conversation_title: interactiveChunk.interactive.conversation_title,
      topic: '',
      roadmap_node_index: 0,
      concept_map: { nodes: [] },
      interactive_content: interactiveChunk.interactive,
      files_updated: { conversation_json: '', concept_map_json: '' },
      timestamp: new Date().toISOString()
    };

    setInteractiveData(interactiveDataToDisplay);
    setCurrentInteractiveIndex(targetInteractiveIndex);
    
    // Update roadmap node index from the focused chunk
    setCurrentRoadmapNodeIndex(focusedChunk.roadmap_node_index);
    console.log(`🗺️ Updated roadmap node index to ${focusedChunk.roadmap_node_index} for focused chunk ${focusedChunkIndex}`);
    
    setIsInteractiveLoading(false);
  }, [focusedChunkIndex, pageIdx, screenId, tabIdx, currentInteractiveIndex, isInteractiveLoading]); // Include isInteractiveLoading in dependencies

  // Save roadmap data when new interactive data arrives
  useEffect(() => {
    if (interactiveData?.concept_map?.nodes && interactiveData.concept_map.nodes.length > 0) {
      // Only update saved roadmap if we have new roadmap data
      console.log('💾 Saving new roadmap data:', interactiveData.concept_map);
      setSavedRoadmap(interactiveData.concept_map);
    }
  }, [interactiveData?.concept_map]);

  // Load conversation data from localStorage on component mount
  useEffect(() => {
    const conversationId = localStorage.getItem('current_deeplearn_conversation_id');
    const query = localStorage.getItem('current_deeplearn_query');
    const mode = localStorage.getItem('current_deeplearn_mode');
    const webSearch = localStorage.getItem('current_deeplearn_web_search') === 'true';
    
    if (conversationId && query && (mode === 'quick-search' || mode === 'deep-learn')) {
      // Store the conversation ID for follow-up queries
      setCurrentConversationId(conversationId);
      
      // Set the response mode based on the initial mode
      setSelectedResponseMode(mode as 'deep-learn' | 'quick-search');
      
      // Initialize storage manager tracking
      const tabId = `${pageIdx}-${screenId}-${tabIdx}`;
      
      // Clear existing conversation data for new conversation
      deepLearnStorageManager.clearConversationData(tabId);
      console.log(`🗑️ Cleared old conversation data for new conversation: ${conversationId}`);
      
      // Initialize new conversation data
      deepLearnStorageManager.initializeConversation(tabId, conversationId);
      console.log(`🚀 Initialized new conversation data for: ${conversationId}`);
      
      const chunkCount = deepLearnStorageManager.getChunkCount(tabId);
      setCurrentChunkIndex(chunkCount);
      
      // Add the initial question to the conversation
      const initialQuestion: ConversationMessage = {
        id: '1',
        type: 'question',
        content: query,
        timestamp: new Date().toLocaleString(),
        mode: mode as 'deep-learn' | 'quick-search',
        chunkIndex: 0 // Initial chunk is always 0
      };
      
      setConversation([initialQuestion]);
      setIsLoading(true);
      setDeepLearnProgress(null); // Clear any previous progress
      
      // Create the initial chunk immediately so interactive data can be stored
      deepLearnStorageManager.addConversationChunk(tabId, 'new_topic');
      setChunkCreated(true);
      console.log(`💾 Created initial chunk 0 for new conversation: ${conversationId}`);
      
      if (mode === 'quick-search') {
        // Add a streaming answer message for quick search
        const streamingAnswer: ConversationMessage = {
          id: '2',
          type: 'answer',
          content: '',
          timestamp: new Date().toLocaleString(),
          mode: 'quick-search',
          isStreaming: true,
          chunkIndex: 0 // Initial chunk is always 0
        };
        
        setConversation([initialQuestion, streamingAnswer]);
        
        // Ensure interactive loading is true for new conversation
        setIsInteractiveLoading(true);
        console.log('🔄 Set interactive loading to true for new quick search conversation');
        
        // Call the quick search API to get the streaming response
        submitQuickSearchQuery(
          query,
          webSearch,
          (data: string) => appendToStreamingMessage('2', data),
          (error: string) => handleApiError('2', error),
          () => {
            console.log('Quick search completed');
            completeStreaming('2');
            console.log(`✅ Initial query completed for chunk 0`);
          },
          undefined, // additionalComments
          undefined, // references
          undefined, // existingConversationId - don't pass this for new conversations
          conversationId, // generatedConversationId - pass as generated conversation ID
          undefined, // searchType
          pageIdx,
          screenId,
          tabIdx
        );
      } else if (mode === 'deep-learn') {
        // Add a streaming answer message for deep learn
        const streamingAnswer: ConversationMessage = {
          id: '2',
          type: 'answer',
          content: '',
          timestamp: new Date().toLocaleString(),
          mode: 'deep-learn',
          isStreaming: true,
          chunkIndex: 0 // Initial chunk is always 0
        };
        
        setConversation([initialQuestion, streamingAnswer]);
        
        // Ensure interactive loading is true for new conversation
        setIsInteractiveLoading(true);
        console.log('🔄 Set interactive loading to true for new deep learn conversation');
        
        // Call the deep learn API to get the streaming response
        submitDeepLearnDeepQuery(
          query,
          webSearch,
          (data: DeepLearnStreamingData) => {
            // Update progress if available
            if (data.progress) {
              setDeepLearnProgress({
                current: data.progress.current_completions,
                total: data.progress.total_expected_completions,
                percentage: data.progress.progress_percentage,
                status: data.stream_info || 'Processing...'
              });
            }
            
            // Update the streaming content with the LLM response
            if (data.llm_response) {
              updateConversationMessage('2', data.llm_response);
            }
          },
          (error: string) => handleApiError('2', error),
          () => {
            console.log('Deep learn completed');
            completeStreaming('2');
            console.log(`✅ Initial query completed for chunk 0`);
          },
          undefined, // additionalComments
          undefined, // references
          undefined, // existingConversationId - don't pass this for new conversations
          conversationId, // generatedConversationId - pass as generated conversation ID
          undefined, // searchType
          pageIdx,
          screenId,
          tabIdx
        );
      }
      
      // Clear the localStorage to prevent duplicate loading
      localStorage.removeItem('current_deeplearn_conversation_id');
      localStorage.removeItem('current_deeplearn_query');
      localStorage.removeItem('current_deeplearn_mode');
      localStorage.removeItem('current_deeplearn_web_search');
      
      // Clear any existing interactive data for this tab to ensure fresh start
      localStorage.removeItem(`deeplearn_interactive_${tabId}`);
      console.log(`🧹 Cleared cached interactive data for fresh start: ${tabId}`);
    }
  }, [pageIdx, screenId, tabIdx]);

  // Set a timeout to stop interactive loading after 60 seconds (fallback)
  useEffect(() => {
    if (isInteractiveLoading) {
      const timeout = setTimeout(() => {
        console.log('⏰ Interactive loading timeout after 60s - stopping loading state');
        console.log('⚠️ This might indicate a backend issue or event listener problem');
        setIsInteractiveLoading(false);
      }, 60000); // 60 seconds - much longer timeout

      return () => clearTimeout(timeout);
    }
  }, [isInteractiveLoading]);

  // Listen for interactive data updates with tab isolation
  useEffect(() => {
    const tabId = `${pageIdx}-${screenId}-${tabIdx}`;
    console.log('👂 Setting up interactive data event listener for tab isolation:', tabId);
    
    const handleInteractiveUpdate = (event: CustomEvent) => {
      const { tabId: eventTabId, data } = event.detail;
      
      // Only process events for this specific tab
      if (eventTabId !== tabId) {
        console.log('🚫 Ignoring interactive update for different tab:', eventTabId, 'current tab:', tabId);
        return;
      }
      
      console.log('📡 Received interactive data update for current tab:', eventTabId);
      console.log('📊 Data structure:', {
        hasVideos: data?.interactive_content?.recommended_videos?.length > 0,
        hasWebpages: data?.interactive_content?.related_webpages?.length > 0,
        videosLength: data?.interactive_content?.recommended_videos?.length,
        webpagesLength: data?.interactive_content?.related_webpages?.length
      });
      
      // Save interactive data to storage for current chunk
      if (currentChunkIndex >= 0) {
        deepLearnStorageManager.addInteractiveToChunk(tabId, currentChunkIndex, data);
        console.log(`🎯 Saved interactive data to chunk ${currentChunkIndex} in storage`);
        deepLearnStorageManager.debugLogStorage(tabId);
      } else {
        console.log('⚠️ Current chunk index is invalid, cannot save interactive data');
      }
      
      setInteractiveData(data);
      setCurrentInteractiveIndex(currentChunkIndex); // Set the current interactive index to the chunk that just received the data
      
      // Update roadmap node index from the interactive data
      setCurrentRoadmapNodeIndex(data.roadmap_node_index);
      console.log(`🗺️ Updated roadmap node index to ${data.roadmap_node_index} from interactive data`);
      
      // Always stop loading when we receive interactive data, regardless of content
      console.log('✅ Interactive data received - stopping loading state');
      setIsInteractiveLoading(false);
      
      // Log the interactive data that was set
      console.log('📊 Set interactive data:', {
        hasData: !!data,
        hasInteractiveContent: !!data?.interactive_content,
        videoCount: data?.interactive_content?.recommended_videos?.length || 0,
        webpageCount: data?.interactive_content?.related_webpages?.length || 0
      });
    };

    window.addEventListener('deeplearn-interactive-update', handleInteractiveUpdate as EventListener);
    console.log('✅ Interactive event listener registered for tab:', tabId);

    return () => {
      console.log('🧹 Cleaning up interactive event listener for tab:', tabId);
      window.removeEventListener('deeplearn-interactive-update', handleInteractiveUpdate as EventListener);
    };
  }, [pageIdx, screenId, tabIdx, currentChunkIndex]);

  const handleBackClick = () => {
    // Navigate back to deep learn entry page
    switchToDeepLearn(pageIdx, screenId, tabIdx);
  };

  const toggleProfile = () => {
    setProfileSelected(!profileSelected);
  };

  const toggleReference = () => {
    setReferenceSelected(!referenceSelected);
  };

  const handleFollowUp = () => {
    setHasFirstQuestion(true);
    setSelectedMode('follow-up');
    // Additional logic for follow up mode
  };

  const handleNewTopic = () => {
    setHasFirstQuestion(true);
    setSelectedMode('new-topic');
    // Additional logic for new topic mode
  };

  const handleModeChange = (newMode: 'follow-up' | 'new-topic') => {
    setSelectedMode(newMode);
  };

  const toggleWebSearch = () => {
    setWebSearchEnabled(!webSearchEnabled);
  };

  const toggleResponseMode = (mode: 'deep-learn' | 'quick-search') => {
    setSelectedResponseMode(mode);
  };

  // Handle submit from input box
  const handleSubmitQuery = async () => {
    if (!inputValue.trim() || isLoading) return;

    const query = inputValue.trim();
    const tabId = `${pageIdx}-${screenId}-${tabIdx}`;
    
    // Determine search type based on selected mode
    const searchType: 'new_topic' | 'followup' = selectedMode === 'follow-up' ? 'followup' : 'new_topic';
    
    console.log('📝 Submitting query:', query);
    console.log('🔍 Current mode:', selectedMode);
    console.log('🌐 Web search enabled:', webSearchEnabled);
    if (selectedMode === 'new-topic') {
      console.log('🎯 Response mode:', selectedResponseMode);
    }

    // Update chunk index for storage tracking
    const newChunkIndex = deepLearnStorageManager.getChunkCount(tabId);
    setCurrentChunkIndex(newChunkIndex);
    console.log(`🔄 Resetting chunkCreated flag from ${chunkCreated} to false for new query`);
    setChunkCreated(false); // Reset flag for new query

    // For follow-up mode, always use quick-search display format
    // For new topic mode, use the selected response mode
    const displayMode = selectedMode === 'follow-up' ? 'quick-search' : selectedResponseMode;

    // Add the new question to conversation
    const newQuestion: ConversationMessage = {
      id: Date.now().toString(),
      type: 'question',
      content: query,
      timestamp: new Date().toLocaleString(),
      mode: displayMode,
      chunkIndex: newChunkIndex // Use the new chunk index
    };

    // Add streaming answer message
    const streamingAnswer: ConversationMessage = {
      id: (Date.now() + 1).toString(),
      type: 'answer',
      content: '',
      timestamp: new Date().toLocaleString(),
      mode: displayMode,
      isStreaming: true,
      chunkIndex: newChunkIndex // Use the new chunk index
    };

    setConversation(prev => [...prev, newQuestion, streamingAnswer]);
    setIsLoading(true);
    
    // Only start interactive loading if NOT in follow-up mode (since follow-up doesn't call interactive API)
    if (selectedMode !== 'follow-up') {
      setIsInteractiveLoading(true);
    } else {
      // For followup mode, find the last new_topic chunk to get interactive content
      const conversationData = deepLearnStorageManager.getConversationData(tabId);
      if (conversationData && conversationData.chunks.length > 0) {
        // Find the last new_topic chunk
        let lastNewTopicChunk = null;
        for (let i = conversationData.chunks.length - 1; i >= 0; i--) {
          if (conversationData.chunks[i].search_type === 'new_topic') {
            lastNewTopicChunk = conversationData.chunks[i];
            break;
          }
        }
        
        if (lastNewTopicChunk && lastNewTopicChunk.interactive) {
          setInteractiveData({
            success: true,
            conversation_title: lastNewTopicChunk.interactive.conversation_title,
            topic: '',
            roadmap_node_index: 0,
            concept_map: { nodes: [] },
            interactive_content: lastNewTopicChunk.interactive,
            files_updated: { conversation_json: '', concept_map_json: '' },
            timestamp: new Date().toISOString()
          });
          setCurrentInteractiveIndex(lastNewTopicChunk.index); // Set the current interactive index to the chunk we loaded from
          
          // Update roadmap node index from the last new_topic chunk
          setCurrentRoadmapNodeIndex(lastNewTopicChunk.roadmap_node_index);
          console.log(`🗺️ Updated roadmap node index to ${lastNewTopicChunk.roadmap_node_index} for followup from last new_topic chunk ${lastNewTopicChunk.index}`);
          
          console.log(`🎯 Loaded interactive content for followup from last new_topic chunk ${lastNewTopicChunk.index}`);
        }
      }
      setIsInteractiveLoading(false);
    }
    
    setDeepLearnProgress(null); // Clear previous progress
    setInputValue(''); // Clear input

    // Use stored conversation ID or generate new one
    const conversationIdToUse = currentConversationId || 'dl-c-' + Date.now();
    
    try {
      // For follow-up mode, ALWAYS use the follow-up function regardless of response mode
      if (selectedMode === 'follow-up') {
        await submitFollowUpQuery(
          query,
          webSearchEnabled,
          (data: string) => appendToStreamingMessage(streamingAnswer.id, data),
          (error: string) => handleApiError(streamingAnswer.id, error),
          () => {
            console.log('Follow-up search completed');
            console.log(`🔍 Checking if followup chunk should be created - chunkCreated: ${chunkCreated}`);
            completeStreaming(streamingAnswer.id);
            setIsInteractiveLoading(false);
            
            // Save chunk to storage manager (only the required fields) - outside of setConversation
            // Use a more reliable check - if this chunk index doesn't exist yet, create it
            const currentConversationData = deepLearnStorageManager.getConversationData(tabId);
            const chunkExists = currentConversationData?.chunks.find(c => c.index === newChunkIndex);
            
            if (!chunkExists) {
              console.log(`💾 Creating followup chunk ${newChunkIndex} for tab: ${tabId}`);
              deepLearnStorageManager.addConversationChunk(tabId, 'followup');
              setChunkCreated(true);
              console.log(`✅ Followup chunk ${newChunkIndex} created successfully`);
            } else {
              console.log(`⚠️ Followup chunk ${newChunkIndex} already exists, skipping`);
            }
          },
          conversationIdToUse, // conversationId - required for follow-up
          undefined, // additionalComments
          undefined, // references
          pageIdx,
          screenId,
          tabIdx
        );
      } else {
        // For new topic mode - call the appropriate API based on response mode
        console.log(`🚀 Starting new topic query with response mode: ${selectedResponseMode}`);
        
        // Create the chunk immediately for new topic mode to ensure interactive data can be stored
        const currentConversationData = deepLearnStorageManager.getConversationData(tabId);
        const chunkExists = currentConversationData?.chunks.find(c => c.index === newChunkIndex);
        
        if (!chunkExists) {
          console.log(`💾 Pre-creating new topic chunk ${newChunkIndex} for tab: ${tabId}`);
          deepLearnStorageManager.addConversationChunk(tabId, 'new_topic');
          setChunkCreated(true);
          console.log(`✅ New topic chunk ${newChunkIndex} pre-created successfully`);
        }
        
        if (selectedResponseMode === 'deep-learn') {
          // Use deep learn endpoint for new topic
          await submitDeepLearnDeepQuery(
            query,
            webSearchEnabled,
            (data: DeepLearnStreamingData) => {
              // Update the streaming content - use llm_response for actual content
              const contentToAdd = data.llm_response || data.stream_info || '';
              updateConversationMessage(streamingAnswer.id, contentToAdd);
            },
            (error: string) => handleApiError(streamingAnswer.id, error),
            () => {
              console.log('Deep learn search completed');
              completeStreaming(streamingAnswer.id);
              console.log(`✅ New topic query completed for chunk ${newChunkIndex}`)
            },
            undefined, // additionalComments
            undefined, // references
            conversationIdToUse, // existingConversationId
            undefined, // generatedConversationId
            'new_topic', // searchType
            pageIdx,
            screenId,
            tabIdx
          );
        } else {
          // Use quick search endpoint for new topic
          await submitQuickSearchQuery(
            query,
            webSearchEnabled,
            (data: string) => appendToStreamingMessage(streamingAnswer.id, data),
            (error: string) => handleApiError(streamingAnswer.id, error),
            () => {
              console.log('Quick search completed');
              completeStreaming(streamingAnswer.id);
              console.log(`✅ New topic query completed for chunk ${newChunkIndex}`)
            },
            undefined, // additionalComments
            undefined, // references
            conversationIdToUse, // existingConversationId
            undefined, // generatedConversationId
            'new_topic', // searchType
            pageIdx,
            screenId,
            tabIdx
          );
        }
      }
    } catch (error) {
      console.error('Error submitting query:', error);
      setIsLoading(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return `Me, ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
    } else {
      return `Me, ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
    }
  };

    // Function to render the concept map based on actual data
  const renderConceptMap = () => {
    if (isInteractiveLoading) {
      return (
        <div className="deep-learn-response-concept-map-loading">
          <div className="concept-map-loading-spinner"></div>
          <span className="concept-map-loading-text">Loading concept map...</span>
        </div>
      );
    }

    // Use saved roadmap data or fallback
    const roadmapToRender = savedRoadmap || {
      nodes: [
        { id: 0, label: 'Black Hole', neighbors: [1, 2, 3, 4] },
        { id: 1, label: 'White dwarf', neighbors: [0, 2] },
        { id: 2, label: 'Type I Supernova', neighbors: [0, 1, 5] },
        { id: 3, label: 'Stretched Horizon', neighbors: [0] },
        { id: 4, label: 'Cosmology', neighbors: [0] },
        { id: 5, label: 'Gravity Wave', neighbors: [2] },
      ]
    };

    // FORCE fit within the actual concept map box dimensions
    // Box is 90.4% of 400px max = ~362px, minus 16px margin-left and 2px border = ~344px usable
    // Height is 175px minus 2px border = 173px usable
    const containerWidth = 320; // Conservative width to ensure fit
    const containerHeight = 160; // Conservative height to ensure fit  
    const nodeRadius = 4; // Smaller nodes
    const padding = 35; // More padding to ensure labels fit
    const textHeight = 16; // Reserve space for text below nodes
    
    // Calculate available space for positioning (force within bounds)
    const availableWidth = containerWidth - (padding * 2);
    const availableHeight = containerHeight - (padding * 2) - textHeight;
    
    // Create positions for nodes that fit within the container
    const nodePositions = roadmapToRender.nodes.map((node, index) => {
      let x, y;
      
      // Position nodes with proper boundaries and padding
      const numNodes = roadmapToRender.nodes.length;
      
      if (numNodes <= 3) {
        // For small graphs, use horizontal layout
        x = padding + (index * availableWidth / Math.max(1, numNodes - 1));
        y = padding + (availableHeight * 0.5);
      } else {
        // For larger graphs, use a more distributed layout
        switch (index % 6) {
          case 0: // Center-left (main node)
            x = padding + availableWidth * 0.2;
            y = padding + availableHeight * 0.5;
            break;
          case 1: // Top-right
            x = padding + availableWidth * 0.7;
            y = padding + availableHeight * 0.15;
            break;
          case 2: // Right
            x = padding + availableWidth * 0.8;
            y = padding + availableHeight * 0.5;
            break;
          case 3: // Center
            x = padding + availableWidth * 0.5;
            y = padding + availableHeight * 0.8;
            break;
          case 4: // Bottom-left
            x = padding + availableWidth * 0.1;
            y = padding + availableHeight * 0.7;
            break;
          case 5: // Bottom-right
            x = padding + availableWidth * 0.9;
            y = padding + availableHeight * 0.85;
            break;
          default:
            x = padding + availableWidth * 0.5;
            y = padding + availableHeight * 0.5;
        }
      }
      
      // FORCE nodes to stay within bounds (safety check)
      x = Math.max(padding, Math.min(x, containerWidth - padding));
      y = Math.max(padding, Math.min(y, containerHeight - textHeight - padding));
      
      return { ...node, x, y };
    });

    // Generate connections based on neighbors
    const connections: Array<{
      from: { x: number; y: number };
      to: { x: number; y: number };
    }> = [];
    
    nodePositions.forEach(node => {
      if (node.neighbors && node.neighbors.length > 0) {
        node.neighbors.forEach(neighborId => {
          const neighbor = nodePositions.find(n => n.id === neighborId);
          if (neighbor) {
            connections.push({
              from: { x: node.x, y: node.y },
              to: { x: neighbor.x, y: neighbor.y }
            });
          }
        });
      }
    });

    return (
      <div className="deep-learn-response-concept-map-dynamic">
        <svg 
          viewBox={`0 0 ${containerWidth} ${containerHeight}`}
          className="concept-map-svg"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Render connections first (so they appear behind nodes) */}
          {connections.map((connection, index) => (
            <line
              key={`connection-${index}`}
              x1={connection.from.x}
              y1={connection.from.y}
              x2={connection.to.x}
              y2={connection.to.y}
              stroke="#C0C0C0"
              strokeWidth="1.5"
              opacity="0.7"
            />
          ))}
          
          {/* Render nodes */}
          {nodePositions.map((node) => {
            // Use currentRoadmapNodeIndex to determine highlighting
            const isCurrentNode = node.id === currentRoadmapNodeIndex;
            
            return (
              <g key={`node-${node.id}`}>
                {/* Node circle */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={nodeRadius}
                  fill={isCurrentNode ? '#4C6694' : '#8B8B8B'}
                  stroke="#fff"
                  strokeWidth="2"
                  className="concept-map-node-circle"
                  style={{ 
                    cursor: 'pointer',
                    filter: isCurrentNode ? 'drop-shadow(0 1px 8px #6588D2)' : 'none'
                  }}
                />
                
                                 {/* Node label */}
                 <text
                   x={node.x}
                   y={node.y + nodeRadius + 11}
                   textAnchor="middle"
                   fontSize="9"
                   fill={isCurrentNode ? '#4C6694' : '#666'}
                   fontWeight={isCurrentNode ? '600' : '400'}
                   className="concept-map-node-text"
                 >
                   {node.label.length > 8 ? node.label.substring(0, 8) + '...' : node.label}
                 </text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  const renderConversationGroup = (message: ConversationMessage, index: number) => {
    if (message.type === 'question') {
      return (
        <div 
          key={message.id} 
          className="deep-learn-response-conversation-group"
        >
          {/* Start Marker - Visible at beginning of conversation exchange */}
          <div 
            className="deep-learn-response-visible-marker"
            data-chunk-index={message.chunkIndex || 0}
            data-message-id={`start-${message.id}`}
            style={{
              height: '30px',
              width: '100%',
              backgroundColor: '#e8f4f8',
              border: '2px solid #4CAF50',
              borderRadius: '5px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '10px',
              fontSize: '12px',
              fontWeight: 'bold',
              color: '#2E7D32'
            }}
          >
            📍 START CHUNK {message.chunkIndex || 0}
          </div>
          
          {/* Question Part */}
          <div className="deep-learn-response-question">
            <span className="deep-learn-response-question-date">
              {formatTimestamp(message.timestamp)}
            </span>
            <div className="deep-learn-response-question-box">
              <span className="deep-learn-response-question-text">
                {message.content}
              </span>
            </div>
          </div>
        </div>
      );
    } else if (message.type === 'answer') {
      return (
        <div 
          key={message.id} 
          className="deep-learn-response-conversation-group"
        >
          {/* Answer Part */}
          <div className={`deep-learn-response-answer ${message.mode === 'quick-search' ? 'response-quick-search' : ''}`}>
            {/* Title Section */}
            <div className="deep-learn-response-title-section">
              <span className="deep-learn-response-answer-title">
                {message.mode === 'quick-search' ? 'Quick Search Response' : 'Deep Learn Response'}
              </span>
              <div className="deep-learn-response-tag">
                <span className="deep-learn-response-tag-text">
                  {message.mode === 'quick-search' ? 'Quick Search' : 'Deep Learn'}
                </span>
              </div>
            </div>
            
            {/* Separation Line */}
            <div className="deep-learn-response-separator"></div>
            
            {/* Progress Bar for Deep Learn */}
            {message.mode === 'deep-learn' && (
              <div className="deep-learn-response-thinking-bar">
                <span className="deep-learn-response-thinking-status">
                  {deepLearnProgress ? deepLearnProgress.status : "Hyperknow is thinking..."}
                </span>
                <div className="deep-learn-response-thinking-right">
                  <span className="deep-learn-response-thinking-duration">
                    {deepLearnProgress ? `${deepLearnProgress.current}/${deepLearnProgress.total}` : "0/0"}
                  </span>
                  <div className="deep-learn-response-thinking-arrow">
                    <img 
                      src="/workspace/back-arrow.svg" 
                      alt="Progress" 
                      className="deep-learn-response-arrow-icon"
                    />
                  </div>
                </div>
              </div>
            )}
            
            {/* Source Cards for Deep Learn - Show at beginning */}
            {message.mode === 'deep-learn' && (
              <div className="deep-learn-response-sources">
                <div className="deep-learn-response-source-card">
                  <div className="deep-learn-response-source-title">
                    Quantum Mechanics and Black Hole Thermodynamics
                  </div>
                  <div className="deep-learn-response-source-detail">
                    Exploring the intersection of quantum mechanics and black hole thermodynamics.
                  </div>
                  <div className="deep-learn-response-source-site">
                    <img 
                      src="/workspace/site-icons/science.svg" 
                      alt="Science" 
                      className="deep-learn-response-site-icon"
                    />
                    <span className="deep-learn-response-site-name">
                      Science
                    </span>
                  </div>
                </div>
                
                <div className="deep-learn-response-source-card">
                  <div className="deep-learn-response-source-title">
                    String Theory Approaches to Information Paradox
                  </div>
                  <div className="deep-learn-response-source-detail">
                    How string theory provides insights into resolving the black hole information paradox.
                  </div>
                  <div className="deep-learn-response-source-site">
                    <img 
                      src="/workspace/site-icons/arxiv.svg" 
                      alt="arXiv" 
                      className="deep-learn-response-site-icon"
                    />
                    <span className="deep-learn-response-site-name">
                      arXiv
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Response Content */}
            <div className="deep-learn-response-content-text">
              {message.isStreaming ? (
                <div className="streaming-content">
                  {message.mode === 'deep-learn' ? (
                    message.content ? (
                      <MarkdownRenderer content={message.content} />
                    ) : (
                      // Loading skeleton for deep learn
                      <div className="deep-learn-loading-skeleton">
                        <div className="skeleton-heading"></div>
                        <div className="skeleton-paragraph"></div>
                        <div className="skeleton-paragraph short"></div>
                        <div className="skeleton-paragraph"></div>
                        <div className="skeleton-image"></div>
                        <div className="skeleton-heading sub"></div>
                        <div className="skeleton-paragraph"></div>
                        <div className="skeleton-paragraph"></div>
                        <div className="skeleton-paragraph short"></div>
                        <div className="skeleton-paragraph"></div>
                      </div>
                    )
                  ) : (
                    message.content
                  )}
                  {message.mode !== 'deep-learn' && (
                    <div className="flex items-center gap-2 text-blue-600 mt-2">
                      <div className="w-3 h-4 bg-[#4C6694] animate-pulse"></div>
                      <span className="text-sm font-['Inter',Helvetica]">
                        Streaming response...
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                message.mode === 'deep-learn' ? (
                  <MarkdownRenderer content={message.content} />
                ) : (
                  message.content
                )
              )}
            </div>
            
            {/* End Separator - Only show when not streaming */}
            {!message.isStreaming && (
              <div className="deep-learn-response-separator" style={{ marginTop: '10px' }}></div>
            )}
          </div>
          
          {/* End Marker - Visible at end of conversation exchange - Only show when not streaming */}
          {!message.isStreaming && (
            <div 
              className="deep-learn-response-visible-marker"
              data-chunk-index={message.chunkIndex || 0}
              data-message-id={`end-${message.id}`}
              style={{
                height: '30px',
                width: '100%',
                backgroundColor: '#fff3e0',
                border: '2px solid #FF9800',
                borderRadius: '5px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: '10px',
                fontSize: '12px',
                fontWeight: 'bold',
                color: '#E65100'
              }}
            >
              🏁 END CHUNK {message.chunkIndex || 0}
            </div>
          )}
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="deep-learn-response">
      {/* Center of Screen Marker */}
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '200px',
        height: '30px',
        backgroundColor: 'rgba(255, 0, 0, 0.8)',
        border: '2px solid #FF0000',
        borderRadius: '15px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '12px',
        fontWeight: 'bold',
        color: 'white',
        zIndex: 999,
        pointerEvents: 'none',
        boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
      }}>
        🎯 SCREEN CENTER (Focus Target)
      </div>

      {/* Debug Panel - Remove this in production */}
      <div style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        backgroundColor: '#f0f0f0',
        border: '1px solid #ccc',
        padding: '10px',
        borderRadius: '5px',
        fontSize: '12px',
        zIndex: 1000,
        maxWidth: '400px',
        maxHeight: '80vh',
        overflowY: 'auto'
      }}>
        <strong>🔍 Debug Info:</strong><br/>
        Creation Chunk Index: <strong>{currentChunkIndex}</strong><br/>
        <strong>👁️ Focused Chunk Index: <span style={{color: 'red'}}>{focusedChunkIndex}</span></strong><br/>
        <strong>🎯 Current Interactive Index: <span style={{color: 'blue'}}>{currentInteractiveIndex}</span></strong><br/>
        <strong>🗺️ Current Roadmap Node Index: <span style={{color: 'green'}}>{currentRoadmapNodeIndex}</span></strong><br/>
        Conversation ID: <strong>{currentConversationId.slice(-8)}</strong><br/>
        Tab ID: <strong>{`${pageIdx}-${screenId}-${tabIdx}`}</strong><br/>
        Total Chunks: <strong>{deepLearnStorageManager.getChunkCount(`${pageIdx}-${screenId}-${tabIdx}`)}</strong><br/>
        Interactive Loading: <strong>{isInteractiveLoading ? 'Yes' : 'No'}</strong><br/>
        
        <div style={{marginTop: '10px', padding: '5px', backgroundColor: '#e8e8e8', borderRadius: '3px'}}>
          <strong>📊 Separator Scores:</strong><br/>
          {separatorScores.length > 0 ? (
            separatorScores.map((item, index) => (
              <div key={index} style={{
                margin: '3px 0',
                padding: '3px',
                backgroundColor: item.isBest ? '#90EE90' : '#fff',
                border: item.isBest ? '2px solid #006400' : '1px solid #ccc',
                borderRadius: '2px',
                fontSize: '10px'
              }}>
                <strong>Chunk {item.chunkIndex}</strong> {item.isBest ? '👑' : ''}<br/>
                Visibility: <strong>{(item.visibility * 100).toFixed(1)}%</strong><br/>
                Center: <strong>{(item.centerScore * 100).toFixed(1)}%</strong> (dist: {item.distance.toFixed(0)}px)<br/>
                Final: <strong>{(item.finalScore * 100).toFixed(1)}%</strong><br/>
                <span style={{fontSize: '9px', color: '#666'}}>
                  {item.finalScore.toFixed(3)} = centerScore (closest to center wins)
                </span>
              </div>
            ))
          ) : (
            <span style={{fontSize: '10px', color: '#666'}}>No separators detected</span>
          )}
        </div>
        
        <button 
          onClick={() => deepLearnStorageManager.debugLogStorage(`${pageIdx}-${screenId}-${tabIdx}`)}
          style={{fontSize: '10px', marginTop: '5px', padding: '2px 6px', marginRight: '5px'}}
        >
          🔍 Log Storage State
        </button>
        <button 
          onClick={() => {
            const markers = document.querySelectorAll('.deep-learn-response-visible-marker[data-chunk-index]');
            console.log('🔍 DOM Focus Debug:', Array.from(markers).map(el => ({
              chunkIndex: el.getAttribute('data-chunk-index'),
              messageId: el.getAttribute('data-message-id'),
              type: el.getAttribute('data-message-id')?.includes('start') ? 'START' : 'END',
              isVisible: el.getBoundingClientRect().top < window.innerHeight && el.getBoundingClientRect().bottom > 0,
              rect: el.getBoundingClientRect()
            })));
          }}
          style={{fontSize: '10px', marginTop: '5px', padding: '2px 6px', marginRight: '5px'}}
        >
          🔍 Log Focus Debug
        </button>
        <button 
          onClick={() => {
            const tabId = `${pageIdx}-${screenId}-${tabIdx}`;
            const conversationData = deepLearnStorageManager.getConversationData(tabId);
            const focusedChunk = conversationData?.chunks.find(chunk => chunk.index === focusedChunkIndex);
            console.log('🔄 Manual Interactive Switch Test:', {
              currentFocusedChunk: focusedChunkIndex,
              currentInteractiveIndex: currentInteractiveIndex,
              currentRoadmapNodeIndex: currentRoadmapNodeIndex,
              focusedChunk: focusedChunk,
              targetInteractiveIndex: focusedChunk?.point_to_prev_interactive_index,
              targetRoadmapNodeIndex: focusedChunk?.roadmap_node_index,
              needsSwitch: focusedChunk?.point_to_prev_interactive_index !== currentInteractiveIndex,
              conversationData: conversationData
            });
          }}
          style={{fontSize: '10px', marginTop: '5px', padding: '2px 6px', marginRight: '5px'}}
        >
          🔄 Test Switch
        </button>
        <button 
          onClick={() => {
            const markers = document.querySelectorAll('.deep-learn-response-visible-marker[data-chunk-index]');
            const viewportHeight = window.innerHeight;
            const viewportCenter = viewportHeight / 2;
            
            console.log('🔍 Focus Detection Debug:', Array.from(markers).map(el => {
              const rect = el.getBoundingClientRect();
              const elementCenter = rect.top + rect.height / 2;
              const distance = Math.abs(elementCenter - viewportCenter);
              const centerScore = Math.max(0, 1 - (distance / viewportHeight));
              const visibility = Math.min(1, Math.max(0, 
                (Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0)) / rect.height
              ));
              
              return {
                chunkIndex: el.getAttribute('data-chunk-index'),
                messageId: el.getAttribute('data-message-id'),
                type: el.getAttribute('data-message-id')?.includes('start') ? 'START' : 'END',
                visibility: `${(visibility * 100).toFixed(1)}%`,
                centerDistance: `${distance.toFixed(0)}px`,
                centerScore: `${(centerScore * 100).toFixed(1)}%`,
                rect: { top: rect.top, bottom: rect.bottom, height: rect.height }
              };
            }));
          }}
          style={{fontSize: '10px', marginTop: '5px', padding: '2px 6px'}}
        >
          🔍 Focus Debug
        </button>
      </div>
      
      {/* Header Section */}
      <header className="deep-learn-response-header">
        {/* Left-aligned elements */}
        <div className="deep-learn-response-header-left">
          {/* Back Arrow */}
          <button
            onClick={handleBackClick}
            className="deep-learn-response-back-button"
            aria-label="Go back to deep learn entry"
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path 
                d="M17.4168 10.9999H4.5835M4.5835 10.9999L11.0002 17.4166M4.5835 10.9999L11.0002 4.58325" 
                stroke="#00276C" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {/* Conversation Title */}
          <h1 className="deep-learn-response-title">
            Learning Journey: {interactiveData?.interactive_content?.conversation_title || (conversation.length > 0 ? conversation[0].content.substring(0, 50) + '...' : 'New Conversation')}
          </h1>

          {/* Conversation Tag */}
          <div className="deep-learn-response-tag">
            <span className="deep-learn-response-tag-text">
              Conversation
            </span>
          </div>
        </div>

        {/* Right-aligned elements - Only show in full screen mode */}
        {!isInSplitMode && (
          <div className="deep-learn-response-header-right">
            {/* Share Icon */}
            <button
              className="deep-learn-response-action-button"
              aria-label="Share analysis"
            >
              <img
                src="/workspace/share.svg"
                alt="Share"
                className="deep-learn-response-action-icon"
              />
            </button>

            {/* Print Icon */}
            <button
              className="deep-learn-response-action-button"
              aria-label="Print analysis"
            >
              <img
                src="/workspace/print.svg"
                alt="Print"
                className="deep-learn-response-action-icon"
              />
            </button>

            {/* Publish to Community Button */}
            <button
              className="deep-learn-response-publish-button"
              aria-label="Publish to community"
            >
              <img
                src="/workspace/publish.svg"
                alt="Publish"
                className="deep-learn-response-publish-icon"
              />
              <span className="deep-learn-response-publish-text">
                Publish to Community
              </span>
            </button>
          </div>
        )}
      </header>

      {/* Main Content Section */}
      <div className="deep-learn-response-main">
        <div className="deep-learn-response-content">
          {/* Conversation Section */}
          <div className="deep-learn-response-conversation">
            {/* Conversation Main Section */}
            <div className="deep-learn-response-conversation-main">
              {/* Conversation Groups */}
              <div className="deep-learn-response-conversation-groups">
                {conversation.length > 0 ? (
                  // Group messages by chunk index to create proper chunks
                  (() => {
                    const chunks = new Map<number, ConversationMessage[]>();
                    conversation.forEach(message => {
                      const chunkIndex = message.chunkIndex || 0;
                      if (!chunks.has(chunkIndex)) {
                        chunks.set(chunkIndex, []);
                      }
                      chunks.get(chunkIndex)!.push(message);
                    });
                    
                    return Array.from(chunks.entries()).map(([chunkIndex, messages]) => (
                      <div 
                        key={`chunk-${chunkIndex}`}
                        className="deep-learn-response-chunk"
                        data-chunk-index={chunkIndex}
                      >
                        {messages.map((message, index) => renderConversationGroup(message, index))}
                      </div>
                    ));
                  })()
                ) : (
                  <div className="deep-learn-response-conversation-group">
                    <div className="deep-learn-response-question">
                      <span className="deep-learn-response-question-date">
                        Me, Jun 1, 9:50PM
                      </span>
                      <div className="deep-learn-response-question-box">
                        <span className="deep-learn-response-question-text">
                          What is the Black Hole Information Paradox?
                        </span>
                      </div>
                    </div>

                    {/* Sample Deep Learn Response Part */}
                    <div className="deep-learn-response-answer">
                      {/* Title Section */}
                      <div className="deep-learn-response-title-section">
                        <span className="deep-learn-response-answer-title">
                          Solution of Black Hole Information Paradox
                        </span>
                        <div className="deep-learn-response-tag">
                          <span className="deep-learn-response-tag-text">
                            Deep Learn
                          </span>
                        </div>
                      </div>
                      
                      {/* Separation Line */}
                      <div className="deep-learn-response-separator"></div>
                      
                      {/* Thinking Progress Bar */}
                      <div className="deep-learn-response-thinking-bar">
                        <span className="deep-learn-response-thinking-status">
                          Thinking...
                        </span>
                        <div className="deep-learn-response-thinking-right">
                          <span className="deep-learn-response-thinking-duration">
                            Thought for 13 seconds
                          </span>
                          <svg 
                            width="16" 
                            height="16" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            xmlns="http://www.w3.org/2000/svg"
                            className="deep-learn-response-arrow-icon"
                          >
                            <path 
                              d="M6 9L12 15L18 9" 
                              stroke="black" 
                              strokeWidth="2" 
                              strokeLinecap="round" 
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                      </div>
                      
                      {/* Source Webpages Section */}
                      <div className="deep-learn-response-sources">
                        <div className="deep-learn-response-source-card">
                          <div className="deep-learn-response-source-title">
                            Black Hole Information Paradox: A Comprehensive Analysis
                          </div>
                          <div className="deep-learn-response-source-detail">
                            Recent developments in quantum mechanics and general relativity have shed new light on this fundamental problem in theoretical physics.
                          </div>
                          <div className="deep-learn-response-source-site">
                            <img 
                              src="/workspace/site-icons/physics-today.svg" 
                              alt="Physics Today" 
                              className="deep-learn-response-site-icon"
                            />
                            <span className="deep-learn-response-site-name">
                              Physics Today
                            </span>
                          </div>
                        </div>
                        
                        <div className="deep-learn-response-source-card">
                          <div className="deep-learn-response-source-title">
                            Hawking Radiation and Information Loss
                          </div>
                          <div className="deep-learn-response-source-detail">
                            Understanding the relationship between Hawking radiation and the preservation of quantum information.
                          </div>
                          <div className="deep-learn-response-source-site">
                            <img 
                              src="/workspace/site-icons/nature.svg" 
                              alt="Nature" 
                              className="deep-learn-response-site-icon"
                            />
                            <span className="deep-learn-response-site-name">
                              Nature
                            </span>
                          </div>
                        </div>
                        
                        <div className="deep-learn-response-source-card">
                          <div className="deep-learn-response-source-title">
                            Quantum Mechanics and Black Hole Thermodynamics
                          </div>
                          <div className="deep-learn-response-source-detail">
                            Exploring the intersection of quantum mechanics and black hole thermodynamics.
                          </div>
                          <div className="deep-learn-response-source-site">
                            <img 
                              src="/workspace/site-icons/science.svg" 
                              alt="Science" 
                              className="deep-learn-response-site-icon"
                            />
                            <span className="deep-learn-response-site-name">
                              Science
                            </span>
                          </div>
                        </div>
                        
                        <div className="deep-learn-response-source-card">
                          <div className="deep-learn-response-source-title">
                            String Theory Approaches to Information Paradox
                          </div>
                          <div className="deep-learn-response-source-detail">
                            How string theory provides insights into resolving the black hole information paradox.
                          </div>
                          <div className="deep-learn-response-source-site">
                            <img 
                              src="/workspace/site-icons/arxiv.svg" 
                              alt="arXiv" 
                              className="deep-learn-response-site-icon"
                            />
                            <span className="deep-learn-response-site-name">
                              arXiv
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Response Content */}
                      <div className="deep-learn-response-content-text">
                        The Black Hole Information Paradox represents one of the most profound challenges in theoretical physics, arising from the apparent conflict between quantum mechanics and general relativity. At its core, the paradox questions whether information that falls into a black hole is permanently lost or somehow preserved.

                        Stephen Hawking's groundbreaking work in 1974 showed that black holes emit radiation (now known as Hawking radiation) and can eventually evaporate. However, this radiation appears to be purely thermal, containing no information about the matter that originally formed the black hole. This creates a fundamental problem: if information is truly lost, it violates the principle of unitarity in quantum mechanics, which states that information must be conserved.

                        Several theoretical approaches have been proposed to resolve this paradox. The AdS/CFT correspondence, proposed by Juan Maldacena in 1997, suggests that information is indeed preserved through a holographic principle where the information is encoded on the black hole's event horizon rather than being lost inside. String theory approaches propose that quantum correlations in the Hawking radiation carry the necessary information.

                        Recent developments in quantum information theory and the study of quantum entanglement have provided new insights. The concept of "firewalls" and the ER=EPR conjecture suggest that quantum entanglement might play a crucial role in preserving information across the event horizon.

                        While the paradox remains not fully resolved, these theoretical frameworks provide promising directions for understanding how quantum mechanics and gravity can be reconciled, potentially leading to a unified theory of quantum gravity.
                      </div>
                      
                      {/* End Separator */}
                      <div className="deep-learn-response-separator" style={{ marginTop: '10px' }}></div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Input Box Section */}
            <div className="deep-learn-response-input-section">
              {/* Input Area */}
              <div className="deep-learn-response-input-box">
                {!hasFirstQuestion ? (
                  <div className="deep-learn-response-mode-selection">
                    <span className="deep-learn-response-mode-text">Start a </span>
                    <button 
                      className="deep-learn-response-mode-button follow-up"
                      onClick={handleFollowUp}
                    >
                      Follow Up
                    </button>
                    <span className="deep-learn-response-mode-text"> or </span>
                    <button 
                      className="deep-learn-response-mode-button new-topic"
                      onClick={handleNewTopic}
                    >
                      New Topic
                    </button>
                  </div>
                ) : (
                  <>
                                <textarea
              className="deep-learn-response-input"
              placeholder="Type your question here..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmitQuery();
                }
              }}
            />
                    {selectedMode && (
                      <div className="deep-learn-response-mode-change">
                        <span className="deep-learn-response-mode-text">Change to </span>
                        <button 
                          className={`deep-learn-response-mode-button ${selectedMode === 'follow-up' ? 'new-topic' : 'follow-up'}`}
                          onClick={() => handleModeChange(selectedMode === 'follow-up' ? 'new-topic' : 'follow-up')}
                        >
                          {selectedMode === 'follow-up' ? 'New Topic' : 'Follow Up'}
                        </button>
                      </div>
                    )}
                  </>
                )}
                
                {/* Buttons at the bottom right */}
                <div className="deep-learn-response-buttons">
                  {/* Mode Toggle Button - Only show when New Topic is selected */}
                  {selectedMode === 'new-topic' && (
                    <div className="deep-learn-response-mode-toggle">
                      <div 
                        className={`deep-learn-response-mode-toggle-option ${selectedResponseMode === 'deep-learn' ? 'selected' : 'unselected'}`}
                        onClick={() => toggleResponseMode('deep-learn')}
                        title="Deep Learn"
                      >
                        <img 
                          src="/workspace/deepLearn/lens-stars.svg" 
                          alt="Deep Learn Icon" 
                          className="deep-learn-response-mode-toggle-icon"
                          style={{ filter: selectedResponseMode === 'deep-learn' ? 'brightness(0) invert(1)' : 'brightness(0) saturate(100%) invert(32%) sepia(9%) saturate(2096%) hue-rotate(182deg) brightness(93%) contrast(87%)' }}
                        />
                      </div>
                      <div 
                        className={`deep-learn-response-mode-toggle-option ${selectedResponseMode === 'quick-search' ? 'selected' : 'unselected'}`}
                        onClick={() => toggleResponseMode('quick-search')}
                        title="Quick Search"
                      >
                        <img 
                          src="/workspace/deepLearn/lens-check.svg" 
                          alt="Quick Search Icon" 
                          className="deep-learn-response-mode-toggle-icon"
                          style={{ filter: selectedResponseMode === 'quick-search' ? 'brightness(0) invert(1)' : 'brightness(0) saturate(100%) invert(32%) sepia(9%) saturate(2096%) hue-rotate(182deg) brightness(93%) contrast(87%)' }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Web Search Toggle Button */}
                  <button 
                    className={`deep-learn-response-web-search ${webSearchEnabled ? 'selected' : 'unselected'}`}
                    onClick={toggleWebSearch}
                    title="Toggle Web Search"
                  >
                    <img 
                      src="/workspace/deepLearn/language.svg" 
                      alt="Web Search" 
                      className="deep-learn-response-web-search-icon"
                      style={{ filter: webSearchEnabled ? 'brightness(0) saturate(100%) invert(32%) sepia(9%) saturate(2096%) hue-rotate(182deg) brightness(93%) contrast(87%)' : 'brightness(0) saturate(100%) invert(48%) sepia(0%) saturate(0%) hue-rotate(251deg) brightness(94%) contrast(92%)' }}
                    />
                  </button>

                  {/* Profile Select Button */}
                  <button 
                    className={`deep-learn-response-button ${profileSelected ? 'selected' : ''}`}
                    onClick={toggleProfile}
                    title="Select Profile"
                  >
                    <img 
                      src="/workspace/deepLearn/contacts-line.svg" 
                      alt="Profile" 
                      className="deep-learn-response-button-icon"
                      style={{ filter: profileSelected ? 'brightness(0) invert(1)' : 'brightness(0) saturate(100%) invert(39%) sepia(0%) saturate(0%) hue-rotate(147deg) brightness(94%) contrast(87%)' }}
                    />
                  </button>
                  
                  {/* Reference Select Button */}
                  <button 
                    className={`deep-learn-response-button ${referenceSelected ? 'selected' : ''}`}
                    title="Select References"
                    onClick={toggleReference}
                  >
                    <img 
                      src="/workspace/deepLearn/folder.svg" 
                      alt="References" 
                      className="deep-learn-response-button-icon"
                      style={{ filter: referenceSelected ? 'brightness(0) invert(1)' : 'brightness(0) saturate(100%) invert(39%) sepia(0%) saturate(0%) hue-rotate(147deg) brightness(94%) contrast(87%)' }}
                    />
                  </button>

                  {/* Separator Line */}
                  <div className="deep-learn-response-button-separator"></div>

                  {/* Send Button */}
                  <button 
                    className={`deep-learn-response-send-button ${inputValue.trim() && !isLoading ? 'active' : ''}`}
                    disabled={!inputValue.trim() || isLoading}
                    title="Send Query"
                    onClick={handleSubmitQuery}
                  >
                    <img 
                      src="/workspace/arrow-up.svg" 
                      alt="Send" 
                      className="deep-learn-response-send-icon"
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Section */}
          <div className="deep-learn-response-interactive">
            {/* Top Gray Box */}
            <div className="deep-learn-response-interactive-box top-box">
              <div className="deep-learn-response-interactive-content">
                {/* Related Videos Section */}
                <div className="deep-learn-response-related-videos">
                  {/* Header */}
                  <div className="deep-learn-response-related-header">
                    <img 
                      src="/workspace/deepLearn/related-videos.svg" 
                      alt="Related Videos" 
                      className="deep-learn-response-related-icon"
                    />
                    <span className="deep-learn-response-related-title">
                      Related Videos
                    </span>
                  </div>
                  
                  {/* Video Content */}
                  <div className="deep-learn-response-video-content">
                    {isInteractiveLoading ? (
                      /* Loading state for video */
                      <div className="deep-learn-response-video-box">
                        {/* Image Section with grey box and loading overlay */}
                        <div className="deep-learn-response-video-image-section">
                          <div className="video-loading-placeholder">
                            <div className="video-loading-spinner"></div>
                          </div>
                        </div>
                        
                        {/* Text Section with skeleton loading */}
                        <div className="deep-learn-response-video-text-section">
                          <div className="skeleton-video-title"></div>
                          <div className="skeleton-video-source"></div>
                        </div>
                      </div>
                    ) : interactiveData?.interactive_content?.recommended_videos && interactiveData.interactive_content.recommended_videos.length > 0 ? (
                      // Show only the top 1 video
                      <div className="deep-learn-response-video-box">
                        {/* Image Section */}
                        <div className="deep-learn-response-video-image-section">
                          <img 
                            src={interactiveData.interactive_content.recommended_videos[0].thumbnail} 
                            alt={interactiveData.interactive_content.recommended_videos[0].title} 
                            className="deep-learn-response-video-image"
                            onError={(e) => {
                              // Handle broken images
                              const target = e.target as HTMLImageElement;
                              target.src = "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=284&h=132&fit=crop";
                            }}
                          />
                        </div>
                        
                        {/* Text Section */}
                        <div className="deep-learn-response-video-text-section">
                          <h4 className="deep-learn-response-video-title">
                            <a 
                              href={interactiveData.interactive_content.recommended_videos[0].url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                            >
                              {interactiveData.interactive_content.recommended_videos[0].title}
                            </a>
                          </h4>
                          <div className="deep-learn-response-video-source">
                            <img 
                              src="/workspace/deepLearn/youtube.svg" 
                              alt="YouTube" 
                              className="deep-learn-response-youtube-icon"
                            />
                            <span className="deep-learn-response-source-text">
                              {interactiveData.interactive_content.recommended_videos[0].channel || 'YouTube'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Fallback video box */
                      <div className="deep-learn-response-video-box">
                        {/* Image Section */}
                        <div className="deep-learn-response-video-image-section">
                          <img 
                            src="https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=284&h=132&fit=crop" 
                            alt="Universe video thumbnail" 
                            className="deep-learn-response-video-image"
                          />
                        </div>
                        
                        {/* Text Section */}
                        <div className="deep-learn-response-video-text-section">
                          <h4 className="deep-learn-response-video-title">
                            <a href="#" onClick={(e) => e.preventDefault()}>
                              DNA and Gene Editing Using CRISPR Technology
                            </a>
                          </h4>
                          <div className="deep-learn-response-video-source">
                            <img 
                              src="/workspace/deepLearn/youtube.svg" 
                              alt="YouTube" 
                              className="deep-learn-response-youtube-icon"
                            />
                            <span className="deep-learn-response-source-text">
                              Science Channel
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Related Webpages Section */}
                <div className="deep-learn-response-related-webpages">
                  {/* Header */}
                  <div className="deep-learn-response-webpages-header">
                    <img 
                      src="/workspace/deepLearn/related-webpages.svg" 
                      alt="Related Webpages" 
                      className="deep-learn-response-webpages-icon"
                    />
                    <span className="deep-learn-response-webpages-title">
                      Related Webpages
                    </span>
                  </div>
                  
                  {/* Webpages Content */}
                  <div className="deep-learn-response-webpages-content">
                    {isInteractiveLoading ? (
                      /* Loading state for webpages - skeleton animation */
                      <>
                        <div className="deep-learn-response-webpage-box">
                          <div className="skeleton-webpage-title"></div>
                          <div className="skeleton-webpage-description"></div>
                        </div>
                        
                        <div className="deep-learn-response-webpage-box">
                          <div className="skeleton-webpage-title"></div>
                          <div className="skeleton-webpage-description"></div>
                        </div>
                      </>
                    ) : interactiveData?.interactive_content?.related_webpages && interactiveData.interactive_content.related_webpages.length > 0 ? (
                      // Show only the top 2 webpages
                      interactiveData.interactive_content.related_webpages.slice(0, 2).map((webpage, index) => (
                        <div key={index} className="deep-learn-response-webpage-box">
                          <h4 className="deep-learn-response-webpage-title">
                            <a 
                              href={webpage.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                            >
                              {webpage.title}
                            </a>
                          </h4>
                          <p className="deep-learn-response-webpage-description">
                            {webpage.description}
                          </p>
                        </div>
                      ))
                    ) : (
                      /* Fallback webpage boxes */
                      <>
                        <div className="deep-learn-response-webpage-box">
                          <h4 className="deep-learn-response-webpage-title">
                            Related Webpages 1
                          </h4>
                          <p className="deep-learn-response-webpage-description">
                            Discover Pinterest's best ideas and inspiration for Study icon. Get inspired and try out new things.
                          </p>
                        </div>
                        
                        <div className="deep-learn-response-webpage-box">
                          <h4 className="deep-learn-response-webpage-title">
                            Related Webpages 1
                          </h4>
                          <p className="deep-learn-response-webpage-description">
                            Discover Pinterest's best ideas and inspiration for Study icon. Get inspired and try out new things.
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Bottom Gray Box */}
            <div className="deep-learn-response-interactive-box bottom-box">
              <div className="deep-learn-response-interactive-content">
                {/* Concept Map Section */}
                <div className="deep-learn-response-concept-map">
                  {/* Header */}
                  <div className="deep-learn-response-concept-map-header">
                    <img 
                      src="/workspace/deepLearn/concept-map.svg" 
                      alt="Concept Map" 
                      className="deep-learn-response-concept-map-icon"
                    />
                    <span className="deep-learn-response-concept-map-title">
                      Concept Map
                    </span>
                  </div>
                  
                  {/* Concept Map Content */}
                  <div className="deep-learn-response-concept-map-content">
                    {/* Concept Map Box */}
                    <div className="deep-learn-response-concept-map-box">
                      {renderConceptMap()}
                    </div>
                    
                    {/* Current Selection Indicator */}
                    <div className="deep-learn-response-concept-map-selection">
                      <span className="deep-learn-response-concept-map-selection-text">
                        You are currently exploring:
                      </span>
                      <div className="deep-learn-response-concept-map-selection-button">
                        {(() => {
                          // Find the node label based on currentInteractiveIndex
                          const currentNode = savedRoadmap?.nodes?.find(node => node.id === currentInteractiveIndex);
                          return currentNode?.label || interactiveData?.topic || interactiveData?.interactive_content?.conversation_title || 'Learning Journey';
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeepLearnResponse;

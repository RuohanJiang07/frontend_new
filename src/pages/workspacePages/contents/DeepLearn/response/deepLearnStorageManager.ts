// Deep Learn Local Storage Manager
// Handles only the specific data required for conversation chunk tracking

export interface ConversationChunk {
  index: number;
  search_type: 'new_topic' | 'followup';
  point_to_prev_interactive_index: number;
  interactive?: {
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
}

export interface ConversationData {
  conversationId: string;
  chunks: ConversationChunk[];
}

class DeepLearnStorageManager {
  private storageKeyPrefix = 'deeplearn_conversation_';

  private getStorageKey(tabId: string): string {
    return `${this.storageKeyPrefix}${tabId}`;
  }

  // Get conversation data from localStorage
  getConversationData(tabId: string): ConversationData | null {
    try {
      const data = localStorage.getItem(this.getStorageKey(tabId));
      if (!data) {
        console.log(`📂 No existing conversation data found for tab: ${tabId}`);
        return null;
      }
      
      const parsed = JSON.parse(data) as ConversationData;
      console.log(`📂 Loaded conversation data for tab ${tabId}:`, {
        conversationId: parsed.conversationId,
        chunkCount: parsed.chunks.length
      });
      
      // Log each chunk's details
      parsed.chunks.forEach((chunk) => {
        console.log(`📋 Chunk ${chunk.index}:`, {
          index: chunk.index,
          search_type: chunk.search_type,
          point_to_prev_interactive_index: chunk.point_to_prev_interactive_index,
          hasInteractive: !!chunk.interactive
        });
      });
      
      return parsed;
    } catch (error) {
      console.error(`❌ Error loading conversation data for tab ${tabId}:`, error);
      return null;
    }
  }

  // Save conversation data to localStorage
  saveConversationData(tabId: string, data: ConversationData): void {
    try {
      localStorage.setItem(this.getStorageKey(tabId), JSON.stringify(data));
      
      console.log(`💾 Saved conversation data for tab ${tabId}:`, {
        conversationId: data.conversationId,
        chunkCount: data.chunks.length
      });
      
      // Log the current state of local storage
      console.log(`🗃️ Current local storage state for ${tabId}:`, data);
      
    } catch (error) {
      console.error(`❌ Error saving conversation data for tab ${tabId}:`, error);
    }
  }

  // Initialize new conversation
  initializeConversation(tabId: string, conversationId: string): ConversationData {
    const newConversation: ConversationData = {
      conversationId: conversationId,
      chunks: []
    };
    
    console.log(`🚀 Initializing new conversation for tab ${tabId} with ID: ${conversationId}`);
    
    this.saveConversationData(tabId, newConversation);
    return newConversation;
  }

  // Add new conversation chunk
  addConversationChunk(
    tabId: string,
    searchType: 'new_topic' | 'followup',
    interactiveData?: any
  ): ConversationChunk {
    let conversationData = this.getConversationData(tabId);
    if (!conversationData) {
      throw new Error(`No conversation data found for tab ${tabId}. Please initialize conversation first.`);
    }

    // Calculate the new chunk index
    const newIndex = conversationData.chunks.length;
    
    // Prevent duplicate chunk creation - check if a chunk with this index already exists
    const existingChunk = conversationData.chunks.find(c => c.index === newIndex);
    if (existingChunk) {
      console.log(`⚠️ Chunk with index ${newIndex} already exists, skipping creation`);
      return existingChunk;
    }

    // Calculate point_to_prev_interactive_index based on search_type
    let pointToPrevInteractiveIndex: number;
    
    if (searchType === 'new_topic') {
      // For new_topic, point to self (current index)
      pointToPrevInteractiveIndex = newIndex;
      console.log(`🔗 New topic chunk ${newIndex} points to itself for interactive content`);
    } else {
      // For followup, find the last new_topic chunk
      let lastNewTopicIndex = -1;
      for (let i = conversationData.chunks.length - 1; i >= 0; i--) {
        if (conversationData.chunks[i].search_type === 'new_topic') {
          lastNewTopicIndex = conversationData.chunks[i].index;
          break;
        }
      }
      
      pointToPrevInteractiveIndex = lastNewTopicIndex >= 0 ? lastNewTopicIndex : 0;
      console.log(`🔗 Followup chunk ${newIndex} points to last new_topic chunk ${pointToPrevInteractiveIndex} for interactive content`);
    }

    // Create new chunk with only the required fields
    const newChunk: ConversationChunk = {
      index: newIndex,
      search_type: searchType,
      point_to_prev_interactive_index: pointToPrevInteractiveIndex
    };

    // Add interactive data only for new_topic search type
    if (searchType === 'new_topic' && interactiveData) {
      newChunk.interactive = {
        conversation_title: interactiveData.interactive_content?.conversation_title || 'Untitled',
        recommended_videos: (interactiveData.interactive_content?.recommended_videos || []).map((video: any) => ({
          ...video,
          channel: video.channel || 'Unknown'
        })),
        related_webpages: interactiveData.interactive_content?.related_webpages || [],
        related_concepts: interactiveData.interactive_content?.related_concepts || []
      };
      console.log(`🎯 Added interactive content to chunk ${newIndex}:`, {
        videoCount: newChunk.interactive.recommended_videos.length,
        webpageCount: newChunk.interactive.related_webpages.length,
        conceptCount: newChunk.interactive.related_concepts.length
      });
    }

    // Add chunk to conversation
    conversationData.chunks.push(newChunk);

    // Save updated conversation
    this.saveConversationData(tabId, conversationData);

    console.log(`✅ Added new chunk ${newIndex} to conversation:`, {
      index: newChunk.index,
      search_type: newChunk.search_type,
      point_to_prev_interactive_index: newChunk.point_to_prev_interactive_index,
      hasInteractive: !!newChunk.interactive
    });

    return newChunk;
  }

  // Add interactive data to existing chunk
  addInteractiveToChunk(tabId: string, chunkIndex: number, interactiveData: any): void {
    const conversationData = this.getConversationData(tabId);
    if (!conversationData) {
      console.warn(`⚠️ Cannot add interactive data - no conversation data for tab ${tabId}`);
      return;
    }

    const chunk = conversationData.chunks.find(c => c.index === chunkIndex);
    if (!chunk) {
      console.warn(`⚠️ Cannot find chunk with index ${chunkIndex} in tab ${tabId}`);
      return;
    }

    chunk.interactive = {
      conversation_title: interactiveData.interactive_content?.conversation_title || 'Untitled',
      recommended_videos: (interactiveData.interactive_content?.recommended_videos || []).map((video: any) => ({
        ...video,
        channel: video.channel || 'Unknown'
      })),
      related_webpages: interactiveData.interactive_content?.related_webpages || [],
      related_concepts: interactiveData.interactive_content?.related_concepts || []
    };

    this.saveConversationData(tabId, conversationData);
    
    console.log(`🎯 Added interactive data to chunk ${chunkIndex}:`, {
      videoCount: chunk.interactive.recommended_videos.length,
      webpageCount: chunk.interactive.related_webpages.length,
      conceptCount: chunk.interactive.related_concepts.length
    });
  }

  // Get interactive data for a specific chunk index
  getInteractiveForChunk(tabId: string, chunkIndex: number): ConversationChunk['interactive'] | null {
    const conversationData = this.getConversationData(tabId);
    if (!conversationData) {
      return null;
    }

    // First, find the chunk with the given index
    const targetChunk = conversationData.chunks.find(c => c.index === chunkIndex);
    if (!targetChunk) {
      console.warn(`⚠️ Cannot find chunk with index ${chunkIndex}`);
      return null;
    }

    // Get the interactive index this chunk points to
    const interactiveIndex = targetChunk.point_to_prev_interactive_index;
    
    // Find the chunk that contains the interactive data
    const interactiveChunk = conversationData.chunks.find(c => c.index === interactiveIndex);
    if (!interactiveChunk) {
      console.warn(`⚠️ Cannot find interactive chunk with index ${interactiveIndex}`);
      return null;
    }

    console.log(`🎯 Retrieved interactive data for chunk ${chunkIndex} from chunk ${interactiveIndex}`);
    return interactiveChunk.interactive || null;
  }

  // Clear conversation data for a tab
  clearConversationData(tabId: string): void {
    localStorage.removeItem(this.getStorageKey(tabId));
    console.log(`🗑️ Cleared conversation data for tab ${tabId}`);
  }

  // Get current chunk count for a conversation
  getChunkCount(tabId: string): number {
    const conversationData = this.getConversationData(tabId);
    return conversationData ? conversationData.chunks.length : 0;
  }

  // Debug: Log all storage data
  debugLogStorage(tabId: string): void {
    console.log(`🔍 DEBUG: Full storage state for tab ${tabId}`);
    const conversationData = this.getConversationData(tabId);
    
    if (conversationData) {
      console.log('📊 Conversation Overview:', {
        totalChunks: conversationData.chunks.length
      });

      conversationData.chunks.forEach((chunk) => {
        console.log(`📋 Chunk ${chunk.index} Details:`, {
          index: chunk.index,
          search_type: chunk.search_type,
          point_to_prev_interactive_index: chunk.point_to_prev_interactive_index,
          hasInteractive: !!chunk.interactive,
          interactiveVideoCount: chunk.interactive?.recommended_videos?.length || 0,
          interactiveWebpageCount: chunk.interactive?.related_webpages?.length || 0
        });
      });
    } else {
      console.log('📭 No conversation data found');
    }
  }
}

// Export singleton instance
export const deepLearnStorageManager = new DeepLearnStorageManager();
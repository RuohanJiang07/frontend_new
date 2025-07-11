export interface DeepLearnRequest {
  workspace_id: string;
  conversation_id?: string;
  new_conversation: boolean;
  search_type: string;
  question_type: string;
  web_search: boolean;
  user_query: string;
  user_additional_comment?: string;
  profile_selected: string;
  references_selected?: string[] | null;
}

export interface DeepLearnResponse {
  conversation_id: string;
  message: string;
  status: string;
}

export interface QuickSearchRequest {
  workspace_id: string;
  conversation_id?: string;
  new_conversation: boolean;
  search_type: string;
  web_search: boolean;
  user_query: string;
  user_additional_comment?: string | null;
  references_selected?: string[] | null;
}

export interface InteractiveRequest {
  workspace_id: string;
  conversation_id: string;
  user_query: string;
  user_additional_comment?: string | null;
}

export interface InteractiveResponse {
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

const API_BASE_URL = 'https://backend-aec-experimental.onrender.com';

// Helper function to get access token
const getAccessToken = (): string | null => {
  return localStorage.getItem('hyperknow_access_token');
};

// Helper function to get workspace ID
const getWorkspaceId = (): string | null => {
  return localStorage.getItem('current_workspace_id');
};

// Helper function to create headers with auth
const createAuthHeaders = () => {
  const accessToken = getAccessToken();
  
  if (!accessToken) {
    throw new Error('No access token found. Please login first.');
  }

  return {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
    'accept': 'application/json',
  };
};

// Helper function to generate UUID
const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Helper function to generate conversation ID in dl-c-{uuid} format
const generateConversationId = (): string => {
  const uuid = generateUUID();
  return `dl-c-${uuid}`;
};

export const submitQuickSearchQuery = async (
  query: string,
  webSearch: boolean,
  additionalComments?: string,
  references?: string[] | null,
  onData: (data: string) => void,
  onError: (error: string) => void,
  onComplete: () => void,
  existingConversationId?: string, // Existing conversation ID for continuous conversation
  generatedConversationId?: string // Generated conversation ID for new conversation
): Promise<string> => {
  try {
    const workspaceId = getWorkspaceId();
    if (!workspaceId) {
      throw new Error('No workspace selected. Please select a workspace first.');
    }

    // Use existing conversation ID, generated conversation ID, or generate new one
    const conversationId = existingConversationId || generatedConversationId || generateConversationId();
    const isNewConversation = !existingConversationId;
    
    console.log('🆔 Quick Search - Using conversation ID:', conversationId, 'isNew:', isNewConversation);
    console.log('📤 Quick Search - Starting quick search endpoint first...');

    // Use real user input and settings
    const requestData: QuickSearchRequest = {
      workspace_id: workspaceId,
      conversation_id: conversationId,
      search_type: isNewConversation ? "new_topic" : "new_topic", // Always new_topic for now
      web_search: webSearch,
      user_query: query,
      new_conversation: isNewConversation,
      user_additional_comment: additionalComments || null,
      references_selected: references || []
    };

    console.log('📝 Submitting Quick Search request:', requestData);

    // Start the quick search endpoint FIRST
    console.log('🚀 Starting Quick Search endpoint...');
    const response = await fetch(`${API_BASE_URL}/api/v1/deep_research/start/quicksearch`, {
      method: 'POST',
      headers: createAuthHeaders(),
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication failed. Please login again.');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Immediately start the interactive endpoint call (no delay)
    console.log('🔧 Starting interactive endpoint call simultaneously...');
    const tabId = window.location.pathname + window.location.search;
    
    const interactivePromise = callInteractiveEndpoint(conversationId, query, additionalComments)
      .then(interactiveData => {
        console.log('✅ Interactive endpoint returned data for Quick Search:', interactiveData);
        
        // Store interactive data for the sidebar
        localStorage.setItem(`deeplearn_interactive_${tabId}`, JSON.stringify(interactiveData));
        console.log('💾 Stored interactive data to localStorage with key:', `deeplearn_interactive_${tabId}`);
        
        // Trigger event to update sidebar
        window.dispatchEvent(new CustomEvent('deeplearn-interactive-update', {
          detail: { tabId, data: interactiveData }
        }));
        console.log('📡 Triggered deeplearn-interactive-update event for tabId:', tabId);
        
        return interactiveData;
      })
      .catch(error => {
        console.error('❌ Interactive endpoint error for Quick Search:', error);
        // Don't throw error to avoid breaking the main quick search flow
      });

    // Start processing the quick search response stream
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Failed to get response reader');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        console.log('✅ Quick search streaming completed');
        onComplete();
        break;
      }

      // Decode the chunk and add to buffer
      buffer += decoder.decode(value, { stream: true });
      
      // Process complete lines (backend sends line by line)
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep incomplete line in buffer

      for (const line of lines) {
        if (line.trim()) {
          console.log('📥 Received quick search streaming line:', line);
          
          // Check for error in the line
          if (line.includes('"error"')) {
            try {
              const errorData = JSON.parse(line);
              if (errorData.error) {
                onError(errorData.error);
                return conversationId;
              }
            } catch (parseError) {
              // If it's not valid JSON, treat as regular content
            }
          }
          
          // Send the line to the callback (add newline back since backend expects line-by-line)
          onData(line + '\n');
        }
      }
    }

    // Wait for interactive endpoint to complete (but don't block the main flow)
    interactivePromise.catch(error => {
      console.warn('⚠️ Interactive call failed but continuing with Quick Search:', error);
    });

    return conversationId;
  } catch (error) {
    console.error('❌ Quick Search API error:', error);
    onError(error instanceof Error ? error.message : 'Unknown quick search error');
    throw error;
  }
};

const callInteractiveEndpoint = async (
  conversationId: string,
  userQuery: string,
  userAdditionalComment?: string
): Promise<InteractiveResponse> => {
  try {
    const workspaceId = getWorkspaceId();
    if (!workspaceId) {
      throw new Error('No workspace selected for interactive call.');
    }

    const requestData: InteractiveRequest = {
      workspace_id: workspaceId,
      conversation_id: conversationId,
      user_query: userQuery,
      user_additional_comment: userAdditionalComment || null
    };

    console.log('📞 Calling interactive endpoint for quick search:', requestData);

    const response = await fetch(`${API_BASE_URL}/api/v1/deep_research/interactive`, {
      method: 'POST',
      headers: createAuthHeaders(),
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication failed. Please login again.');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: InteractiveResponse = await response.json();
    console.log('✅ Interactive endpoint returned data for Quick Search:', data);
    return data;
  } catch (error) {
    console.error('❌ Interactive API error for quick search:', error);
    throw error;
  }
};
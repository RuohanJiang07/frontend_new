export interface FollowUpRequest {
  workspace_id: string;
  conversation_id: string;
  search_type: 'followup';
  web_search: boolean;
  user_query: string;
  new_conversation: false; // Always false for follow-up mode
  user_additional_comment?: string | null;
  references_selected?: string[] | null;
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

export const submitFollowUpQuery = async (
  query: string,
  webSearch: boolean,
  onData: (data: string) => void,
  onError: (error: string) => void,
  onComplete: () => void,
  conversationId: string, // Must provide existing conversation ID for follow-up
  additionalComments?: string,
  references?: string[] | null,
  pageIdx?: number,
  screenId?: string,
  tabIdx?: number
): Promise<string> => {
  try {
    const workspaceId = getWorkspaceId();
    if (!workspaceId) {
      throw new Error('No workspace selected. Please select a workspace first.');
    }

    if (!conversationId) {
      throw new Error('Conversation ID is required for follow-up queries.');
    }
    
    console.log('🆔 Follow-up Search - Using conversation ID:', conversationId);
    console.log('🔍 Follow-up Search - Search type: followup');
    console.log('📤 Follow-up Search - Starting quick search endpoint...');

    // Use real user input and settings for follow-up mode
    const requestData: FollowUpRequest = {
      workspace_id: workspaceId,
      conversation_id: conversationId,
      search_type: 'followup', // Always followup for this mode
      web_search: webSearch,
      user_query: query,
      new_conversation: false, // Always false for follow-up mode
      user_additional_comment: additionalComments || null,
      references_selected: references || []
    };

    console.log('📝 Submitting Follow-up Search request:', requestData);

    // Start the quick search endpoint for follow-up
    console.log('🚀 Starting Follow-up Search endpoint...');
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
        console.log('✅ Follow-up search streaming completed');
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
          console.log('📥 Received follow-up search streaming line:', line);
          
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

    // Note: No interactive endpoint call for follow-up mode as per requirements
    console.log('✅ Follow-up search completed without interactive endpoint call');

    return conversationId;
  } catch (error) {
    console.error('❌ Follow-up Search API error:', error);
    onError(error instanceof Error ? error.message : 'Unknown follow-up search error');
    throw error;
  }
}; 
export interface DocumentChatConversation {
  title: string;
  created_at: string;
  conversation_id: string;
  references_selected: string[];
}

export interface GetDocumentChatHistoryResponse {
  success: boolean;
  workspace_id: string;
  workspace_name: string;
  owner_id: string;
  document_chat_conversations: {
    items: DocumentChatConversation[];
  };
  total_conversations: number;
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

export const getDocumentChatHistory = async (): Promise<GetDocumentChatHistoryResponse> => {
  try {
    const workspaceId = getWorkspaceId();
    if (!workspaceId) {
      throw new Error('No workspace selected. Please select a workspace first.');
    }

    console.log('📂 Fetching document chat history for workspace:', workspaceId);

    const response = await fetch(`${API_BASE_URL}/api/v1/document_chat/list_past_conversations`, {
      method: 'POST',
      headers: createAuthHeaders(),
      body: JSON.stringify({
        workspace_id: workspaceId
      }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication failed. Please login again.');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: GetDocumentChatHistoryResponse = await response.json();
    console.log('✅ Successfully fetched document chat history:', data);
    return data;
  } catch (error) {
    console.error('❌ Get document chat history API error:', error);
    throw error;
  }
};

// Interface for conversation history data
export interface DocumentChatHistoryItem {
  index: number;
  user_id: string;
  time: string;
  user_query: string;
  references_selected: string[];
  llm_response: string;
}

export interface GetDocumentChatHistoryConversationResponse {
  success: boolean;
  loaded_conversation: boolean;
  cache_source: string;
  cache_path: string;
  conversation_json: DocumentChatHistoryItem[];
  message: string;
  timestamp: string;
}

export const getDocumentChatHistoryConversation = async (conversationId: string): Promise<GetDocumentChatHistoryConversationResponse> => {
  try {
    const workspaceId = getWorkspaceId();
    if (!workspaceId) {
      throw new Error('No workspace selected. Please select a workspace first.');
    }

    console.log('📖 Fetching document chat history conversation:', { workspaceId, conversationId });

    const response = await fetch(`${API_BASE_URL}/api/v1/document_chat/get_history_conversation`, {
      method: 'POST',
      headers: createAuthHeaders(),
      body: JSON.stringify({
        workspace_id: workspaceId,
        conversation_id: conversationId
      }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication failed. Please login again.');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: GetDocumentChatHistoryConversationResponse = await response.json();
    console.log('✅ Successfully fetched document chat history conversation:', data);
    return data;
  } catch (error) {
    console.error('❌ Get document chat history conversation API error:', error);
    throw error;
  }
};
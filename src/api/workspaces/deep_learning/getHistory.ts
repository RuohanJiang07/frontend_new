export interface DeepLearningConversation {
  title: string;
  cover_img: string;
  created_at: string;
  concept_tags: string[];
  conversation_id: string;
  stored_location: string;
}

export interface GetHistoryResponse {
  success: boolean;
  workspace_id: string;
  workspace_name: string;
  owner_id: string;
  deep_learning_conversations: {
    items: DeepLearningConversation[];
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

export const getDeepLearningHistory = async (): Promise<GetHistoryResponse> => {
  try {
    const workspaceId = getWorkspaceId();
    if (!workspaceId) {
      throw new Error('No workspace selected. Please select a workspace first.');
    }

    console.log('📂 Fetching deep learning history for workspace:', workspaceId);

    const response = await fetch(`${API_BASE_URL}/api/v1/deep_research/list_past_conversations`, {
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

    const data: GetHistoryResponse = await response.json();
    console.log('✅ Successfully fetched deep learning history:', data);
    return data;
  } catch (error) {
    console.error('❌ Get deep learning history API error:', error);
    throw error;
  }
};

// Interface for conversation history data
export interface ConversationHistoryItem {
  index: number;
  time: string;
  search_type: string;
  question_type: string;
  web_search: boolean;
  user_query: string;
  user_additional_comment: string | null;
  profile_selected: string;
  references_selected: string[] | null;
  llm_response: string;
  generation_status: Record<string, any>;
  interactive: {
    conversation_title: string;
    recommended_videos: Array<{
      title: string;
      url: string;
      thumbnail: string;
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
  point_to_prev_interactive_index: number;
  roadmap_node_index: number;
}

export interface GetHistoryConversationResponse {
  success: boolean;
  loaded_conversation: boolean;
  cache_source: string;
  cache_path: string;
  conversation_json: ConversationHistoryItem[];
  message: string;
  timestamp: string;
}

export const getHistoryConversation = async (conversationId: string): Promise<GetHistoryConversationResponse> => {
  try {
    const workspaceId = getWorkspaceId();
    if (!workspaceId) {
      throw new Error('No workspace selected. Please select a workspace first.');
    }

    console.log('📖 Fetching history conversation:', { workspaceId, conversationId });

    const response = await fetch(`${API_BASE_URL}/api/v1/deep_research/get_history_conversation`, {
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

    const data: GetHistoryConversationResponse = await response.json();
    console.log('✅ Successfully fetched history conversation:', data);
    return data;
  } catch (error) {
    console.error('❌ Get history conversation API error:', error);
    throw error;
  }
};
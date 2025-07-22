export interface ProblemSolverConversation {
  type: string;
  title: string;
  cover_img: string | null;
  created_at: string;
  conversation_id: string;
  stored_location: string;
}

export interface GetProblemSolverHistoryResponse {
  success: boolean;
  workspace_id: string;
  workspace_name: string;
  owner_id: string;
  problem_solver_conversations: {
    items: ProblemSolverConversation[];
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

export const getProblemSolverHistory = async (): Promise<GetProblemSolverHistoryResponse> => {
  try {
    const workspaceId = getWorkspaceId();
    if (!workspaceId) {
      throw new Error('No workspace selected. Please select a workspace first.');
    }

    console.log('📂 Fetching problem solver history for workspace:', workspaceId);

    const response = await fetch(`${API_BASE_URL}/api/v1/problem_solver/list_past_conversations`, {
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

    const data: GetProblemSolverHistoryResponse = await response.json();
    console.log('✅ Successfully fetched problem solver history:', {
      success: data.success,
      totalConversations: data.total_conversations,
      itemsCount: data.problem_solver_conversations.items.length
    });
    return data;
  } catch (error) {
    console.error('❌ Get problem solver history API error:', error);
    throw error;
  }
};

// Interface for conversation history data
export interface ProblemSolverHistoryItem {
  index: number;
  user_id: string;
  time: string;
  search_type: string;
  profile_selected: string;
  references_selected: string[];
  model_selected: string;
  user_query: string;
  llm_response: string;
}

export interface GetProblemSolverHistoryConversationResponse {
  success: boolean;
  loaded_conversation: boolean;
  cache_source: string;
  cache_path: string;
  conversation_json: ProblemSolverHistoryItem[];
  message: string;
  timestamp: string;
}

export const getProblemSolverHistoryConversation = async (conversationId: string): Promise<GetProblemSolverHistoryConversationResponse> => {
  try {
    const workspaceId = getWorkspaceId();
    if (!workspaceId) {
      throw new Error('No workspace selected. Please select a workspace first.');
    }

    console.log('📖 Fetching problem solver history conversation:', { workspaceId, conversationId });

    const response = await fetch(`${API_BASE_URL}/api/v1/problem_solver/get_history_conversation`, {
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

    const data: GetProblemSolverHistoryConversationResponse = await response.json();
    console.log('✅ Successfully fetched problem solver history conversation:', data);
    return data;
  } catch (error) {
    console.error('❌ Get problem solver history conversation API error:', error);
    throw error;
  }
};
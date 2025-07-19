export interface WorkspaceData {
  workspace_id: string;
  owner_id: string;
  workspace_name: string;
  tags: string[];
  collaborator_ids: string[];
  deep_learning_conversations: Record<string, any>;
  problem_solver_conversations: Record<string, any>;
  document_chat_conversations: Record<string, any>;
  drive_files: Record<string, any>;
  created_at: string;
  cover_url: string;
}

export interface GetAllWorkspacesResponse {
  success: boolean;
  workspaces: WorkspaceData[];
  total_count: number;
}

export interface GetWorkspaceCoverImagesResponse {
  success: boolean;
  default_covers: string[];
  user_uploaded_covers: string[];
}

export interface CreateWorkspaceRequest {
  workspace_name: string;
  tags?: string[];
  collaborator_emails?: string[];
  cover_url?: string;
}

export interface CreateWorkspaceResponse {
  workspace_id: string;
  message: string;
}

const API_BASE_URL = 'https://backend-aec-experimental.onrender.com';

// Helper function to get access token
const getAccessToken = (): string | null => {
  return localStorage.getItem('hyperknow_access_token');
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

export const getAllWorkspaces = async (): Promise<GetAllWorkspacesResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/workspace/get_all_workspaces`, {
      method: 'GET',
      headers: createAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication failed. Please login again.');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: GetAllWorkspacesResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Get workspaces API error:', error);
    return {
      success: false,
      workspaces: [],
      total_count: 0,
    };
  }
};

export const getWorkspaceCoverImages = async (): Promise<GetWorkspaceCoverImagesResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/workspace/get_workspace_cover_images`, {
      method: 'GET',
      headers: createAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication failed. Please login again.');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: GetWorkspaceCoverImagesResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Get workspace cover images API error:', error);
    return {
      success: false,
      default_covers: [],
      user_uploaded_covers: [],
    };
  }
};

export const createWorkspace = async (request: CreateWorkspaceRequest): Promise<CreateWorkspaceResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/workspace/create`, {
      method: 'POST',
      headers: createAuthHeaders(),
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication failed. Please login again.');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: CreateWorkspaceResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Create workspace API error:', error);
    throw error;
  }
};
export interface DriveFileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  file_type?: string;
  parent_id: string;
  processed?: {
    text_extracted: {
      done: boolean;
      output_directory: string;
    };
    embeddings_generated: {
      done: boolean;
      output_directory: string;
    };
  };
  uploaded_at?: string;
}

export interface GetDriveFilesResponse {
  success: boolean;
  workspace_id: string;
  workspace_name: string;
  owner_id: string;
  drive_files: {
    items: DriveFileItem[];
  };
  statistics: {
    total_items: number;
    file_count: number;
    folder_count: number;
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

export const getDriveFiles = async (): Promise<GetDriveFilesResponse> => {
  try {
    const workspaceId = getWorkspaceId();
    if (!workspaceId) {
      throw new Error('No workspace selected. Please select a workspace first.');
    }

    console.log('📂 Fetching drive files for workspace:', workspaceId);

    const response = await fetch(`${API_BASE_URL}/api/v1/drive/get_drive_files`, {
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

    const data: GetDriveFilesResponse = await response.json();
    console.log('✅ Successfully fetched drive files:', data);
    return data;
  } catch (error) {
    console.error('❌ Get drive files API error:', error);
    throw error;
  }
};
interface CreateFolderRequest {
  workspace_id: string;
  parent_id: string;
  name: string;
}

interface CreateFolderResponse {
  success: boolean;
  folder_id: string;
  folder_name: string;
  parent_id: string;
  workspace_id: string;
  workspace_name: string;
  message: string;
  timestamp: string;
}

interface DeleteFolderRequest {
  workspace_id: string;
  folder_id: string;
}

interface DeleteFolderResponse {
  success: boolean;
  message: string;
  folder_id: string;
  folder_name: string;
  workspace_id: string;
  deletion_summary: {
    files_deleted: number;
    files_failed: number;
    subfolders_deleted: number;
    embeddings_deleted: number;
    text_extractions_deleted: number;
  };
  file_deletion_details: {
    successful: string[];
    failed: string[];
  };
  timestamp: string;
}

export const createFolder = async (
  workspaceId: string,
  parentId: string,
  folderName: string
): Promise<CreateFolderResponse> => {
  try {
    // Get access token from localStorage
    const accessToken = localStorage.getItem('hyperknow_access_token');
    
    if (!accessToken) {
      throw new Error('No access token found. Please login first.');
    }

    const response = await fetch('https://backend-aec-experimental.onrender.com/api/v1/drive/create_folder', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        workspace_id: workspaceId,
        parent_id: parentId,
        name: folderName
      } as CreateFolderRequest)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data: CreateFolderResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating folder:', error);
    throw error;
  }
};

export const deleteFolder = async (
  workspaceId: string,
  folderId: string
): Promise<DeleteFolderResponse> => {
  try {
    // Get access token from localStorage
    const accessToken = localStorage.getItem('hyperknow_access_token');
    
    if (!accessToken) {
      throw new Error('No access token found. Please login first.');
    }

    const response = await fetch('https://backend-aec-experimental.onrender.com/api/v1/drive/delete_folder', {
      method: 'DELETE',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        workspace_id: workspaceId,
        folder_id: folderId
      } as DeleteFolderRequest)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data: DeleteFolderResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error deleting folder:', error);
    throw error;
  }
};

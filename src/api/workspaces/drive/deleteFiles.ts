import { getAccessToken } from '../../../utils/auth';

interface DeleteFileResponse {
  success: boolean;
  message: string;
  file_id: string;
  workspace_id: string;
  deleted_items: {
    original_file: boolean;
    extracted_text: boolean;
    embeddings: boolean;
    zilliz_embeddings: boolean;
  };
  zilliz_deletion_message: string;
  timestamp: string;
}

interface DeleteFileRequest {
  workspace_id: string;
  file_id: string;
}

export const deleteFile = async (workspaceId: string, fileId: string): Promise<DeleteFileResponse> => {
  try {
    const accessToken = await getAccessToken();
    
    if (!accessToken) {
      throw new Error('No access token available');
    }

    const response = await fetch('https://backend-aec-experimental.onrender.com/api/v1/drive/delete_file', {
      method: 'DELETE',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        workspace_id: workspaceId,
        file_id: fileId,
      } as DeleteFileRequest),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: DeleteFileResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

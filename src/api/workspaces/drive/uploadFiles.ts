export interface UploadProgressData {
  stage: 'start' | 'text_extraction' | 'embedding' | 'complete';
  progress: number;
  message: string;
  result?: {
    type: string;
    result: {
      extraction: {
        local_path: string;
        s3_path: string;
        input_file: string;
        output_file: string;
        progress: number;
      };
      embedding: {
        reference_id: string;
        num_vectors: number;
        upload_datetime: string;
        collection_name: string;
      };
    };
  };
}

export interface UploadFileRequest {
  workspace_id: string;
  file: File;
  parent_id?: string;
  process_type: 'embed'; // Always embed for now (includes text extraction)
}

export interface UploadFileResponse {
  file_id: string;
  message: string;
  processing_result?: any;
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
    'accept': 'application/json',
  };
};

export const uploadFileWithProgress = async (
  file: File,
  onProgress: (data: UploadProgressData) => void,
  onError: (error: string) => void,
  onComplete: (fileId: string) => void,
  parentId?: string
): Promise<string> => {
  try {
    const workspaceId = getWorkspaceId();
    if (!workspaceId) {
      throw new Error('No workspace selected. Please select a workspace first.');
    }

    console.log('📤 Starting file upload:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      workspaceId,
      parentId: parentId || 'root'
    });

    // Create FormData for multipart upload
    const formData = new FormData();
    formData.append('workspace_id', workspaceId);
    formData.append('file', file);
    formData.append('parent_id', parentId || ''); // Empty string for root
    formData.append('process_type', 'embed'); // Always embed (includes text extraction)

    // Start the upload with streaming response
    const response = await fetch(`${API_BASE_URL}/api/v1/drive/upload_references`, {
      method: 'POST',
      headers: createAuthHeaders(),
      body: formData,
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication failed. Please login again.');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Process the streaming response
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Failed to get response reader');
    }

    const decoder = new TextDecoder();
    let buffer = '';
    let fileId = '';

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        console.log('✅ Upload streaming completed');
        if (fileId) {
          onComplete(fileId);
        }
        break;
      }

      // Decode the chunk and add to buffer
      buffer += decoder.decode(value, { stream: true });
      
      // Process complete lines (backend sends Server-Sent Events format)
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep incomplete line in buffer

      for (const line of lines) {
        if (line.trim() && line.startsWith('data: ')) {
          const jsonData = line.substring(6); // Remove 'data: ' prefix
          
          try {
            if (!jsonData.trim()) {
              console.warn('Received empty data line, skipping...');
              continue;
            }
            
            const data: UploadProgressData = JSON.parse(jsonData);
            console.log('📥 Received upload progress data:', data);
            
            // Extract file_id from complete stage result
            if (data.stage === 'complete' && data.result?.result?.embedding?.reference_id) {
              fileId = data.result.result.embedding.reference_id;
            }
            
            // Send progress data to callback
            onProgress(data);
            
            // Check for completion
            if (data.stage === 'complete') {
              console.log('🏁 Upload processing completed');
              if (fileId) {
                onComplete(fileId);
              }
              return fileId;
            }
          } catch (parseError) {
            console.warn('⚠️ Failed to parse upload progress data:', jsonData, parseError);
            if (jsonData.includes('error') || jsonData.includes('Error')) {
              onError(`Parse error: ${parseError instanceof Error ? parseError.message : 'Unknown parse error'}`);
              return '';
            }
          }
        }
      }
    }

    return fileId;
  } catch (error) {
    console.error('❌ Upload API error:', error);
    onError(error instanceof Error ? error.message : 'Unknown upload error');
    throw error;
  }
};
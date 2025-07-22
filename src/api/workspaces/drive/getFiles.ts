// Drive Files API functionality
// This module handles fetching drive files from the backend

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

// Types for the API response
export interface DriveFile {
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

export interface DriveFilesResponse {
  success: boolean;
  workspace_id: string;
  workspace_name: string;
  owner_id: string;
  drive_files: {
    items: DriveFile[];
  };
  statistics: {
    total_items: number;
    file_count: number;
    folder_count: number;
  };
  timestamp: string;
}

export interface TransformedDriveItem {
  id: string;
  name: string;
  type: 'folder' | 'file';
  fileType?: string;
  size: string;
  fileCount?: number;
  parentId: string;
  uploadedAt?: string;
  isProcessed?: boolean;
}

// Function to count files in a folder
const countFilesInFolder = (files: DriveFile[], folderId: string): number => {
  return files.filter(file => file.parent_id === folderId).length;
};

// Function to transform API response to our component format
const transformDriveFiles = (response: DriveFilesResponse): TransformedDriveItem[] => {
  const { items } = response.drive_files;
  
  return items.map(item => {
    const transformedItem: TransformedDriveItem = {
      id: item.id,
      name: item.name,
      type: item.type,
      parentId: item.parent_id,
      size: '3.2 MB', // Default size as mentioned
      uploadedAt: item.uploaded_at,
    };

    if (item.type === 'folder') {
      // Count files in this folder
      transformedItem.fileCount = countFilesInFolder(items, item.id);
    } else {
      // It's a file, add file type
      transformedItem.fileType = item.file_type;
      // Check if file is processed (has text extracted)
      transformedItem.isProcessed = item.processed?.text_extracted?.done || false;
    }

    return transformedItem;
  });
};

// Main function to get drive files
export const getDriveFiles = async (): Promise<{
  success: boolean;
  data?: TransformedDriveItem[];
  workspaceName?: string;
  error?: string;
}> => {
  try {
    const workspaceId = getWorkspaceId();
    if (!workspaceId) {
      throw new Error('No workspace selected. Please select a workspace first.');
    }

    console.log('📁 Fetching drive files for workspace:', workspaceId);

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

    const data: DriveFilesResponse = await response.json();
    
    if (!data.success) {
      throw new Error('Failed to fetch drive files from server.');
    }

    console.log('✅ Drive files fetched successfully:', {
      workspaceName: data.workspace_name,
      totalItems: data.statistics.total_items,
      fileCount: data.statistics.file_count,
      folderCount: data.statistics.folder_count
    });

    // Transform the data to match our component format
    const transformedFiles = transformDriveFiles(data);

    return {
      success: true,
      data: transformedFiles,
      workspaceName: data.workspace_name
    };

  } catch (error) {
    console.error('❌ Error fetching drive files:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch drive files'
    };
  }
};

// Helper function to get files by parent ID (for folder navigation)
export const getFilesByParentId = (files: TransformedDriveItem[], parentId: string): TransformedDriveItem[] => {
  return files.filter(file => file.parentId === parentId);
};

// Helper function to get root files (parent_id === 'root')
export const getRootFiles = (files: TransformedDriveItem[]): TransformedDriveItem[] => {
  return getFilesByParentId(files, 'root');
};

// Helper function to get folder path for breadcrumb
export const getFolderPath = (files: TransformedDriveItem[], currentFolderId: string): string[] => {
  const path: string[] = [];
  let currentId = currentFolderId;

  while (currentId !== 'root') {
    const folder = files.find(f => f.id === currentId);
    if (folder && folder.type === 'folder') {
      path.unshift(folder.name);
      currentId = folder.parentId;
    } else {
      break;
    }
  }

  return path;
};

import { getAccessToken } from '../../../utils/auth';

export interface CreateNoteRequest {
  workspace_id: string;
  parent_id: string;
  note_name: string;
}

export interface CreateNoteResponse {
  success: boolean;
  note_id: string;
  note_name: string;
  parent_id: string;
  workspace_id: string;
  workspace_name: string;
  message: string;
  timestamp: string;
}

export const createNote = async (request: CreateNoteRequest): Promise<CreateNoteResponse> => {
  const token = getAccessToken();
  
  if (!token) {
    throw new Error('No access token available');
  }

  try {
    const response = await fetch('https://backend-aec-experimental.onrender.com/api/v1/note/create_note', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: CreateNoteResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating note:', error);
    throw error;
  }
};

export interface ListNotesRequest {
  workspace_id: string;
}

export interface NoteItem {
  id: string;
  name: string;
  type: string;
  file_type: string;
  parent_id: string;
  processed: {
    text_extracted: {
      done: boolean;
    };
    embeddings_generated: {
      done: boolean;
    };
  };
  uploaded_at: string;
}

export interface ListNotesResponse {
  success: boolean;
  workspace_id: string;
  workspace_name: string;
  notes: NoteItem[];
  total_notes: number;
  message: string;
  timestamp: string;
}

export const listAllNotes = async (request: ListNotesRequest): Promise<ListNotesResponse> => {
  const token = getAccessToken();
  
  if (!token) {
    throw new Error('No access token available');
  }

  try {
    const response = await fetch('https://backend-aec-experimental.onrender.com/api/v1/note/list_all_notes', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ListNotesResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error listing notes:', error);
    throw error;
  }
};

export interface GetNoteContentRequest {
  workspace_id: string;
  file_id: string;
}

export interface GetNoteContentResponse {
  success: boolean;
  file_id: string;
  workspace_id: string;
  content: string;
  content_length: number;
  source: string;
  message: string;
  timestamp: string;
}

export const getNoteContent = async (request: GetNoteContentRequest): Promise<GetNoteContentResponse> => {
  const token = getAccessToken();
  
  if (!token) {
    throw new Error('No access token available');
  }

  try {
    const response = await fetch('https://backend-aec-experimental.onrender.com/api/v1/note/get_note_content', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: GetNoteContentResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting note content:', error);
    throw error;
  }
};

export interface SaveNoteContentRequest {
  workspace_id: string;
  file_id: string;
  content: string;
}

export interface SaveNoteContentResponse {
  success: boolean;
  file_id: string;
  workspace_id: string;
  content_length: number;
  message: string;
  timestamp: string;
}

export const saveNoteContent = async (request: SaveNoteContentRequest): Promise<SaveNoteContentResponse> => {
  const token = getAccessToken();
  
  if (!token) {
    throw new Error('No access token available');
  }

  try {
    const response = await fetch('https://backend-aec-experimental.onrender.com/api/v1/note/save_note_content', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: SaveNoteContentResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error saving note content:', error);
    throw error;
  }
};

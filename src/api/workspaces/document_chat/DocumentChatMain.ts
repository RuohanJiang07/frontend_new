export interface DocumentChatRequest {
  workspace_id: string;
  conversation_id: string;
  user_query: string;
  references_selected?: string[] | null;
  profile_selected?: string | null;
  new_conversation: boolean;
}

export interface DocumentChatStreamingData {
  content?: string;
  error?: string;
  final?: boolean;
  timestamp?: string;
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

// Helper function to generate UUID
const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Helper function to generate conversation ID in chat-c-{uuid} format
const generateConversationId = (): string => {
  const uuid = generateUUID();
  return `chat-c-${uuid}`;
};

export const submitDocumentChatQuery = async (
  query: string,
  profile?: string,
  references?: string[] | null,
  onData: (data: string) => void,
  onError: (error: string) => void,
  onComplete: () => void,
  existingConversationId?: string, // Existing conversation ID for continuous conversation
  generatedConversationId?: string, // Generated conversation ID for new conversation
  selectedFileIds?: string[] // Array of selected file IDs to use instead of hardcoded reference
): Promise<string> => {
  try {
    const workspaceId = getWorkspaceId();
    if (!workspaceId) {
      throw new Error('No workspace selected. Please select a workspace first.');
    }

    // Use existing conversation ID, generated conversation ID, or generate new one
    const conversationId = existingConversationId || generatedConversationId || generateConversationId();
    const isNewConversation = !existingConversationId;
    
    console.log('🆔 Document Chat - Using conversation ID:', conversationId, 'isNew:', isNewConversation);

    // Use selected file IDs or fall back to hardcoded reference for now
    const referencesToUse = selectedFileIds && selectedFileIds.length > 0 
      ? selectedFileIds 
      : ["file-1bcf6d47fc704e63bf6b754b88668b08"]; // Hardcoded reference as requested

    const requestData: DocumentChatRequest = {
      workspace_id: workspaceId,
      conversation_id: conversationId,
      user_query: query,
      new_conversation: isNewConversation,
      profile_selected: profile || null,
      references_selected: referencesToUse
    };

    console.log('📝 Submitting Document Chat request:', requestData);

    const response = await fetch(`${API_BASE_URL}/api/v1/document_chat/start/document_chat`, {
      method: 'POST',
      headers: createAuthHeaders(),
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication failed. Please login again.');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Failed to get response reader');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        console.log('Document chat streaming completed');
        onComplete();
        break;
      }

      // Decode the chunk and add to buffer
      buffer += decoder.decode(value, { stream: true });
      
      // Process complete lines (backend sends line by line)
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep incomplete line in buffer

      for (const line of lines) {
        if (line.trim()) {
          console.log('Received streaming line:', line);
          
          // Check for error in the line
          if (line.includes('"error"')) {
            try {
              const errorData = JSON.parse(line);
              if (errorData.error) {
                onError(errorData.error);
                return conversationId;
              }
            } catch (parseError) {
              // If it's not valid JSON, treat as regular content
            }
          }
          
          // Send the line to the callback (add newline back since backend expects line-by-line)
          onData(line + '\n');
        }
      }
    }

    return conversationId;
  } catch (error) {
    console.error('Document Chat API error:', error);
    onError(error instanceof Error ? error.message : 'Unknown document chat error');
    throw error;
  }
};
export interface ProblemSolverRequest {
    workspace_id: string;
    conversation_id: string;
    new_conversation: boolean;
    user_query: string;
    references_selected?: string[] | null;
    profile_selected?: string | null;
  }
  
  export interface ProblemSolverStreamingData {
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
  
  // Helper function to generate conversation ID in ps-c-{uuid} format
  const generateConversationId = (): string => {
    const uuid = generateUUID();
    return `ps-c-${uuid}`;
  };
  
  export const submitProblemSolverSolution = async (
    query: string,
    profile?: string,
    references?: string[] | null,
    onData: (data: string) => void,
    onError: (error: string) => void,
    onComplete: () => void,
    existingConversationId?: string, // Existing conversation ID for continuous conversation
    generatedConversationId?: string // Generated conversation ID for new conversation
  ): Promise<string> => {
    try {
      const workspaceId = getWorkspaceId();
      if (!workspaceId) {
        throw new Error('No workspace selected. Please select a workspace first.');
      }
  
      // Use existing conversation ID, generated conversation ID, or generate new one
      const conversationId = existingConversationId || generatedConversationId || generateConversationId();
      const isNewConversation = !existingConversationId;
      
      console.log('🆔 Problem Solver - Using conversation ID:', conversationId, 'isNew:', isNewConversation);
  
      const requestData: ProblemSolverRequest = {
        workspace_id: workspaceId,
        conversation_id: conversationId,
        new_conversation: isNewConversation,
        user_query: query,
        profile_selected: profile || null,
        references_selected: references || null
      };
  
      console.log('📝 Submitting Problem Solver Solution request:', requestData);
  
      const response = await fetch(`${API_BASE_URL}/api/v1/problem_solver/start/solution`, {
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
          console.log('Problem solver streaming completed');
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
      console.error('Problem Solver Solution API error:', error);
      onError(error instanceof Error ? error.message : 'Unknown problem solver error');
      throw error;
    }
  };
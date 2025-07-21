// Note Copilot Text Retrieval functionality
// This module handles fetching generated notes from the backend

// Helper function to get access token
const getAccessToken = (): string | null => {
  return localStorage.getItem('hyperknow_access_token');
};

// Helper function to get workspace ID
const getWorkspaceId = (): string | null => {
  return localStorage.getItem('current_workspace_id');
};

// Interface for the response from the get_generated_notes endpoint
export interface GeneratedNotesResponse {
  success: boolean;
  conversation_id: string;
  timestamp: string;
  generated_notes_json: any | null;
  generated_notes_markdown: string | null;
  markdown_file_path: string | null;
  json_file_path: string | null;
  notes_count: number;
  last_updated: string | null;
  message: string;
}

export class NoteCopilotTextRetrieval {
  private conversationId: string;
  private intervalId: number | null = null;
  private onTextReceived: (text: string) => void;
  private onError: (error: string) => void;
  private lastFetchedText: string = '';
  private API_BASE_URL = 'https://backend-aec-experimental.onrender.com/api/v1/note_copilot/note_copilot/get_generated_notes';

  constructor(
    conversationId: string,
    onTextReceived: (text: string) => void,
    onError: (error: string) => void
  ) {
    this.conversationId = conversationId;
    this.onTextReceived = onTextReceived;
    this.onError = onError;
  }

  // Start polling for generated notes
  public startPolling(intervalMs: number = 5000): void {
    if (this.intervalId !== null) {
      this.stopPolling();
    }

    // Fetch immediately on start
    this.fetchGeneratedNotes();

    // Then set up interval
    this.intervalId = window.setInterval(() => {
      this.fetchGeneratedNotes();
    }, intervalMs);

    console.log(`🔄 Started polling for generated notes every ${intervalMs}ms for conversation: ${this.conversationId}`);
  }

  // Stop polling
  public stopPolling(): void {
    if (this.intervalId !== null) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('⏹️ Stopped polling for generated notes');
    }
  }

  // Fetch generated notes from the backend
  private async fetchGeneratedNotes(): Promise<void> {
    try {
      const accessToken = getAccessToken();
      const workspaceId = getWorkspaceId();

      if (!accessToken) {
        throw new Error('No access token found. Please login first.');
      }

      if (!workspaceId) {
        throw new Error('No workspace ID found. Please select a workspace first.');
      }

      console.log(`🔄 Fetching generated notes for conversation: ${this.conversationId}`);

      // Create form data
      const formData = new FormData();
      formData.append('workspace_id', workspaceId);
      formData.append('conversation_id', this.conversationId);
      formData.append('format', 'markdown'); // We only need markdown format

      // Make the request
      const response = await fetch(this.API_BASE_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'accept': 'application/json',
        },
        body: formData,
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please login again.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: GeneratedNotesResponse = await response.json();
      console.log(`📥 Received response for generated notes:`, {
        success: data.success,
        conversation_id: data.conversation_id,
        notes_count: data.notes_count,
        has_markdown: !!data.generated_notes_markdown,
        message: data.message
      });

      if (data.success && data.generated_notes_markdown) {
        // Only call the callback if the text has changed
        if (data.generated_notes_markdown !== this.lastFetchedText) {
          this.lastFetchedText = data.generated_notes_markdown;
          this.onTextReceived(data.generated_notes_markdown);
          console.log(`📝 Received updated notes (${data.notes_count} sections) for conversation: ${this.conversationId}`);
          console.log(`📝 GENERATED NOTES CONTENT (first 200 chars):`);
          console.log(data.generated_notes_markdown.substring(0, 200) + '...');
        } else {
          console.log(`📝 No changes in generated notes since last fetch`);
        }
      } else if (!data.success) {
        console.warn(`⚠️ API returned success: false - ${data.message}`);
      } else {
        console.log(`📝 No generated notes available yet`);
      }
    } catch (error) {
      console.error('❌ Error fetching generated notes:', error);
      this.onError(error instanceof Error ? error.message : 'Unknown error fetching notes');
    }
  }

  // Get the conversation ID
  public getConversationId(): string {
    return this.conversationId;
  }

  // Force an immediate fetch
  public async fetchNow(): Promise<string | null> {
    try {
      await this.fetchGeneratedNotes();
      return this.lastFetchedText;
    } catch (error) {
      console.error('❌ Error in immediate fetch:', error);
      this.onError(error instanceof Error ? error.message : 'Unknown error in immediate fetch');
      return null;
    }
  }
}
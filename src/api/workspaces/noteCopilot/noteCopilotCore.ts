// Constants
const API_BASE_URL = 'https://backend-aec-experimental.onrender.com';
const WS_URL = 'wss://backend-aec-experimental.onrender.com/api/v1/note_copilot/note_copilot/ws/stream_audio';
const SAMPLE_RATE = 24000;
const CHUNK_MS = 2000; // 2 seconds
const CHUNK_SIZE_SAMPLES = (SAMPLE_RATE * CHUNK_MS) / 1000;
const CHUNK_SIZE_BYTES = CHUNK_SIZE_SAMPLES * 2; // 16-bit = 2 bytes per sample

// Helper function to generate UUID
const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Helper function to generate conversation ID in note-c-{uuid} format
const generateConversationId = (): string => {
  const uuid = generateUUID();
  return `note-c-${uuid}`;
};

// Helper function to get access token
const getAccessToken = (): string | null => {
  return localStorage.getItem('hyperknow_access_token');
};

// Helper function to get workspace ID
const getWorkspaceId = (): string | null => {
  return localStorage.getItem('current_workspace_id');
};

export interface AudioRecorderOptions {
  onTranscriptionReceived?: (transcription: string) => void;
  onStatusChange?: (status: 'idle' | 'recording' | 'processing' | 'error') => void;
  onTimeUpdate?: (time: string) => void;
  onError?: (error: string) => void;
}

export class NoteCopilotRecorder {
  private websocket: WebSocket | null = null;
  private audioContext: AudioContext | null = null;
  private processor: ScriptProcessorNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private isRecording: boolean = false;
  private startTime: number | null = null;
  private timerInterval: number | null = null;
  private chunkIndex: number = 0;
  private recordedChunks: Array<{
    index: number;
    data: ArrayBuffer;
    timestamp: string;
    size: number;
  }> = [];
  private totalBytes: number = 0;
  private audioBuffer: number[] = [];
  private stream: MediaStream | null = null;
  private conversationId: string;
  private options: AudioRecorderOptions;
  private pingInterval: number | null = null;

  constructor(options: AudioRecorderOptions = {}) {
    this.options = options;
    this.conversationId = generateConversationId();
    console.log('🆔 Generated conversation ID:', this.conversationId);
  }

  // Convert Float32Array to PCM16 Int16Array
  private float32ToPcm16(float32Array: Float32Array): Int16Array {
    const pcm16Array = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
      // Clamp to [-1, 1] and convert to 16-bit PCM
      const sample = Math.max(-1, Math.min(1, float32Array[i]));
      pcm16Array[i] = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
    }
    return pcm16Array;
  }

  // Convert Int16Array to ArrayBuffer
  private int16ArrayToArrayBuffer(int16Array: Int16Array): ArrayBuffer {
    const buffer = new ArrayBuffer(int16Array.length * 2);
    const view = new DataView(buffer);
    for (let i = 0; i < int16Array.length; i++) {
      view.setInt16(i * 2, int16Array[i], true); // little-endian
    }
    return buffer;
  }

  private async connectWebSocket(): Promise<void> {
    try {
      console.log("🔗 Connecting to WebSocket...");
      this.websocket = new WebSocket(WS_URL);
      
      return new Promise((resolve, reject) => {
        if (!this.websocket) {
          reject(new Error("WebSocket not initialized"));
          return;
        }

        this.websocket.onopen = () => {
          console.log("✅ WebSocket connected");
          resolve();
        };
        
        this.websocket.onerror = (error) => {
          console.error(`❌ WebSocket error:`, error);
          this.options.onError?.(`WebSocket connection error`);
          this.options.onStatusChange?.('error');
          reject(error);
        };
        
        this.websocket.onmessage = (event) => {
          console.log(`📥 Received:`, event.data);
          try {
            const data = JSON.parse(event.data);
            
            // Check if this is a transcription response
            if (data.type === 'transcription' && data.text) {
              this.options.onTranscriptionReceived?.(data.text);
            }
            
            // Check if this is a ping request
            if (data.type === 'ping') {
              this.sendPong();
            }
          } catch (e) {
            console.error('Error parsing WebSocket message:', e);
          }
        };
        
        this.websocket.onclose = () => {
          console.log("🔌 WebSocket disconnected");
          this.stopPingInterval();
        };
      });
    } catch (error) {
      console.error(`❌ Failed to connect:`, error);
      this.options.onError?.(`Failed to connect to WebSocket: ${error instanceof Error ? error.message : 'Unknown error'}`);
      this.options.onStatusChange?.('error');
      throw error;
    }
  }

  private startPingInterval() {
    // Send a ping every 30 seconds to keep the connection alive
    this.pingInterval = window.setInterval(() => {
      this.sendPing();
    }, 30000);
  }

  private stopPingInterval() {
    if (this.pingInterval !== null) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  private sendPing() {
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      this.websocket.send(JSON.stringify({ type: "ping" }));
      console.log("📤 Sent ping");
    }
  }

  private sendPong() {
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      this.websocket.send(JSON.stringify({ type: "pong" }));
      console.log("📤 Sent pong");
    }
  }

  private async sendInitMessage() {
    const accessToken = getAccessToken();
    const workspaceId = getWorkspaceId();
    
    if (!accessToken) {
      throw new Error('No access token found. Please login first.');
    }
    
    if (!workspaceId) {
      throw new Error('No workspace ID found. Please select a workspace first.');
    }
    
    const initMessage = {
      type: "init",
      token: accessToken,
      request: {
        workspace_id: workspaceId,
        conversation_id: this.conversationId
      }
    };
    
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      this.websocket.send(JSON.stringify(initMessage));
      console.log("✅ Sent init message", { workspaceId, conversationId: this.conversationId });
    } else {
      throw new Error('WebSocket not connected');
    }
  }

  private processAudioData(audioData: number[]) {
    // Add new audio data to buffer
    this.audioBuffer.push(...audioData);
    
    // Process complete chunks
    while (this.audioBuffer.length >= CHUNK_SIZE_SAMPLES) {
      // Extract one chunk
      const chunkData = this.audioBuffer.splice(0, CHUNK_SIZE_SAMPLES);
      const float32Chunk = new Float32Array(chunkData);
      
      // Convert to PCM16
      const pcm16Chunk = this.float32ToPcm16(float32Chunk);
      const arrayBuffer = this.int16ArrayToArrayBuffer(pcm16Chunk);
      
      // Save chunk locally
      this.saveChunkLocally(arrayBuffer);
      
      // Send via WebSocket
      this.sendAudioChunk(arrayBuffer);
    }
  }

  private saveChunkLocally(arrayBuffer: ArrayBuffer) {
    const chunkInfo = {
      index: this.chunkIndex,
      data: arrayBuffer,
      timestamp: new Date().toISOString(),
      size: arrayBuffer.byteLength
    };
    
    this.recordedChunks.push(chunkInfo);
    this.totalBytes += arrayBuffer.byteLength;
    this.chunkIndex++;
    
    console.log(`💾 Saved chunk ${this.chunkIndex - 1} locally (${arrayBuffer.byteLength} bytes)`);
  }

  private sendAudioChunk(arrayBuffer: ArrayBuffer) {
    try {
      // Convert ArrayBuffer to base64
      const uint8Array = new Uint8Array(arrayBuffer);
      const base64Audio = btoa(String.fromCharCode(...uint8Array));
      
      const chunkMessage = {
        type: "audio_chunk",
        audio_data: base64Audio,
        chunk_index: this.chunkIndex - 1
      };
      
      if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
        this.websocket.send(JSON.stringify(chunkMessage));
        console.log(`📤 Sent audio chunk ${this.chunkIndex - 1} (${arrayBuffer.byteLength} bytes)`);
      }
    } catch (error) {
      console.error(`❌ Error sending audio chunk:`, error);
      this.options.onError?.(`Error sending audio chunk: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private updateTimer() {
    if (!this.startTime) return;
    
    const elapsed = Date.now() - this.startTime;
    const seconds = Math.floor(elapsed / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    const timeString = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    this.options.onTimeUpdate?.(timeString);
  }

  public async startRecording() {
    if (this.isRecording) {
      console.log("Already recording");
      return;
    }

    try {
      this.options.onStatusChange?.('recording');
      
      // Reset counters
      this.chunkIndex = 0;
      this.recordedChunks = [];
      this.totalBytes = 0;
      this.audioBuffer = [];
      
      // Connect to WebSocket
      await this.connectWebSocket();
      await this.sendInitMessage();
      
      // Start ping interval
      this.startPingInterval();
      
      // Get user media
      console.log("🎤 Requesting microphone access...");
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: SAMPLE_RATE,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: false
        } 
      });
      
      // Setup audio context
      this.audioContext = new AudioContext({ sampleRate: SAMPLE_RATE });
      this.source = this.audioContext.createMediaStreamSource(this.stream);
      
      // Create script processor for real-time audio processing
      this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);
      
      this.processor.onaudioprocess = (event) => {
        if (this.isRecording) {
          const audioData = event.inputBuffer.getChannelData(0);
          this.processAudioData(Array.from(audioData));
        }
      };
      
      // Connect audio nodes
      this.source.connect(this.processor);
      this.processor.connect(this.audioContext.destination);
      
      this.isRecording = true;
      this.startTime = Date.now();
      
      // Start timer
      this.timerInterval = window.setInterval(() => this.updateTimer(), 100);
      
      console.log("🔴 Recording started");
      
    } catch (error) {
      console.error(`❌ Failed to start recording:`, error);
      this.options.onError?.(`Failed to start recording: ${error instanceof Error ? error.message : 'Unknown error'}`);
      this.options.onStatusChange?.('error');
    }
  }

  public async stopRecording() {
    if (!this.isRecording) {
      console.log("Not recording");
      return;
    }

    try {
      this.isRecording = false;
      this.options.onStatusChange?.('processing');
      
      // Process any remaining audio in buffer
      if (this.audioBuffer.length > 0) {
        const float32Chunk = new Float32Array(this.audioBuffer);
        const pcm16Chunk = this.float32ToPcm16(float32Chunk);
        const arrayBuffer = this.int16ArrayToArrayBuffer(pcm16Chunk);
        
        this.saveChunkLocally(arrayBuffer);
        this.sendAudioChunk(arrayBuffer);
      }
      
      // Stop timer
      if (this.timerInterval !== null) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
      }
      
      // Send commit buffer message
      if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
        this.websocket.send(JSON.stringify({ type: "commit_buffer" }));
        console.log("📤 Sent commit_buffer");
        
        // Send stop message after a delay
        setTimeout(() => {
          if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
            this.websocket.send(JSON.stringify({ type: "stop" }));
            console.log("🛑 Sent stop message");
            this.stopPingInterval();
            this.websocket.close();
          }
        }, 2000);
      }
      
      // Cleanup audio context
      if (this.processor) {
        this.processor.disconnect();
        this.processor = null;
      }
      
      if (this.source) {
        this.source.disconnect();
        this.source = null;
      }
      
      if (this.audioContext) {
        await this.audioContext.close();
        this.audioContext = null;
      }
      
      // Stop all tracks in the stream
      if (this.stream) {
        this.stream.getTracks().forEach(track => track.stop());
        this.stream = null;
      }
      
      console.log("⏹️ Recording stopped");
      
      // Calculate total duration
      if (this.startTime) {
        const duration = Math.floor((Date.now() - this.startTime) / 1000);
        console.log(`📊 Total recording duration: ${duration} seconds`);
        console.log(`📊 Total chunks recorded: ${this.recordedChunks.length}`);
        console.log(`📊 Total size: ${Math.round(this.totalBytes / 1024)} KB`);
      }
      
      this.options.onStatusChange?.('idle');
      
    } catch (error) {
      console.error(`❌ Error stopping recording:`, error);
      this.options.onError?.(`Error stopping recording: ${error instanceof Error ? error.message : 'Unknown error'}`);
      this.options.onStatusChange?.('error');
    }
  }

  public toggleRecording() {
    if (this.isRecording) {
      this.stopRecording();
    } else {
      this.startRecording();
    }
  }

  public getConversationId(): string {
    return this.conversationId;
  }

  public isCurrentlyRecording(): boolean {
    return this.isRecording;
  }

  public getRecordingStats() {
    return {
      chunkCount: this.recordedChunks.length,
      totalBytes: this.totalBytes,
      sampleRate: SAMPLE_RATE,
      conversationId: this.conversationId
    };
  }
}
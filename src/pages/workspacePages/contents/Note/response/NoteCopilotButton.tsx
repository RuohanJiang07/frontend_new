import React, { useState } from 'react';
import { Button } from '../../../../../components/ui/button';
import { useEffect, useRef, useCallback } from 'react';
import { NoteCopilotTextRetrieval } from '../../../../../api/workspaces/noteCopilot/noteCopilotTextRetrieval';
import { 
  MicIcon,
  TypeIcon,
  SettingsIcon,
  ChevronDownIcon
} from 'lucide-react';

interface NoteCopilotButtonProps {
  className?: string;
}

function NoteCopilotButton({ className = '' }: NoteCopilotButtonProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [audioLanguage, setAudioLanguage] = useState('English');
  const [noteLanguage, setNoteLanguage] = useState('English');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState('00:00');
  const [recordingStatus, setRecordingStatus] = useState<'idle' | 'recording' | 'processing' | 'error'>('idle');
  const [transcription, setTranscription] = useState('');
  const [generatedNotes, setGeneratedNotes] = useState('');
  const recorderRef = useRef<any>(null);
  const textRetrieverRef = useRef<NoteCopilotTextRetrieval | null>(null);
  const conversationIdRef = useRef<string | null>(null);

  useEffect(() => {
    const initializeRecorder = async () => {
      try {
        // Dynamically import the NoteCopilotRecorder class
        const { NoteCopilotRecorder } = await import('../../../../../api/workspaces/noteCopilot/noteCopilotCore');
        
        // Create a new instance with callbacks
        const recorder = new NoteCopilotRecorder({
          onTranscriptionReceived: (text) => {
            console.log('📝 Received transcription:', text);
            setTranscription(text);
            
            // Insert transcription into editor
            insertTextIntoEditor(text);
          },
          onStatusChange: (status) => {
            console.log('🎙️ Recording status changed:', status);
            setRecordingStatus(status);
            setIsRecording(status === 'recording');
            
            // If recording started, start polling for generated notes
            if (status === 'recording' && recorderRef.current) {
              const conversationId = recorderRef.current.getConversationId();
              conversationIdRef.current = conversationId;
              console.log('🆔 Using conversation ID for text retrieval:', conversationId);
              initializeTextRetriever(conversationId);
            }
          },
          onTimeUpdate: (time) => {
            setRecordingTime(time);
          },
          onError: (error) => {
            console.error('❌ Recording error:', error);
            // You could show a toast notification here
          }
        });
        
        // Store the recorder instance in the ref
        recorderRef.current = recorder;
        console.log('✅ NoteCopilotRecorder initialized successfully');
      } catch (error) {
        console.error('❌ Failed to load NoteCopilotRecorder:', error);
      }
    };
    
    initializeRecorder();
    
    // Cleanup on unmount
    return () => {
      try {
        if (recorderRef.current && recorderRef.current.isCurrentlyRecording()) {
          console.log('🧹 Cleaning up recorder on unmount');
          recorderRef.current.toggleRecording();
        }
        
        // Stop polling for text when component unmounts
        if (textRetrieverRef.current) {
          console.log('🧹 Stopping text polling on unmount');
          textRetrieverRef.current.stopPolling();
        }
      } catch (error) {
        console.error('❌ Error during cleanup:', error);
      }
    };
  }, []);

  // Initialize text retriever to poll for generated notes
  const initializeTextRetriever = useCallback((conversationId: string) => {
    try {
      // Stop existing retriever if any
      if (textRetrieverRef.current) {
        textRetrieverRef.current.stopPolling();
      }
      
      console.log('🔄 Initializing text retriever for conversation ID:', conversationId);
      
      // Create new retriever
      const retriever = new NoteCopilotTextRetrieval(
        conversationId,
        (text) => {
          console.log('📝 Received generated notes:', text.substring(0, 100) + '...');
          setGeneratedNotes(text);
          
          // Insert the generated notes into the editor
          insertTextIntoEditor(text);
        },
        (error) => {
          console.error('❌ Text retrieval error:', error);
        }
      );
      
      // Start polling every 5 seconds
      retriever.startPolling(5000);
      textRetrieverRef.current = retriever;
      
      console.log('🔄 Started polling for generated notes with conversation ID:', conversationId);
      
      // Force an immediate fetch
      retriever.fetchNow().then(text => {
        if (text) {
          console.log('📝 Initial fetch returned notes:', text.substring(0, 100) + '...');
        } else {
          console.log('📝 Initial fetch returned no notes');
        }
      });
    } catch (error) {
      console.error('❌ Failed to initialize text retriever:', error);
    }
  }, []);

  // Function to insert text into the editor
  const insertTextIntoEditor = (text: string) => {
    try {
      if (text) {
        console.log('📝 Inserting text into editor:', text.substring(0, 50) + '...');
        
        // Create a custom event that the editor component can listen for
        const event = new CustomEvent('note-copilot-text', { 
          detail: { text } 
        });
        window.dispatchEvent(event);
        
        console.log('📝 Dispatched note-copilot-text event with content');
      }
    } catch (error) {
      console.error('❌ Error inserting text into editor:', error);
    }
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const toggleRecording = useCallback(() => {
    if (recorderRef.current) {
      console.log('🎙️ Toggling recording state');
      recorderRef.current.toggleRecording();
      
      // If we're stopping recording, make sure polling continues
      if (recorderRef.current.isCurrentlyRecording()) {
        console.log('🎙️ Recording started');
        // We're currently recording, so this toggle will stop it
        // We'll start polling in the onStatusChange callback
      } else {
        console.log('🎙️ Recording stopped');
        // We're not recording, so this toggle will start it
        // Make sure polling continues if we have a conversation ID
        if (conversationIdRef.current && textRetrieverRef.current) {
          console.log('🔄 Ensuring polling continues after recording stops');
          textRetrieverRef.current.startPolling(5000);
        }
      }
    } else {
      console.error('❌ Recorder not initialized');
    }
  }, []);

  // Effect to log when transcription changes
  useEffect(() => {
    if (transcription) {
      console.log('📝 Transcription updated:', transcription.substring(0, 50) + '...');
    }
  }, [transcription]);

  // Effect to log when generated notes change
  useEffect(() => {
    if (generatedNotes) {
      console.log('📝 Generated notes updated:', generatedNotes.substring(0, 50) + '...');
    }
  }, [generatedNotes]);

  return (
    <div className={`relative ${className}`} style={{ 
      maxWidth: '400px',
      transition: 'all 0.3s ease-in-out'
    }}>
      {/* Dropdown panel - shows when expanded */}
      {isExpanded && (
        <div className="absolute bottom-full left-0 mb-2 w-full min-w-[300px] bg-[#ECF1F6] rounded-lg p-4 shadow-lg transition-all duration-300 ease-in-out">
          {/* Audio Language */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-[#6B6B6B] font-inter text-sm font-medium">
              Audio Language
            </span>
            <div className="flex items-center gap-2">
              <span className="text-black font-inter text-sm font-medium">
                {audioLanguage}
              </span>
              <ChevronDownIcon className="w-4 h-4 text-[#6B6B6B]" />
            </div>
          </div>

          {/* Note Language */}
          <div className="flex items-center justify-between">
            <span className="text-[#6B6B6B] font-inter text-sm font-medium">
              Note Language
            </span>
            <div className="flex items-center gap-2">
              <span className="text-black font-inter text-sm font-medium">
                {noteLanguage}
              </span>
              <ChevronDownIcon className="w-4 h-4 text-[#6B6B6B]" />
            </div>
          </div>
        </div>
      )}

      {/* Main button */}
      <div className="bg-[#ECF1F6] rounded-lg p-3 flex items-center gap-2 sm:gap-4 w-full">
        {/* Recording controls section */}
        <div className="flex items-center gap-3">
          {/* Microphone button */}
          <Button
            variant="ghost"
            size="icon"
            className={`w-8 h-8 p-0 hover:bg-white/50 ${
              recordingStatus === 'recording' ? 'bg-red-100' : 
              recordingStatus === 'processing' ? 'bg-yellow-100' : 
              recordingStatus === 'error' ? 'bg-red-50' : ''
            }`}
            onClick={toggleRecording}
          >
            <MicIcon className={`w-5 h-5 ${
              recordingStatus === 'recording' ? 'text-red-600 animate-pulse' : 
              recordingStatus === 'processing' ? 'text-yellow-600' : 
              recordingStatus === 'error' ? 'text-red-500' : 
              'text-[#6B6B6B]'
            }`} />
          </Button>

          {/* Timer */}
          <span className="text-[#6B6B6B] font-inter text-sm font-medium min-w-[40px]">
            {recordingTime}
          </span>
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-[#6B6B6B]/30"></div>

        {/* Text formatting and settings */}
        <div className="flex items-center gap-3">
          {/* Text formatting button */}
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 p-0 hover:bg-white/50"
          >
            <TypeIcon className="w-5 h-5 text-[#6B6B6B]" />
          </Button>

          {/* Settings button */}
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 p-0 hover:bg-white/50"
            onClick={toggleExpanded}
          >
            <SettingsIcon className="w-5 h-5 text-[#6B6B6B]" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default NoteCopilotButton;
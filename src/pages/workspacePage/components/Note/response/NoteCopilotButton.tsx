import React, { useState } from 'react';
import { Button } from '../../../../../components/ui/button';
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
  const [recordingTime, setRecordingTime] = useState('03:27');

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Dropdown panel - shows when expanded */}
      {isExpanded && (
        <div className="absolute bottom-full left-0 mb-2 w-[400px] bg-[#ECF1F6] rounded-lg p-4 shadow-lg">
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
      <div className="bg-[#ECF1F6] rounded-lg p-3 flex items-center gap-4">
        {/* Recording controls section */}
        <div className="flex items-center gap-3">
          {/* Microphone button */}
          <Button
            variant="ghost"
            size="icon"
            className={`w-8 h-8 p-0 hover:bg-white/50 ${isRecording ? 'bg-red-100' : ''}`}
            onClick={toggleRecording}
          >
            <MicIcon className={`w-5 h-5 ${isRecording ? 'text-red-600' : 'text-[#6B6B6B]'}`} />
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
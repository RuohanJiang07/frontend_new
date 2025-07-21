import React from 'react';
import { useTabContext } from '../../../workspaceFrame/TabContext';
import NoteEditor from './NoteEditor';

interface NoteResponseProps {
  onBack?: () => void;
  onViewChange?: (view: string | null) => void;
  tabIdx?: number;
  pageIdx?: number;
  screenId?: string;
}

function NoteResponse({ onBack, onViewChange, tabIdx = 0, pageIdx = 0, screenId = '' }: NoteResponseProps) {
  const { switchToNote } = useTabContext();

  const handleBack = () => {
    switchToNote(pageIdx, screenId, tabIdx);
  };

  return (
    <div className="note-response-container">
      <NoteEditor 
        onBack={handleBack}
        tabIdx={tabIdx}
        pageIdx={pageIdx}
        screenId={screenId}
      />
    </div>
  );
}

export default NoteResponse; 
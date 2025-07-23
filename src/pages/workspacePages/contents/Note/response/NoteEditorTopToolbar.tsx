import React, { useState } from 'react';
import { useEffect, useRef } from 'react';
import './style/NoteEditorTopToolbar.css';
import { 
  Undo2, 
  Redo2, 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough, 
  List, 
  ListOrdered, 
  AlignLeft, 
  Link, 
  Code, 
  Smile, 
  Image, 
  Video, 
  ZoomIn, 
  ZoomOut,
  ChevronUp,
  ChevronDown,
  Save
} from 'lucide-react';

interface NoteEditorTopToolbarProps {
  onBack: () => void;
  editor?: any;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  isInSplitMode?: boolean;
  noteData?: {
    noteId: string;
    noteName: string;
    workspaceId: string;
    timestamp: string;
  } | null;
  onSave?: () => void;
  isSaving?: boolean;
}

function NoteEditorTopToolbar({ onBack, editor, onZoomIn, onZoomOut, isInSplitMode = false, noteData, onSave, isSaving = false }: NoteEditorTopToolbarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Function to handle bold formatting
  const handleBold = () => {
    editor?.chain().focus().toggleBold().run();
  };

  // Function to handle italic formatting
  const handleItalic = () => {
    editor?.chain().focus().toggleItalic().run();
  };

  // Function to handle underline formatting
  const handleUnderline = () => {
    editor?.chain().focus().toggleUnderline().run();
  };

  // Function to handle strikethrough formatting
  const handleStrike = () => {
    editor?.chain().focus().toggleStrike().run();
  };

  // Function to handle bullet list
  const handleBulletList = () => {
    editor?.chain().focus().toggleBulletList().run();
  };

  // Function to handle ordered list
  const handleOrderedList = () => {
    editor?.chain().focus().toggleOrderedList().run();
  };

  // Function to handle undo
  const handleUndo = () => {
    editor?.chain().focus().undo().run();
  };

  // Function to handle redo
  const handleRedo = () => {
    editor?.chain().focus().redo().run();
  };

  // Function to toggle collapse state
  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="flex flex-col items-center" style={{ paddingTop: '40px' }}>
      {/* Collapsible content */}
      <div 
        className={`collapsible-content ${isCollapsed ? 'collapsed' : 'expanded'} w-full mx-auto`}
        style={{
          maxWidth: isInSplitMode ? '600px' : '800px',
          width: '100%'
        }}
      >
        {/* Header with title and icon - centered at 50% width */}
        <div className="flex flex-col items-start w-full">
          {/* Note icon, title, and share button - all in one row */}
          <div className="note-header-container">
            <div className="note-icon-container">
              <img src="/workspace/note/noteEditorIcon.svg" alt="Note Editor" className="note-icon" />
              <span className="note-label">
                Note
              </span>
            </div>
            
            {/* Share button - positioned to the right at the same level as note icon */}
            <div className="share-button-container">
              <button className="bg-[#DFEDFF] text-[#00276C] rounded-full px-4 py-1.5 flex items-center gap-2 hover:bg-blue-100">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 8C19.6569 8 21 6.65685 21 5C21 3.34315 19.6569 2 18 2C16.3431 2 15 3.34315 15 5C15 5.12548 15.0077 5.24917 15.0227 5.37061L8.08261 9.84066C7.54305 9.32015 6.80891 9 6 9C4.34315 9 3 10.3431 3 12C3 13.6569 4.34315 15 6 15C6.80891 15 7.54305 14.6798 8.08261 14.1593L15.0227 18.6294C15.0077 18.7508 15 18.8745 15 19C15 20.6569 16.3431 22 18 22C19.6569 22 21 20.6569 21 19C21 17.3431 19.6569 16 18 16C17.1911 16 16.457 16.3202 15.9174 16.8407L8.97733 12.3706C8.99229 12.2492 9 12.1255 9 12C9 11.8745 8.99229 11.7508 8.97733 11.6294L15.9174 7.15934C16.457 7.67985 17.1911 8 18 8Z" fill="currentColor"/>
                </svg>
                <span>Share</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
          
          {/* Title - moved closer to the last saved info */}
          <h1 className="note-title">
            {noteData?.noteName || 'Untitled Note'}
          </h1>
        </div>
        
        {/* Last saved info - moved closer to title */}
        <div className="last-saved-container w-full mb-1">
          <svg className="cloud-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 10H16.74C16.3659 7.49025 14.2358 5.5 11.64 5.5C9.17383 5.5 7.14625 7.33122 6.64118 9.71839C4.06833 10.2202 2 12.2923 2 14.8C2 17.567 4.433 20 7.2 20H18C20.7614 20 23 17.7614 23 15C23 12.2386 20.7614 10 18 10Z" fill="currentColor"/>
          </svg>
          <span>Last saved at {noteData?.timestamp ? new Date(noteData.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) : new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</span>
        </div>
        
        {/* Author info */}
        <div className="author-info-container w-full">
          <div className="author-box">
            <div className="author-avatar">
              <img src="/main/landing_page/avatars.png" alt="John Doe" className="w-full h-full object-cover" />
            </div>
            <span className="author-name">John Doe</span>
          </div>
          
          <div className="created-date-box">
            <span>Created at {noteData?.timestamp ? new Date(noteData.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          </div>
        </div>
      </div>

      {/* Toolbar with collapse button */}
      <div className="toolbar-container">
        <div 
          className="toolbar-inner flex items-center bg-[#F8F8F8] rounded-full border border-[#DFDFDF] py-1.5 w-full mx-auto overflow-x-auto"
          style={{
            gap: isInSplitMode ? '4px' : '8px',
            padding: '6px 12px',
            maxWidth: isInSplitMode ? '600px' : '800px',
            transition: 'all 0.3s ease-in-out'
          }}
        >
          {/* Undo/Redo */}
          <button 
            className={`p-1 text-gray-600 hover:bg-gray-100 rounded-full ${editor?.isActive('undo') ? 'bg-[#DFEDFF]' : ''}`}
            onClick={handleUndo}
          >
            <Undo2 size={20} />
          </button>
          <button 
            className={`p-1 text-gray-600 hover:bg-gray-100 rounded-full ${editor?.isActive('redo') ? 'bg-[#DFEDFF]' : ''}`}
            onClick={handleRedo}
          >
            <Redo2 size={20} />
          </button>
          
          {!isInSplitMode && <span className="mx-2 text-gray-300">|</span>}
          
          {/* Bold, Italic, Underline, Strikethrough */}
          <button 
            className={`p-1 ${editor?.isActive('bold') ? 'bg-[#DFEDFF]' : ''} text-gray-600 hover:bg-gray-100 rounded-full`}
            onClick={handleBold}
          >
            <Bold size={20} />
          </button>
          <button 
            className={`p-1 ${editor?.isActive('italic') ? 'bg-[#DFEDFF]' : ''} text-gray-600 hover:bg-gray-100 rounded-full`}
            onClick={handleItalic}
          >
            <Italic size={20} />
          </button>
          <button 
            className={`p-1 ${editor?.isActive('underline') ? 'bg-[#DFEDFF]' : ''} text-gray-600 hover:bg-gray-100 rounded-full`}
            onClick={handleUnderline}
          >
            <Underline size={20} />
          </button>
          <button 
            className={`p-1 ${editor?.isActive('strike') ? 'bg-[#DFEDFF]' : ''} text-gray-600 hover:bg-gray-100 rounded-full`}
            onClick={handleStrike}
          >
            <Strikethrough size={20} />
          </button>
          
          {!isInSplitMode && <span className="mx-2 text-gray-300">|</span>}
          
          {/* Lists */}
          <button 
            className={`p-1 ${editor?.isActive('bulletList') ? 'bg-[#DFEDFF]' : ''} text-gray-600 hover:bg-gray-100 rounded-full`}
            onClick={handleBulletList}
          >
            <List size={20} />
          </button>
          <button 
            className={`p-1 ${editor?.isActive('orderedList') ? 'bg-[#DFEDFF]' : ''} text-gray-600 hover:bg-gray-100 rounded-full`}
            onClick={handleOrderedList}
          >
            <ListOrdered size={20} />
          </button>
          <button className="p-1 text-gray-600 hover:bg-gray-100 rounded-full">
            <AlignLeft size={20} />
          </button>
          
          {!isInSplitMode && <span className="mx-2 text-gray-300">|</span>}
          
          {/* Link, Code, Mention, Emoji, Image, Video */}
          <button className={`p-1 text-gray-600 hover:bg-gray-100 rounded-full ${isInSplitMode ? 'hidden' : ''}`}>
            <Link size={20} />
          </button>
          <button className={`p-1 text-gray-600 hover:bg-gray-100 rounded-full ${isInSplitMode ? 'hidden' : ''}`}>
            <Code size={20} />
          </button>
          <button className={`p-1 text-gray-600 hover:bg-gray-100 rounded-full ${isInSplitMode ? 'hidden' : ''}`}>
            <Smile size={20} />
          </button>
          <button className={`p-1 text-gray-600 hover:bg-gray-100 rounded-full ${isInSplitMode ? 'hidden' : ''}`}>
            <Image size={20} />
          </button>
          <button className={`p-1 text-gray-600 hover:bg-gray-100 rounded-full ${isInSplitMode ? 'hidden' : ''}`}>
            <Video size={20} />
          </button>
          
          {/* Zoom buttons and collapse button - right aligned */}
          <div className="ml-auto flex items-center gap-2">
            {/* Save button */}
            <button 
              className={`p-1 text-gray-600 hover:bg-gray-100 rounded-full ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={onSave}
              disabled={isSaving}
              title="Save Note"
            >
              <Save size={20} />
            </button>
            
            <button 
              className="p-1 text-gray-600 hover:bg-gray-100 rounded-full"
              onClick={onZoomIn}
              title="Zoom In"
            >
              <ZoomIn size={20} />
            </button>
            <button 
              className="p-1 text-gray-600 hover:bg-gray-100 rounded-full"
              onClick={onZoomOut}
              title="Zoom Out"
            >
              <ZoomOut size={20} />
            </button>
            
            {/* Collapse button */}
            <button 
              className={`collapse-button ${isCollapsed ? 'collapsed' : ''}`}
              onClick={handleToggleCollapse}
              title={isCollapsed ? "展开" : "收起"}
            >
              {isCollapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NoteEditorTopToolbar;
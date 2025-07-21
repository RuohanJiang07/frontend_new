import React, { useState } from 'react';
import { MoreVerticalIcon, UploadIcon, FolderPlusIcon, PlusIcon, ClockIcon, FileTextIcon, SearchIcon } from 'lucide-react';
import { useTabContext } from '../../../workspaceFrame/TabContext';
import './Note.css';

interface NoteItem {
  id: string;
  name: string;
  type: 'folder' | 'file';
  fileType?: string;
  size?: string;
  fileCount?: number;
}

interface NoteProps {
  onBack?: () => void;
  onViewChange?: (view: string | null) => void;
  tabIdx?: number;
  pageIdx?: number;
  screenId?: string;
}

function Note({ onBack, onViewChange, tabIdx = 0, pageIdx = 0, screenId = '' }: NoteProps) {
  const { switchToNote, switchToNoteResponse } = useTabContext();
  const [activeFilter, setActiveFilter] = useState('recent');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Get split screen context
  const { activePage, getActiveScreens } = useTabContext();
  const activeScreens = getActiveScreens(activePage);
  const isSplit = activeScreens.length > 1;

  // Sample data matching the image
  const noteItems: NoteItem[] = [
    {
      id: '1',
      name: 'Calculus - SYLLABUS',
      type: 'file',
      fileType: 'docx',
      size: '9.4MB'
    },
    {
      id: '2',
      name: 'Problem Set 2',
      type: 'file',
      fileType: 'docx',
      size: '780KB'
    },
    {
      id: '3',
      name: 'Calculus - SYLLABUS',
      type: 'file',
      fileType: 'docx',
      size: '9.4MB'
    },
    {
      id: '4',
      name: 'Problem Set 2',
      type: 'file',
      fileType: 'docx',
      size: '780KB'
    },
    {
      id: '5',
      name: 'my diary',
      type: 'file',
      fileType: 'docx',
      size: '780KB'
    },
    {
      id: '6',
      name: 'Answer Key',
      type: 'file',
      fileType: 'docx',
      size: '9.4MB'
    },
    {
      id: '7',
      name: 'Lecture Notes',
      type: 'file',
      fileType: 'docx',
      size: '2.1MB'
    },
    {
      id: '8',
      name: 'Study Guide',
      type: 'file',
      fileType: 'docx',
      size: '1.5MB'
    }
  ];

  const handleItemClick = (item: NoteItem) => {
    if (item.type === 'file') {
      // Navigate to note editor for files
      switchToNoteResponse(pageIdx, screenId, tabIdx);
    } else {
      // Handle folder navigation
      console.log('Opening folder:', item.name);
    }
  };

  const handleCreateNote = () => {
    // Navigate to note editor for creating new note
    switchToNoteResponse(pageIdx, screenId, tabIdx);
  };

  const handleUpload = () => {
    console.log('Upload clicked');
  };

  const handleImport = () => {
    console.log('Import clicked');
  };

  const filteredItems = noteItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="note-container">
      <div className="note-content">
        {/* Header Section */}
        <div className="note-header">
          <img
            src="/workspace/note/note_icon.svg"
            alt="Smart Note"
            className="note-header-icon"
          />
          <div className="note-header-text">
            <h1 className="note-title">Smart Note</h1>
            <p className="note-subtitle">Next generation of Note-taking</p>
          </div>
        </div>

        {/* File Management Section */}
        <div className="file-management-section">
          <button className="file-management-button" onClick={handleCreateNote}>
            <PlusIcon className="file-management-icon" />
            <span className="file-management-text">Create</span>
          </button>
          <button className="file-management-button" onClick={handleUpload}>
            <UploadIcon className="file-management-icon" />
            <span className="file-management-text">Upload</span>
          </button>
          <button className="file-management-button" onClick={handleImport}>
            <FolderPlusIcon className="file-management-icon" />
            <span className="file-management-text">Import</span>
          </button>
        </div>

        {/* Note Files Section Header */}
        <div className="note-files-header">
          <div className="note-files-left">
            <div className="filter-buttons">
              <button 
                className={`filter-button ${activeFilter === 'recent' ? 'active' : ''}`}
                onClick={() => setActiveFilter('recent')}
              >
                <ClockIcon size={16} />
                Recent
              </button>
              <button 
                className={`filter-button ${activeFilter === 'all' ? 'active' : ''}`}
                onClick={() => setActiveFilter('all')}
              >
                <FileTextIcon size={16} />
                All Notes
              </button>
            </div>
          </div>
          
          <div className="search-container">
            <SearchIcon className="search-icon" />
            <input
              type="text"
              placeholder="Search for a note..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Note Files Grid */}
        <div className={`note-files-grid ${isSplit ? 'split' : ''}`}>
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="note-file-card"
              onClick={() => handleItemClick(item)}
            >
              <img
                src="/workspace/note/document.svg"
                alt="document"
                className="note-file-icon"
              />
              <button className="note-file-menu-button" onClick={(e) => e.stopPropagation()}>
                <MoreVerticalIcon size={16} />
              </button>
              
              <div className="note-file-info">
                <div className="note-file-title">{item.name}</div>
                <div className="note-file-right">
                  <div className="note-file-tag">
                    {item.fileType}
                  </div>
                  <div className="note-file-size">
                    {item.size}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Note;
import React, { useState } from 'react';
import { MoreHorizontalIcon, UploadIcon, FolderPlusIcon, PlusIcon, ClockIcon, FileTextIcon, SearchIcon } from 'lucide-react';
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
      name: 'Lecture 1',
      type: 'folder',
      fileCount: 8
    },
    {
      id: '8',
      name: 'Lecture 2',
      type: 'folder',
      fileCount: 4
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
        {/* Header with note icon and titles */}
        <div className="smart-note-header">
          <img
            src="/workspace/note/note_icon.svg"
            alt="Smart Note"
            className="note-icon"
          />
          <div className="header-text">
            <h1 className="smart-note-title">Smart Note</h1>
            <p className="smart-note-subtitle">Next generation of Note-taking</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button className="action-button" onClick={handleCreateNote}>
            <PlusIcon className="action-button-icon" />
            <span className="action-button-text">Create Note</span>
          </button>
          <button className="action-button" onClick={handleUpload}>
            <UploadIcon className="action-button-icon" />
            <span className="action-button-text">Upload</span>
          </button>
          <button className="action-button" onClick={handleImport}>
            <FolderPlusIcon className="action-button-icon" />
            <span className="action-button-text">Import</span>
          </button>
        </div>

        {/* Filter buttons and Search */}
        <div className="filter-search-section">
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

        {/* Files Grid */}
        <div className={`files-grid ${isSplit ? 'split' : ''}`}>
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="file-item"
              onClick={() => handleItemClick(item)}
            >
              <img
                src={item.type === 'folder' ? '/workspace/note/folder.svg' : '/workspace/note/document.svg'}
                alt={item.type}
                className="file-icon"
              />
              <button className="file-menu-button" onClick={(e) => e.stopPropagation()}>
                <MoreHorizontalIcon size={16} />
              </button>
              <div className={`file-name ${item.name.length <= 15 ? 'single-line' : ''}`}>{item.name}</div>
              {item.type === 'folder' ? (
                <>
                  <div className="file-type folder">Folder</div>
                  <div className="file-info">{item.fileCount} Files</div>
                </>
              ) : (
                <>
                  <div className="file-type">{item.fileType}</div>
                  <div className="file-info">{item.size}</div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Note;
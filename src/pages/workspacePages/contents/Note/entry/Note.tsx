import React, { useState, useEffect } from 'react';
import { MoreVerticalIcon, UploadIcon, FolderPlusIcon, PlusIcon, ClockIcon, FileTextIcon, SearchIcon } from 'lucide-react';
import { useTabContext } from '../../../workspaceFrame/TabContext';
import CreateNoteModal from '../../../../../components/workspacePage/CreateNoteModal';
import { createNote, listAllNotes, NoteItem as ApiNoteItem } from '../../../../../api/workspaces/note/note';
import { useToast } from '../../../../../hooks/useToast';
import './Note.css';

interface LocalNoteItem {
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
  const { success, error } = useToast();
  const [activeFilter, setActiveFilter] = useState('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [notes, setNotes] = useState<ApiNoteItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Get split screen context
  const { activePage, getActiveScreens } = useTabContext();
  const activeScreens = getActiveScreens(activePage);
  const isSplit = activeScreens.length > 1;

  // Fetch notes when component mounts
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const workspaceId = localStorage.getItem('current_workspace_id');
        if (!workspaceId) {
          error('No workspace selected');
          setIsLoading(false);
          return;
        }

        const response = await listAllNotes({ workspace_id: workspaceId });
        if (response.success) {
          setNotes(response.notes);
        } else {
          error('Failed to load notes');
        }
      } catch (err) {
        console.error('Error fetching notes:', err);
        error('Failed to load notes');
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotes();
  }, [error]);

  // Convert API notes to local format
  const noteItems: LocalNoteItem[] = notes.map(note => ({
    id: note.id,
    name: note.name,
    type: 'file' as const,
    fileType: 'note',
    size: '3.2MB' // Using 3.2MB as requested
  }));

  const handleItemClick = (item: LocalNoteItem) => {
    if (item.type === 'file') {
      // Find the original note data
      const originalNote = notes.find(note => note.id === item.id);
      if (originalNote) {
        // Store note data in localStorage for the editor to access
        localStorage.setItem('current_note_data', JSON.stringify({
          noteId: originalNote.id,
          noteName: originalNote.name,
          workspaceId: originalNote.parent_id === 'root' ? localStorage.getItem('current_workspace_id') || '' : originalNote.parent_id,
          timestamp: originalNote.uploaded_at
        }));
      }
      // Navigate to note editor for files
      switchToNoteResponse(pageIdx, screenId, tabIdx);
    } else {
      // Handle folder navigation
      console.log('Opening folder:', item.name);
    }
  };

  const handleCreateNote = () => {
    setIsCreateModalOpen(true);
  };

  const handleCreateNoteSubmit = async (noteName: string) => {
    try {
      const workspaceId = localStorage.getItem('current_workspace_id');
      if (!workspaceId) {
        error('No workspace selected');
        return;
      }

      const response = await createNote({
        workspace_id: workspaceId,
        parent_id: 'root',
        note_name: noteName
      });

      if (response.success) {
        success(`Note "${noteName}" created successfully!`);
        // Store note data in localStorage for the editor to access
        localStorage.setItem('current_note_data', JSON.stringify({
          noteId: response.note_id,
          noteName: response.note_name,
          workspaceId: response.workspace_id,
          timestamp: response.timestamp
        }));
        // Refresh the notes list
        const workspaceId = localStorage.getItem('current_workspace_id');
        if (workspaceId) {
          const refreshResponse = await listAllNotes({ workspace_id: workspaceId });
          if (refreshResponse.success) {
            setNotes(refreshResponse.notes);
          }
        }
        // Navigate to note editor
        switchToNoteResponse(pageIdx, screenId, tabIdx);
      } else {
        error('Failed to create note');
      }
    } catch (err) {
      console.error('Error creating note:', err);
      error('Failed to create note');
    }
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
          {isLoading ? (
            // Loading skeleton cards
            Array.from({ length: 8 }).map((_, index) => (
              <div key={`loading-${index}`} className="note-loading-skeleton">
                <div className="note-loading-icon"></div>
                <div className="note-loading-info">
                  <div className="note-loading-title"></div>
                  <div className="note-loading-right">
                    <div className="note-loading-tag"></div>
                    <div className="note-loading-size"></div>
                  </div>
                </div>
              </div>
            ))
          ) : filteredItems.length === 0 ? (
            <div className="empty-message">No notes found</div>
          ) : (
            filteredItems.map((item) => (
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
          ))
          )}
        </div>
      </div>
      
      {/* Create Note Modal */}
      <CreateNoteModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateNote={handleCreateNoteSubmit}
      />
    </div>
  );
}

export default Note;
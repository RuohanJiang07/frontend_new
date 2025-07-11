import React, { useState } from 'react';
import { Button } from '../../../../../components/ui/button';
import { Card, CardContent } from '../../../../../components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '../../../../../components/ui/avatar';
import {
  SearchIcon,
  ChevronDownIcon,
  PlusIcon,
  UploadIcon,
  EditIcon,
  TrashIcon,
  FileTextIcon
} from 'lucide-react';
import NoteEditor from '../response/NoteEditor';

interface NoteItem {
  id: string;
  name: string;
  dateCreated: string;
  lastModified: string;
  owner: string;
  ownerAvatar: string;
}

interface NoteProps {
  onBack?: () => void;
  onViewChange?: (view: string | null) => void;
}

function Note({ onBack, onViewChange }: NoteProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('By Name');

  // Sample recent notes data
  const recentNotes = Array.from({ length: 5 }, (_, i) => ({
    id: (i + 1).toString(),
    title: 'Moment of Inertia',
    date: 'Apr 18, 12:56 PM'
  }));

  // Sample all notes data
  const allNotes: NoteItem[] = [
    {
      id: '1',
      name: 'Moment of Inertia',
      dateCreated: 'Apr 18, 2025, 12:56 PM',
      lastModified: 'Apr 18, 2025, 12:56 PM',
      owner: 'John Doe',
      ownerAvatar: '/main/landing_page/avatars.png'
    },
    {
      id: '2',
      name: "Newton's Laws",
      dateCreated: 'Apr 18, 2025, 12:56 PM',
      lastModified: 'Apr 18, 2025, 12:56 PM',
      owner: 'John Doe',
      ownerAvatar: '/main/landing_page/avatars.png'
    },
    {
      id: '3',
      name: "Newton's Laws",
      dateCreated: 'Apr 18, 2025, 12:56 PM',
      lastModified: 'Apr 18, 2025, 12:56 PM',
      owner: 'John Doe',
      ownerAvatar: '/main/landing_page/avatars.png'
    },
    {
      id: '4',
      name: "Newton's Laws",
      dateCreated: 'Apr 18, 2025, 12:56 PM',
      lastModified: 'Apr 18, 2025, 12:56 PM',
      owner: 'John Doe',
      ownerAvatar: '/main/landing_page/avatars.png'
    },
    {
      id: '5',
      name: "Newton's Laws",
      dateCreated: 'Apr 18, 2025, 12:56 PM',
      lastModified: 'Apr 18, 2025, 12:56 PM',
      owner: 'John Doe',
      ownerAvatar: '/main/landing_page/avatars.png'
    },
    {
      id: '6',
      name: "Newton's Laws",
      dateCreated: 'Apr 18, 2025, 12:56 PM',
      lastModified: 'Apr 18, 2025, 12:56 PM',
      owner: 'John Doe',
      ownerAvatar: '/main/landing_page/avatars.png'
    },
    {
      id: '7',
      name: "Newton's Laws",
      dateCreated: 'Apr 18, 2025, 12:56 PM',
      lastModified: 'Apr 18, 2025, 12:56 PM',
      owner: 'John Doe',
      ownerAvatar: '/main/landing_page/avatars.png'
    }
  ];

  const handleNoteClick = () => {
    // Notify parent component to change view to editor
    onViewChange?.('smart-note-editor');
  };

  const handleBackToNotes = () => {
    // Notify parent component to go back to default view
    onViewChange?.(null);
  };

  // If we're in editor view, render the editor component
  // This will be handled by the parent component based on activeView
  return (
    <div className="h-[calc(100vh-88px)] overflow-y-auto bg-white w-full">
      <main className="flex-1 p-12 max-w-7xl mx-auto">
        {/* Header with icon and title - matching Document Chat style */}
        <div className="flex items-center justify-center mb-4">
          <div className="flex items-center gap-4">
            <img
              className="w-12 h-10"
              alt="Hyperknow logo"
              src="/main/landing_page/hyperknow_logo 1.svg"
            />
            <div>
              <h2 className="font-['Outfit',Helvetica] font-medium text-black text-2xl">
                Smart Note
              </h2>
              <p className="font-['Outfit',Helvetica] font-medium text-black text-[13px]">
                better than google docs and granola
              </p>
            </div>
          </div>
        </div>

        {/* Recent Section */}
        <div className="mb-12">
          <h2 className="font-semibold text-black text-xl font-['Inter',Helvetica] mb-6">
            Recent
          </h2>

          <div className="flex gap-8 overflow-x-auto pb-4 justify-center">
            {recentNotes.map((note) => (
              <div key={note.id} className="flex-shrink-0 relative">
                {/* Date tab - positioned OUTSIDE and ABOVE the main card, 20% wider, moved down 1px, NO BOTTOM BORDER */}
                <div className="absolute top-[1px] left-0 w-[114px] h-[24px] bg-white border-2 border-[#AFD7FF] border-b-0 rounded-t-[8px] flex items-center justify-center z-20">
                  <span className="text-black font-['Inter',Helvetica] text-[13px] font-normal">
                    {note.date}
                  </span>
                </div>

                {/* Main card - positioned 25px down, removed upper left corner radius */}
                <div
                  className="w-[191px] h-[248px] bg-white border-2 border-[#AFD7FF] rounded-[0px_0px_10px_10px] overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer relative mt-[25px]"
                  onClick={handleNoteClick}
                >

                  {/* Main content area - full height minus footer */}
                  <div className="absolute top-0 left-0 right-0 bottom-[40px] bg-white flex items-center justify-center">
                    {/* Document preview content */}
                    <div className="text-center">
                      <FileTextIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <span className="text-xs text-gray-400">Document Preview</span>
                    </div>
                  </div>

                  {/* Footer section with title */}
                  <div className="absolute bottom-0 left-0 right-0 h-[40px] bg-[#ECF1F6] flex items-center justify-center">
                    <span className="text-black font-['Inter',Helvetica] text-base font-normal">
                      {note.title}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* All Notes Section */}
        <div className="w-full">
          {/* All Notes header and controls - matching Document Chat style */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold text-black text-xl font-['Inter',Helvetica]">
              All Notes
            </h2>

            <div className="flex items-center gap-2">
              {/* Search bar - with ECF1F6 background */}
              <div className="w-[200px] h-[32px] bg-[#ECF1F6] rounded-lg flex items-center px-3">
                <SearchIcon className="w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search for notes..."
                  className="ml-2 bg-transparent border-none outline-none text-gray-500 font-['Inter',Helvetica] text-xs flex-1"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Sort dropdown - with ECF1F6 background */}
              <Button
                variant="outline"
                size="sm"
                className="h-[32px] bg-[#ECF1F6] border-none rounded-lg flex items-center justify-center px-3"
              >
                <span className="text-gray-600 font-['Inter',Helvetica] text-xs font-medium">{sortBy}</span>
                <ChevronDownIcon className="w-3 h-3 text-gray-500 ml-1" />
              </Button>

              {/* New button - keeping black background */}
              <Button
                className="h-[32px] bg-black text-white rounded-lg flex items-center gap-2 font-['Inter',Helvetica] text-xs px-3 hover:bg-gray-800"
                onClick={handleNoteClick}
              >
                <PlusIcon className="w-4 h-4" />
                New
              </Button>

              {/* Upload button - with ECF1F6 background */}
              <Button
                variant="outline"
                className="h-[32px] bg-[#ECF1F6] border-none rounded-lg flex items-center gap-2 font-['Inter',Helvetica] text-xs text-gray-600 px-3 hover:bg-[#e2e8f0]"
              >
                <UploadIcon className="w-4 h-4" />
                Upload
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="w-full bg-white">
            {/* Table header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-200">
              <div className="col-span-3">
                <span className="font-medium text-black text-base font-['Inter',Helvetica]">Name</span>
              </div>
              <div className="col-span-3">
                <span className="font-medium text-black text-base font-['Inter',Helvetica]">Date Created</span>
              </div>
              <div className="col-span-3">
                <span className="font-medium text-black text-base font-['Inter',Helvetica]">Last Modified</span>
              </div>
              <div className="col-span-3">
                <span className="font-medium text-black text-base font-['Inter',Helvetica]">Owner</span>
              </div>
            </div>

            {/* Table rows */}
            <div className="divide-y divide-gray-100">
              {allNotes.map((note) => (
                <div
                  key={note.id}
                  className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={handleNoteClick}
                >
                  <div className="col-span-3 flex items-center gap-3">
                    {/* Note icon matching the selected element style */}
                    <div className="w-5 h-5 flex-shrink-0">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <span className="font-normal text-black text-base font-['Inter',Helvetica]">
                      {note.name}
                    </span>
                  </div>
                  <div className="col-span-3 flex items-center">
                    <span className="text-black text-base font-['Inter',Helvetica]">
                      {note.dateCreated}
                    </span>
                  </div>
                  <div className="col-span-3 flex items-center">
                    <span className="text-black text-base font-['Inter',Helvetica]">
                      {note.lastModified}
                    </span>
                  </div>
                  <div className="col-span-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={note.ownerAvatar} alt={note.owner} />
                        <AvatarFallback className="text-xs">
                          {note.owner.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-black text-base font-['Inter',Helvetica]">
                        {note.owner}
                      </span>
                    </div>

                    {/* Action buttons - always visible */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-3 bg-gray-100 border-none rounded text-xs font-['Inter',Helvetica] text-gray-600 hover:bg-gray-200"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNoteClick();
                        }}
                      >
                        OPEN
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-400 hover:text-gray-600"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <EditIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-400 hover:text-red-600"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Note;
import React, { useState } from 'react';
import { Button } from '../../../../components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '../../../../components/ui/avatar';
import {
  SearchIcon,
  ChevronDownIcon,
  PlusIcon,
  UploadIcon,
  EditIcon,
  TrashIcon,
  MoreHorizontalIcon,
  FolderIcon,
  FileTextIcon,
  FileIcon,
  ImageIcon
} from 'lucide-react';

interface FileItem {
  id: string;
  name: string;
  type: 'folder' | 'document' | 'pdf' | 'image' | 'note' | 'spreadsheet' | 'presentation';
  dateCreated: string;
  lastModified: string;
  size: string;
  owner: string;
  ownerAvatar: string;
}

interface DriveProps {
  onBack?: () => void;
}

function Drive({ onBack }: DriveProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('By Name');

  // Sample file data based on the Figma design
  const files: FileItem[] = [
    {
      id: '1',
      name: 'Lec 1',
      type: 'folder',
      dateCreated: 'Apr 18, 2025, 12:56 PM',
      lastModified: 'Apr 18, 2025, 12:56 PM',
      size: '7 KB',
      owner: 'John Doe',
      ownerAvatar: '/main/landing_page/avatars.png'
    },
    {
      id: '2',
      name: "Newton's Laws",
      type: 'note',
      dateCreated: 'Apr 18, 2025, 12:56 PM',
      lastModified: 'Apr 18, 2025, 12:56 PM',
      size: '1,256 KB',
      owner: 'John Doe',
      ownerAvatar: '/main/landing_page/avatars.png'
    },
    {
      id: '3',
      name: "Newton's Laws",
      type: 'document',
      dateCreated: 'Apr 18, 2025, 12:56 PM',
      lastModified: 'Apr 18, 2025, 12:56 PM',
      size: '1.38 MB',
      owner: 'John Doe',
      ownerAvatar: '/main/landing_page/avatars.png'
    },
    {
      id: '4',
      name: "Newton's Laws",
      type: 'note',
      dateCreated: 'Apr 18, 2025, 12:56 PM',
      lastModified: 'Apr 18, 2025, 12:56 PM',
      size: '10.6 MB',
      owner: 'John Doe',
      ownerAvatar: '/main/landing_page/avatars.png'
    },
    {
      id: '5',
      name: "Newton's Laws",
      type: 'pdf',
      dateCreated: 'Apr 18, 2025, 12:56 PM',
      lastModified: 'Apr 18, 2025, 12:56 PM',
      size: '205.5 MB',
      owner: 'John Doe',
      ownerAvatar: '/main/landing_page/avatars.png'
    },
    {
      id: '6',
      name: "Newton's Laws",
      type: 'spreadsheet',
      dateCreated: 'Apr 18, 2025, 12:56 PM',
      lastModified: 'Apr 18, 2025, 12:56 PM',
      size: '275.7 MB',
      owner: 'John Doe',
      ownerAvatar: '/main/landing_page/avatars.png'
    },
    {
      id: '7',
      name: "Newton's Laws",
      type: 'presentation',
      dateCreated: 'Apr 18, 2025, 12:56 PM',
      lastModified: 'Apr 18, 2025, 12:56 PM',
      size: '28.6 KB',
      owner: 'John Doe',
      ownerAvatar: '/main/landing_page/avatars.png'
    },
    {
      id: '8',
      name: "Newton's Laws",
      type: 'document',
      dateCreated: 'Apr 18, 2025, 12:56 PM',
      lastModified: 'Apr 18, 2025, 12:56 PM',
      size: '1,256 KB',
      owner: 'John Doe',
      ownerAvatar: '/main/landing_page/avatars.png'
    },
    {
      id: '9',
      name: "Newton's Laws",
      type: 'spreadsheet',
      dateCreated: 'Apr 18, 2025, 12:56 PM',
      lastModified: 'Apr 18, 2025, 12:56 PM',
      size: '1.38 MB',
      owner: 'John Doe',
      ownerAvatar: '/main/landing_page/avatars.png'
    },
    {
      id: '10',
      name: "Newton's Laws",
      type: 'pdf',
      dateCreated: 'Apr 18, 2025, 12:56 PM',
      lastModified: 'Apr 18, 2025, 12:56 PM',
      size: '10.6 MB',
      owner: 'John Doe',
      ownerAvatar: '/main/landing_page/avatars.png'
    },
    {
      id: '11',
      name: "Newton's Laws",
      type: 'pdf',
      dateCreated: 'Apr 18, 2025, 12:56 PM',
      lastModified: 'Apr 18, 2025, 12:56 PM',
      size: '205.5 MB',
      owner: 'John Doe',
      ownerAvatar: '/main/landing_page/avatars.png'
    },
    {
      id: '12',
      name: "Newton's Laws",
      type: 'spreadsheet',
      dateCreated: 'Apr 18, 2025, 12:56 PM',
      lastModified: 'Apr 18, 2025, 12:56 PM',
      size: '275.7 MB',
      owner: 'John Doe',
      ownerAvatar: '/main/landing_page/avatars.png'
    }
  ];

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'folder':
        return <FolderIcon className="w-5 h-5 text-blue-600" />;
      case 'document':
        return <FileTextIcon className="w-5 h-5 text-blue-600" />;
      case 'note':
        return <FileTextIcon className="w-5 h-5 text-blue-600" />;
      case 'pdf':
        return <FileIcon className="w-5 h-5 text-red-600" />;
      case 'image':
        return <ImageIcon className="w-5 h-5 text-green-600" />;
      case 'spreadsheet':
        return <FileIcon className="w-5 h-5 text-green-600" />;
      case 'presentation':
        return <FileIcon className="w-5 h-5 text-orange-600" />;
      default:
        return <FileIcon className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="h-full flex bg-gray-50">
      {/* Left Sidebar */}
      <div className="w-[180px] bg-white border-r border-gray-200 flex flex-col">
        {/* New and Upload buttons */}
        <div className="p-4 space-y-2">
          <Button className="w-full h-10 bg-white border border-gray-300 text-gray-700 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-50 font-['Inter',Helvetica] text-sm">
            <PlusIcon className="w-4 h-4" />
            New
          </Button>
          <Button className="w-full h-10 bg-white border border-gray-300 text-gray-700 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-50 font-['Inter',Helvetica] text-sm">
            <UploadIcon className="w-4 h-4" />
            Upload
          </Button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-black bg-gray-100 rounded-lg font-['Inter',Helvetica]">
              <FolderIcon className="w-4 h-4" />
              Workspace Drive
            </div>
            <div className="flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg cursor-pointer font-['Inter',Helvetica]">
              <FileIcon className="w-4 h-4" />
              Recent
            </div>
            <div className="flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg cursor-pointer font-['Inter',Helvetica]">
              <FileIcon className="w-4 h-4" />
              Starred
            </div>
            <div className="flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg cursor-pointer font-['Inter',Helvetica]">
              <FileIcon className="w-4 h-4" />
              Shared
            </div>
            <div className="flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg cursor-pointer font-['Inter',Helvetica]">
              <FileIcon className="w-4 h-4" />
              Trash
            </div>
          </div>
        </nav>

        {/* Storage indicator */}
        <div className="p-4 border-t border-gray-200">
          <div className="text-xs text-gray-600 font-['Inter',Helvetica] mb-2">Storage</div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div className="bg-blue-500 h-2 rounded-full" style={{ width: '4.15%' }}></div>
          </div>
          <div className="text-xs text-gray-500 font-['Inter',Helvetica]">0.83 GB of 20 GB used</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Header with icon and title */}
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 via-yellow-400 to-green-400 rounded-lg flex items-center justify-center">
                <FolderIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-semibold text-black text-xl font-['Inter',Helvetica]">
                  Workspace Drive
                </h1>
                <p className="text-sm text-gray-600 font-['Inter',Helvetica]">
                  all files enabled with smart assistant
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Breadcrumb and controls */}
        <div className="bg-white border-b border-gray-200 px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 font-['Inter',Helvetica]">
              My Drive / Workspace: PHYS 2801
            </div>

            <div className="flex items-center gap-3">
              {/* Search bar */}
              <div className="relative w-[280px]">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for files..."
                  className="w-full h-9 pl-10 pr-4 border border-gray-300 rounded-lg text-sm font-['Inter',Helvetica] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Sort dropdown */}
              <Button
                variant="outline"
                className="h-9 px-3 border-gray-300 rounded-lg flex items-center gap-2 font-['Inter',Helvetica] text-sm"
              >
                <span className="text-gray-700">{sortBy}</span>
                <ChevronDownIcon className="w-4 h-4 text-gray-500" />
              </Button>

              {/* New button */}
              <Button className="h-9 px-3 bg-black text-white rounded-lg flex items-center gap-2 font-['Inter',Helvetica] text-sm hover:bg-gray-800">
                <PlusIcon className="w-4 h-4" />
                New
              </Button>

              {/* Upload button */}
              <Button
                variant="outline"
                className="h-9 px-3 border-gray-300 rounded-lg flex items-center gap-2 font-['Inter',Helvetica] text-sm"
              >
                <UploadIcon className="w-4 h-4" />
                Upload
              </Button>
            </div>
          </div>
        </div>

        {/* File Table */}
        <div className="flex-1 bg-white overflow-auto">
          <div className="w-full">
            {/* Table header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 sticky top-0">
              <div className="col-span-4">
                <span className="font-medium text-gray-700 text-sm font-['Inter',Helvetica]">Name</span>
              </div>
              <div className="col-span-2">
                <span className="font-medium text-gray-700 text-sm font-['Inter',Helvetica]">Date Created</span>
              </div>
              <div className="col-span-2">
                <span className="font-medium text-gray-700 text-sm font-['Inter',Helvetica]">Last Modified</span>
              </div>
              <div className="col-span-1">
                <span className="font-medium text-gray-700 text-sm font-['Inter',Helvetica]">Size</span>
              </div>
              <div className="col-span-3">
                <span className="font-medium text-gray-700 text-sm font-['Inter',Helvetica]">Owner</span>
              </div>
            </div>

            {/* Table rows */}
            <div className="divide-y divide-gray-100">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="grid grid-cols-12 gap-4 px-6 py-3 hover:bg-gray-50 transition-colors group cursor-pointer"
                >
                  <div className="col-span-4 flex items-center gap-3">
                    <div className="flex-shrink-0">
                      {getFileIcon(file.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-gray-900 text-sm font-['Inter',Helvetica] truncate block">
                        {file.name}
                      </span>
                      {file.type === 'note' && (
                        <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full font-['Inter',Helvetica] mt-1">
                          Note
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="col-span-2 flex items-center">
                    <span className="text-gray-600 text-sm font-['Inter',Helvetica]">
                      {file.dateCreated}
                    </span>
                  </div>
                  <div className="col-span-2 flex items-center">
                    <span className="text-gray-600 text-sm font-['Inter',Helvetica]">
                      {file.lastModified}
                    </span>
                  </div>
                  <div className="col-span-1 flex items-center">
                    <span className="text-gray-600 text-sm font-['Inter',Helvetica]">
                      {file.size}
                    </span>
                  </div>
                  <div className="col-span-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={file.ownerAvatar} alt={file.owner} />
                        <AvatarFallback className="text-xs">
                          {file.owner.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-gray-600 text-sm font-['Inter',Helvetica]">
                        {file.owner}
                      </span>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-400 hover:text-gray-600"
                      >
                        <EditIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-400 hover:text-red-600"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-400 hover:text-gray-600"
                      >
                        <MoreHorizontalIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Drive;
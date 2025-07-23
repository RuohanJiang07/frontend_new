import React, { useState } from 'react';
import { Button } from '../../ui/button';
import { X } from 'lucide-react';

interface CreateNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateNote: (noteName: string) => void;
}

const CreateNoteModal: React.FC<CreateNoteModalProps> = ({ isOpen, onClose, onCreateNote }) => {
  const [noteName, setNoteName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  if (!isOpen) return null;

  const handleCreate = async () => {
    if (!noteName.trim()) return;
    
    setIsCreating(true);
    try {
      await onCreateNote(noteName.trim());
      setNoteName('');
      onClose();
    } catch (error) {
      console.error('Error creating note:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && noteName.trim() && !isCreating) {
      handleCreate();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div 
        className="bg-white rounded-[15px] shadow-xl flex flex-col overflow-hidden relative"
        style={{
          width: '400px',
          maxWidth: '90vw'
        }}
      >
        {/* Close Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 p-0 hover:bg-gray-100 text-gray-600 z-10"
        >
          <X className="w-5 h-5" />
        </Button>
        {/* Content */}
        <div className="p-6">
          <div className="mb-1">
            <label 
              htmlFor="noteName" 
              className="block text-sm font-medium text-gray-700 mb-2 font-['Inter',Helvetica]"
            >
              Note Name
            </label>
            <div className="flex gap-3">
              <input
                id="noteName"
                type="text"
                value={noteName}
                onChange={(e) => setNoteName(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter note name..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-gray-400 font-['Inter',Helvetica]"
                autoFocus
              />
              <Button
                onClick={handleCreate}
                disabled={!noteName.trim() || isCreating}
                className={`px-4 text-white font-['Inter',Helvetica] h-[40px] ${
                  !noteName.trim() || isCreating ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                style={{ backgroundColor: '#4C6696' }}
              >
                {isCreating ? 'Creating...' : 'Create'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateNoteModal; 
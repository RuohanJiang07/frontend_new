import React, { useState } from 'react';
import { FileTextIcon, ClipboardIcon } from 'lucide-react';

interface PastedContent {
  id: string;
  content: string;
  title: string;
  source: 'paste';
}

interface PasteContentProps {
  onFileSelection: (files: PastedContent[]) => void;
  selectedFiles: PastedContent[];
}

const PasteContent: React.FC<PasteContentProps> = ({ onFileSelection, selectedFiles }) => {
  const [textContent, setTextContent] = useState('');
  const [title, setTitle] = useState('');

  const addPastedContent = () => {
    if (!textContent.trim()) return;

    const newContent: PastedContent = {
      id: `paste-${Date.now()}`,
      content: textContent.trim(),
      title: title.trim() || `Pasted Content ${Date.now()}`,
      source: 'paste'
    };

    const currentNonPasteFiles = selectedFiles.filter(f => f.source !== 'paste');
    const currentPasteFiles = selectedFiles.filter(f => f.source === 'paste');
    const updatedFiles = [...currentNonPasteFiles, ...currentPasteFiles, newContent];
    onFileSelection(updatedFiles);
    
    setTextContent('');
    setTitle('');
  };

  const removePastedContent = (contentId: string) => {
    const updatedFiles = selectedFiles.filter(f => f.id !== contentId);
    onFileSelection(updatedFiles);
  };

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setTextContent(text);
    } catch (err) {
      console.error('Failed to read clipboard contents: ', err);
    }
  };

  const pastedFiles = selectedFiles.filter(f => f.source === 'paste');

  return (
    <div className="flex flex-col h-full p-6">
      {/* Paste Input Section */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 font-['Inter',Helvetica]">
          Paste Text Content
        </h3>
        
        {/* Title Input */}
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1 font-['Inter',Helvetica]">
            Title (Optional)
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Give your content a title"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-['Inter',Helvetica] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Text Area */}
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1 font-['Inter',Helvetica]">
            Content
          </label>
          <textarea
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            placeholder="Paste your text content here..."
            rows={8}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-['Inter',Helvetica] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={pasteFromClipboard}
            className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-['Inter',Helvetica] flex items-center gap-2"
          >
            <ClipboardIcon className="w-4 h-4" />
            Paste from Clipboard
          </button>
          <button
            onClick={addPastedContent}
            disabled={!textContent.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-['Inter',Helvetica]"
          >
            Add Content
          </button>
        </div>
      </div>

      {/* Added Content List */}
      {pastedFiles.length > 0 && (
        <div className="flex-1">
          <h4 className="text-sm font-medium text-gray-900 mb-3 font-['Inter',Helvetica]">
            Added Content ({pastedFiles.length})
          </h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {pastedFiles.map((content) => (
              <div
                key={content.id}
                className="p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <FileTextIcon className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 font-['Inter',Helvetica] mb-1">
                        {content.title}
                      </p>
                      <p className="text-xs text-gray-500 font-['Inter',Helvetica] line-clamp-2">
                        {content.content.substring(0, 100)}
                        {content.content.length > 100 ? '...' : ''}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removePastedContent(content.id)}
                    className="p-1 hover:bg-gray-200 rounded transition-colors flex-shrink-0 ml-2"
                  >
                    <svg className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {pastedFiles.length === 0 && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <FileTextIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-['Inter',Helvetica]">
              No content added yet
            </p>
            <p className="text-sm text-gray-400 font-['Inter',Helvetica]">
              Paste text content above to include it as a source
            </p>
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="mt-auto pt-6 border-t border-gray-200">
        <p className="text-xs text-gray-500 font-['Inter',Helvetica]">
          <strong>Tip:</strong> You can paste research notes, articles, or any text content that's relevant to your work.
        </p>
      </div>
    </div>
  );
};

export default PasteContent;
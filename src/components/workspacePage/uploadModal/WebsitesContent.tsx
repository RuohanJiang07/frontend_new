import React, { useState } from 'react';
import { Plus, X, ExternalLinkIcon } from 'lucide-react';

interface Website {
  id: string;
  url: string;
  title?: string;
  source: 'website';
}

interface WebsitesContentProps {
  onFileSelection: (files: Website[]) => void;
  selectedFiles: Website[];
}

const WebsitesContent: React.FC<WebsitesContentProps> = ({ onFileSelection, selectedFiles }) => {
  const [urlInput, setUrlInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const addWebsite = async () => {
    if (!urlInput.trim()) return;

    setIsLoading(true);
    
    // Simulate URL validation and title fetching
    setTimeout(() => {
      const newWebsite: Website = {
        id: `website-${Date.now()}`,
        url: urlInput.trim(),
        title: `Website: ${new URL(urlInput.trim()).hostname}`,
        source: 'website'
      };

      const currentNonWebsiteFiles = selectedFiles.filter(f => f.source !== 'website');
      const currentWebsiteFiles = selectedFiles.filter(f => f.source === 'website');
      const updatedFiles = [...currentNonWebsiteFiles, ...currentWebsiteFiles, newWebsite];
      onFileSelection(updatedFiles);
      
      setUrlInput('');
      setIsLoading(false);
    }, 1000);
  };

  const removeWebsite = (websiteId: string) => {
    const updatedFiles = selectedFiles.filter(f => f.id !== websiteId);
    onFileSelection(updatedFiles);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addWebsite();
    }
  };

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const websiteFiles = selectedFiles.filter(f => f.source === 'website');

  return (
    <div className="flex flex-col h-full p-6">
      {/* URL Input Section */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 font-['Inter',Helvetica]">
          Add Websites as Sources
        </h3>
        <div className="flex gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter website URL (e.g., https://example.com)"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-['Inter',Helvetica] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
          <button
            onClick={addWebsite}
            disabled={!urlInput.trim() || !isValidUrl(urlInput.trim()) || isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-['Inter',Helvetica] flex items-center gap-2"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            Add
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2 font-['Inter',Helvetica]">
          Add websites that contain relevant information for your research
        </p>
      </div>

      {/* Added Websites List */}
      {websiteFiles.length > 0 && (
        <div className="flex-1">
          <h4 className="text-sm font-medium text-gray-900 mb-3 font-['Inter',Helvetica]">
            Added Websites ({websiteFiles.length})
          </h4>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {websiteFiles.map((website) => (
              <div
                key={website.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <ExternalLinkIcon className="w-5 h-5 text-gray-600 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 font-['Inter',Helvetica] truncate">
                      {website.title || website.url}
                    </p>
                    <p className="text-xs text-gray-500 font-['Inter',Helvetica] truncate">
                      {website.url}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeWebsite(website.id)}
                  className="p-1 hover:bg-gray-200 rounded transition-colors flex-shrink-0"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {websiteFiles.length === 0 && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <ExternalLinkIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-['Inter',Helvetica]">
              No websites added yet
            </p>
            <p className="text-sm text-gray-400 font-['Inter',Helvetica]">
              Add website URLs above to include them as sources
            </p>
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="mt-auto pt-6 border-t border-gray-200">
        <p className="text-xs text-gray-500 font-['Inter',Helvetica]">
          <strong>Tip:</strong> Make sure the websites are publicly accessible and contain relevant content for your research.
        </p>
      </div>
    </div>
  );
};

export default WebsitesContent;
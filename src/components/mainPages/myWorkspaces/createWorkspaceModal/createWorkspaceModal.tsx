import { UploadCloudIcon, X } from "lucide-react";
import { Card } from "../card";
import { Input } from "../../../ui/input";
import './createWorkspaceModal.css';
import { Button } from "../../../ui/button";
import { useState, useEffect } from "react";
import { getWorkspaceCoverImages, createWorkspace, CreateWorkspaceRequest } from "../../../../api/mainPages/workspaces";
import { useToast } from "../../../../hooks/useToast";

interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: WorkspaceData) => void;
}

interface WorkspaceData {
  name: string;
  description: string;
  coverImage: string;
  tags: string[];
  background: string;
}

const CreateWorkspaceModal = ({ isOpen, onClose, onSubmit }: CreateWorkspaceModalProps) => {
  const { success, error } = useToast();
  const [formData, setFormData] = useState<WorkspaceData>({
    name: '',
    description: '',
    coverImage: '',
    tags: [],
    background: ''
  });

  const [tagInput, setTagInput] = useState('');
  const [coverImages, setCoverImages] = useState<string[]>([]);
  const [loadingCovers, setLoadingCovers] = useState(false);
  const [creating, setCreating] = useState(false);

  // Fetch cover images when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchCoverImages();
    }
  }, [isOpen]);

  const fetchCoverImages = async () => {
    try {
      setLoadingCovers(true);
      const response = await getWorkspaceCoverImages();
      
      if (response.success) {
        // Combine default covers and user uploaded covers
        const allCovers = [...response.default_covers, ...response.user_uploaded_covers];
        setCoverImages(allCovers);
        
        // Set first image as default if no image is selected
        if (allCovers.length > 0 && !formData.coverImage) {
          setFormData(prev => ({
            ...prev,
            coverImage: allCovers[0]
          }));
        }
      } else {
        error('Failed to load cover images');
      }
    } catch (err) {
      console.error('Error fetching cover images:', err);
      error('Failed to load cover images');
    } finally {
      setLoadingCovers(false);
    }
  };

  const handleInputChange = (field: keyof WorkspaceData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagInput(e.target.value);
  };

  const handleTagKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.name.trim()) {
      error('Workspace name is required');
      return;
    }

    try {
      setCreating(true);
      
      const createRequest: CreateWorkspaceRequest = {
        workspace_name: formData.name.trim(),
        tags: formData.tags.length > 0 ? formData.tags : undefined,
        collaborator_emails: formData.background.trim() ? [formData.background.trim()] : undefined,
        cover_url: formData.coverImage,
      };

      console.log('Creating workspace with request:', createRequest);

      const response = await createWorkspace(createRequest);
      
      success(`Workspace "${formData.name}" created successfully!`);
      
      // Save workspace_id to localStorage for future use
      localStorage.setItem('current_workspace_id', response.workspace_id);
      
      // Call parent onSubmit with the form data
      onSubmit(formData);
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        coverImage: '',
        tags: [],
        background: ''
      });
      setTagInput('');
      
      // Close modal
      onClose();
      
    } catch (err) {
      console.error('Error creating workspace:', err);
      error('Failed to create workspace. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="relative w-[720px] h-[500px] bg-white rounded-[20px] shadow-lg flex flex-col">
        {/* Close Button - Improved clickability */}
        <button
          className="absolute top-[24px] right-[32px] w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors z-10"
          onClick={onClose}
          disabled={creating}
        >
          <X className="w-5 h-5 text-black" />
        </button>

        {/* Content Container - Properly centered */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-[600px] h-full max-h-[400px] overflow-y-auto scrollbar-hide">
            <div className="flex flex-col items-center">
              <h2 className="font-['IBM_Plex_Sans'] text-[18px] font-normal text-black leading-normal">
                Create New Workspace
              </h2>
              <p className="mt-[2px] text-center font-['IBM_Plex_Sans'] text-[14px] font-normal text-[#898989] leading-normal max-w-[480px]">
                Workspaces are where you have your study materials organized by
                subject, topic, or your interest
              </p>
            </div>

            {/* First row with Workspace Name and Tags */}
            <div className="flex gap-[18px] mt-[18px] justify-center">
              {/* Workspace Name Field */}
              <div className="flex flex-col">
                <label className="font-['IBM_Plex_Sans'] text-[15px] font-normal text-black leading-normal pl-[16px]">
                  Workspace Name <span className="text-[#e72a2a]">*</span>
                </label>
                <Input
                  className="w-[280px] h-[42px] flex-shrink-0 rounded-[10px] border-2 border-[#e2e2e2] pl-[16px] font-['IBM_Plex_Sans'] text-[15px] font-normal text-[#898989] leading-normal placeholder:text-[#898989]"
                  placeholder="Name your workspace"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  disabled={creating}
                />
              </div>

              {/* Tags Field */}
              <div className="flex flex-col">
                <label className="font-['IBM_Plex_Sans'] text-[15px] font-normal text-black leading-normal pl-[16px]">
                  Tags (Optional)
                </label>
                <Input
                  className="w-[280px] h-[42px] flex-shrink-0 rounded-[10px] border-2 border-[#e2e2e2] pl-[16px] font-['IBM_Plex_Sans'] text-[15px] font-normal text-[#898989] leading-normal placeholder:text-[#898989]"
                  placeholder='Type and press Enter to add tags'
                  value={tagInput}
                  onChange={handleTagInputChange}
                  onKeyPress={handleTagKeyPress}
                  disabled={creating}
                />
                
                {/* Display tags */}
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2 pl-[16px]">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="text-blue-600 hover:text-blue-800"
                          disabled={creating}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Collaborator Section */}
            <div className="mt-[16px] flex justify-center">
              <div className="w-[578px]">
                <label className="font-['IBM_Plex_Sans'] text-[15px] font-normal text-black leading-normal pl-[16px]">
                  Collaborator (Optional)
                </label>
                <Input
                  className="w-full h-[42px] rounded-[10px] border-2 border-[#e2e2e2] pl-[16px] font-['IBM_Plex_Sans'] text-[15px] font-normal text-[#898989] leading-normal placeholder:text-[#898989]"
                  placeholder="Invite collaborator by email"
                  value={formData.background}
                  onChange={(e) => handleInputChange('background', e.target.value)}
                  disabled={creating}
                />
              </div>
            </div>

            {/* Workspace Cover Section */}
            <div className="mt-[16px] flex justify-center">
              <div className="w-[578px]">
                <label className="font-['IBM_Plex_Sans'] text-[15px] font-normal text-black leading-normal pl-[16px]">
                  Select Workspace Cover
                </label>

                <div className="mt-2 grid grid-cols-3 gap-x-[16px] gap-y-[12px]">
                  {/* Upload Card */}
                  <Card className="w-[182px] h-[115px] flex-shrink-0 bg-[#f4f4f4] rounded-[5px] border-2 border-[#d9d9d9] flex flex-col items-center justify-center cursor-pointer hover:border-[#999]">
                    <UploadCloudIcon className="w-8 h-8 mb-1 text-gray-500" />
                    <p className="font-['IBM_Plex_Sans'] text-[12px] font-normal text-[#898989] leading-normal text-center px-2">Upload from computer</p>
                  </Card>

                  {/* Loading state for cover images */}
                  {loadingCovers ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <div
                        key={`loading-${index}`}
                        className="w-[182px] h-[115px] flex-shrink-0 bg-gray-200 rounded-[5px] animate-pulse"
                      />
                    ))
                  ) : (
                    /* Cover Images - Updated selection color to match create button */
                    coverImages.map((imageUrl, index) => (
                      <div
                        key={index}
                        className={`w-[182px] h-[115px] flex-shrink-0 cursor-pointer rounded-[5px] border-2 transition-all ${
                          formData.coverImage === imageUrl 
                            ? 'border-[#80A5E4] ring-2 ring-[#80A5E4]/30' 
                            : 'border-[#d9d9d9] hover:border-[#999]'
                        }`}
                        onClick={() => !creating && handleInputChange('coverImage', imageUrl)}
                      >
                        <img
                          className="w-full h-full object-cover rounded-[5px]"
                          alt={`Cover ${index + 1}`}
                          src={imageUrl}
                          onError={(e) => {
                            // Handle broken images
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Debug: Show selected cover URL */}
            {formData.coverImage && (
              <div className="mt-3 flex justify-center">
                <p className="text-xs text-gray-500">
                  Selected cover: {formData.coverImage}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Create Button - Fixed position at bottom right */}
        <Button
          className={`absolute right-[32px] bottom-[32px] w-[90px] h-[34px] rounded-[17px] text-black font-['IBM_Plex_Sans'] text-[15px] font-normal leading-normal flex-shrink-0 ${
            creating 
              ? 'bg-gray-300 cursor-not-allowed' 
              : 'bg-[#ECF1F6] hover:bg-[#d1e9f8]'
          }`}
          onClick={handleSubmit}
          disabled={creating || !formData.name.trim()}
        >
          {creating ? 'Creating...' : 'Create'}
        </Button>
      </div>
    </div>
  );
};

export default CreateWorkspaceModal;
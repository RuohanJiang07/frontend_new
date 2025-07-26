import React, { useState, useEffect } from 'react';
import { X, ChevronDown, ChevronUp, MoreVertical, Info } from 'lucide-react';
import { getAllProfiles, saveProfile, Profile, SaveProfileRequest } from '../../../../api/mainPages/profile';

interface ProfileManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileManagementModal: React.FC<ProfileManagementModalProps> = ({ isOpen, onClose }) => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedProfiles, setExpandedProfiles] = useState<Set<string>>(new Set(['profile-default']));
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newProfile, setNewProfile] = useState<SaveProfileRequest['profile_info']>({
    profile_name: '',
    description: '',
    education_levels: [],
    area_of_expertise: '',
    learning_preferences: [],
    additional_comments: ''
  });
  const [saving, setSaving] = useState(false);

  // Fetch profiles when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchProfiles();
    }
  }, [isOpen]);

  const fetchProfiles = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAllProfiles();
      setProfiles(response.profiles);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch profiles');
    } finally {
      setLoading(false);
    }
  };

  const toggleProfileExpanded = (profileId: string) => {
    const newExpanded = new Set(expandedProfiles);
    if (newExpanded.has(profileId)) {
      newExpanded.delete(profileId);
    } else {
      newExpanded.add(profileId);
    }
    setExpandedProfiles(newExpanded);
  };

  const handleNewProfile = () => {
    setIsCreatingNew(true);
    setNewProfile({
      profile_name: '',
      description: '',
      education_levels: [],
      area_of_expertise: '',
      learning_preferences: [],
      additional_comments: ''
    });
    // Add new profile to expanded set
    setExpandedProfiles(prev => new Set([...prev, 'new-profile']));
  };

  const handleSaveProfile = async () => {
    if (!newProfile.profile_name.trim()) {
      setError('Profile name is required');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const response = await saveProfile({ profile_info: newProfile });
      // Refresh profiles after saving
      await fetchProfiles();
      setIsCreatingNew(false);
      setExpandedProfiles(prev => {
        const newSet = new Set(prev);
        newSet.delete('new-profile');
        return newSet;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelNew = () => {
    setIsCreatingNew(false);
    setExpandedProfiles(prev => {
      const newSet = new Set(prev);
      newSet.delete('new-profile');
      return newSet;
    });
  };

  const toggleEducationLevel = (level: string) => {
    setNewProfile(prev => ({
      ...prev,
      education_levels: prev.education_levels.includes(level)
        ? prev.education_levels.filter(l => l !== level)
        : [...prev.education_levels, level]
    }));
  };

  const toggleLearningPreference = (preference: string) => {
    setNewProfile(prev => ({
      ...prev,
      learning_preferences: prev.learning_preferences.includes(preference)
        ? prev.learning_preferences.filter(p => p !== preference)
        : [...prev.learning_preferences, preference]
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div 
        className="bg-white rounded-[15px] flex-shrink-0 relative"
        style={{
          width: '813px',
          height: '665px'
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-start p-5">
          <div className="flex-1">
            <div className="flex items-center mb-2">
              <h1 
                className="text-black"
                style={{
                  fontSize: '24px',
                  fontStyle: 'normal',
                  fontWeight: '590'
                }}
              >
                My Profile
              </h1>
              <button 
                onClick={handleNewProfile}
                className="ml-2.5 px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm hover:bg-gray-300 transition-colors"
              >
                + New Profile
              </button>
            </div>
            <div className="flex items-center gap-2 text-gray-600 text-sm">
              <Info className="w-4 h-4" />
              <span>Based on the profiles, LLM will generate customized responses</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-7 pb-5 h-[calc(100%-120px)] overflow-y-auto">
          {loading ? (
            // Loading skeleton
            <div className="space-y-4">
              {[1, 2, 3].map((index) => (
                <div key={index} className="mb-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-4">
                    <div className="flex-1">
                      <div className="h-5 bg-gray-200 rounded w-1/3 mb-2 animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
                      <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <div className="h-4 bg-gray-200 rounded w-24 mb-2 animate-pulse"></div>
                      <div className="flex gap-2 flex-wrap">
                        {[1, 2, 3, 4].map((btnIndex) => (
                          <div key={btnIndex} className="h-8 bg-gray-200 rounded-full w-20 animate-pulse"></div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="h-4 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
                    </div>
                    <div>
                      <div className="h-4 bg-gray-200 rounded w-40 mb-2 animate-pulse"></div>
                      <div className="space-y-2">
                        <div className="flex gap-2 flex-wrap">
                          {[1, 2, 3, 4].map((btnIndex) => (
                            <div key={btnIndex} className="h-8 bg-gray-200 rounded-full w-24 animate-pulse"></div>
                          ))}
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          {[1, 2, 3, 4, 5].map((btnIndex) => (
                            <div key={btnIndex} className="h-8 bg-gray-200 rounded-full w-20 animate-pulse"></div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="h-4 bg-gray-200 rounded w-36 mb-2 animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <p className="text-red-500 mb-2">{error}</p>
                <button 
                  onClick={fetchProfiles}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : (
            // Render profiles
            <div className="space-y-4">
              {/* New Profile Section */}
              {isCreatingNew && (
                <div className="mb-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg mb-4">
                    <div>
                      <h2 className="font-semibold text-black">New Profile</h2>
                      <p className="text-sm text-gray-500">Create a new profile</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleProfileExpanded('new-profile')}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        {expandedProfiles.has('new-profile') ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {expandedProfiles.has('new-profile') && (
                    <div className="space-y-4">
                      {/* Profile Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Profile Name *</label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter profile name"
                          value={newProfile.profile_name}
                          onChange={(e) => setNewProfile(prev => ({ ...prev, profile_name: e.target.value }))}
                        />
                      </div>

                      {/* Description */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter description"
                          value={newProfile.description}
                          onChange={(e) => setNewProfile(prev => ({ ...prev, description: e.target.value }))}
                        />
                      </div>

                      {/* Education Level */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Education Level</label>
                        <div className="flex gap-2 flex-wrap">
                          {['High School', 'Undergraduates', 'Graduates', 'Industry Professionals'].map((level) => (
                            <button
                              key={level}
                              onClick={() => toggleEducationLevel(level)}
                              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                                newProfile.education_levels.includes(level)
                                  ? 'bg-[#DFEDFF] text-[#00276C]'
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                            >
                              {level}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Area of Expertise */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Area of Expertise</label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter your area of expertise"
                          value={newProfile.area_of_expertise}
                          onChange={(e) => setNewProfile(prev => ({ ...prev, area_of_expertise: e.target.value }))}
                        />
                      </div>

                      {/* Learning Preferences */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Learning Preferences</label>
                        <div className="space-y-2">
                          <div className="flex gap-2 flex-wrap">
                            {['Visual Learning', 'Hands-on Practice', 'Step-by-step', 'Real Examples'].map((preference) => (
                              <button
                                key={preference}
                                onClick={() => toggleLearningPreference(preference)}
                                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                                  newProfile.learning_preferences.includes(preference)
                                    ? 'bg-[#DFEDFF] text-[#00276C]'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                              >
                                {preference}
                              </button>
                            ))}
                          </div>
                          <div className="flex gap-2 flex-wrap">
                            {['Interactive', 'Theory First', 'Quick Overview', 'Deep Dive', 'Problem-based'].map((preference) => (
                              <button
                                key={preference}
                                onClick={() => toggleLearningPreference(preference)}
                                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                                  newProfile.learning_preferences.includes(preference)
                                    ? 'bg-[#DFEDFF] text-[#00276C]'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                              >
                                {preference}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Additional Comments */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Additional Comments</label>
                        <textarea
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                          rows={4}
                          placeholder="Enter any additional comments..."
                          value={newProfile.additional_comments}
                          onChange={(e) => setNewProfile(prev => ({ ...prev, additional_comments: e.target.value }))}
                        />
                      </div>

                      {/* Save/Cancel Buttons */}
                      <div className="flex gap-3 pt-0 justify-end">
                        <button
                          onClick={handleSaveProfile}
                          disabled={saving || !newProfile.profile_name.trim()}
                          className="px-6 py-2 bg-[#4C6694] text-white rounded-lg hover:bg-[#3d5a7a] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                        >
                          {saving ? 'Saving...' : 'Save Profile'}
                        </button>
                        <button
                          onClick={handleCancelNew}
                          disabled={saving}
                          className="px-6 py-2 bg-[#4C6694] text-white rounded-lg hover:bg-[#3d5a7a] disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {profiles.map((profile) => (
                <div key={profile.profile_id} className="mb-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-4">
                    <div>
                      <h2 className="font-semibold text-black">{profile.profile_name}</h2>
                      <p className="text-sm text-gray-500">{profile.description || 'No Description'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleProfileExpanded(profile.profile_id)}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        {expandedProfiles.has(profile.profile_id) ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                      </button>
                      <button className="p-1 hover:bg-gray-200 rounded">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {expandedProfiles.has(profile.profile_id) && (
                    <div className="space-y-4">
                      {/* Education Level */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Education Level</label>
                        <div className="flex gap-2 flex-wrap">
                          {profile.education_levels.map((level, index) => (
                            <button 
                              key={index}
                              className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm hover:bg-gray-300"
                            >
                              {level}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Area of Expertise */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Area of Expertise</label>
                        <p className="text-gray-900">{profile.area_of_expertise || 'Not Specified'}</p>
                      </div>

                      {/* Learning Preferences */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Learning Preferences</label>
                        <div className="space-y-2">
                          <div className="flex gap-2 flex-wrap">
                            {profile.learning_preferences.slice(0, 4).map((preference, index) => (
                              <button 
                                key={index}
                                className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm hover:bg-gray-300"
                              >
                                {preference}
                              </button>
                            ))}
                          </div>
                          <div className="flex gap-2 flex-wrap">
                            {profile.learning_preferences.slice(4).map((preference, index) => (
                              <button 
                                key={index + 4}
                                className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm hover:bg-gray-300"
                              >
                                {preference}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Additional Comments */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Additional Comments</label>
                        <p className="text-gray-900 whitespace-pre-wrap">{profile.additional_comments || 'Not Specified'}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileManagementModal; 
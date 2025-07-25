import React, { useState } from 'react';
import { X, ChevronDown, ChevronUp, MoreVertical, Info } from 'lucide-react';

interface ProfileManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileManagementModal: React.FC<ProfileManagementModalProps> = ({ isOpen, onClose }) => {
  const [defaultProfileExpanded, setDefaultProfileExpanded] = useState(true);
  const [statProfileExpanded, setStatProfileExpanded] = useState(false);
  const [physicsProfileExpanded, setPhysicsProfileExpanded] = useState(false);

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
              <button className="ml-2.5 px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm hover:bg-gray-300 transition-colors">
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
          {/* Default Profile Section */}
          <div className="mb-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-4">
              <div>
                <h2 className="font-semibold text-black">Default Profile</h2>
                <p className="text-sm text-gray-500">Your default profile that hyperknow will use</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDefaultProfileExpanded(!defaultProfileExpanded)}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  {defaultProfileExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                </button>
                <button className="p-1 hover:bg-gray-200 rounded">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>

            {defaultProfileExpanded && (
              <div className="space-y-4">
                {/* Education Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Education Level</label>
                  <div className="flex gap-2 flex-wrap">
                    <button className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm hover:bg-gray-300">
                      High School
                    </button>
                    <button className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm hover:bg-gray-300">
                      Undergraduates
                    </button>
                    <button className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm hover:bg-gray-300">
                      Graduates
                    </button>
                    <button className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm hover:bg-gray-300">
                      Industry Professionals
                    </button>
                  </div>
                </div>

                {/* Area of Expertise */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Area of Expertise</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your area of expertise"
                  />
                </div>

                {/* Learning Preferences */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Learning Preferences</label>
                  <div className="space-y-2">
                    <div className="flex gap-2 flex-wrap">
                      <button className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm hover:bg-gray-300">
                        Visual Learning
                      </button>
                      <button className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm hover:bg-gray-300">
                        Hands-on Practice
                      </button>
                      <button className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm hover:bg-gray-300">
                        Step-by-step
                      </button>
                      <button className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm hover:bg-gray-300">
                        Real Examples
                      </button>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <button className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm hover:bg-gray-300">
                        Interactive
                      </button>
                      <button className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm hover:bg-gray-300">
                        Theory First
                      </button>
                      <button className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm hover:bg-gray-300">
                        Quick Overview
                      </button>
                      <button className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm hover:bg-gray-300">
                        Deep Dive
                      </button>
                      <button className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm hover:bg-gray-300">
                        Problem-based
                      </button>
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
                  />
                </div>
              </div>
            )}
          </div>

          {/* Stat Class Profile Section */}
          <div className="mb-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-4">
              <div>
                <h3 className="font-semibold text-black">Stat Class Profile</h3>
                <p className="text-sm text-gray-500">College's STAT3710 Profile</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setStatProfileExpanded(!statProfileExpanded)}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  {statProfileExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                </button>
                <button className="p-1 hover:bg-gray-200 rounded">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>
            {statProfileExpanded && (
              <div className="space-y-4">
                {/* Education Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Education Level</label>
                  <div className="flex gap-2 flex-wrap">
                    <button className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm hover:bg-gray-300">
                      High School
                    </button>
                    <button className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm hover:bg-gray-300">
                      Undergraduates
                    </button>
                    <button className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm hover:bg-gray-300">
                      Graduates
                    </button>
                    <button className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm hover:bg-gray-300">
                      Industry Professionals
                    </button>
                  </div>
                </div>

                {/* Area of Expertise */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Area of Expertise</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your area of expertise"
                  />
                </div>

                {/* Learning Preferences */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Learning Preferences</label>
                  <div className="space-y-2">
                    <div className="flex gap-2 flex-wrap">
                      <button className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm hover:bg-gray-300">
                        Visual Learning
                      </button>
                      <button className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm hover:bg-gray-300">
                        Hands-on Practice
                      </button>
                      <button className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm hover:bg-gray-300">
                        Step-by-step
                      </button>
                      <button className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm hover:bg-gray-300">
                        Real Examples
                      </button>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <button className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm hover:bg-gray-300">
                        Interactive
                      </button>
                      <button className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm hover:bg-gray-300">
                        Theory First
                      </button>
                      <button className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm hover:bg-gray-300">
                        Quick Overview
                      </button>
                      <button className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm hover:bg-gray-300">
                        Deep Dive
                      </button>
                      <button className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm hover:bg-gray-300">
                        Problem-based
                      </button>
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
                  />
                </div>
              </div>
            )}
          </div>

          {/* Physics Class Profile Section */}
          <div className="mb-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-4">
              <div>
                <h3 className="font-semibold text-black">Physics Class Profile</h3>
                <p className="text-sm text-gray-500">College's PH3710 Profile</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPhysicsProfileExpanded(!physicsProfileExpanded)}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  {physicsProfileExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                </button>
                <button className="p-1 hover:bg-gray-200 rounded">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>
            {physicsProfileExpanded && (
              <div className="space-y-4">
                {/* Education Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Education Level</label>
                  <div className="flex gap-2 flex-wrap">
                    <button className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm hover:bg-gray-300">
                      High School
                    </button>
                    <button className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm hover:bg-gray-300">
                      Undergraduates
                    </button>
                    <button className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm hover:bg-gray-300">
                      Graduates
                    </button>
                    <button className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm hover:bg-gray-300">
                      Industry Professionals
                    </button>
                  </div>
                </div>

                {/* Area of Expertise */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Area of Expertise</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your area of expertise"
                  />
                </div>

                {/* Learning Preferences */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Learning Preferences</label>
                  <div className="space-y-2">
                    <div className="flex gap-2 flex-wrap">
                      <button className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm hover:bg-gray-300">
                        Visual Learning
                      </button>
                      <button className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm hover:bg-gray-300">
                        Hands-on Practice
                      </button>
                      <button className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm hover:bg-gray-300">
                        Step-by-step
                      </button>
                      <button className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm hover:bg-gray-300">
                        Real Examples
                      </button>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <button className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm hover:bg-gray-300">
                        Interactive
                      </button>
                      <button className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm hover:bg-gray-300">
                        Theory First
                      </button>
                      <button className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm hover:bg-gray-300">
                        Quick Overview
                      </button>
                      <button className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm hover:bg-gray-300">
                        Deep Dive
                      </button>
                      <button className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm hover:bg-gray-300">
                        Problem-based
                      </button>
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
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileManagementModal; 
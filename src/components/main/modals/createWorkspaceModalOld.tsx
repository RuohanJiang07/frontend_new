import React, { useState } from 'react';
import { X, Image as ImageIcon } from 'lucide-react';
import './createWorkspaceModal.css';

interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: WorkspaceData) => void;
}

interface WorkspaceData {
  name: string;
  description: string;
  coverImage: string;
  learningPreferences: string[];
  background: string;
}

const LEARNING_PREFERENCES = [
  { id: 'visual', label: 'Visual Learning' },
  { id: 'stepByStep', label: 'Step-by-Step Explanation' },
  { id: 'mathematical', label: 'Mathematical Formulas' },
  { id: 'practical', label: 'Practical Examples' },
  { id: 'historical', label: 'Historical Context' },
  { id: 'diagrams', label: 'Diagrams & Charts' },
  { id: 'interactive', label: 'Interactive Elements' },
  { id: 'conceptual', label: 'Conceptual Understanding' },
  { id: 'technical', label: 'Technical Details' },
  { id: 'overview', label: 'Overview First' },
  { id: 'detailed', label: 'Detailed Explanations' },
  { id: 'practical', label: 'Practical Applications' },
  { id: 'analogies', label: 'Analogies & Metaphors' },
  { id: 'problemSolving', label: 'Problem Solving' },
  { id: 'proofs', label: 'Proofs & Derivations' },
  { id: 'simplified', label: 'Simplified Language' }
];

const DEFAULT_COVERS = [
  '/workspace/dafult_cover/project_img_1.png',
  '/workspace/dafult_cover/project_img_2.png'
];

function CreateWorkspaceModal({ isOpen, onClose, onSubmit }: CreateWorkspaceModalProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<WorkspaceData>({
    name: '',
    description: '',
    coverImage: DEFAULT_COVERS[0],
    learningPreferences: [],
    background: ''
  });

  if (!isOpen) return null;

  const handleNext = () => {
    if (step < 2) setStep(step + 1);
    else onSubmit(formData);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const togglePreference = (id: string) => {
    setFormData(prev => ({
      ...prev,
      learningPreferences: prev.learningPreferences.includes(id)
        ? prev.learningPreferences.filter(p => p !== id)
        : [...prev.learningPreferences, id]
    }));
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        {/* Header Bar */}
        <div className="modal-header">
          <h2>New Workspace</h2>
          <button onClick={onClose} className="close-button">
            <X size={18} />
          </button>
        </div>

        {/* Main Content */}
        <div className="modal-content">
          {/* Left Panel - Steps */}
          <div className="steps-panel">
            <div
              className={`step-item ${step === 1 ? 'active' : ''}`}
              onClick={() => setStep(1)}
            >
              Basic Info
            </div>
            <div
              className={`step-item ${step === 2 ? 'active' : ''}`}
              onClick={() => setStep(2)}
            >
              Learning Preferences
            </div>
          </div>

          {/* Right Panel - Content */}
          <div className="form-content">
            {step === 1 && (
              <div className="form-section">
                <div className="form-group">
                  <label>Workspace Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter workspace name"
                  />
                </div>
                <div className="form-group">
                  <label>Description (Optional)</label>
                  <textarea
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    placeholder="Describe your workspace"
                  />
                </div>
                <div className="form-group">
                  <label>Cover Image</label>
                  <div className="cover-grid">
                    {DEFAULT_COVERS.map((cover, index) => (
                      <div
                        key={index}
                        onClick={() => setFormData({ ...formData, coverImage: cover })}
                        className={`cover-item ${formData.coverImage === cover ? 'selected' : ''}`}
                      >
                        <img src={cover} alt={`Cover ${index + 1}`} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="form-section">
                <h3>Preferred Learning Style</h3>
                <div className="preferences-grid">
                  {LEARNING_PREFERENCES.map(pref => (
                    <button
                      key={pref.id}
                      onClick={() => togglePreference(pref.id)}
                      className={`preference-item ${formData.learningPreferences.includes(pref.id) ? 'selected' : ''}`}
                    >
                      {pref.label}
                    </button>
                  ))}
                </div>

                <div className="form-group additional-preferences">
                  <h3>Additional Background</h3>
                  <textarea
                    value={formData.background}
                    onChange={e => setFormData({ ...formData, background: e.target.value })}
                    rows={4}
                    placeholder="Tell us about your background (e.g., high school student, taking AP courses)"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button
            onClick={handleBack}
            className={`back-button ${step === 1 ? 'invisible' : ''}`}
          >
            Back
          </button>
          <button
            onClick={handleNext}
            className="next-button"
          >
            {step === 2 ? 'Create Workspace' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateWorkspaceModal;
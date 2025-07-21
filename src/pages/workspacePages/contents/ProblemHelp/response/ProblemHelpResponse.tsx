import React, { useState, useRef } from 'react';
import { useTabContext } from '../../../workspaceFrame/TabContext';
import './ProblemHelpResponse.css';
import { MarkdownRenderer } from '../../../../../components/ui/markdown';

interface ProblemHelpResponseProps {
  onBack: () => void;
  tabIdx?: number;
  pageIdx?: number;
  screenId?: string;
}

// Conversation message interface
interface ConversationMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: string;
  concepts?: Array<{
    title: string;
    explanation: string;
  }>;
}

function ProblemHelpResponse({ onBack, tabIdx = 0, pageIdx = 0, screenId = '' }: ProblemHelpResponseProps) {
  const { switchToProblemHelp } = useTabContext();
  const [followUpQuestion, setFollowUpQuestion] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [profileSelected, setProfileSelected] = useState(false);
  const [referenceSelected, setReferenceSelected] = useState(false);

  // Refs for scroll handling
  const conversationMainRef = useRef<HTMLDivElement>(null);
  const scrollbarThumbRef = useRef<HTMLDivElement>(null);

  // Placeholder conversation data
  const conversationHistory: ConversationMessage[] = [
    {
      id: 'user-1',
      type: 'user',
      content: 'Problem 2.2: A 5.0 kg box is initially at rest on a horizontal surface. A horizontal force of 30 N is applied to it. The coefficient of kinetic friction between the box and the surface is 0.2. (a) Will the box move? (b) If it moves, what is its acceleration?',
      timestamp: 'Me, Jun 1, 9:50 PM'
    },
    {
      id: 'assistant-1',
      type: 'assistant',
      content: `**(a) Will the box move?**

To determine if the box will move, we need to compare the applied force with the maximum static friction force.

**Step 1: Calculate the normal force**
N = mg = 5.0 kg × 9.8 m/s² = 49 N

**Step 2: Calculate the maximum static friction force**
f_s_max = μ_s × N = 0.2 × 49 N = 9.8 N

**Step 3: Compare forces**
Applied force (30 N) > Maximum static friction (9.8 N)

**Conclusion:** Yes, the box will move because the applied force exceeds the maximum static friction.

**(b) If it moves, what is its acceleration?**

Once the box starts moving, kinetic friction takes over.

**Step 1: Calculate kinetic friction force**
f_k = μ_k × N = 0.2 × 49 N = 9.8 N

**Step 2: Calculate net force**
F_net = F_applied - f_k = 30 N - 9.8 N = 20.2 N

**Step 3: Calculate acceleration**
a = F_net / m = 20.2 N / 5.0 kg = 4.04 m/s²

**Answers:**
1. Yes, the 30 N force overcomes friction, so the box moves.
2. Once sliding, its acceleration is about 4.0 m/s² (directed along the applied force).`,
      timestamp: 'Answer, GPT-4o',
      concepts: [
        {
          title: 'Kinetic Friction',
          explanation: 'Kinetic friction is the resistive force that acts against the motion of two surfaces that are already sliding against each other. Once an object starts moving, kinetic friction tries to slow it down or oppose its motion along the surface.'
        },
        {
          title: 'Free Body Diagram (FBD)',
          explanation: 'A free-body diagram (FBD) is a simple, essential tool in physics used to analyze the forces acting on a single object. It is a diagram that shows all the external forces acting on one object, isolated from everything else.'
        }
      ]
    },
    {
      id: 'user-2',
      type: 'user',
      content: 'What if the coefficient of static friction is different from the coefficient of kinetic friction? How would that change the analysis?',
      timestamp: 'Me, Jun 1, 10:15 PM'
    },
    {
      id: 'assistant-2',
      type: 'assistant',
      content: `**Great follow-up question!** The coefficients of static and kinetic friction are indeed typically different, and this significantly affects the analysis.

**Key Differences:**
- **Static friction coefficient (μ_s)**: Usually higher than kinetic friction coefficient (μ_k)
- **Kinetic friction coefficient (μ_k)**: Lower than static friction, typically 70-90% of static friction

**How this changes the analysis:**

**Step 1: Check if the box moves**
- Use μ_s for the initial "will it move?" calculation
- f_s_max = μ_s × N (where μ_s > μ_k)

**Step 2: Calculate acceleration once moving**
- Use μ_k for the acceleration calculation
- f_k = μ_k × N (where μ_k < μ_s)

**Example with different coefficients:**
If μ_s = 0.3 and μ_k = 0.2:
- Static friction: f_s_max = 0.3 × 49 N = 14.7 N
- Since 30 N > 14.7 N, the box still moves
- Kinetic friction: f_k = 0.2 × 49 N = 9.8 N
- Net force: F_net = 30 N - 9.8 N = 20.2 N
- Acceleration: a = 20.2 N / 5.0 kg = 4.04 m/s²

**Important insight:** The acceleration remains the same once moving, but the threshold force to start motion increases with higher static friction.`,
      timestamp: 'Answer, GPT-4o',
      concepts: [
        {
          title: 'Static vs Kinetic Friction',
          explanation: 'Static friction prevents motion and is typically higher than kinetic friction. Once an object starts moving, kinetic friction takes over and is usually lower, which is why it\'s easier to keep something moving than to start it moving.'
        },
        {
          title: 'Friction Coefficients',
          explanation: 'The coefficient of friction is a dimensionless scalar value that describes the ratio of the force of friction between two bodies and the normal force pressing them together. Different materials have different coefficients.'
        }
      ]
    }
  ];

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      // Placeholder for submit functionality
      console.log('Submit:', followUpQuestion);
      setFollowUpQuestion('');
    }
  };

  const toggleProfile = () => {
    setProfileSelected(!profileSelected);
  };

  const toggleReference = () => {
    setReferenceSelected(!referenceSelected);
  };

  // Render the main response content for a message
  const renderMessageContent = (message: ConversationMessage) => {
    if (message.type === 'user') {
      return (
        <div className="problem-help-response-question">
          <span className="problem-help-response-question-date">
            {message.timestamp}
          </span>
          <div className="problem-help-response-question-box">
            <span className="problem-help-response-question-text">
              {message.content}
            </span>
          </div>
        </div>
      );
    }

    // Assistant message
    return (
      <div className="problem-help-response-answer">
        <div className="problem-help-response-answer-header">
          <span className="problem-help-response-answer-title">{message.timestamp}</span>
          <div className="problem-help-response-solution-tag">Solution</div>
        </div>
        
        <div className="problem-help-response-answer-content">
          {/* Main Solution - No box wrapper */}
          <div className="problem-help-response-solution">
            <MarkdownRenderer 
              content={message.content}
              variant="response"
              className="text-sm leading-relaxed"
            />
          </div>
          
          {/* Key Concepts Sidebar */}
          {message.concepts && message.concepts.length > 0 && (
            <div className="problem-help-response-concepts">
              {message.concepts.map((concept, index) => (
                <div key={index} className="problem-help-response-concept-box">
                  <div className="problem-help-response-concept-header">
                    <img
                      src="/workspace/problemSolver/related-concepts.svg"
                      alt="Related concepts"
                      className="problem-help-response-concept-icon"
                    />
                    <span className="problem-help-response-concept-title">{concept.title}</span>
                  </div>
                  <div className="problem-help-response-concept-body">
                    <p className="problem-help-response-concept-text">
                      {concept.explanation}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="problem-help-response-actions">
          <button className="problem-help-response-action-button">
            <img
              src="/workspace/copy.svg"
              alt="Copy"
              className="problem-help-response-action-icon"
            />
          </button>
          <button className="problem-help-response-action-button">
            <img
              src="/workspace/documentChat/thumbsup.svg"
              alt="Thumbs up"
              className="problem-help-response-action-icon"
            />
          </button>
          <button className="problem-help-response-action-button">
            <img
              src="/workspace/documentChat/thumbsdown.svg"
              alt="Thumbs down"
              className="problem-help-response-action-icon"
            />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="problem-help-response">
      {/* Header Section */}
      <header className="problem-help-response-header">
        {/* Left-aligned elements */}
        <div className="problem-help-response-header-left">
          {/* Back Arrow */}
          <button
            onClick={() => switchToProblemHelp(pageIdx, screenId, tabIdx)}
            className="problem-help-response-back-button"
            aria-label="Go back to problem help entry"
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path 
                d="M17.4168 10.9999H4.5835M4.5835 10.9999L11.0002 17.4166M4.5835 10.9999L11.0002 4.58325" 
                stroke="#00276C" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {/* Conversation Title */}
          <h1 className="problem-help-response-title">
            Problem Help: Solving the derivatives
          </h1>

          {/* Conversation Tag */}
          <div className="problem-help-response-tag">
            <span className="problem-help-response-tag-text">
              Conversation
            </span>
          </div>
        </div>

        {/* Right-aligned elements */}
        <div className="problem-help-response-header-right">
          {/* Share Icon */}
          <button
            className="problem-help-response-action-button"
            aria-label="Share conversation"
          >
            <img
              src="/workspace/share.svg"
              alt="Share"
              className="problem-help-response-action-icon"
            />
          </button>

          {/* Print Icon */}
          <button
            className="problem-help-response-action-button"
            aria-label="Print conversation"
          >
            <img
              src="/workspace/print.svg"
              alt="Print"
              className="problem-help-response-action-icon"
            />
          </button>

          {/* Publish to Community Button */}
          <button
            className="problem-help-response-publish-button"
            aria-label="Publish to community"
          >
            <img
              src="/workspace/publish.svg"
              alt="Publish"
              className="problem-help-response-publish-icon"
            />
            <span className="problem-help-response-publish-text">
              Publish to Community
            </span>
          </button>
        </div>
      </header>

      {/* Main Content Section */}
      <div className="problem-help-response-main-frame">
        <div className="problem-help-response-conversation-main" ref={conversationMainRef}>
          <div className="problem-help-response-conversation-groups">
            {conversationHistory.map((message) => (
              <div key={message.id} className="problem-help-response-conversation-group">
                {renderMessageContent(message)}
              </div>
            ))}
          </div>
        </div>
        <div className="problem-help-response-input-section">
          <div className={`problem-help-response-input-box ${isInputFocused ? 'focused' : ''}`}>
            <textarea
              className="problem-help-response-input"
              placeholder="Follow up on this question or start a new one..."
              value={followUpQuestion}
              onChange={(e) => setFollowUpQuestion(e.target.value)}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
              onKeyPress={handleKeyPress}
            />
            <div className="problem-help-response-buttons">
              <button 
                className={`problem-help-response-button ${profileSelected ? 'selected' : ''}`}
                onClick={toggleProfile}
                title="Select Profile" 
              >
                <img 
                  src="/workspace/deepLearn/contacts-line.svg" 
                  alt="Profile" 
                  className="problem-help-response-button-icon"
                  style={{ filter: profileSelected ? 'brightness(0) invert(1)' : 'brightness(0) saturate(100%) invert(39%) sepia(0%) saturate(0%) hue-rotate(147deg) brightness(94%) contrast(87%)' }}
                />
              </button>
              <button 
                className={`problem-help-response-button ${referenceSelected ? 'selected' : ''}`}
                onClick={toggleReference}
                title="Select References" 
              >
                <img 
                  src="/workspace/deepLearn/folder.svg" 
                  alt="References" 
                  className="problem-help-response-button-icon"
                  style={{ filter: referenceSelected ? 'brightness(0) invert(1)' : 'brightness(0) saturate(100%) invert(39%) sepia(0%) saturate(0%) hue-rotate(147deg) brightness(94%) contrast(87%)' }}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Custom scrollbar positioned at tab level */}
      <div className="problem-help-response-custom-scrollbar">
        <div className="problem-help-response-custom-scrollbar-track">
          <div 
            className="problem-help-response-custom-scrollbar-thumb"
            ref={scrollbarThumbRef}
          />
        </div>
      </div>
    </div>
  );
}

export default ProblemHelpResponse;
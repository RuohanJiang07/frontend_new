import React from 'react';
import { useState } from 'react';
import './ProblemHelp.css';

// Sample history data for demonstration
const SAMPLE_HISTORY = [
  {
    id: '1',
    title: 'Calculate the force required to move a 50kg box up a 30-degree incline with a coefficient of friction of 0.25',
    type: 'step-by-step',
    date: 'Apr 18, 2025, 12:56 PM',
    query: 'Calculate the force required to move a 50kg box up a 30-degree incline with a coefficient of friction of 0.25',
    response: 'To solve this problem, we need to analyze the forces acting on the box and use Newton\'s laws of motion.\n\n**Step 1: Draw a free-body diagram**\nThe box experiences several forces:\n- Weight (W = mg) acting downward\n- Normal force (N) perpendicular to the incline\n- Applied force (F) parallel to the incline\n- Friction force (f) opposing motion\n\n**Step 2: Break down the weight into components**\nW_parallel = mg sin(30°) = 50 × 9.8 × 0.5 = 245 N\nW_perpendicular = mg cos(30°) = 50 × 9.8 × 0.866 = 424.3 N\n\n**Step 3: Calculate the normal force**\nN = W_perpendicular = 424.3 N\n\n**Step 4: Calculate the friction force**\nf = μN = 0.25 × 424.3 = 106.1 N\n\n**Step 5: Apply Newton\'s second law**\nF - W_parallel - f = ma\nF = ma + W_parallel + f\n\nSince the box moves at constant velocity, a = 0:\nF = 0 + 245 + 106.1 = 351.1 N\n\n**Answer:** The force required is approximately 351 N.'
  },
  {
    id: '2',
    title: 'Find the derivative of f(x) = sin(x²) using the chain rule',
    type: 'solution',
    date: 'Apr 17, 2025, 10:23 AM',
    query: 'Find the derivative of f(x) = sin(x²) using the chain rule',
    response: 'To find the derivative of f(x) = sin(x²), we\'ll use the chain rule.\n\n**Step 1: Identify the inner and outer functions**\n- Outer function: sin(u)\n- Inner function: u = x²\n\n**Step 2: Apply the chain rule**\nThe chain rule states: d/dx[sin(u)] = cos(u) × du/dx\n\n**Step 3: Calculate the derivatives**\n- d/dx[sin(u)] = cos(u)\n- du/dx = d/dx[x²] = 2x\n\n**Step 4: Combine using the chain rule**\nf\'(x) = cos(x²) × 2x = 2x cos(x²)\n\n**Answer:** f\'(x) = 2x cos(x²)'
  },
  {
    id: '3',
    title: 'Solve the quadratic equation 3x² + 5x - 2 = 0 using the quadratic formula',
    type: 'step-by-step',
    date: 'Apr 16, 2025, 3:45 PM',
    query: 'Solve the quadratic equation 3x² + 5x - 2 = 0 using the quadratic formula',
    response: 'To solve the quadratic equation 3x² + 5x - 2 = 0, we\'ll use the quadratic formula.\n\n**Step 1: Identify the coefficients**\n- a = 3\n- b = 5\n- c = -2\n\n**Step 2: Write the quadratic formula**\nx = (-b ± √(b² - 4ac)) / (2a)\n\n**Step 3: Calculate the discriminant**\nΔ = b² - 4ac = 5² - 4(3)(-2) = 25 + 24 = 49\n\n**Step 4: Substitute values into the formula**\nx = (-5 ± √49) / (2 × 3)\nx = (-5 ± 7) / 6\n\n**Step 5: Calculate both solutions**\nx₁ = (-5 + 7) / 6 = 2/6 = 1/3\nx₂ = (-5 - 7) / 6 = -12/6 = -2\n\n**Answer:** x = 1/3 or x = -2'
  },
  {
    id: '4',
    title: 'Calculate the electric field at a point 10cm away from a point charge of 5μC',
    type: 'solution',
    date: 'Apr 15, 2025, 9:12 AM',
    query: 'Calculate the electric field at a point 10cm away from a point charge of 5μC',
    response: 'To calculate the electric field from a point charge, we\'ll use Coulomb\'s law.\n\n**Step 1: Write the formula for electric field**\nE = k|q| / r²\nwhere:\n- k = 8.99 × 10⁹ N⋅m²/C² (Coulomb\'s constant)\n- q = charge\n- r = distance\n\n**Step 2: Convert units**\n- q = 5μC = 5 × 10⁻⁶ C\n- r = 10cm = 0.1m\n\n**Step 3: Substitute values**\nE = (8.99 × 10⁹) × (5 × 10⁻⁶) / (0.1)²\nE = (8.99 × 10⁹) × (5 × 10⁻⁶) / 0.01\nE = 4.495 × 10⁴ / 0.01\nE = 4.495 × 10⁶ N/C\n\n**Answer:** The electric field is 4.495 × 10⁶ N/C'
  },
  {
    id: '5',
    title: 'Find the volume of a cone with height 12cm and base radius 5cm',
    type: 'step-by-step',
    date: 'Apr 14, 2025, 2:30 PM',
    query: 'Find the volume of a cone with height 12cm and base radius 5cm',
    response: 'To find the volume of a cone, we\'ll use the formula V = (1/3)πr²h.\n\n**Step 1: Identify the given values**\n- Height (h) = 12cm\n- Base radius (r) = 5cm\n\n**Step 2: Write the volume formula**\nV = (1/3)πr²h\n\n**Step 3: Substitute the values**\nV = (1/3)π(5)²(12)\nV = (1/3)π(25)(12)\nV = (1/3)π(300)\nV = 100π\n\n**Step 4: Calculate the numerical value**\nV ≈ 100 × 3.14159 ≈ 314.16 cm³\n\n**Answer:** The volume is approximately 314.16 cm³'
  },
  {
    id: '6',
    title: 'Determine the pH of a solution with hydrogen ion concentration of 3.2 × 10⁻⁵ mol/L',
    type: 'solution',
    date: 'Apr 13, 2025, 11:18 AM',
    query: 'Determine the pH of a solution with hydrogen ion concentration of 3.2 × 10⁻⁵ mol/L',
    response: 'To determine the pH of a solution, we\'ll use the pH formula.\n\n**Step 1: Write the pH formula**\npH = -log[H⁺]\nwhere [H⁺] is the hydrogen ion concentration\n\n**Step 2: Substitute the given value**\npH = -log(3.2 × 10⁻⁵)\n\n**Step 3: Use logarithm properties**\npH = -[log(3.2) + log(10⁻⁵)]\npH = -[log(3.2) + (-5)]\npH = -log(3.2) + 5\n\n**Step 4: Calculate log(3.2)**\nlog(3.2) ≈ 0.505\n\n**Step 5: Calculate pH**\npH = -0.505 + 5 = 4.495\n\n**Answer:** The pH is approximately 4.50'
  },
  {
    id: '7',
    title: 'Calculate the momentum of a 2kg object moving at 5 m/s',
    type: 'step-by-step',
    date: 'Apr 12, 2025, 4:05 PM',
    query: 'Calculate the momentum of a 2kg object moving at 5 m/s',
    response: 'To calculate the momentum of an object, we\'ll use the formula p = mv.\n\n**Step 1: Write the momentum formula**\np = mv\nwhere:\n- p = momentum\n- m = mass\n- v = velocity\n\n**Step 2: Identify the given values**\n- Mass (m) = 2kg\n- Velocity (v) = 5 m/s\n\n**Step 3: Substitute values into the formula**\np = (2kg) × (5 m/s)\n\n**Step 4: Calculate the momentum**\np = 10 kg⋅m/s\n\n**Answer:** The momentum is 10 kg⋅m/s'
  },
  {
    id: '8',
    title: 'Find the equivalent resistance of three resistors (10Ω, 15Ω, and 20Ω) connected in parallel',
    type: 'solution',
    date: 'Apr 11, 2025, 1:40 PM',
    query: 'Find the equivalent resistance of three resistors (10Ω, 15Ω, and 20Ω) connected in parallel',
    response: 'To find the equivalent resistance of resistors in parallel, we\'ll use the formula 1/R_eq = 1/R₁ + 1/R₂ + 1/R₃.\n\n**Step 1: Write the parallel resistance formula**\n1/R_eq = 1/R₁ + 1/R₂ + 1/R₃\n\n**Step 2: Identify the resistor values**\n- R₁ = 10Ω\n- R₂ = 15Ω\n- R₃ = 20Ω\n\n**Step 3: Substitute values**\n1/R_eq = 1/10 + 1/15 + 1/20\n\n**Step 4: Find common denominator and add fractions**\n1/R_eq = 6/60 + 4/60 + 3/60 = 13/60\n\n**Step 5: Solve for R_eq**\nR_eq = 60/13 ≈ 4.62Ω\n\n**Answer:** The equivalent resistance is approximately 4.62Ω'
  }
];

import { useTabContext } from '../../../workspaceFrame/TabContext';

interface ProblemHelpProps {
  isSplit?: boolean;
  onBack?: () => void;
  onViewChange?: (view: string | null) => void;
  tabIdx?: number;
  pageIdx?: number;
  screenId?: string;
}

function ProblemHelp({ isSplit = false, onBack, onViewChange, tabIdx = 0, pageIdx = 0, screenId = '' }: ProblemHelpProps) {
  const { switchToProblemHelp, switchToProblemHelpResponse } = useTabContext();
  const [inputValue, setInputValue] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [profileSelected, setProfileSelected] = useState(false);
  const [isUploadHovered, setIsUploadHovered] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleProfile = () => {
    setProfileSelected(!profileSelected);
  };

  const handleUploadClick = () => {
    // Handle upload functionality here
    console.log('Upload clicked');
  };

  // Handle clicking on a history card
  const handleHistoryCardClick = (historyItem: any) => {
    // Generate a unique tab ID for this history item
    const tabId = window.location.pathname + window.location.search;
    
    // Store the history data in localStorage for the response page to load
    localStorage.setItem(`problemhelp_history_data_${tabId}`, JSON.stringify([{
      id: historyItem.id,
      user_query: historyItem.query,
      llm_response: historyItem.response,
      time: new Date(historyItem.date).toISOString(),
      conversation_id: `history-${historyItem.id}`
    }]));
    
    // Mark this as a history conversation
    localStorage.setItem(`problemhelp_history_loaded_${tabId}`, 'true');
    
    // Store the conversation ID
    localStorage.setItem(`problemhelp_conversation_${tabId}`, `history-${historyItem.id}`);
    
    // Navigate to the response page
    switchToProblemHelpResponse(pageIdx, screenId, tabIdx);
  };

  // Filter history based on search query
  const filteredHistory = SAMPLE_HISTORY.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle sending a new query
  const handleSendQuery = () => {
    if (!inputValue.trim()) return;
    const tabId = window.location.pathname + window.location.search;
    // Store the query in localStorage for the response page to load
    localStorage.setItem(`problemhelp_history_data_${tabId}`,
      JSON.stringify([
        {
          id: 'new',
          user_query: inputValue,
          llm_response: '',
          time: new Date().toISOString(),
          conversation_id: `new-${Date.now()}`
        }
      ])
    );
    localStorage.setItem(`problemhelp_history_loaded_${tabId}`, 'true');
    localStorage.setItem(`problemhelp_conversation_${tabId}`, `new-${Date.now()}`);
    // Navigate to the response page
    switchToProblemHelpResponse(pageIdx, screenId, tabIdx);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendQuery();
    }
  };

  return (
    <div className="problem-help-container">
      {/* Header Section */}
      <div className="problem-help-header">
        <img
          src="/workspace/problemHelp/problemHelp.svg"
          alt="Problem Help Icon"
          className="problem-help-header-icon"
        />
        <div className="problem-help-header-text">
          <h1 className="problem-help-title font-outfit">Problem Help</h1>
          <p className="problem-help-subtitle font-outfit">It's ok to not understand every problem</p>
        </div>
      </div>

      {/* Upload Section */}
      <div className="problem-help-upload-section">
        <div 
          className="problem-help-upload-box"
          onClick={handleUploadClick}
          onMouseEnter={() => setIsUploadHovered(true)}
          onMouseLeave={() => setIsUploadHovered(false)}
        >
          <img
            src="/workspace/problemHelp/upload.svg"
            alt="Upload Icon"
            className="problem-help-upload-icon"
          />
          <span className="problem-help-upload-text">
            Drag or select additional contents here
          </span>
        </div>
      </div>

      {/* Input Section */}
      <div className="problem-help-input-section">
        {/* Input Box */}
        <div className={`problem-help-input-box ${isInputFocused ? 'focused' : ''}`}>          
          <textarea
            className="problem-help-input"
            placeholder="Enter your problem here..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setIsInputFocused(false)}
            onKeyDown={handleInputKeyDown}
          />

          {/* Model Selection Dropdown */}
          <div className="problem-help-model-dropdown">
            <img
              src="/workspace/problemHelp/stack-line.svg"
              alt="Model Icon"
              className="problem-help-model-icon"
            />
            <span className="problem-help-model-text">
              GPT-4o
            </span>
            <svg 
              width="19" 
              height="19" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="#4C6694" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="problem-help-dropdown-arrow"
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
          
          {/* Buttons at the bottom right */}
          <div className="problem-help-buttons">
            {/* Profile Button */}
            <button 
              className={`problem-help-button ${profileSelected ? 'selected' : ''}`}
              onClick={toggleProfile}
              title="Select Profile" 
            >
              <img 
                src="/workspace/deepLearn/contacts-line.svg" 
                alt="Profile" 
                className="problem-help-button-icon"
                style={{ filter: profileSelected ? 'brightness(0) invert(1)' : 'brightness(0) saturate(100%) invert(39%) sepia(0%) saturate(0%) hue-rotate(147deg) brightness(94%) contrast(87%)' }}
              />
            </button>

            {/* Separator Line */}
            <div className="problem-help-button-separator"></div>

            {/* Send Button */}
            <button 
              className={`problem-help-send-button ${inputValue.trim() ? 'active' : ''}`}
              onClick={handleSendQuery}
              disabled={!inputValue.trim()}
              title="Send Query" 
            >
              <img 
                src="/workspace/arrow-up.svg" 
                alt="Send" 
                className="problem-help-send-icon"
              />
            </button>
          </div>
        </div>
      </div>

      {/* History Section */}
      <div className="problem-help-history-section">
        <div className="problem-help-history-header">
          <div className="problem-help-history-title">
            <img 
              src="/workspace/deepLearn/history.svg" 
              alt="History Icon"
              className="deep-learn-tab-button-icon"
              style={{ width: '20px', height: '20px', filter: 'brightness(0) saturate(100%) invert(32%) sepia(9%) saturate(2096%) hue-rotate(182deg) brightness(93%) contrast(87%)' }}
            />
            My History
          </div>
          <div className="problem-help-search-container">
            <img
              src="/workspace/problemHelp/search.svg"
              alt="Search Icon"
              className="problem-help-search-icon"
            />
            <input
              type="text"
              className="problem-help-search-input"
              placeholder="Search in workspace..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* History Cards Section - Independent frame */}
      <div className={`problem-help-cards-container ${isSplit ? 'split' : ''}`}>
        {filteredHistory.map((item) => (
          <div 
            key={item.id} 
            className="problem-help-card"
            onClick={() => handleHistoryCardClick(item)}
            style={{ cursor: 'pointer' }}
          >
            <div className="problem-help-card-title">
              {item.title}
            </div>
            <div className="problem-help-card-detail">
              <div className={`problem-help-card-tag ${item.type}`}>
                {item.type === 'step-by-step' ? 'Step-by-step' : 'Solution'}
              </div>
              <div className="problem-help-card-date">
                <img
                  src="/workspace/problemHelp/calendar.svg"
                  alt="Calendar"
                  className="problem-help-card-date-icon"
                />
                <span className="problem-help-card-date-text">
                  {item.date}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProblemHelp;
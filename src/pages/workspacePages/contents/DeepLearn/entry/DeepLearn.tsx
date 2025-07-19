import React from 'react';
import { useState } from 'react';
import './DeepLearn.css';
import { useEffect } from 'react';

interface DeepLearnProps {
  isSplit?: boolean;
  onBack?: () => void;
  onViewChange?: (view: string | null) => void;
}

interface TrendingTopic {
  id: string;
  title: string;
  imageUrl: string;
  author: string;
  heat: number;
}

function DeepLearn({ isSplit = false, onBack, onViewChange }: DeepLearnProps) {
  const [selectedMode, setSelectedMode] = useState<'deep-learn' | 'quick-search'>('deep-learn');
  const [selectedTab, setSelectedTab] = useState<'trending' | 'history'>('trending');
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [profileSelected, setProfileSelected] = useState(false);
  const [referenceSelected, setReferenceSelected] = useState(false);
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);
  const [historyItems, setHistoryItems] = useState<any[]>([]);

  // Load trending topics on component mount
  useEffect(() => {
    // In a real app, this would be an API call
    const mockTrendingTopics: TrendingTopic[] = [
      {
        id: '1',
        title: 'Quantum Mechanics: Understanding Wave-Particle Duality',
        imageUrl: 'https://images.pexels.com/photos/3844788/pexels-photo-3844788.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        author: 'Physics Today',
        heat: 1243
      },
      {
        id: '2',
        title: 'Machine Learning Fundamentals: Neural Networks Explained',
        imageUrl: 'https://images.pexels.com/photos/373543/pexels-photo-373543.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        author: 'AI Research',
        heat: 982
      },
      {
        id: '3',
        title: 'Climate Change: Understanding Global Warming Mechanisms',
        imageUrl: 'https://images.pexels.com/photos/1072824/pexels-photo-1072824.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        author: 'Earth Science',
        heat: 876
      },
      {
        id: '4',
        title: 'Blockchain Technology: Beyond Cryptocurrencies',
        imageUrl: 'https://images.pexels.com/photos/8370752/pexels-photo-8370752.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        author: 'Tech Insights',
        heat: 754
      },
      {
        id: '5',
        title: 'Genetic Engineering: CRISPR and the Future of Medicine',
        imageUrl: 'https://images.pexels.com/photos/3825578/pexels-photo-3825578.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        author: 'BioTech Review',
        heat: 689
      },
      {
        id: '6',
        title: 'Astrophysics: Black Holes and Gravitational Waves',
        imageUrl: 'https://images.pexels.com/photos/5086477/pexels-photo-5086477.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        author: 'Space Science',
        heat: 632
      }
    ];
    
    setTrendingTopics(mockTrendingTopics);

    // Mock history items
    const mockHistoryItems = [
      {
        id: '1',
        title: 'Machine Learning Fundamentals',
        date: '2024-01-15',
        query: 'What are the basics of machine learning?'
      },
      {
        id: '2',
        title: 'Quantum Computing Explained',
        date: '2024-01-10',
        query: 'How does quantum computing work?'
      },
      {
        id: '3',
        title: 'Blockchain Technology',
        date: '2024-01-05',
        query: 'What is blockchain and how does it work?'
      }
    ];
    
    setHistoryItems(mockHistoryItems);
  }, []);

  const toggleMode = (mode: 'deep-learn' | 'quick-search') => {
    setSelectedMode(mode);
  };

  const toggleWebSearch = () => {
    setWebSearchEnabled(!webSearchEnabled);
  };

  const toggleProfile = () => {
    setProfileSelected(!profileSelected);
  };

  const toggleReference = () => {
    setReferenceSelected(!referenceSelected);
  };

  const toggleTab = (tab: 'trending' | 'history') => {
    setSelectedTab(tab);
  };

  // Handle navigation to response page
  const handleNavigateToResponse = () => {
    if (inputValue.trim()) {
      onViewChange?.('deep-learn-response');
    }
  };

  // Handle history item click
  const handleHistoryItemClick = (historyItem: any) => {
    onViewChange?.('deep-learn-response');
  };

  // Handle trending topic click
  const handleTrendingTopicClick = (topic: TrendingTopic) => {
    setInputValue(topic.title);
    // Optionally navigate to response page immediately
    // onViewChange?.('deep-learn-response');
  };

  return (
    <div className="deep-learn-container">
      {/* Header Section */}
      <div className="deep-learn-header">
        <img
          src="/workspace/deepLearn/deepLearn.svg"
          alt="Deep Learn Icon"
          className="deep-learn-header-icon"
        />
        <div className="deep-learn-header-text">
          <h1 className="deep-learn-title font-outfit">Deep Learn</h1>
          <p className="deep-learn-subtitle font-outfit">Your go-to place to study new concepts</p>
        </div>
      </div>

      {/* Input Section */}
      <div className="deep-learn-input-section">
        <div className="mode-toggle-container">
          {/* Mode Toggle */}
          <div className="mode-toggle">
            <div 
              className={`mode-toggle-slider ${selectedMode === 'deep-learn' ? '' : 'translate-x-full'}`}
            ></div>
            <div 
              className={`mode-toggle-option ${selectedMode === 'deep-learn' ? 'selected' : 'unselected'}`}
              onClick={() => toggleMode('deep-learn')}
            >
              <img 
                src="/workspace/deepLearn/lens-stars.svg" 
                alt="Deep Learn Icon" 
                className="mode-toggle-icon"
                style={{ filter: selectedMode === 'deep-learn' ? 'brightness(0) invert(1)' : 'brightness(0) saturate(100%) invert(32%) sepia(9%) saturate(2096%) hue-rotate(182deg) brightness(93%) contrast(87%)' }}
              />
              <span className="font-['SF_Pro',sans-serif] text-[15px]">Deep Learn</span>
            </div>
            <div 
              className={`mode-toggle-option ${selectedMode === 'quick-search' ? 'selected' : 'unselected'}`}
              onClick={() => toggleMode('quick-search')}
            >
              <img 
                src="/workspace/deepLearn/lens-check.svg" 
                alt="Quick Search Icon" 
                className="mode-toggle-icon"
                style={{ filter: selectedMode === 'quick-search' ? 'brightness(0) invert(1)' : 'brightness(0) saturate(100%) invert(32%) sepia(9%) saturate(2096%) hue-rotate(182deg) brightness(93%) contrast(87%)' }}
              />
              <span className="deep-learn-tab-button-text">My History</span>
            </div>
          </div>
          
          {/* Web Search Toggle */}
          <div 
            className={`web-search-toggle ${webSearchEnabled ? 'selected' : 'unselected'}`}
            onClick={toggleWebSearch}
          >
            <img 
              src="/workspace/deepLearn/language.svg" 
              alt="Web Search Icon"
              width="30" 
              height="30"
              style={{ filter: webSearchEnabled ? 'brightness(0) saturate(100%) invert(32%) sepia(9%) saturate(2096%) hue-rotate(182deg) brightness(93%) contrast(87%)' : 'brightness(0) saturate(100%) invert(54%) sepia(0%) saturate(0%) hue-rotate(251deg) brightness(94%) contrast(92%)' }}
            />
          </div>
        </div>
        
        {/* Input Box */}
        <div className={`deep-learn-input-box ${isInputFocused ? 'focused' : ''}`}>
          <textarea
            className="deep-learn-input"
            placeholder="Enter the topic you'd like to learn..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setIsInputFocused(false)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && inputValue.trim()) {
                e.preventDefault();
                handleNavigateToResponse();
              }
            }}
          />
          
          {/* Buttons at the bottom right */}
          <div className="deep-learn-buttons">
            {/* Profile Select Button */}
            <button 
              className={`deep-learn-button ${profileSelected ? 'selected' : ''}`}
              onClick={toggleProfile}
              title="Select Profile" 
            >
              <img 
                src="/workspace/deepLearn/contacts-line.svg" 
                alt="Profile" 
                className="deep-learn-button-icon"
                style={{ filter: profileSelected ? 'brightness(0) invert(1)' : 'brightness(0) saturate(100%) invert(39%) sepia(0%) saturate(0%) hue-rotate(147deg) brightness(94%) contrast(87%)' }}
              />
            </button>
            
            {/* Reference Select Button */}
            <button 
              className={`deep-learn-button ${referenceSelected ? 'selected' : ''}`}
              onClick={toggleReference}
              title="Select References" 
            >
              <img 
                src="/workspace/deepLearn/folder.svg" 
                alt="References" 
                className="deep-learn-button-icon"
                style={{ filter: referenceSelected ? 'brightness(0) invert(1)' : 'brightness(0) saturate(100%) invert(39%) sepia(0%) saturate(0%) hue-rotate(147deg) brightness(94%) contrast(87%)' }}
              />
            </button>

            {/* Separator Line */}
            <div className="deep-learn-button-separator"></div>

            {/* Send Button */}
            <button 
              className={`deep-learn-send-button ${inputValue.trim() ? 'active' : ''}`}
              onClick={handleNavigateToResponse}
              disabled={!inputValue.trim()}
              title="Send Query" 
            >
              <img 
                src="/workspace/arrow-up.svg" 
                alt="Send" 
                className="deep-learn-send-icon"
              />
            </button>
          </div>
        </div>
      </div>

      {/* Trending/History Section */}
      <div className="deep-learn-trending-history-section">
        <div className="deep-learn-tab-buttons">
          {/* Trending Button */}
          <div 
            className={`deep-learn-tab-button trending ${selectedTab === 'trending' ? 'selected' : ''}`}
            onClick={() => toggleTab('trending')}
          >
            <img 
              src="/workspace/deepLearn/trending.svg" 
              alt="Trending Icon" 
              className="deep-learn-tab-button-icon"
            />
            <span className="deep-learn-tab-button-text">Trending</span>
          </div>
          
          {/* My History Button - with 20x20px icon */}
          <div 
            className={`deep-learn-tab-button history ${selectedTab === 'history' ? 'selected' : ''}`}
            onClick={() => toggleTab('history')}
          >
            <img 
              src="/workspace/deepLearn/history.svg" 
              alt="My History Icon"
              className="deep-learn-tab-button-icon"
              style={{ width: '20px', height: '20px' }}
            />
            <span className="deep-learn-tab-button-text">My History</span>
          </div>
        </div>
        
        {/* Content area for selected tab */}
        <div className={`deep-learn-tab-content ${selectedTab === 'trending' ? 'tab-trending' : 'tab-history'}`}>
            <div className="deep-learn-trending-content" data-testid="trending-content">
              {/* First row of trending topics */}
              <div className="trending-row">
                {trendingTopics.slice(0, 3).map((topic, index) => (
                  <div key={topic.id} className="trending-card" onClick={() => handleTrendingTopicClick(topic)}>
                    <img 
                      src={topic.imageUrl} 
                      alt={topic.title} 
                      className="trending-card-image"
                      onError={(e) => {
                        // Handle broken images
                        const target = e.target as HTMLImageElement;
                        target.src = `https://images.pexels.com/photos/3825578/pexels-photo-3825578.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2`;
                      }}
                    />
                    <div className="trending-card-title">{topic.title}</div>
                    <div className="trending-card-footer">
                      <div className="trending-card-author">
                        <img 
                          src="/workspace/deepLearn/author.svg" 
                          alt="Author" 
                          className="trending-card-author-icon"
                        />
                        <span className="trending-card-author-text">{topic.author}</span>
                      </div>
                      <div className="trending-card-heat">
                        <img 
                          src="/workspace/deepLearn/fire-line.svg" 
                          alt="Heat" 
                          className="trending-card-heat-icon"
                        />
                        <span className="trending-card-heat-text">{topic.heat}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Second row of trending topics */}
              <div className="trending-row">
                {trendingTopics.slice(3, 6).map((topic, index) => (
                  <div key={topic.id} className="trending-card" onClick={() => handleTrendingTopicClick(topic)}>
                    <img 
                      src={topic.imageUrl} 
                      alt={topic.title} 
                      className="trending-card-image"
                      onError={(e) => {
                        // Handle broken images
                        const target = e.target as HTMLImageElement;
                        target.src = `https://images.pexels.com/photos/3825578/pexels-photo-3825578.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2`;
                      }}
                    />
                    <div className="trending-card-title">{topic.title}</div>
                    <div className="trending-card-footer">
                      <div className="trending-card-author">
                        <img 
                          src="/workspace/deepLearn/author.svg" 
                          alt="Author" 
                          className="trending-card-author-icon"
                        />
                        <span className="trending-card-author-text">{topic.author}</span>
                      </div>
                      <div className="trending-card-heat">
                        <img 
                          src="/workspace/deepLearn/fire-line.svg" 
                          alt="Heat" 
                          className="trending-card-heat-icon"
                        />
                        <span className="trending-card-heat-text">{topic.heat}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="deep-learn-history-content" data-testid="history-content">
              <div className="history-items">
                {historyItems.map((item) => (
                  <div key={item.id} className="history-item" onClick={() => handleHistoryItemClick(item)}>
                    <div className="history-item-content">
                      <div className="history-item-title">{item.title}</div>
                      <div className="history-item-query">{item.query}</div>
                      <div className="history-item-date">{item.date}</div>
                    </div>
                    <div className="history-item-arrow">
                      <img 
                        src="/workspace/deepLearn/arrow-right.svg" 
                        alt="View" 
                        className="history-item-arrow-icon"
                      />
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

export default DeepLearn;
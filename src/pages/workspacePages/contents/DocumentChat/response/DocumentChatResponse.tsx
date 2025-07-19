import React, { useEffect, useRef, useState } from 'react';
import './DocumentChatResponse.css';

interface DocumentChatResponseProps {
  isSplit?: boolean;
  onBack?: () => void;
}

interface FileItem {
  id: string;
  name: string;
  icon: string;
  checked: boolean;
}

const DocumentChatResponse: React.FC<DocumentChatResponseProps> = ({ isSplit = false, onBack }) => {
  const conversationMainRef = useRef<HTMLDivElement>(null);
  const scrollbarThumbRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(false);

  // File selection state
  const [files, setFiles] = useState<FileItem[]>([
    { id: '1', name: 'climate_research.pdf', icon: '/workspace/fileIcons/pdf.svg', checked: false },
    { id: '2', name: 'ml_nlp_guide.docx', icon: '/workspace/fileIcons/txt.svg', checked: false },
    { id: '3', name: 'renewable_energy_report.pdf', icon: '/workspace/fileIcons/pdf.svg', checked: false },
  ]);

  const [selectAll, setSelectAll] = useState(false);

  const handleBackClick = () => {
    // Navigate back to document chat entry page
    onBack?.();
  };

  // Handle Select All checkbox
  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    setFiles(files.map(file => ({ ...file, checked })));
  };

  // Handle individual file checkbox
  const handleFileCheck = (fileId: string, checked: boolean) => {
    const updatedFiles = files.map(file => 
      file.id === fileId ? { ...file, checked } : file
    );
    setFiles(updatedFiles);
    
    // Update Select All state
    const allChecked = updatedFiles.every(file => file.checked);
    setSelectAll(allChecked);
  };

  // Handle removing reference from input box
  const handleRemoveReference = (fileId: string) => {
    setFiles(files.map(file => 
      file.id === fileId ? { ...file, checked: false } : file
    ));
    
    // Update Select All state
    const allChecked = files.every(file => file.id === fileId ? false : file.checked);
    setSelectAll(allChecked);
  };

  // Get selected files for reference boxes
  const selectedFiles = files.filter(file => file.checked);

  // Update Select All state when files change
  useEffect(() => {
    const allChecked = files.every(file => file.checked);
    setSelectAll(allChecked);
  }, [files]);

  // Handle scroll events and update custom scrollbar
  useEffect(() => {
    const conversationMain = conversationMainRef.current;
    const scrollbarThumb = scrollbarThumbRef.current;
    const scrollbarContainer = document.querySelector('.document-chat-response-custom-scrollbar') as HTMLElement;
    const scrollbarTrack = document.querySelector('.document-chat-response-custom-scrollbar-track') as HTMLElement;
    
    if (!conversationMain || !scrollbarThumb || !scrollbarContainer || !scrollbarTrack) return;

    let scrollTimeout: number;

    const updateScrollbar = () => {
      const { scrollTop, scrollHeight, clientHeight } = conversationMain;
      
      // Only show scrollbar if content is scrollable
      if (scrollHeight <= clientHeight) {
        scrollbarContainer.style.display = 'none';
        return;
      }
      
      scrollbarContainer.style.display = 'block';
      
      const scrollPercentage = scrollTop / (scrollHeight - clientHeight);
      
      // Calculate scrollbar height to extend to bottom of screen
      const viewportHeight = window.innerHeight;
      const scrollbarHeight = viewportHeight - 100; // 100px is the top offset from CSS
      
      // Update scrollbar thumb position and height
      const thumbHeight = Math.max(30, (clientHeight / scrollHeight) * scrollbarHeight); // Minimum 30px height
      const maxThumbTop = scrollbarHeight - thumbHeight;
      
      scrollbarThumb.style.top = `${scrollPercentage * maxThumbTop}px`;
      scrollbarThumb.style.height = `${thumbHeight}px`;
      
      // Set scrollbar container height to extend to bottom of screen
      scrollbarContainer.style.height = `${scrollbarHeight}px`;
    };

    const handleScroll = () => {
      updateScrollbar();
      
      // Show scrollbar when scrolling
      scrollbarContainer.classList.add('scrolling');
      
      // Hide scrollbar after scrolling stops
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        scrollbarContainer.classList.remove('scrolling');
      }, 1000); // Hide after 1 second of no scrolling
    };

    // Handle clicks on scrollbar track
    const handleTrackClick = (e: MouseEvent) => {
      const { scrollHeight, clientHeight } = conversationMain;
      const scrollbarHeight = window.innerHeight - 100;
      
      // Calculate click position relative to scrollbar
      const rect = scrollbarTrack.getBoundingClientRect();
      const clickY = e.clientY - rect.top;
      const clickPercentage = clickY / scrollbarHeight;
      
      // Scroll to the clicked position
      const targetScrollTop = clickPercentage * (scrollHeight - clientHeight);
      conversationMain.scrollTop = targetScrollTop;
    };

    // Handle global wheel events for the entire tab area
    const handleGlobalWheel = (e: WheelEvent) => {
      // Check if the target is within the tab area but not in conversation-main
      const target = e.target as HTMLElement;
      const isInConversationMain = conversationMain.contains(target);
      
      // If not in conversation-main but in the tab area, control conversation-main scrolling
      if (!isInConversationMain) {
        e.preventDefault();
        
        const { scrollTop, scrollHeight, clientHeight } = conversationMain;
        const scrollDelta = e.deltaY;
        const newScrollTop = scrollTop + scrollDelta;
        
        // Ensure scroll stays within bounds
        const maxScrollTop = scrollHeight - clientHeight;
        conversationMain.scrollTop = Math.max(0, Math.min(newScrollTop, maxScrollTop));
      }
    };

    conversationMain.addEventListener('scroll', handleScroll);
    scrollbarTrack.addEventListener('click', handleTrackClick);
    window.addEventListener('wheel', handleGlobalWheel, { passive: false });
    window.addEventListener('resize', updateScrollbar);
    
    // Initial update
    updateScrollbar();

    return () => {
      conversationMain.removeEventListener('scroll', handleScroll);
      scrollbarTrack.removeEventListener('click', handleTrackClick);
      window.removeEventListener('wheel', handleGlobalWheel);
      window.removeEventListener('resize', updateScrollbar);
      clearTimeout(scrollTimeout);
    };
  }, []);

  return (
    <div className="document-chat-response">
      {/* Header Section */}
      <header className="document-chat-response-header">
        {/* Left-aligned elements */}
        <div className="document-chat-response-header-left">
          {/* Back Arrow */}
          <button
            onClick={handleBackClick}
            className="document-chat-response-back-button"
            aria-label="Go back to document chat entry"
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
          <h1 className="document-chat-response-title">
            Papers Regarding Black Hole Information Paradox
          </h1>

          {/* Conversation Tag */}
          <div className="document-chat-response-tag">
            <span className="document-chat-response-tag-text">
              Conversation
            </span>
          </div>
        </div>

        {/* Right-aligned elements */}
        <div className="document-chat-response-header-right">
          {/* Share Icon */}
          <button
            className="document-chat-response-action-button"
            aria-label="Share conversation"
          >
            <img
              src="/workspace/share.svg"
              alt="Share"
              className="document-chat-response-action-icon"
            />
          </button>

          {/* Print Icon */}
          <button
            className="document-chat-response-action-button"
            aria-label="Print conversation"
          >
            <img
              src="/workspace/print.svg"
              alt="Print"
              className="document-chat-response-action-icon"
            />
          </button>

          {/* Publish to Community Button */}
          <button
            className="document-chat-response-publish-button"
            aria-label="Publish to community"
          >
            <img
              src="/workspace/publish.svg"
              alt="Publish"
              className="document-chat-response-publish-icon"
            />
            <span className="document-chat-response-publish-text">
              Publish to Community
            </span>
          </button>
        </div>
      </header>

      {/* Main Content Section */}
      <div className="document-chat-response-main">
        <div className="document-chat-response-content">
          {/* File List Section */}
          <div className="document-chat-response-file-list">
            <div className="document-chat-response-file-list-content">
              {/* List Header */}
              <div className="document-chat-response-file-list-header">
                <span className="document-chat-response-file-list-title">
                  File Uploaded
                </span>
                <div className="document-chat-response-file-list-select-all">
                  <span className="document-chat-response-file-list-select-all-text">
                    Select All
                  </span>
                  <input
                    type="checkbox"
                    className="document-chat-response-checkbox"
                    checked={selectAll}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                </div>
              </div>

              {/* List Content */}
              <div className="document-chat-response-file-list-items">
                {files.map(file => (
                  <div key={file.id} className="document-chat-response-file-item">
                    <img
                      src={file.icon}
                      alt={file.name}
                      className="document-chat-response-file-icon"
                    />
                    <span className="document-chat-response-file-name">
                      {file.name}
                    </span>
                    <input
                      type="checkbox"
                      className="document-chat-response-checkbox"
                      checked={file.checked}
                      onChange={(e) => handleFileCheck(file.id, e.target.checked)}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Add New References Button */}
            <button className="document-chat-response-add-button">
              <img
                src="/workspace/documentChat/add.svg"
                alt="Add"
                className="document-chat-response-add-icon"
              />
              <span className="document-chat-response-add-text">
                Add New References
              </span>
            </button>
          </div>

          {/* Conversation Section */}
          <div className="document-chat-response-conversation">
            {/* Conversation Main Section */}
            <div className="document-chat-response-conversation-main" ref={conversationMainRef}>
              {/* Sample conversation group */}
              <div className="document-chat-response-conversation-groups">
                {/* First Q&A Group */}
                <div className="document-chat-response-conversation-group">
                  {/* Answer Part (User Question) */}
                  <div className="document-chat-response-question">
                    <span className="document-chat-response-question-date">
                      Me, Jun 1, 9:50PM
                    </span>
                    <div className="document-chat-response-question-box">
                      <span className="document-chat-response-question-text">
                        What are the main findings in the climate research paper?
                      </span>
                    </div>
                  </div>

                  {/* Response Part (AI Answer) */}
                  <div className="document-chat-response-answer">
                    <p className="document-chat-response-answer-text">
                      Since the 1997 proposal of the AdS/CFT correspondence, the predominant belief among physicists is that information is indeed preserved in black hole evaporation. There are broadly two main streams of thought about how this happens. Within what might broadly be termed the "string theory community", the dominant idea is that Hawking radiation is not precisely thermal but receives quantum correlations that encode information about the black hole's interior.[9] This viewpoint has been the subject of extensive recent research and received further support in 2019 when researchers amended the computation of the entropy of the Hawking radiation in certain models and showed that the radiation is in fact dual to the black hole interior at late times.[25][26] Hawking himself was influenced by this view and in 2004 published a paper that assumed the AdS/CFT correspondence and argued that quantum perturbations of the event horizon could allow information to escape from a black hole, which would resolve the information paradox.[27] In this perspective, it is the event horizon of the black hole that is important and not the black-hole singularity. The GISR (Gravity Induced Spontaneous Radiation) mechanism of references[28][29] can be considered an implementation of this idea but with the quantum perturbations of the event horizon replaced by the microscopic states of the black hole.
                    </p>
                    
                    {/* User Actions */}
                    <div className="document-chat-response-actions">
                      <button className="document-chat-response-action-button">
                        <img
                          src="/workspace/copy.svg"
                          alt="Copy"
                          className="document-chat-response-action-icon"
                        />
                      </button>
                      <button className="document-chat-response-action-button">
                        <img
                          src="/workspace/documentChat/thumbsup.svg"
                          alt="Thumbs up"
                          className="document-chat-response-action-icon"
                        />
                      </button>
                      <button className="document-chat-response-action-button">
                        <img
                          src="/workspace/documentChat/thumbsdown.svg"
                          alt="Thumbs down"
                          className="document-chat-response-action-icon"
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Second Q&A Group */}
                <div className="document-chat-response-conversation-group">
                  {/* Answer Part (User Question) */}
                  <div className="document-chat-response-question">
                    <span className="document-chat-response-question-date">
                      Me, Jun 1, 10:15PM
                    </span>
                    <div className="document-chat-response-question-box">
                      <span className="document-chat-response-question-text">
                        How do these findings compare to previous studies?
                      </span>
                    </div>
                  </div>

                  {/* Response Part (AI Answer) */}
                  <div className="document-chat-response-answer">
                    <p className="document-chat-response-answer-text">
                      The findings in this study show a 40% acceleration in warming rates compared to previous research from 2010-2020. This represents a significant deviation from earlier projections, suggesting that climate change impacts are occurring faster than initially predicted by most models.
                    </p>
                    
                    {/* User Actions */}
                    <div className="document-chat-response-actions">
                      <button className="document-chat-response-action-button">
                        <img
                          src="/workspace/copy.svg"
                          alt="Copy"
                          className="document-chat-response-action-icon"
                        />
                      </button>
                      <button className="document-chat-response-action-button">
                        <img
                          src="/workspace/documentChat/thumbsup.svg"
                          alt="Thumbs up"
                          className="document-chat-response-action-icon"
                        />
                      </button>
                      <button className="document-chat-response-action-button">
                        <img
                          src="/workspace/documentChat/thumbsdown.svg"
                          alt="Thumbs down"
                          className="document-chat-response-action-icon"
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Input Box Section */}
            <div className="document-chat-response-input-section">
              {/* Selected References Part */}
              <div className="document-chat-response-references">
                {selectedFiles.map(file => (
                  <div key={file.id} className="document-chat-response-reference-box">
                    <span className="document-chat-response-reference-text">
                      {file.name}
                    </span>
                    <button 
                      className="document-chat-response-remove-button"
                      onClick={() => handleRemoveReference(file.id)}
                    >
                      <img
                        src="/workspace/documentChat/remove.svg"
                        alt="Remove"
                        className="document-chat-response-remove-icon"
                      />
                    </button>
                  </div>
                ))}
              </div>

              {/* Input Area */}
              <div className="document-chat-response-input-box">
                <textarea
                  className="document-chat-response-input"
                  placeholder="Type your question here..."
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom scrollbar positioned at tab level */}
      <div className="document-chat-response-custom-scrollbar">
        <div className="document-chat-response-custom-scrollbar-track">
          <div 
            className="document-chat-response-custom-scrollbar-thumb"
            ref={scrollbarThumbRef}
          />
        </div>
      </div>
    </div>
  );
};

export default DocumentChatResponse;

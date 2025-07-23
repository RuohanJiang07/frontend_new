import React, { useEffect, useState } from 'react';
import { useRef } from 'react';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import FontFamily from '@tiptap/extension-font-family';
import { useTabContext } from '../../../workspaceFrame/TabContext';
import { getNoteContent, saveNoteContent } from '../../../../../api/workspaces/note/note';
import { useToast } from '../../../../../hooks/useToast';
import NoteCopilotButton from './NoteCopilotButton';
import NoteEditorTopToolbar from './NoteEditorTopToolbar';
import './style/NoteEditor.css';

interface NoteEditorProps {
  onBack: () => void;
  tabIdx?: number;
  pageIdx?: number;
  screenId?: string;
}

function NoteEditor({ onBack, tabIdx = 0, pageIdx = 0, screenId = '' }: NoteEditorProps) {
  const { switchToNote, getActiveScreens, activePage } = useTabContext();
  const { error, success } = useToast();
  const [zoomLevel, setZoomLevel] = useState(1);
  const [lineCount, setLineCount] = useState(1);
  const [lineHeights, setLineHeights] = useState<number[]>([]);
  const [noteData, setNoteData] = useState<{
    noteId: string;
    noteName: string;
    workspaceId: string;
    timestamp: string;
  } | null>(null);
  const [noteContent, setNoteContent] = useState<string>('');
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Function to fetch note content
  const fetchNoteContent = async (noteId: string, workspaceId: string) => {
    setIsLoadingContent(true);
    try {
      const response = await getNoteContent({
        workspace_id: workspaceId,
        file_id: noteId
      });
      
      if (response.success) {
        setNoteContent(response.content);
      } else {
        error('Failed to load note content');
      }
    } catch (err) {
      console.error('Error fetching note content:', err);
      error('Failed to load note content');
    } finally {
      setIsLoadingContent(false);
    }
  };

  // Function to save note content
  const handleSave = async () => {
    if (!noteData || !editor) return;
    
    setIsSaving(true);
    try {
      const content = editor.getHTML();
      const response = await saveNoteContent({
        workspace_id: noteData.workspaceId,
        file_id: noteData.noteId,
        content: content
      });
      
      if (response.success) {
        success('Note saved successfully!');
      } else {
        error('Failed to save note');
      }
    } catch (err) {
      console.error('Error saving note:', err);
      error('Failed to save note');
    } finally {
      setIsSaving(false);
    }
  };

  // Get note data from localStorage when component mounts
  useEffect(() => {
    const storedNoteData = localStorage.getItem('current_note_data');
    if (storedNoteData) {
      try {
        const parsedData = JSON.parse(storedNoteData);
        setNoteData(parsedData);
        // Clear the data from localStorage after reading it
        localStorage.removeItem('current_note_data');
        
        // Fetch note content if we have note data
        if (parsedData.noteId && parsedData.workspaceId) {
          fetchNoteContent(parsedData.noteId, parsedData.workspaceId);
        }
      } catch (error) {
        console.error('Error parsing note data:', error);
      }
    }
  }, []);
  
  // 检测分屏模式 - 直接使用，不需要延迟
  const activeScreens = getActiveScreens(activePage);
  const isInSplitMode = activeScreens.length > 1 && !activeScreens.some(screen => screen.state === 'full-screen');
  
  // 移除之前的复杂逻辑，直接使用分屏状态
  useEffect(() => {
    // 这里可以添加其他需要在分屏状态改变时执行的逻辑
    console.log('Split mode changed:', isInSplitMode);
  }, [isInSplitMode]);

  const updateLineCount = (editor: Editor) => {
    const dom = editor.view.dom;
    const elements = dom.querySelectorAll('p, h1, h2, h3, li, blockquote, pre');
    
    let totalLines = 0;
    const heights: number[] = [];
    
    elements.forEach((element) => {
      const rect = element.getBoundingClientRect();
      const elementHeight = rect.height;
      
      // Calculate line height for this element type
      let lineHeight = 27.2; // default for 16px * 1.7
      const computedStyle = window.getComputedStyle(element);
      const fontSize = parseFloat(computedStyle.fontSize);
      const lineHeightValue = parseFloat(computedStyle.lineHeight);
      
      if (!isNaN(lineHeightValue)) {
        lineHeight = lineHeightValue;
      } else {
        // Fallback calculation based on element type
        if (element.tagName === 'H1') lineHeight = fontSize * 1.2;
        else if (element.tagName === 'H2') lineHeight = fontSize * 1.3;
        else if (element.tagName === 'H3') lineHeight = fontSize * 1.4;
        else lineHeight = fontSize * 1.7;
      }
      
      // Calculate how many visual lines this element spans
      const visualLines = Math.max(1, Math.round(elementHeight / lineHeight));
      
      // Add heights for each visual line
      for (let i = 0; i < visualLines; i++) {
        heights.push(lineHeight);
      }
      
      totalLines += visualLines;
    });
    
    setLineCount(totalLines || 1);
    setLineHeights(heights.length > 0 ? heights : [27.2]);
  };

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyle,
      Color,
      FontFamily,
    ],
    content: noteContent || '<p></p>',
    editorProps: {
      attributes: {
        class: 'prose prose-sm focus:outline-none font-inter text-sm leading-relaxed',
        style: 'overflow: visible; min-height: 100%;'
      },
    },
    onUpdate: ({ editor }) => {
      updateLineCount(editor);
    },
    onCreate: ({ editor }) => {
      updateLineCount(editor);
    },
  });

  // Update editor content when noteContent changes
  useEffect(() => {
    if (editor && noteContent) {
      editor.commands.setContent(noteContent);
    }
  }, [editor, noteContent]);

  useEffect(() => {
    const handleNoteCopilotText = (event: CustomEvent<{ text: string }>) => {
      if (editor && event.detail?.text) {
        editor.commands.setContent(event.detail.text);
        setTimeout(() => updateLineCount(editor), 100);
      }
    };

    window.addEventListener('note-copilot-text', handleNoteCopilotText as EventListener);
    return () => {
      window.removeEventListener('note-copilot-text', handleNoteCopilotText as EventListener);
    };
  }, [editor]);

  // Listen for changes in editor content to recalculate line heights
  useEffect(() => {
    if (editor) {
      const updateHeights = () => {
        setTimeout(() => updateLineCount(editor), 10);
      };
      
      editor.on('transaction', updateHeights);
      editor.on('focus', updateHeights);
      editor.on('blur', updateHeights);
      
      return () => {
        editor.off('transaction', updateHeights);
        editor.off('focus', updateHeights);
        editor.off('blur', updateHeights);
      };
    }
  }, [editor]);

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.1, 2));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.1, 0.5));

  const generateLineNumbers = () => {
    return Array.from({ length: lineCount }, (_, i) => (
      <div 
        key={i} 
        className="line-number"
        style={{ 
          height: `${lineHeights[i] || 27.2}px`,
          minHeight: `${lineHeights[i] || 27.2}px`,
          maxHeight: `${lineHeights[i] || 27.2}px`
        }}
      >
        {i + 1}
      </div>
    ));
  };

  return (
    <div className="h-[calc(100vh-88px)] flex flex-col bg-white overflow-hidden">
      <NoteEditorTopToolbar 
        onBack={() => switchToNote(pageIdx, screenId, tabIdx)} 
        editor={editor} 
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        isInSplitMode={isInSplitMode}
        noteData={noteData}
        onSave={handleSave}
        isSaving={isSaving}
      />
      
      <div className="flex-1 relative overflow-hidden">
        <div className="flex-1 overflow-y-auto w-full h-full">
          <div className="flex justify-center w-full">
            <div 
              className="editor-container editor-scroll-container"
              style={{ 
                transform: `scale(${zoomLevel})`, 
                transformOrigin: 'top center',
                width: '100%',
                maxWidth: isInSplitMode ? '600px' : '800px',
                transition: 'all 0.3s ease-in-out'
              }}
            >
              {isLoadingContent ? (
                <div className="flex justify-center items-center h-32">
                  <div className="text-gray-500">Loading note content...</div>
                </div>
              ) : (
                <>
                  <div className="line-numbers">{generateLineNumbers()}</div>
                  <EditorContent editor={editor} className="editor-content" />
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-[60px] left-1/2 transform -translate-x-1/2 z-10">
          <NoteCopilotButton />
        </div>
      </div>


    </div>
  );
}

export default NoteEditor;
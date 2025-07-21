import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import FontFamily from '@tiptap/extension-font-family';
import { useTabContext } from '../../../workspaceFrame/TabContext';
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
  const { switchToNote } = useTabContext();
  const [zoomLevel, setZoomLevel] = useState(1);
  const [lineCount, setLineCount] = useState(1);
  const [lineHeights, setLineHeights] = useState<number[]>([]);

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
    content: `<h1>What is Lorem Ipsum?</h1>
<p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</p>
<h2>Why do we use it?</h2>
<p>It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).</p>
<p></p>
<p></p>
<h2>Where does it come from?</h2>
<p>Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old.</p>`,
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
      />
      
      <div className="flex-1 relative overflow-hidden">
        <div className="flex-1 overflow-y-auto w-full h-full">
          <div className="flex justify-center w-full">
            <div className="editor-container editor-scroll-container" style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center' }}>
              <div className="line-numbers">{generateLineNumbers()}</div>
              <EditorContent editor={editor} className="editor-content" />
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
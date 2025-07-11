import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import FontFamily from '@tiptap/extension-font-family';
import { Button } from '../../../../../components/ui/button';
import NoteCopilotButton from './NoteCopilotButton';
import { 
  ArrowLeftIcon,
  CloudIcon,
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  StrikethroughIcon,
  AlignLeftIcon,
  AlignCenterIcon,
  AlignRightIcon,
  ListIcon,
  ListOrderedIcon,
  LinkIcon,
  ImageIcon,
  TableIcon,
  CodeIcon,
  QuoteIcon,
  TypeIcon,
  PaletteIcon
} from 'lucide-react';

interface NoteEditorProps {
  onBack: () => void;
}

function NoteEditor({ onBack }: NoteEditorProps) {
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
    content: `
      <h1>Wait-Why Do Antibiotics Exist?</h1>
      <p>Prof. Fabrizio Apagnolo</p>
      <p>Crisper (?) -> CRISPR</p>
      <br>
      <h2>1. History</h2>
      <p>Dawn of Modern Medicine: (1800s)</p>
      <ul>
        <li>Paul Erhlich: began working on microbial staining for microscopy; note that stains can easily enter bacterial</li>
        <li>First time the possibility of chemotherapy for infectious diseases is seriously pursued</li>
      </ul>
      <p>First True Antibiotic</p>
      <ul>
        <li>1928, Alexander Fleming: penicillin, the first true antibiotic (quite an accident!)</li>
        <li>1940: first experimentally used to treat an infection. Clinical approved in 1943. Also, resistance to penicillin was reported in the literature by Chain & a colleague</li>
        <li>1945: Fleming shared the Nobel Prize with two of the chemists</li>
      </ul>
      <p><strong>2. Antibiotic Resistance - is not New</strong></p>
      <ul>
        <li>Antibiotic resistance genes (ARGs) are common!</li>
        <li>Antibiotic resistance genes found mostly on plasmids (part of DNA): ARGs often on plasmids paired with genes needed for antibiotic synthesis</li>
      </ul>
      <p>Why haven't microbes made antibiotic weapons useless?</p>
      <p>Why DO antibiotics exist?</p>
      <p>- Differences in Concentration</p>
      <ul>
        <li>Concentration has been a key factor in the success of antibiotic treatments from penicillin onward: this is why Fleming needed chemists to help purify and concentrate penicillin</li>
        <li>Modern antibiotic therapy uses a PK/PD approach</li>
      </ul>
      <p>-Scale</p>
    `,
    editorProps: {
      attributes: {
        class: 'prose prose-sm focus:outline-none min-h-[600px] font-inter text-sm leading-relaxed',
      },
    },
  });

  const formatOptions = [
    { icon: BoldIcon, command: () => editor?.chain().focus().toggleBold().run(), isActive: () => editor?.isActive('bold') },
    { icon: ItalicIcon, command: () => editor?.chain().focus().toggleItalic().run(), isActive: () => editor?.isActive('italic') },
    { icon: UnderlineIcon, command: () => editor?.chain().focus().toggleUnderline().run(), isActive: () => editor?.isActive('underline') },
    { icon: StrikethroughIcon, command: () => editor?.chain().focus().toggleStrike().run(), isActive: () => editor?.isActive('strike') },
  ];

  const alignOptions = [
    { icon: AlignLeftIcon, command: () => editor?.chain().focus().setTextAlign('left').run(), isActive: () => editor?.isActive({ textAlign: 'left' }) },
    { icon: AlignCenterIcon, command: () => editor?.chain().focus().setTextAlign('center').run(), isActive: () => editor?.isActive({ textAlign: 'center' }) },
    { icon: AlignRightIcon, command: () => editor?.chain().focus().setTextAlign('right').run(), isActive: () => editor?.isActive({ textAlign: 'right' }) },
  ];

  const listOptions = [
    { icon: ListIcon, command: () => editor?.chain().focus().toggleBulletList().run(), isActive: () => editor?.isActive('bulletList') },
    { icon: ListOrderedIcon, command: () => editor?.chain().focus().toggleOrderedList().run(), isActive: () => editor?.isActive('orderedList') },
  ];

  return (
    <div className="h-screen flex flex-col bg-white font-inter">
      {/* Header - Reduced height and aligned menu items with title */}
      <div className="flex items-center justify-between px-4 py-1.5 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-4">
          {/* Left arrow positioned in the middle vertically */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="p-2 self-center"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </Button>
          
          {/* Title and menu items in same block with perfect alignment */}
          <div className="flex flex-col">
            {/* Title */}
            <div className="flex items-center gap-2">
              <span className="font-medium text-base text-black font-inter">
                PHYS 2801 Class
              </span>
              <CloudIcon className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-500 font-inter">
                Last saved at 4:47 pm
              </span>
            </div>
            
            {/* Menu items - File Edit View etc. aligned with title start */}
            <div className="flex items-center text-xs -mt-1 -ml-1">
              <span className="px-1 py-1 hover:bg-gray-100 cursor-pointer font-inter text-[#898989]">File</span>
              <span className="px-2 py-1 hover:bg-gray-100 cursor-pointer font-inter text-[#898989]">Edit</span>
              <span className="px-2 py-1 hover:bg-gray-100 cursor-pointer font-inter text-[#898989]">View</span>
              <span className="px-2 py-1 hover:bg-gray-100 cursor-pointer font-inter text-[#898989]">Insert</span>
              <span className="px-2 py-1 hover:bg-gray-100 cursor-pointer font-inter text-[#898989]">Format</span>
              <span className="px-2 py-1 hover:bg-gray-100 cursor-pointer font-inter text-[#898989]">Tools</span>
              <span className="px-2 py-1 hover:bg-gray-100 cursor-pointer font-inter text-[#898989]">Help</span>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar - Exactly matching the image */}
      <div className="flex items-center gap-1 px-4 py-2 border-b border-gray-200 bg-white">
        {/* Undo/Redo */}
        <Button
          variant="ghost"
          size="icon"
          className="w-7 h-7 p-1 hover:bg-gray-100"
          onClick={() => editor?.chain().focus().undo().run()}
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 7v6h6"/>
            <path d="M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13"/>
          </svg>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="w-7 h-7 p-1 hover:bg-gray-100"
          onClick={() => editor?.chain().focus().redo().run()}
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 7v6h-6"/>
            <path d="M3 17a9 9 0 019-9 9 9 0 016 2.3l3-2.3"/>
          </svg>
        </Button>

        <div className="w-px h-5 bg-gray-300 mx-1"></div>

        {/* Format dropdown */}
        <select 
          className="px-2 py-1 border border-gray-300 rounded text-xs font-inter bg-white min-w-[70px] h-7"
          onChange={(e) => {
            const value = e.target.value;
            if (value === 'paragraph') {
              editor?.chain().focus().setParagraph().run();
            } else if (value.startsWith('heading')) {
              const level = parseInt(value.replace('heading', ''));
              editor?.chain().focus().toggleHeading({ level: level as any }).run();
            }
          }}
        >
          <option value="paragraph">Normal</option>
          <option value="heading1">Heading 1</option>
          <option value="heading2">Heading 2</option>
          <option value="heading3">Heading 3</option>
        </select>

        <div className="w-px h-5 bg-gray-300 mx-1"></div>

        {/* Text formatting - Bold, Italic, Underline, Strikethrough */}
        {formatOptions.map((option, index) => (
          <Button
            key={index}
            variant="ghost"
            size="icon"
            className={`w-7 h-7 p-1 hover:bg-gray-100 ${option.isActive?.() ? 'bg-gray-200' : ''}`}
            onClick={option.command}
          >
            <option.icon className="w-3.5 h-3.5" />
          </Button>
        ))}

        <div className="w-px h-5 bg-gray-300 mx-1"></div>

        {/* Alignment - Left, Center, Right */}
        {alignOptions.map((option, index) => (
          <Button
            key={index}
            variant="ghost"
            size="icon"
            className={`w-7 h-7 p-1 hover:bg-gray-100 ${option.isActive?.() ? 'bg-gray-200' : ''}`}
            onClick={option.command}
          >
            <option.icon className="w-3.5 h-3.5" />
          </Button>
        ))}

        <div className="w-px h-5 bg-gray-300 mx-1"></div>

        {/* Lists - Bullet and Numbered */}
        {listOptions.map((option, index) => (
          <Button
            key={index}
            variant="ghost"
            size="icon"
            className={`w-7 h-7 p-1 hover:bg-gray-100 ${option.isActive?.() ? 'bg-gray-200' : ''}`}
            onClick={option.command}
          >
            <option.icon className="w-3.5 h-3.5" />
          </Button>
        ))}

        <div className="w-px h-5 bg-gray-300 mx-1"></div>

        {/* Insert options - Link, Image, Table, Code, Quote */}
        <Button
          variant="ghost"
          size="icon"
          className="w-7 h-7 p-1 hover:bg-gray-100"
          onClick={() => {
            const url = window.prompt('Enter link URL:');
            if (url) {
              editor?.chain().focus().setLink({ href: url }).run();
            }
          }}
        >
          <LinkIcon className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="w-7 h-7 p-1 hover:bg-gray-100"
        >
          <ImageIcon className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="w-7 h-7 p-1 hover:bg-gray-100"
        >
          <TableIcon className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={`w-7 h-7 p-1 hover:bg-gray-100 ${editor?.isActive('code') ? 'bg-gray-200' : ''}`}
          onClick={() => editor?.chain().focus().toggleCode().run()}
        >
          <CodeIcon className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={`w-7 h-7 p-1 hover:bg-gray-100 ${editor?.isActive('blockquote') ? 'bg-gray-200' : ''}`}
          onClick={() => editor?.chain().focus().toggleBlockquote().run()}
        >
          <QuoteIcon className="w-3.5 h-3.5" />
        </Button>

        <div className="w-px h-5 bg-gray-300 mx-1"></div>

        {/* Text color and font */}
        <Button
          variant="ghost"
          size="icon"
          className="w-7 h-7 p-1 hover:bg-gray-100"
        >
          <TypeIcon className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="w-7 h-7 p-1 hover:bg-gray-100"
        >
          <PaletteIcon className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 bg-gray-50 overflow-auto relative">
        {/* Page numbers sidebar */}
        <div className="flex">
          <div className="w-10 bg-gray-100 border-r border-gray-200 flex flex-col items-center py-4 text-xs text-gray-500 font-inter">
            {Array.from({ length: 50 }, (_, i) => (
              <div key={i + 1} className="h-5 flex items-center">
                {i + 1}
              </div>
            ))}
          </div>

          {/* Editor content - Fixed centering and margins */}
          <div className="flex-1 flex justify-center py-6 px-6">
            <div className="w-[816px] min-h-[1056px] bg-white shadow-lg px-10 py-12">
              <EditorContent 
                editor={editor} 
                className="h-full font-inter w-full max-w-none"
              />
            </div>
          </div>
        </div>

        {/* NoteCopilotButton - Positioned at bottom center of editor area */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10">
          <NoteCopilotButton />
        </div>
      </div>

      {/* Custom styles for the editor content */}
      <style jsx global>{`
        .ProseMirror {
          font-family: 'Inter', sans-serif !important;
          font-size: 14px !important;
          line-height: 1.6 !important;
          max-width: none !important;
          width: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        
        .ProseMirror h1 {
          font-family: 'Inter', sans-serif !important;
          font-size: 24px !important;
          font-weight: 600 !important;
          margin-bottom: 16px !important;
          margin-top: 0 !important;
        }
        
        .ProseMirror h2 {
          font-family: 'Inter', sans-serif !important;
          font-size: 20px !important;
          font-weight: 600 !important;
          margin-bottom: 12px !important;
          margin-top: 24px !important;
        }
        
        .ProseMirror h3 {
          font-family: 'Inter', sans-serif !important;
          font-size: 18px !important;
          font-weight: 600 !important;
          margin-bottom: 8px !important;
          margin-top: 20px !important;
        }
        
        .ProseMirror p {
          font-family: 'Inter', sans-serif !important;
          font-size: 14px !important;
          margin-bottom: 12px !important;
          margin-top: 0 !important;
        }
        
        .ProseMirror ul, .ProseMirror ol {
          font-family: 'Inter', sans-serif !important;
          font-size: 14px !important;
          margin-bottom: 12px !important;
          padding-left: 24px !important;
        }
        
        .ProseMirror li {
          font-family: 'Inter', sans-serif !important;
          font-size: 14px !important;
          margin-bottom: 4px !important;
        }
        
        .ProseMirror strong {
          font-family: 'Inter', sans-serif !important;
          font-weight: 600 !important;
        }
        
        .ProseMirror em {
          font-family: 'Inter', sans-serif !important;
          font-style: italic !important;
        }
        
        .ProseMirror code {
          font-family: 'Inter', monospace !important;
          font-size: 13px !important;
          background-color: #f3f4f6 !important;
          padding: 2px 4px !important;
          border-radius: 3px !important;
        }
        
        .ProseMirror blockquote {
          font-family: 'Inter', sans-serif !important;
          font-size: 14px !important;
          border-left: 4px solid #e5e7eb !important;
          padding-left: 16px !important;
          margin: 16px 0 !important;
          font-style: italic !important;
        }
        
        /* Remove prose max-width constraints */
        .prose {
          max-width: none !important;
        }
        
        .prose-sm {
          max-width: none !important;
        }
      `}</style>
    </div>
  );
}

export default NoteEditor;
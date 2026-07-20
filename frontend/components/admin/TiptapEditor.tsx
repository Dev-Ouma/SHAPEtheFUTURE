"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Quote, 
  Undo, 
  Redo, 
  Code,
  Link as LinkIcon,
  Heading1,
  Heading2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Underline as UnderlineIcon
} from 'lucide-react';

interface TiptapEditorProps {
  content: string;
  onChange: (content: string) => void;
}

const TiptapEditor = ({ content, onChange }: TiptapEditorProps) => {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  const MenuBar = () => {
    return (
      <div className="border-b border-slate-200 p-2 flex flex-wrap gap-1 bg-slate-50">
        <button
          onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleBold().run(); }}
          className={`p-2 rounded hover:bg-slate-200 transition-colors ${editor.isActive('bold') ? 'bg-slate-200 text-primary' : 'text-slate-500'}`}
          title="Bold"
        >
          <Bold size={16} />
        </button>
        <button
          onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleItalic().run(); }}
          className={`p-2 rounded hover:bg-slate-200 transition-colors ${editor.isActive('italic') ? 'bg-slate-200 text-primary' : 'text-slate-500'}`}
          title="Italic"
        >
          <Italic size={16} />
        </button>
        <button
          onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleUnderline().run(); }}
          className={`p-2 rounded hover:bg-slate-200 transition-colors ${editor.isActive('underline') ? 'bg-slate-200 text-primary' : 'text-slate-500'}`}
          title="Underline"
        >
          <UnderlineIcon size={16} />
        </button>
        <div className="w-px h-6 bg-slate-200 mx-1 self-center" />
        <button
          onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleHeading({ level: 1 }).run(); }}
          className={`p-2 rounded hover:bg-slate-200 transition-colors ${editor.isActive('heading', { level: 1 }) ? 'bg-slate-200 text-primary' : 'text-slate-500'}`}
          title="Heading 1"
        >
          <Heading1 size={16} />
        </button>
        <button
          onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleHeading({ level: 2 }).run(); }}
          className={`p-2 rounded hover:bg-slate-200 transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-slate-200 text-primary' : 'text-slate-500'}`}
          title="Heading 2"
        >
          <Heading2 size={16} />
        </button>
        <div className="w-px h-6 bg-slate-200 mx-1 self-center" />
        <button
          onClick={(e) => { e.preventDefault(); editor.chain().focus().setTextAlign('left').run(); }}
          className={`p-2 rounded hover:bg-slate-200 transition-colors ${editor.isActive({ textAlign: 'left' }) ? 'bg-slate-200 text-primary' : 'text-slate-500'}`}
          title="Align Left"
        >
          <AlignLeft size={16} />
        </button>
        <button
          onClick={(e) => { e.preventDefault(); editor.chain().focus().setTextAlign('center').run(); }}
          className={`p-2 rounded hover:bg-slate-200 transition-colors ${editor.isActive({ textAlign: 'center' }) ? 'bg-slate-200 text-primary' : 'text-slate-500'}`}
          title="Align Centre"
        >
          <AlignCenter size={16} />
        </button>
        <button
          onClick={(e) => { e.preventDefault(); editor.chain().focus().setTextAlign('right').run(); }}
          className={`p-2 rounded hover:bg-slate-200 transition-colors ${editor.isActive({ textAlign: 'right' }) ? 'bg-slate-200 text-primary' : 'text-slate-500'}`}
          title="Align Right"
        >
          <AlignRight size={16} />
        </button>
        <div className="w-px h-6 bg-slate-200 mx-1 self-center" />
        <button
          onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleBulletList().run(); }}
          className={`p-2 rounded hover:bg-slate-200 transition-colors ${editor.isActive('bulletList') ? 'bg-slate-200 text-primary' : 'text-slate-500'}`}
          title="Bullet List"
        >
          <List size={16} />
        </button>
        <button
          onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleOrderedList().run(); }}
          className={`p-2 rounded hover:bg-slate-200 transition-colors ${editor.isActive('orderedList') ? 'bg-slate-200 text-primary' : 'text-slate-500'}`}
          title="Ordered List"
        >
          <ListOrdered size={16} />
        </button>
        <button
          onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleBlockquote().run(); }}
          className={`p-2 rounded hover:bg-slate-200 transition-colors ${editor.isActive('blockquote') ? 'bg-slate-200 text-primary' : 'text-slate-500'}`}
          title="Quote"
        >
          <Quote size={16} />
        </button>
        <div className="w-px h-6 bg-slate-200 mx-1 self-center" />
        <button
          onClick={(e) => { e.preventDefault(); editor.chain().focus().undo().run(); }}
          className="p-2 rounded hover:bg-slate-200 text-slate-500 transition-colors"
          title="Undo"
        >
          <Undo size={16} />
        </button>
        <button
          onClick={(e) => { e.preventDefault(); editor.chain().focus().redo().run(); }}
          className="p-2 rounded hover:bg-slate-200 text-slate-500 transition-colors"
          title="Redo"
        >
          <Redo size={16} />
        </button>
      </div>
    );
  };

  return (
    <div className="border border-slate-200 rounded-sm overflow-hidden focus-within:ring-2 focus-within:ring-primary transition-all">
      <MenuBar />
      <EditorContent 
        editor={editor} 
        className="prose prose-sm max-w-none p-5 min-h-[400px] focus:outline-none bg-white font-serif"
      />
      <style jsx global>{`
        .ProseMirror {
          min-height: 400px;
          outline: none;
        }
        .ProseMirror p {
          margin-bottom: 1em;
        }
        .ProseMirror h1 {
          font-size: 1.5em;
          font-weight: 800;
          margin-bottom: 0.5em;
        }
        .ProseMirror h2 {
          font-size: 1.25em;
          font-weight: 700;
          margin-bottom: 0.5em;
        }
        .ProseMirror ul {
          list-style-type: disc;
          padding-left: 1.5em;
          margin-bottom: 1em;
        }
        .ProseMirror ol {
          list-style-type: decimal;
          padding-left: 1.5em;
          margin-bottom: 1em;
        }
        .ProseMirror blockquote {
          border-left: 4px solid #037b90;
          padding-left: 1em;
          font-style: italic;
          color: #64748b;
          margin-bottom: 1em;
        }
      `}</style>
    </div>
  );
};

export default TiptapEditor;

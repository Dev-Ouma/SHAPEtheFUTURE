"use client";

import React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Image from "@tiptap/extension-image";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  List, 
  ListOrdered, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Heading1, 
  Heading2,
  Undo,
  Redo,
  Quote,
  Image as ImageIcon,
  Table as TableIcon,
  Columns,
  Rows,
  Trash2
} from "lucide-react";

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) return null;

  const btnClass = (active: boolean) => 
    `p-2 rounded-sm transition-colors ${active ? 'bg-primary text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`;

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 border-b border-slate-200 bg-slate-50 sticky top-0 z-10">
      <div className="flex items-center space-x-1 pr-2 border-r border-slate-200">
        <button
          onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleBold().run(); }}
          className={btnClass(editor.isActive('bold'))}
          title="Bold"
        >
          <Bold size={16} />
        </button>
        <button
          onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleItalic().run(); }}
          className={btnClass(editor.isActive('italic'))}
          title="Italic"
        >
          <Italic size={16} />
        </button>
        <button
          onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleUnderline().run(); }}
          className={btnClass(editor.isActive('underline'))}
          title="Underline"
        >
          <UnderlineIcon size={16} />
        </button>
      </div>

      <div className="flex items-center space-x-1 px-2 border-r border-slate-200">
        <button
          onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleHeading({ level: 1 }).run(); }}
          className={btnClass(editor.isActive('heading', { level: 1 }))}
          title="Heading 1"
        >
          <Heading1 size={16} />
        </button>
        <button
          onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleHeading({ level: 2 }).run(); }}
          className={btnClass(editor.isActive('heading', { level: 2 }))}
          title="Heading 2"
        >
          <Heading2 size={16} />
        </button>
      </div>

      <div className="flex items-center space-x-1 px-2 border-r border-slate-200">
        <button
          onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleBulletList().run(); }}
          className={btnClass(editor.isActive('bulletList'))}
          title="Bullet List"
        >
          <List size={16} />
        </button>
        <button
          onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleOrderedList().run(); }}
          className={btnClass(editor.isActive('orderedList'))}
          title="Numbered List"
        >
          <ListOrdered size={16} />
        </button>
      </div>

      <div className="flex items-center space-x-1 px-2 border-r border-slate-200">
        <button
          onClick={(e) => { e.preventDefault(); editor.chain().focus().setTextAlign('left').run(); }}
          className={btnClass(editor.isActive({ textAlign: 'left' }))}
          title="Align Left"
        >
          <AlignLeft size={16} />
        </button>
        <button
          onClick={(e) => { e.preventDefault(); editor.chain().focus().setTextAlign('center').run(); }}
          className={btnClass(editor.isActive({ textAlign: 'center' }))}
          title="Align Centre"
        >
          <AlignCenter size={16} />
        </button>
        <button
          onClick={(e) => { e.preventDefault(); editor.chain().focus().setTextAlign('right').run(); }}
          className={btnClass(editor.isActive({ textAlign: 'right' }))}
          title="Align Right"
        >
          <AlignRight size={16} />
        </button>
      </div>

      <div className="flex items-center space-x-1 px-2 border-r border-slate-200">
        <button
          onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleBlockquote().run(); }}
          className={btnClass(editor.isActive('blockquote'))}
          title="Quote"
        >
          <Quote size={16} />
        </button>
        <button
          onClick={(e) => { 
            e.preventDefault(); 
            const url = window.prompt('Enter Image URL:');
            if (url) {
              editor.chain().focus().setImage({ src: url }).run();
            }
          }}
          className="p-2 text-slate-500 hover:bg-slate-100 rounded-sm"
          title="Insert Image"
        >
          <ImageIcon size={16} />
        </button>
      </div>

      <div className="flex items-center space-x-1 px-2 border-r border-slate-200">
        <button
          onClick={(e) => { e.preventDefault(); editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(); }}
          className="p-2 text-slate-500 hover:bg-slate-100 rounded-sm"
          title="Insert Table"
        >
          <TableIcon size={16} />
        </button>
        <button
          onClick={(e) => { e.preventDefault(); editor.chain().focus().addColumnAfter().run(); }}
          className="p-2 text-slate-500 hover:bg-slate-100 rounded-sm disabled:opacity-50"
          title="Add Column"
          disabled={!editor.can().addColumnAfter()}
        >
          <Columns size={16} />
        </button>
        <button
          onClick={(e) => { e.preventDefault(); editor.chain().focus().addRowAfter().run(); }}
          className="p-2 text-slate-500 hover:bg-slate-100 rounded-sm disabled:opacity-50"
          title="Add Row"
          disabled={!editor.can().addRowAfter()}
        >
          <Rows size={16} />
        </button>
        <button
          onClick={(e) => { e.preventDefault(); editor.chain().focus().deleteTable().run(); }}
          className="p-2 text-rose-500 hover:bg-rose-50 rounded-sm disabled:opacity-50"
          title="Delete Table"
          disabled={!editor.can().deleteTable()}
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="flex items-center space-x-1 pl-2">
        <button
          onClick={(e) => { e.preventDefault(); editor.chain().focus().undo().run(); }}
          className="p-2 text-slate-500 hover:bg-slate-100 rounded-sm"
          title="Undo"
        >
          <Undo size={16} />
        </button>
        <button
          onClick={(e) => { e.preventDefault(); editor.chain().focus().redo().run(); }}
          className="p-2 text-slate-500 hover:bg-slate-100 rounded-sm"
          title="Redo"
        >
          <Redo size={16} />
        </button>
      </div>
    </div>
  );
};

// Extensions will be initialized inside the component using useMemo to prevent StrictMode duplication warnings

export default function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const extensions = React.useMemo(() => [
    StarterKit,
    // Underline and Link are already in the version or conflicting
    Image.configure({
      allowBase64: true,
    }),
    TextAlign.configure({
      types: ['heading', 'paragraph'],
    }),
    Table.configure({
      resizable: true,
    }),
    TableRow,
    TableHeader,
    TableCell,
  ], []);

  const editor = useEditor({
    extensions: extensions,
    content: content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-slate focus:outline-none max-w-none min-h-[400px] p-8 font-sans font-normal leading-relaxed text-slate-800',
      },
    },
  });

  // Effect to update content if it changes externally (e.g., initial load)
  React.useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  return (
    <div className={`group border border-slate-200 bg-white shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all flex flex-col min-h-[500px]`}>
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <EditorContent editor={editor} />
      </div>
      <div className="border-t border-slate-100 bg-slate-50/30 p-2 opacity-60 group-focus-within:opacity-100 transition-opacity">
        <MenuBar editor={editor} />
      </div>
    </div>
  );
}

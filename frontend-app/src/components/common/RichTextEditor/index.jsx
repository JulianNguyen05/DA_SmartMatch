// src/components/common/RichTextEditor/index.jsx
import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Bold, Italic, List, ListOrdered, Undo, Redo } from 'lucide-react';

/**
 * Rich text editor dùng theme indigo hiện có của các trang Job
 * (khớp inputClassName trong JobCreatePage/JobEditPage).
 * onChange bắn ra { target: { name, value } } để tương thích 1:1
 * với handleChange(e) đang dùng trong 2 trang này — không cần sửa logic form.
 *
 * @param {string} label
 * @param {string} name
 * @param {string} value        - HTML string
 * @param {Function} onChange   - nhận (e) với e.target.name/value
 * @param {string} [placeholder]
 * @param {boolean} [required]
 * @param {string} [error]
 */
const ToolbarButton = ({ onClick, isActive, disabled, children, title }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={[
      'p-2 rounded-lg transition-colors',
      isActive ? 'bg-indigo-100 text-indigo-600' : 'text-gray-500 hover:bg-gray-100',
      disabled ? 'opacity-30 cursor-not-allowed' : '',
    ].join(' ')}
  >
    {children}
  </button>
);

const RichTextEditor = ({
  label, name, value, onChange, placeholder = '', required = false, error,
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: false }),
      Placeholder.configure({ placeholder }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      const html = editor.isEmpty ? '' : editor.getHTML();
      onChange({ target: { name, value: html } });
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none min-h-[140px] px-4 py-3 focus:outline-none text-gray-700',
      },
    },
  });

  // Đồng bộ nếu value bị set từ ngoài vào (VD: fetch data ở JobEditPage)
  useEffect(() => {
    if (editor && value !== undefined && value !== editor.getHTML()) {
      editor.commands.setContent(value || '', false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor]);

  if (!editor) return null;

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-sm font-semibold text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div
        className={[
          'border rounded-xl bg-gray-50/50 overflow-hidden transition-all duration-200',
          'focus-within:bg-white focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10',
          error ? 'border-red-400' : 'border-gray-200',
        ].join(' ')}
      >
        <div className="flex items-center gap-1 px-2 py-1.5 border-b border-gray-200 bg-gray-50/80">
          <ToolbarButton
            title="In đậm"
            isActive={editor.isActive('bold')}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <Bold size={15} />
          </ToolbarButton>
          <ToolbarButton
            title="In nghiêng"
            isActive={editor.isActive('italic')}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <Italic size={15} />
          </ToolbarButton>
          <div className="w-px h-5 bg-gray-200 mx-1" />
          <ToolbarButton
            title="Danh sách gạch đầu dòng"
            isActive={editor.isActive('bulletList')}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <List size={15} />
          </ToolbarButton>
          <ToolbarButton
            title="Danh sách đánh số"
            isActive={editor.isActive('orderedList')}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            <ListOrdered size={15} />
          </ToolbarButton>
          <div className="w-px h-5 bg-gray-200 mx-1" />
          <ToolbarButton
            title="Hoàn tác"
            disabled={!editor.can().undo()}
            onClick={() => editor.chain().focus().undo().run()}
          >
            <Undo size={15} />
          </ToolbarButton>
          <ToolbarButton
            title="Làm lại"
            disabled={!editor.can().redo()}
            onClick={() => editor.chain().focus().redo().run()}
          >
            <Redo size={15} />
          </ToolbarButton>
        </div>
        <EditorContent editor={editor} />
      </div>
      {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
    </div>
  );
};

export default RichTextEditor;
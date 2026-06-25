import React from 'react';
import { ArrowUp, ArrowDown, Trash2, Plus } from 'lucide-react';

const EditableParagraphList = ({ items, sectionId, primaryColor, onUpdateItems, emptyItemTemplate }) => {
  const handleTextChange = (index, field, newText) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: newText };
    onUpdateItems(sectionId, updatedItems);
  };

  const handleHTMLBlur = (e, index, field) => {
    let val = e.currentTarget.innerHTML.trim();
    if (val === '<br>') val = '';
    handleTextChange(index, field, val);
  };

  const handleMoveUp = (index) => {
    if (index === 0) return;
    const updatedItems = [...items];
    [updatedItems[index - 1], updatedItems[index]] = [updatedItems[index], updatedItems[index - 1]];
    onUpdateItems(sectionId, updatedItems);
  };

  const handleMoveDown = (index) => {
    if (index === items.length - 1) return;
    const updatedItems = [...items];
    [updatedItems[index + 1], updatedItems[index]] = [updatedItems[index], updatedItems[index + 1]];
    onUpdateItems(sectionId, updatedItems);
  };

  const handleDelete = (index) => {
    const updatedItems = items.filter((_, i) => i !== index);
    onUpdateItems(sectionId, updatedItems);
  };

  const handleAdd = () => {
    const updatedItems = [...items, { ...emptyItemTemplate }];
    onUpdateItems(sectionId, updatedItems);
  };

  const editableClasses = "outline-none focus:bg-blue-50 focus:ring-1 focus:ring-blue-300 rounded p-1 transition-all empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400 empty:before:pointer-events-none empty:before:block cursor-text w-full";

  return (
    <div className="w-full relative group/section">
      <div className="space-y-3 relative">
        {items.map((item, index) => (
          <div key={index} className="relative group/item transition-all">
            {/* Toolbar mini bằng CSS Hover */}
            <div className="absolute right-0 -top-6 flex-row gap-1 bg-gray-50/90 shadow-sm border rounded-md p-1 z-10 opacity-0 invisible group-hover/item:opacity-100 group-hover/item:visible transition-all flex" contentEditable="false">
              <button onClick={() => handleMoveUp(index)} disabled={index === 0} className="p-1 hover:bg-gray-200 rounded text-gray-600 disabled:opacity-30 transition-colors"><ArrowUp size={14} /></button>
              <button onClick={() => handleMoveDown(index)} disabled={index === items.length - 1} className="p-1 hover:bg-gray-200 rounded text-gray-600 disabled:opacity-30 transition-colors"><ArrowDown size={14} /></button>
              <div className="w-px h-4 bg-gray-300 self-center mx-1"></div>
              <button onClick={() => handleDelete(index)} className="p-1 hover:bg-red-100 rounded text-red-500 transition-colors"><Trash2 size={14} /></button>
            </div>

            {/* Chỉ render trường description thành văn bản dài */}
            <div
              contentEditable suppressContentEditableWarning
              onBlur={(e) => handleHTMLBlur(e, index, 'description')}
              className={`text-sm text-gray-700 whitespace-pre-wrap min-h-[40px] leading-relaxed ${editableClasses}`}
              data-placeholder="Nhập nội dung đoạn văn tự do..."
              dangerouslySetInnerHTML={{ __html: item.description || '' }}
            />
          </div>
        ))}

        {items.length === 0 && (
          <div className="text-sm text-gray-400 italic py-2">
            Chưa có thông tin. Bấm "Thêm đoạn văn" để bổ sung.
          </div>
        )}
      </div>

      <div className="mt-2 opacity-0 group-hover/section:opacity-100 transition-opacity duration-200">
        <button
          onClick={handleAdd}
          className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-full border border-dashed hover:bg-gray-50 transition-all"
          style={{ color: primaryColor, borderColor: primaryColor }}
        >
          <Plus size={14} /> Thêm đoạn văn
        </button>
      </div>
    </div>
  );
};

export default EditableParagraphList;
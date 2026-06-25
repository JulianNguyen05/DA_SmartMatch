import React from 'react';
import { ArrowUp, ArrowDown, Trash2, Plus } from 'lucide-react';

const EditableTimelineList = ({ items, sectionId, primaryColor, onUpdateItems, emptyItemTemplate }) => {
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

  const editableClasses = "outline-none focus:bg-blue-50 focus:ring-1 focus:ring-blue-300 rounded p-0.5 transition-all w-full empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400 empty:before:pointer-events-none empty:before:block cursor-text";

  return (
    <div className="w-full relative group/section">
      <div className="space-y-1 relative">
        {items.map((item, index) => (
          <div 
            key={index} 
            className="relative flex gap-4 pb-4 border-b border-gray-100 last:border-0 group/item transition-all pl-3"
            style={{ borderLeft: `2px solid ${primaryColor}` }}
          >
            {/* Toolbar mini bằng CSS Hover */}
            <div className="absolute left-0 -top-8 flex-row gap-1 bg-gray-50/90 shadow-sm border rounded-md p-1 z-10 opacity-0 invisible group-hover/item:opacity-100 group-hover/item:visible transition-all flex" contentEditable="false">
              <button onClick={() => handleMoveUp(index)} disabled={index === 0} className="p-1 hover:bg-gray-200 rounded text-gray-600 disabled:opacity-30 transition-colors"><ArrowUp size={14} /></button>
              <button onClick={() => handleMoveDown(index)} disabled={index === items.length - 1} className="p-1 hover:bg-gray-200 rounded text-gray-600 disabled:opacity-30 transition-colors"><ArrowDown size={14} /></button>
              <div className="w-px h-4 bg-gray-300 self-center mx-1"></div>
              <button onClick={() => handleDelete(index)} className="p-1 hover:bg-red-100 rounded text-red-500 transition-colors"><Trash2 size={14} /></button>
            </div>

            <div className="w-1/4 flex-shrink-0">
              <div 
                contentEditable suppressContentEditableWarning
                onBlur={(e) => handleHTMLBlur(e, index, 'date')}
                className={`text-xs font-semibold italic ${editableClasses}`}
                style={{ color: primaryColor }}
                data-placeholder="Bắt đầu - Kết thúc"
                dangerouslySetInnerHTML={{ __html: item.date || '' }}
              />
            </div>

            <div className="flex-1 w-3/4">
              <div 
                contentEditable suppressContentEditableWarning
                onBlur={(e) => handleHTMLBlur(e, index, 'title')}
                className={`font-semibold text-gray-900 mb-0.5 ${editableClasses}`}
                data-placeholder="Tiêu đề chính..."
                dangerouslySetInnerHTML={{ __html: item.title || '' }}
              />
              <div 
                contentEditable suppressContentEditableWarning
                onBlur={(e) => handleHTMLBlur(e, index, 'subtitle')}
                className={`text-sm text-gray-600 mb-2 ${editableClasses}`}
                data-placeholder="Tiêu đề phụ / Vị trí..."
                dangerouslySetInnerHTML={{ __html: item.subtitle || '' }}
              />
              <div 
                contentEditable suppressContentEditableWarning
                onBlur={(e) => handleHTMLBlur(e, index, 'description')}
                className={`text-sm text-gray-700 whitespace-pre-wrap min-h-[20px] ${editableClasses}`}
                data-placeholder="Mô tả chi tiết..."
                dangerouslySetInnerHTML={{ __html: item.description || '' }}
              />
            </div>
          </div>
        ))}
        
        {items.length === 0 && <div className="text-sm text-gray-400 italic py-2">Chưa có thông tin. Bấm "Thêm mới" để bổ sung.</div>}
      </div>

      <div className="mt-2 opacity-0 group-hover/section:opacity-100 transition-opacity duration-200">
        <button 
          onClick={handleAdd}
          className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-full border border-dashed hover:bg-gray-50 transition-all"
          style={{ color: primaryColor, borderColor: primaryColor }}
        >
          <Plus size={14} /> Thêm mục mới
        </button>
      </div>
    </div>
  );
};

export default EditableTimelineList;
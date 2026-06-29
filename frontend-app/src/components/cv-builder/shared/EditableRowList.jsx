import React from 'react';
import { ArrowUp, ArrowDown, Trash2, Plus } from 'lucide-react';

const EditableRowList = ({ items, sectionId, primaryColor, onUpdateItems, emptyItemTemplate }) => {
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

  const handleAddAfter = (index) => {
    const updatedItems = [...items];
    updatedItems.splice(index + 1, 0, { ...emptyItemTemplate });
    onUpdateItems(sectionId, updatedItems);
  };

  const handleAddFirst = () => {
    onUpdateItems(sectionId, [{ ...emptyItemTemplate }]);
  };

  const editableClasses = "outline-none focus:bg-blue-50 focus:ring-1 focus:ring-blue-300 rounded p-0.5 transition-all empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400 empty:before:pointer-events-none empty:before:block cursor-text";

  return (
    <div className="w-full relative group/section">
      <div className="space-y-4 relative">
        {items.map((item, index) => (
          <div key={index} className="relative pb-4 border-b border-gray-100 last:border-0 group/item transition-all">
            <div className="absolute right-0 -top-4 flex-row gap-1 bg-gray-50/90 shadow-sm border rounded-md p-1 z-10 opacity-0 invisible group-hover/item:opacity-100 group-hover/item:visible transition-all flex" contentEditable="false">
              <button onClick={() => handleMoveUp(index)} disabled={index === 0} className="p-1 hover:bg-gray-200 rounded text-gray-600 disabled:opacity-30 transition-colors"><ArrowUp size={14} /></button>
              <button onClick={() => handleMoveDown(index)} disabled={index === items.length - 1} className="p-1 hover:bg-gray-200 rounded text-gray-600 disabled:opacity-30 transition-colors"><ArrowDown size={14} /></button>
              <div className="w-px h-4 bg-gray-300 self-center mx-1"></div>
              <button onClick={() => handleAddAfter(index)} className="p-1 hover:bg-green-100 rounded transition-colors" style={{ color: primaryColor }}><Plus size={14} /></button>
              <div className="w-px h-4 bg-gray-300 self-center mx-1"></div>
              <button onClick={() => handleDelete(index)} className="p-1 hover:bg-red-100 rounded text-red-500 transition-colors"><Trash2 size={14} /></button>
            </div>

            <div className="flex justify-between items-start gap-4 mb-0.5">
              <div contentEditable suppressContentEditableWarning onBlur={(e) => handleHTMLBlur(e, index, 'title')} className={`font-semibold text-gray-900 flex-1 ${editableClasses}`} data-placeholder="Tiêu đề chính..." dangerouslySetInnerHTML={{ __html: item.title || '' }} />
              <div contentEditable suppressContentEditableWarning onBlur={(e) => handleHTMLBlur(e, index, 'date')} className={`text-[0.85em] font-semibold italic text-right min-w-[80px] ${editableClasses}`} style={{ color: primaryColor }} data-placeholder="Thời gian..." dangerouslySetInnerHTML={{ __html: item.date || '' }} />
            </div>
            <div contentEditable suppressContentEditableWarning onBlur={(e) => handleHTMLBlur(e, index, 'subtitle')} className={`text-[1em] text-gray-600 mb-2 ${editableClasses}`} data-placeholder="Tiêu đề phụ / Vị trí..." dangerouslySetInnerHTML={{ __html: item.subtitle || '' }} />
            <div contentEditable suppressContentEditableWarning onBlur={(e) => handleHTMLBlur(e, index, 'description')} className={`text-[1em] text-gray-700 whitespace-pre-wrap min-h-[20px] ${editableClasses}`} data-placeholder="Mô tả chi tiết..." dangerouslySetInnerHTML={{ __html: item.description || '' }} />
          </div>
        ))}

        {items.length === 0 && (
          <div className="flex items-center gap-1 text-[1em] italic py-2 cursor-pointer w-fit" style={{ color: primaryColor }} onClick={handleAddFirst}>
            <Plus size={14} /> Thêm mục mới
          </div>
        )}
      </div>
    </div>
  );
};

export default EditableRowList;
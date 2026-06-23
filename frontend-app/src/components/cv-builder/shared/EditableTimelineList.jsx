import React, { useState } from 'react';
import { ArrowUp, ArrowDown, Trash2, Plus } from 'lucide-react';

const EditableTimelineList = ({ 
  items, 
  sectionId, 
  primaryColor, 
  onUpdateItems,
  emptyItemTemplate 
}) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const handleTextChange = (index, field, newText) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: newText };
    onUpdateItems(sectionId, updatedItems);
  };

  const handleMoveUp = (index) => {
    if (index === 0) return;
    const updatedItems = [...items];
    const temp = updatedItems[index - 1];
    updatedItems[index - 1] = updatedItems[index];
    updatedItems[index] = temp;
    onUpdateItems(sectionId, updatedItems);
  };

  const handleMoveDown = (index) => {
    if (index === items.length - 1) return;
    const updatedItems = [...items];
    const temp = updatedItems[index + 1];
    updatedItems[index + 1] = updatedItems[index];
    updatedItems[index] = temp;
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

  // Cấu hình CSS chung cho các thẻ div có thể chỉnh sửa
  // Sử dụng :empty::before để hiển thị attr data-placeholder khi rỗng
  const editableClasses = "outline-none focus:bg-blue-50 focus:ring-1 focus:ring-blue-300 rounded p-0.5 transition-all w-full empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400 empty:before:pointer-events-none empty:before:block cursor-text";

  return (
    <div className="w-full relative group/section">
      <div className="space-y-4 relative">
        {items.map((item, index) => (
          <div 
            key={index} 
            className="relative flex gap-4 pb-4 border-b border-gray-100 last:border-0 group/item transition-all"
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {/* Thanh công cụ nổi - ĐÃ CHUYỂN SANG HIỂN THỊ NGANG (flex-row) */}
            {hoveredIndex === index && (
              <div className="absolute left-0 -top-8 flex flex-row gap-1 bg-gray-50/90 shadow-sm border rounded-md p-1 z-10 animate-fadeIn">
                <button 
                  onClick={() => handleMoveUp(index)} 
                  disabled={index === 0}
                  className="p-1 hover:bg-gray-200 rounded text-gray-600 disabled:opacity-30 transition-colors"
                  title="Di chuyển lên"
                >
                  <ArrowUp size={14} />
                </button>
                <button 
                  onClick={() => handleMoveDown(index)} 
                  disabled={index === items.length - 1}
                  className="p-1 hover:bg-gray-200 rounded text-gray-600 disabled:opacity-30 transition-colors"
                  title="Di chuyển xuống"
                >
                  <ArrowDown size={14} />
                </button>
                <div className="w-px h-4 bg-gray-300 self-center mx-1"></div>
                <button 
                  onClick={() => handleDelete(index)} 
                  className="p-1 hover:bg-red-100 rounded text-red-500 transition-colors"
                  title="Xóa khối này"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            )}

            {/* Cột Trái: Thời gian */}
            <div className="w-1/4 flex-shrink-0">
              <div 
                contentEditable 
                suppressContentEditableWarning
                onBlur={(e) => handleTextChange(index, 'date', e.currentTarget.textContent)}
                className={`text-xs text-gray-500 italic ${editableClasses}`}
                data-placeholder="Bắt đầu - Kết thúc"
              >
                {item.date || ''}
              </div>
            </div>

            {/* Cột Phải: Nội dung chi tiết */}
            <div className="flex-1 w-3/4">
              <div 
                contentEditable 
                suppressContentEditableWarning
                onBlur={(e) => handleTextChange(index, 'title', e.currentTarget.textContent)}
                className={`font-semibold text-gray-900 mb-0.5 ${editableClasses}`}
                data-placeholder="Tiêu đề chính..."
              >
                {item.title || ''}
              </div>
              
              <div 
                contentEditable 
                suppressContentEditableWarning
                onBlur={(e) => handleTextChange(index, 'subtitle', e.currentTarget.textContent)}
                className={`text-sm text-gray-600 mb-2 ${editableClasses}`}
                data-placeholder="Tiêu đề phụ / Vị trí..."
              >
                {item.subtitle || ''}
              </div>
              
              <div 
                contentEditable 
                suppressContentEditableWarning
                onBlur={(e) => handleTextChange(index, 'description', e.currentTarget.textContent)}
                className={`text-sm text-gray-700 whitespace-pre-wrap min-h-[20px] ${editableClasses}`}
                data-placeholder="Mô tả chi tiết..."
              >
                {item.description || ''}
              </div>
            </div>
          </div>
        ))}
        
        {items.length === 0 && (
          <div className="text-sm text-gray-400 italic py-2">
            Chưa có thông tin. Bấm "Thêm mới" để bổ sung.
          </div>
        )}
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
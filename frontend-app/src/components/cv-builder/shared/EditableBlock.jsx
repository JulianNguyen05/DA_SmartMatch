import React from 'react';
import { ArrowUp, ArrowDown, Plus } from 'lucide-react';

const EditableBlock = ({ children, onUp, onDown, onDelete, onAdd, showAdd = false }) => {
  return (
    <div className="relative group border border-transparent hover:border-red-400 hover:border-dashed transition-colors duration-200">
      {children}
      <div className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center -mt-3 -mr-2 z-10 shadow-sm">
        {onUp && <button onClick={onUp} className="px-1 bg-gray-500 text-white rounded-l text-[10px] hover:bg-gray-600"><ArrowUp size={12} /></button>}
        {onDown && <button onClick={onDown} className="px-1 bg-gray-500 text-white border-l border-gray-400 text-[10px] hover:bg-gray-600"><ArrowDown size={12} /></button>}
        {onDelete && <button onClick={onDelete} className="px-2 py-1 bg-red-500 text-white border-l border-red-400 text-[10px] hover:bg-red-600 flex items-center gap-1"><span>Xóa</span></button>}
        {showAdd && onAdd && (
          <button onClick={onAdd} className="px-2 py-1 bg-[#00b14f] text-white border-l border-green-400 rounded-r text-[10px] hover:bg-green-600 flex items-center gap-1">
            <Plus size={12} /> <span>Thêm</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default EditableBlock;
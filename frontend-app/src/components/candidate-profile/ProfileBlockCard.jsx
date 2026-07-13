// src/components/candidate-profile/ProfileBlockCard.jsx
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Eye, EyeOff, Pencil } from 'lucide-react';
import { BLOCK_META, renderBlockSummary, getBlockItems } from './blockConfig';

/**
 * Card đại diện cho 1 block trên sandbox ProfilePage.
 * @param {object}   layoutItem   - { blockType, position, visible, repeatable }
 * @param {object}   profileData  - toàn bộ response getFullProfile (để lấy data hiển thị)
 * @param {Function} onToggleVisibility - (blockType, nextVisible) => void
 * @param {Function} onEdit       - (blockType) => void — mở form/modal chỉnh sửa (tiến độ sau)
 */
const ProfileBlockCard = ({ layoutItem, profileData, onToggleVisibility, onEdit }) => {
  const { blockType, visible } = layoutItem;
  const meta = BLOCK_META[blockType] || { label: blockType, repeatable: false };

  const {
    attributes, listeners, setNodeRef, transform, transition, isDragging,
  } = useSortable({ id: blockType });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const itemCount = meta.repeatable ? getBlockItems(blockType, profileData).length : null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden
        ${visible ? 'border-gray-200' : 'border-gray-100 bg-gray-50/60'}
        ${isDragging ? 'shadow-lg' : 'hover:shadow-sm'}`}
    >
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
        {/* Drag handle — chỉ vùng này kích hoạt kéo-thả, tránh đè lên nút bấm */}
        <button
          {...attributes}
          {...listeners}
          className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing touch-none"
          title="Kéo để sắp xếp"
        >
          <GripVertical size={18} />
        </button>

        <h3 className={`flex-1 text-sm font-bold uppercase tracking-wide ${visible ? 'text-gray-800' : 'text-gray-400'}`}>
          {meta.label}
        </h3>

        {itemCount !== null && (
          <span className="text-xs font-medium bg-indigo-50 text-indigo-600 px-2.5 py-0.5 rounded-full">
            {itemCount} mục
          </span>
        )}

        <button
          onClick={() => onEdit(blockType)}
          className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
          title="Chỉnh sửa"
        >
          <Pencil size={16} />
        </button>

        <button
          onClick={() => onToggleVisibility(blockType, !visible)}
          className={`p-1.5 rounded-lg transition-colors ${
            visible ? 'text-gray-400 hover:text-gray-600 hover:bg-gray-100' : 'text-gray-300 hover:text-indigo-600 hover:bg-indigo-50'
          }`}
          title={visible ? 'Ẩn khỏi ProfilePage' : 'Hiện trên ProfilePage'}
        >
          {visible ? <Eye size={16} /> : <EyeOff size={16} />}
        </button>
      </div>

      <div className="px-4 py-3">
        {renderBlockSummary(blockType, profileData)}
      </div>
    </div>
  );
};

export default ProfileBlockCard;

import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { GripVertical } from 'lucide-react';

// Mapping item ID sang display name (Vietnamese)
const SECTION_NAMES = {
  personalInfo: 'Thông tin cá nhân',
  objective: 'Mục tiêu nghề nghiệp',
  experience: 'Kinh nghiệm làm việc',
  education: 'Học vấn',
  skills: 'Kỹ năng',
  hobbies: 'Sở thích',
  awards: 'Danh hiệu & Giải thưởng',
  certifications: 'Chứng chỉ',
  projects: 'Dự án',
  references: 'Người tham chiếu'
};

const DraggableItem = ({ id, itemId, primaryColor, variant = 'default' }) => {
  const { attributes, listeners, setNodeRef, isDragging, transform } = useDraggable({
    id: id,
  });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.5 : 1,
    transition: 'all 200ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  };

  const displayName = SECTION_NAMES[itemId] || itemId;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`
        flex items-center gap-2 p-2.5 rounded-lg cursor-grab active:cursor-grabbing
        border transition-all select-none
        ${isDragging 
          ? 'opacity-50 scale-95' 
          : 'hover:shadow-md'
        }
        ${variant === 'unused'
          ? 'bg-gray-100 border-gray-200 text-gray-700 hover:border-gray-400'
          : 'bg-white border-gray-200 text-gray-700'
        }
      `}
      style={{
        ...style,
        borderColor: isDragging ? primaryColor : '#e5e7eb',
        backgroundColor: isDragging ? `${primaryColor}20` : (variant === 'unused' ? '#f3f4f6' : '#ffffff'),
      }}
    >
      <GripVertical 
        size={14} 
        className="text-gray-400 flex-shrink-0"
      />
      <span className="text-sm font-medium flex-1 truncate">
        {displayName}
      </span>
    </div>
  );
};

export default DraggableItem;

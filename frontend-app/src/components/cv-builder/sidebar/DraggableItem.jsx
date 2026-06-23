import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

const SECTION_NAMES = {
  avatar: 'Ảnh đại diện',
  contactInfo: 'Danh thiếp',
  personalInfo: 'Thông tin cá nhân',
  objective: 'Mục tiêu nghề nghiệp',
  education: 'Học vấn',
  experience: 'Kinh nghiệm làm việc',
  activities: 'Hoạt động',
  certifications: 'Chứng chỉ',
  awards: 'Giải thưởng',
  skills: 'Kỹ năng',
  references: 'Người tham chiếu',
  hobbies: 'Sở thích',
  projects: 'Dự án',
  customSection: 'Thông tin thêm'
};

const DraggableItem = ({ id, itemId, primaryColor, variant = 'default', isOverlay = false }) => {
  const { attributes, listeners, setNodeRef, isDragging, transform, transition } = useSortable({
    id: id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isOverlay ? 999 : 'auto',
  };

  // Tự động nhận diện ID "customSection_123..." thành "Thông tin thêm"
  const displayName = itemId?.startsWith('customSection') ? 'Thông tin thêm' : (SECTION_NAMES[itemId] || itemId);

  // === HIỆU ỨNG RĂNG CƯA (PLACEHOLDER) ===
  // Khi item bị nhấc đi, để lại một khoảng trống có viền nét đứt màu của theme
// === HIỆU ỨNG RĂNG CƯA (PLACEHOLDER) ===
  if (isDragging && !isOverlay) {
    return (
      <div
        ref={setNodeRef}
        style={{ 
          ...style, 
          backgroundColor: `${primaryColor}15`, 
          borderColor: primaryColor 
        }}
        className="flex items-center gap-2 p-2.5 rounded-lg border-2 border-dashed opacity-50"
      >
        {/* Render nội dung ẩn để giữ đúng kích thước của item gốc */}
        <GripVertical size={14} className="opacity-0 flex-shrink-0" />
        <span className="text-sm font-medium flex-1 truncate opacity-0">
          {displayName}
        </span>
      </div>
    );
  }

  // === GIAO DIỆN BÌNH THƯỜNG & KHI BAY LƠ LỬNG (OVERLAY) ===
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`
        flex items-center gap-2 p-2.5 rounded-lg cursor-grab active:cursor-grabbing
        border transition-colors select-none
        ${isOverlay ? 'shadow-xl scale-105 rotate-2 text-white' : 'hover:shadow-md text-gray-700'}
        ${variant === 'unused' && !isOverlay ? 'bg-gray-100 border-gray-200 hover:border-gray-400' : ''}
      `}
      style={{
        ...style,
        // Nếu là Overlay -> Đổ full nền màu xanh. Nếu bình thường -> Nền trắng/xám
        backgroundColor: isOverlay ? primaryColor : (variant === 'unused' ? '#f3f4f6' : '#ffffff'),
        borderColor: isOverlay ? primaryColor : '#e5e7eb',
      }}
    >
      <GripVertical 
        size={14} 
        className={`flex-shrink-0 ${isOverlay ? 'text-white' : 'text-gray-400'}`} 
      />
      <span className="text-sm font-medium flex-1 truncate">
        {displayName}
      </span>
    </div>
  );
};

export default DraggableItem;
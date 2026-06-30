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
        className="flex items-center gap-2 p-2.5 rounded-xl border-2 border-dashed opacity-50"
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
        flex items-center gap-2 p-2.5 rounded-xl cursor-grab active:cursor-grabbing
        border transition-all duration-200 select-none
        ${isOverlay ? 'shadow-xl scale-105 rotate-2 text-white' : 'hover:shadow-md hover:-translate-y-0.5 text-slate-700'}
        ${variant === 'unused' && !isOverlay ? 'bg-slate-50 border-slate-200 hover:border-[#2563EB]' : ''}
      `}
      style={{
        ...style,
        // Nếu là Overlay -> Đổ full nền màu xanh. Nếu bình thường -> Nền trắng/xám
        backgroundColor: isOverlay ? primaryColor : (variant === 'unused' ? '#F8FAFC' : '#ffffff'),
        borderColor: isOverlay ? primaryColor : '#E2E8F0',
      }}
    >
      <GripVertical 
        size={14} 
        className={`flex-shrink-0 ${isOverlay ? 'text-white' : 'text-slate-400'}`} 
      />
      <span className="text-sm font-medium flex-1 truncate">
        {displayName}
      </span>
    </div>
  );
};

export default DraggableItem;
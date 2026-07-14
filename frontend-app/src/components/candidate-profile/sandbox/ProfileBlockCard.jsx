// src/components/candidate-profile/sandbox/ProfileBlockCard.jsx
import React from 'react';
import { GripVertical, Eye, EyeOff, Pencil } from 'lucide-react';
import { BLOCK_META, BLOCK_COLOR, renderBlockSummary, getBlockItems } from '../shared/blockConfig';

/**
 * Card đại diện cho 1 block trên sandbox ProfilePage — style neobrutalism.
 * Kéo-thả/resize do react-grid-layout (ở ProfileLayoutSandbox) quản lý qua
 * class "block-drag-handle". Ở chế độ xem (isEditMode=false), card chỉ hiển
 * thị nội dung — không tay cầm kéo, không nút sửa/ẩn.
 *
 * @param {object}   layoutItem   - { blockType, position, visible, repeatable }
 * @param {object}   profileData  - toàn bộ response getFullProfile (để lấy data hiển thị)
 * @param {Function} onToggleVisibility - (blockType, nextVisible) => void
 * @param {Function} onEdit       - (blockType) => void — mở form/modal chỉnh sửa
 * @param {boolean}  isEditMode   - true = đang chỉnh sửa bố cục, false = chỉ xem
 */
const ProfileBlockCard = ({ layoutItem, profileData, onToggleVisibility, onEdit, isEditMode }) => {
  const { blockType, visible } = layoutItem;
  const meta = BLOCK_META[blockType] || { label: blockType, repeatable: false };
  const color = BLOCK_COLOR[blockType] || '#E5E5E5';

  const itemCount = meta.repeatable ? getBlockItems(blockType, profileData).length : null;

  return (
    <div
      className={`h-full w-full flex flex-col bg-white border-[3px] border-black select-none
        ${visible ? '' : 'opacity-45 grayscale'}`}
      style={{ boxShadow: '5px 5px 0px 0px #111111' }}
    >
      {/* ─── Header: màu riêng theo blockType + tay cầm kéo-thả (chỉ khi đang sửa) ─── */}
      <div
        className="flex items-center gap-1.5 px-2.5 py-2 border-b-[3px] border-black shrink-0"
        style={{ backgroundColor: color }}
      >
        {isEditMode && (
          <span
            className="block-drag-handle flex items-center cursor-grab active:cursor-grabbing text-black/60 hover:text-black shrink-0"
            title="Kéo để di chuyển"
          >
            <GripVertical size={16} strokeWidth={2.75} />
          </span>
        )}

        <h3 className="flex-1 text-xs sm:text-sm font-black uppercase tracking-wide text-black truncate">
          {meta.label}
        </h3>

        {itemCount !== null && (
          <span className="text-[10px] font-extrabold bg-white text-black border-2 border-black px-1.5 leading-5 shrink-0">
            {itemCount}
          </span>
        )}

        {isEditMode && (
          <>
            <button
              type="button"
              onClick={() => onEdit(blockType)}
              className="p-1 bg-white border-2 border-black text-black hover:bg-black hover:text-white transition-colors shrink-0"
              title="Chỉnh sửa"
            >
              <Pencil size={13} strokeWidth={2.75} />
            </button>

            <button
              type="button"
              onClick={() => onToggleVisibility(blockType, !visible)}
              className="p-1 bg-white border-2 border-black text-black hover:bg-black hover:text-white transition-colors shrink-0"
              title={visible ? 'Ẩn khỏi ProfilePage' : 'Hiện trên ProfilePage'}
            >
              {visible ? <Eye size={13} strokeWidth={2.75} /> : <EyeOff size={13} strokeWidth={2.75} />}
            </button>
          </>
        )}
      </div>

      {/* ─── Nội dung: cuộn riêng khi block bị resize nhỏ hơn nội dung ─── */}
      <div className="px-3 py-2.5 flex-1 min-h-0 overflow-y-auto">
        {renderBlockSummary(blockType, profileData)}
      </div>
    </div>
  );
};

export default ProfileBlockCard;

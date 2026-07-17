// src/components/candidate-profile/sandbox/ProfileBlockCard.jsx
import React from 'react';
import { GripVertical, Eye, EyeOff, Pencil } from 'lucide-react';
import { BLOCK_META, BLOCK_TAG, BLOCK_ICON, renderBlockSummary, getBlockItems } from '../shared/blockConfig';
import { BLOCK_FORM_CONFIGS } from '../shared/blockFormConfig';
import InlineEntryList from '../shared/InlineEntryList';
import InlineReferenceEntryList from '../shared/InlineReferenceEntryList';

// 7 block danh sách đơn giản (Bước 1) + SKILL/LANGUAGE (Bước 2) đã chuyển sang
// nhập trực tiếp trong card. PERSONAL_INFO/AVATAR/SOCIAL_LINKS vẫn dùng preview
// + nút sửa cho tới Bước 3.
const INLINE_BLOCK_TYPES = [...Object.keys(BLOCK_FORM_CONFIGS), 'SKILL', 'LANGUAGE'];
const REFERENCE_BLOCK_TYPES = ['SKILL', 'LANGUAGE'];

/**
 * Card đại diện cho 1 block trên sandbox ProfilePage — style Blueprint Dossier:
 * nền trắng, viền mảnh, nhãn góc kiểu chú thích bản vẽ kỹ thuật (VD "EXP · 02").
 * Kéo-thả/resize do react-grid-layout quản lý qua class "block-drag-handle".
 *
 * @param {object}   layoutItem   - { blockType, visible }
 * @param {object}   profileData  - toàn bộ response getFullProfile
 * @param {number}   userId
 * @param {Function} onToggleVisibility - (blockType, nextVisible) => void
 * @param {Function} onEdit       - (blockType) => void — chỉ dùng cho block CHƯA chuyển inline
 * @param {Function} onSaved      - () => void — refetch profileData sau khi InlineEntryList lưu
 * @param {Function} onToast      - ({ type, message }) => void
 * @param {boolean}  isEditMode   - true = đang chỉnh bố cục (hiện tay cầm kéo + nút ẩn/hiện)
 */
const ProfileBlockCard = ({
  layoutItem, profileData, userId, onToggleVisibility, onEdit, onSaved, onToast, isEditMode,
}) => {
  const { blockType, visible } = layoutItem;
  const meta = BLOCK_META[blockType] || { label: blockType, repeatable: false };
  const Icon = BLOCK_ICON[blockType];
  const isInline = INLINE_BLOCK_TYPES.includes(blockType);
  const itemCount = meta.repeatable ? getBlockItems(blockType, profileData).length : null;

  return (
    <div
      className={`h-full w-full flex flex-col bg-white border border-graphite/12 rounded-xl overflow-hidden
        transition-opacity ${visible ? '' : 'opacity-40 saturate-0'}`}
      style={{ boxShadow: '0 1px 2px rgba(28,35,51,0.04), 0 1px 8px rgba(28,35,51,0.03)' }}
    >
      {/* ─── Header: nhãn góc kiểu bản vẽ kỹ thuật, không còn dải màu to ─── */}
      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-graphite/10 shrink-0 bg-paper/60">
        {isEditMode && (
          <span
            className="block-drag-handle flex items-center cursor-grab active:cursor-grabbing text-graphite/25 hover:text-ink shrink-0"
            title="Kéo để di chuyển"
          >
            <GripVertical size={15} strokeWidth={2} />
          </span>
        )}

        {Icon && <Icon size={13} strokeWidth={2} className="text-ink shrink-0" />}

        <h3 className="flex-1 text-[11px] font-semibold text-graphite/70 uppercase tracking-wider truncate font-body">
          {meta.label}
        </h3>

        <span className="text-[10px] font-medium text-ink bg-ink-light rounded px-1.5 py-0.5 shrink-0 font-tag">
          {BLOCK_TAG[blockType]}{itemCount !== null ? ` · ${String(itemCount).padStart(2, '0')}` : ''}
        </span>

        {isEditMode && !isInline && (
          <button
            type="button"
            onClick={() => onEdit(blockType)}
            className="p-1 text-graphite/40 hover:text-ink transition-colors shrink-0"
            title="Chỉnh sửa"
          >
            <Pencil size={13} strokeWidth={2} />
          </button>
        )}

        {isEditMode && (
          <button
            type="button"
            onClick={() => onToggleVisibility(blockType, !visible)}
            className="p-1 text-graphite/40 hover:text-ink transition-colors shrink-0"
            title={visible ? 'Ẩn khỏi ProfilePage' : 'Hiện trên ProfilePage'}
          >
            {visible ? <Eye size={13} strokeWidth={2} /> : <EyeOff size={13} strokeWidth={2} />}
          </button>
        )}
      </div>

      {/* ─── Nội dung ─── */}
      <div className="px-3.5 py-3 flex-1 min-h-0 overflow-y-auto">
        {REFERENCE_BLOCK_TYPES.includes(blockType) ? (
          <InlineReferenceEntryList
            blockType={blockType}
            userId={userId}
            items={getBlockItems(blockType, profileData)}
            onSaved={onSaved}
            onToast={onToast}
            readOnly={!isEditMode}
          />
        ) : isInline ? (
          <InlineEntryList
            blockType={blockType}
            userId={userId}
            items={getBlockItems(blockType, profileData)}
            onSaved={onSaved}
            onToast={onToast}
            readOnly={!isEditMode}
          />
        ) : (
          renderBlockSummary(blockType, profileData)
        )}
      </div>
    </div>
  );
};

export default ProfileBlockCard;

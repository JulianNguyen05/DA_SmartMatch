// src/components/common/neo/NeoModal.jsx
import React from 'react';
import { X } from 'lucide-react';

/**
 * Modal phong cách neobrutalism — dùng riêng cho các khu vực đã áp dụng style này
 * (vd: trang Profile). KHÔNG thay thế Modal.jsx gốc, vì các trang khác vẫn đang
 * dùng style bo tròn/mềm mại của Modal cũ và không nên bị ảnh hưởng.
 *
 * Token dùng chung: border-[3px] border-black, boxShadow 8px 8px 0 #111111 —
 * khớp với ProfileBlockCard. Xem shared/blockConfig.jsx (BLOCK_COLOR) để chọn
 * accentColor đồng bộ với màu header của block tương ứng.
 *
 * @param {boolean}  isOpen
 * @param {Function} onClose
 * @param {string}   title
 * @param {string}   [accentColor='#2DD4BF'] - màu nền header (mặc định teal thương hiệu Worklify)
 * @param {boolean}  [closeOnOverlayClick=true]
 * @param {React.ReactNode} children
 */
const NeoModal = ({
  isOpen, onClose, title, accentColor = '#2DD4BF', closeOnOverlayClick = true, children,
}) => {
  if (!isOpen) return null;

  const handleOverlayClick = () => {
    if (closeOnOverlayClick) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-[2px]"
      onClick={handleOverlayClick}
    >
      <div
        className="w-full max-w-lg max-h-[90vh] flex flex-col bg-white border-[3px] border-black overflow-hidden"
        style={{ boxShadow: '8px 8px 0px 0px #111111' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ─── Header: màu accent + tiêu đề hoa đậm + nút đóng vuông ─── */}
        <div
          className="flex items-center justify-between gap-3 px-5 py-3.5 border-b-[3px] border-black shrink-0"
          style={{ backgroundColor: accentColor }}
        >
          <h2 className="text-sm sm:text-base font-black uppercase tracking-wide text-black truncate">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 bg-white border-2 border-black text-black hover:bg-black hover:text-white transition-colors shrink-0"
            title="Đóng"
          >
            <X size={16} strokeWidth={2.75} />
          </button>
        </div>

        {/* ─── Nội dung: cuộn riêng nếu form dài hơn 90vh ─── */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default NeoModal;

// src/components/common/neo/NeoButton.jsx
import React from 'react';
import { Loader2 } from 'lucide-react';

// Màu lấy từ shared/blockConfig.jsx (BLOCK_COLOR) để đồng bộ tông với toàn trang Profile
const VARIANT_CLASSES = {
  primary: 'bg-black text-white hover:bg-white hover:text-black',
  outline: 'bg-white text-black hover:bg-black hover:text-white',
  danger: 'bg-[#F87171] text-black hover:bg-black hover:text-white', // đỏ AWARD
  ghost: 'bg-transparent text-black border-transparent shadow-none hover:bg-black/5',
};

/**
 * Nút bấm phong cách neobrutalism — dùng riêng cho khu vực đã áp dụng style này
 * (trang Profile). KHÔNG thay thế Button.jsx gốc.
 *
 * Hiệu ứng "nhấn xuống giấy": khi active, nút dịch chuyển theo hướng bóng đổ
 * và bóng biến mất, mô phỏng cảm giác bị ấn lún xuống — đặc trưng của neobrutalism.
 *
 * @param {'primary'|'outline'|'danger'|'ghost'} [variant='primary']
 * @param {boolean} [isLoading=false]
 * @param {boolean} [disabled=false]
 * @param {string}  [type='button']
 * @param {string}  [className] - class bổ sung (vd: 'flex-1' để full width trong footer form)
 * @param {Function} onClick
 * @param {React.ReactNode} children
 */
const NeoButton = ({
  variant = 'primary', isLoading = false, disabled = false, type = 'button',
  className = '', onClick, children, ...rest
}) => {
  const isGhost = variant === 'ghost';
  const isDisabled = disabled || isLoading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={[
        'inline-flex items-center justify-center gap-2 px-4 py-2.5',
        'text-xs sm:text-sm font-black uppercase tracking-wide',
        !isGhost && 'border-[3px] border-black',
        'transition-all duration-100 select-none',
        isDisabled
          ? 'opacity-40 cursor-not-allowed shadow-none'
          : 'active:translate-x-[3px] active:translate-y-[3px] active:shadow-none',
        VARIANT_CLASSES[variant] || VARIANT_CLASSES.primary,
        className,
      ].filter(Boolean).join(' ')}
      style={!isGhost && !isDisabled ? { boxShadow: '4px 4px 0px 0px #111111' } : undefined}
      {...rest}
    >
      {isLoading && <Loader2 size={14} className="animate-spin shrink-0" />}
      {children}
    </button>
  );
};

export default NeoButton;

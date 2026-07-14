// src/components/common/neo/NeoInput.jsx
import React from 'react';

/**
 * Input phong cách neobrutalism — dùng riêng cho khu vực đã áp dụng style này
 * (trang Profile). KHÔNG thay thế Input.jsx gốc.
 *
 * Label chữ hoa đậm nhỏ phía trên, viền đen dày 3px, khi focus dịch nhẹ theo
 * hướng bóng đổ để tạo cảm giác "nổi lên khỏi trang".
 *
 * @param {string} label
 * @param {string} [error]     - thông báo lỗi hiển thị bên dưới, đồng thời đổi viền sang đỏ
 * @param {string} [type='text']
 * @param {string} [className] - áp cho <input>, không phải wrapper
 */
const NeoInput = ({ label, error, type = 'text', className = '', id, ...rest }) => {
  const inputId = id || (label ? label.replace(/\s+/g, '-').toLowerCase() : undefined);

  return (
    <div>
      {label && (
        <label htmlFor={inputId} className="block text-xs font-black uppercase tracking-wide text-black mb-1.5">
          {label}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        className={[
          'w-full px-3 py-2.5 text-sm font-medium bg-white text-black',
          'border-[3px]',
          error ? 'border-[#F87171]' : 'border-black',
          'outline-none transition-all duration-100',
          'focus:shadow-[4px_4px_0px_0px_#111111] focus:-translate-x-[1px] focus:-translate-y-[1px]',
          'placeholder:text-gray-400 placeholder:font-normal',
          className,
        ].filter(Boolean).join(' ')}
        {...rest}
      />
      {error && (
        <p className="mt-1 text-[11px] font-black uppercase tracking-wide text-[#F87171]">{error}</p>
      )}
    </div>
  );
};

export default NeoInput;

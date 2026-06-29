import React from "react";
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Type,
  Baseline,
} from "lucide-react";
import { CV_FONT_SIZES } from "../templates/cvTemplateCore";

const TextFormatToolbar = () => {
  // Hàm gọi API lõi của trình duyệt để định dạng chữ
  const formatText = (command, value = null) => {
    document.execCommand(command, false, value);
  };

  // Bảng màu fix cứng để không làm mất vùng bôi đen (selection) khi click
  const TEXT_COLORS = [
    "#000000",
    "#374151",
    "#dc2626",
    "#2563eb",
    "#16a34a",
    "#d97706",
    "#9333ea",
  ];

  return (
    <div className="mb-6">
      <label className="block font-semibold text-sm text-gray-700 mb-3">
        Định dạng văn bản
      </label>

      {/* CỰC KỲ QUAN TRỌNG: onMouseDown preventDefault giúp click nút mà không bị mất bôi đen chữ */}
      <div
        className="flex flex-col gap-2 p-2 bg-gray-50 border border-gray-200 rounded-lg shadow-sm"
        onMouseDown={(e) => e.preventDefault()}
      >
        {/* Hàng 1: Kiểu chữ & Căn lề */}
        <div className="flex flex-wrap items-center gap-1">
          <button
            onClick={() => formatText("bold")}
            className="p-1.5 hover:bg-gray-200 text-gray-700 rounded transition-colors"
            title="In đậm"
          >
            <Bold size={16} />
          </button>
          <button
            onClick={() => formatText("italic")}
            className="p-1.5 hover:bg-gray-200 text-gray-700 rounded transition-colors"
            title="In nghiêng"
          >
            <Italic size={16} />
          </button>
          <button
            onClick={() => formatText("underline")}
            className="p-1.5 hover:bg-gray-200 text-gray-700 rounded transition-colors"
            title="Gạch chân"
          >
            <Underline size={16} />
          </button>

          <div className="w-px h-5 bg-gray-300 self-center mx-1"></div>

          <button
            onClick={() => formatText("justifyLeft")}
            className="p-1.5 hover:bg-gray-200 text-gray-700 rounded transition-colors"
            title="Căn trái"
          >
            <AlignLeft size={16} />
          </button>
          <button
            onClick={() => formatText("justifyCenter")}
            className="p-1.5 hover:bg-gray-200 text-gray-700 rounded transition-colors"
            title="Căn giữa"
          >
            <AlignCenter size={16} />
          </button>
          <button
            onClick={() => formatText("justifyRight")}
            className="p-1.5 hover:bg-gray-200 text-gray-700 rounded transition-colors"
            title="Căn phải"
          >
            <AlignRight size={16} />
          </button>
          <button
            onClick={() => formatText("justifyFull")}
            className="p-1.5 hover:bg-gray-200 text-gray-700 rounded transition-colors"
            title="Căn đều"
          >
            <AlignJustify size={16} />
          </button>
        </div>

        <div className="h-px w-full bg-gray-200 my-0.5"></div>

        {/* Hàng 2: Kích cỡ & Màu sắc */}
        <div className="flex flex-col gap-2 mt-1">
          {/* Kích cỡ chữ */}
          <div className="flex items-center gap-2">
            <Baseline
              size={14}
              className="text-gray-500 w-5"
              title="Kích cỡ chữ"
            />
            <div className="flex gap-1 flex-wrap">
              {CV_FONT_SIZES.map((size) => (
                <button
                  key={size.value}
                  onClick={() => formatText("fontSize", size.value)}
                  className="px-2 py-1 text-[11px] font-medium border border-gray-300 bg-white hover:bg-gray-100 rounded text-gray-700 transition-colors"
                >
                  {size.label}
                </button>
              ))}
            </div>
          </div>

          {/* Màu chữ (Dùng Swatch button thay vì input color) */}
          <div className="flex items-center gap-2">
            <Type size={14} className="text-gray-500 w-5" title="Màu chữ" />
            <div className="flex gap-1.5 flex-wrap">
              {TEXT_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => formatText("foreColor", color)}
                  className="w-5 h-5 rounded-full border border-gray-300 shadow-sm transform hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  title={`Đổi màu: ${color}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <p className="text-[11px] text-gray-400 mt-2 italic">
        * Bôi đen chữ trên trang CV rồi bấm công cụ để định dạng.
      </p>
    </div>
  );
};

export default TextFormatToolbar;
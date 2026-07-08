import React, { useState, useEffect } from "react"; // ✅ Đã thêm useEffect
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

const FONT_SIZE_OPTIONS = [
  ...Array.from({ length: 15 }, (_, i) => 10 + i),
  26,
  30,
  32,
  36,
  48,
];

const TextFormatToolbar = () => {
  // State quản lý đóng/mở dropdown cỡ chữ
  const [showSizeDropdown, setShowSizeDropdown] = useState(false);

  // ✅ State lưu trữ trạng thái định dạng đang hoạt động của vùng bôi đen
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    align: "left",
    fontSize: "Cỡ chữ",
    color: "#000000",
  });

  /**
   * Hàm hỗ trợ chuyển đổi hệ màu RGB của trình duyệt sang dạng HEX (#ffffff) để so khớp màu sắc
   */
  const rgbToHex = (rgb) => {
    if (!rgb) return "#000000";
    const match = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (!match) return rgb;
    return (
      "#" +
      [match[1], match[2], match[3]]
        .map((x) => {
          const hex = parseInt(x, 10).toString(16);
          return hex.length === 1 ? "0" + hex : hex;
        })
        .join("")
    );
  };

  /**
   * ✅ HÀM ĐỒNG BỘ: Kiểm tra vùng bôi đen đang có định dạng gì và cập nhật lên UI
   */
  const syncToolbarState = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    let node = selection.anchorNode;
    if (!node) return;

    // Nếu con trỏ đang ở text node, lấy phần tử HTML cha bọc nó
    if (node.nodeType === Node.TEXT_NODE) {
      node = node.parentElement;
    }

    // Chỉ đồng bộ nếu người dùng đang click/bôi đen bên trong ô nhập liệu CV (contenteditable)
    const isInEditable = node?.closest("[contenteditable='true']");
    if (!isInEditable) return;

    // 1. Lấy trạng thái Bold, Italic, Underline từ trình duyệt
    const isBold = document.queryCommandState("bold");
    const isItalic = document.queryCommandState("italic");
    const isUnderline = document.queryCommandState("underline");

    // 2. Lấy trạng thái căn lề từ lệnh hệ thống hoặc computedStyle
    let currentAlign = "left";
    if (document.queryCommandState("justifyCenter")) currentAlign = "center";
    else if (document.queryCommandState("justifyRight")) currentAlign = "right";
    else if (document.queryCommandState("justifyFull")) currentAlign = "justify";
    else {
      // Dự phòng nếu execCommand không trả về chính xác, đọc trực tiếp CSS computed
      const computedAlign = window.getComputedStyle(node).textAlign;
      if (["center", "right", "justify"].includes(computedAlign)) {
        currentAlign = computedAlign;
      }
    }

    // 3. Đọc cỡ chữ và màu sắc thực tế từ thuộc tính CSS đã được tính toán
    const computedStyle = window.getComputedStyle(node);
    const rawFontSize = computedStyle.fontSize; // Trả về dạng ví dụ: "16px"
    const rawColor = computedStyle.color;       // Trả về dạng ví dụ: "rgb(55, 65, 81)"

    const fontSizePx = rawFontSize ? rawFontSize.replace("px", "") : "Cỡ chữ";
    // Làm tròn số nếu kích thước font bị lẻ (ví dụ 14.4px -> 14px)
    const formattedFontSize = !isNaN(fontSizePx) ? Math.round(parseFloat(fontSizePx)).toString() : "Cỡ chữ";

    setActiveFormats({
      bold: isBold,
      italic: isItalic,
      underline: isUnderline,
      align: currentAlign,
      fontSize: formattedFontSize,
      color: rgbToHex(rawColor).toLowerCase(),
    });
  };

  // ✅ Lắng nghe sự kiện bôi đen (selectionchange) trên toàn hệ thống văn bản
  useEffect(() => {
    document.addEventListener("selectionchange", syncToolbarState);
    return () => {
      document.removeEventListener("selectionchange", syncToolbarState);
    };
  }, []);

  /**
   * Áp dụng kích cỡ chữ (px) cho vùng bôi đen.
   */
  const applyFontSize = (pxValue) => {
    document.execCommand("fontSize", false, "7");

    const selection = window.getSelection();
    const container =
      selection?.anchorNode?.parentElement?.closest(
        "[contenteditable='true']"
      ) ??
      document.querySelector("[contenteditable='true']:focus") ??
      document.activeElement;

    if (container) {
      const fontEls = container.querySelectorAll('font[size="7"]');
      fontEls.forEach((el) => {
        el.removeAttribute("size");
        el.style.fontSize = `${pxValue}px`;
      });
    }
    // Trút dữ liệu cập nhật ngay lập tức lên thanh công cụ
    setTimeout(syncToolbarState, 20);
  };

  /**
   * Áp dụng định dạng hệ thống (In đậm, nghiêng, căn lề, màu sắc...)
   */
  const formatText = (command, value = null) => {
    document.execCommand(command, false, value);
    // Trút dữ liệu cập nhật ngay lập tức lên thanh công cụ
    setTimeout(syncToolbarState, 20);
  };

  // Danh sách màu sắc mặc định (Worklify blue dẫn đầu)
  const TEXT_COLORS = [
    "#000000", // Black
    "#FFFFFF", // White
    "#2563EB", // Blue
    "#14B8A6", // Teal
    "#16A34A", // Green
    "#9333EA", // Purple
    "#374151", // Gray
  ];

  return (
    <div className="mb-6">
      <label className="block font-semibold text-sm text-slate-700 mb-3">
        Định dạng văn bản
      </label>

      {/* Giữ nguyên preventDefault để tránh mất vùng bôi đen khi tương tác toolbar */}
      <div
        className="flex flex-col gap-2 p-2 bg-slate-50 border border-slate-200 rounded-xl shadow-sm"
        onMouseDown={(e) => e.preventDefault()}
      >
        {/* Hàng 1: Kiểu chữ & Căn lề */}
        <div className="flex flex-wrap items-center gap-1">
          {/* Nút In Đậm */}
          <button
            onClick={() => formatText("bold")}
            className={`p-1.5 rounded transition-colors ${
              activeFormats.bold
                ? "bg-[#EFF6FF] text-[#2563EB] font-bold border border-[#BFDBFE]"
                : "hover:bg-[#EFF6FF] hover:text-[#2563EB] text-slate-600"
            }`}
            title="In đậm"
          >
            <Bold size={16} />
          </button>

          {/* Nút In Nghiêng */}
          <button
            onClick={() => formatText("italic")}
            className={`p-1.5 rounded transition-colors ${
              activeFormats.italic
                ? "bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]"
                : "hover:bg-[#EFF6FF] hover:text-[#2563EB] text-slate-600"
            }`}
            title="In nghiêng"
          >
            <Italic size={16} />
          </button>

          {/* Nút Gạch Chân */}
          <button
            onClick={() => formatText("underline")}
            className={`p-1.5 rounded transition-colors ${
              activeFormats.underline
                ? "bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]"
                : "hover:bg-[#EFF6FF] hover:text-[#2563EB] text-slate-600"
            }`}
            title="Gạch chân"
          >
            <Underline size={16} />
          </button>

          <div className="w-px h-5 bg-slate-300 self-center mx-1"></div>

          {/* Nhóm căn lề */}
          <button
            onClick={() => formatText("justifyLeft")}
            className={`p-1.5 rounded transition-colors ${
              activeFormats.align === "left"
                ? "bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]"
                : "hover:bg-[#EFF6FF] hover:text-[#2563EB] text-slate-600"
            }`}
            title="Căn trái"
          >
            <AlignLeft size={16} />
          </button>
          <button
            onClick={() => formatText("justifyCenter")}
            className={`p-1.5 rounded transition-colors ${
              activeFormats.align === "center"
                ? "bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]"
                : "hover:bg-[#EFF6FF] hover:text-[#2563EB] text-slate-600"
            }`}
            title="Căn giữa"
          >
            <AlignCenter size={16} />
          </button>
          <button
            onClick={() => formatText("justifyRight")}
            className={`p-1.5 rounded transition-colors ${
              activeFormats.align === "right"
                ? "bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]"
                : "hover:bg-[#EFF6FF] hover:text-[#2563EB] text-slate-600"
            }`}
            title="Căn phải"
          >
            <AlignRight size={16} />
          </button>
          <button
            onClick={() => formatText("justifyFull")}
            className={`p-1.5 rounded transition-colors ${
              activeFormats.align === "justify"
                ? "bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]"
                : "hover:bg-[#EFF6FF] hover:text-[#2563EB] text-slate-600"
            }`}
            title="Căn đều"
          >
            <AlignJustify size={16} />
          </button>
        </div>

        <div className="h-px w-full bg-slate-200 my-0.5"></div>

        {/* Hàng 2: Kích cỡ chữ & Màu sắc */}
        <div className="flex flex-col gap-2 mt-1">
          {/* Dropdown kích cỡ chữ tự động cập nhật text hiển thị */}
          <div className="flex items-center gap-2 mb-2">
            <Baseline size={14} className="text-slate-500 w-5" title="Kích cỡ chữ" />
            
            <div className="relative inline-block text-left">
              <button
                onClick={() => setShowSizeDropdown(!showSizeDropdown)}
                className="px-2 py-1 text-[12px] font-semibold border border-slate-300 bg-white hover:bg-slate-50 rounded-md text-slate-700 outline-none cursor-pointer min-w-[90px] flex items-center justify-between gap-1 shadow-sm"
              >
                {/* Hiển thị số px thực tế đang được chọn, nếu không có thì ghi 'Cỡ chữ' */}
                <span>
                  {!isNaN(activeFormats.fontSize)
                    ? `${activeFormats.fontSize}px`
                    : activeFormats.fontSize}
                </span>
                <span className="text-[8px] text-slate-400">▼</span>
              </button>

              {showSizeDropdown && (
                <div className="absolute left-0 mt-1 max-h-48 w-24 overflow-y-auto bg-white border border-slate-200 rounded-lg shadow-lg z-50 py-1 scrollbar-thin">
                  {FONT_SIZE_OPTIONS.map((size) => (
                    <button
                      key={size}
                      onClick={() => {
                        applyFontSize(size);
                        setShowSizeDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-[12px] transition-colors block ${
                        activeFormats.fontSize === size.toString()
                          ? "bg-[#EFF6FF] text-[#2563EB] font-bold"
                          : "text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {size}px
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Chọn Màu sắc và làm nổi màu đang được active */}
          <div className="flex items-center gap-2">
            <Type size={14} className="text-slate-500 w-5" title="Màu chữ" />
            <div className="flex gap-1.5 flex-wrap">
              {TEXT_COLORS.map((color) => {
                const isColorActive = activeFormats.color === color.toLowerCase();
                return (
                  <button
                    key={color}
                    onClick={() => formatText("foreColor", color)}
                    className={`w-5 h-5 rounded-full border shadow-sm transform transition-all ${
                      isColorActive
                        ? "scale-125 ring-2 ring-offset-2 ring-[#2563EB] border-[#2563EB]"
                        : "border-slate-300 hover:scale-110"
                    }`}
                    style={{ backgroundColor: color }}
                    title={`Đổi màu: ${color}`}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <p className="text-[11px] text-slate-400 mt-2 italic">
        * Bôi đen chữ trên trang CV để xem trạng thái định dạng hoặc chỉnh sửa.
      </p>
    </div>
  );
};

export default TextFormatToolbar;
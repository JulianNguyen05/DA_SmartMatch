# Toàn bộ code thư mục cv-builder

## File: `shared/captureCvThumbnail.js`

```javascript
/**
 * captureCvThumbnail.js
 *
 * Pipeline dùng CHUNG để tạo ảnh thumbnail từ khung giấy CV (paperRef).
 * Dùng ở bất kỳ đâu cần "chụp lại" CV thành ảnh: CVBuilderPage (lúc lưu),
 * CVManagerPage (nút "Tạo lại ảnh xem trước"), v.v. Tránh copy-paste logic
 * chụp ảnh ở nhiều nơi rồi lệch nhau (chỗ nhớ fix, chỗ quên fix).
 *
 * Gộp lại 3 lớp fix đã áp dụng trước đó (xem lịch sử trao đổi):
 *  1. Tắt hẳn CSS transition trước khi chụp -> tránh chụp phải khung hình
 *     đang chuyển động dở dang (gây vỡ layout/chữ đè nhau).
 *  2. loadExternalStyleSheet: true -> nhúng đúng font Google Fonts vào ảnh,
 *     tránh ảnh bị fallback sang font khác (sai độ rộng chữ -> sai xuống dòng).
 *  3. Mô phỏng ngắt trang A4 (page-break) ngay trước khi chụp, dựa theo cơ chế
 *     phân trang cũ (setupPagination) nhưng chỉ áp dụng có chủ đích cho ảnh
 *     thumbnail, không đụng vào màn hình đang thiết kế trực tiếp.
 */
import domtoimage from 'dom-to-image-more';
import { CV_PAGE_HEIGHT_PX, applyCvPageBreaks } from '../templates/cvTemplateCore';

const PAGE_GAP_PX = 40; // khoảng trắng hiển thị giữa 2 trang trong ảnh thumbnail

/**
 * Chụp ảnh thumbnail từ khung giấy CV, có tách trang (page-break) giống bản in thật.
 *
 * @param {HTMLElement} rootElement - phần tử DOM khung giấy CV (vd: paperRef.current)
 * @param {Object} [options]
 * @param {boolean} [options.withPageBreaks=true] - có mô phỏng ngắt trang hay không
 * @param {number} [options.quality=0.85]
 * @param {string} [options.bgcolor='#ffffff']
 * @returns {Promise<Blob>}
 */
export async function captureCvThumbnail(rootElement, options = {}) {
  const { withPageBreaks = true, quality = 0.85, bgcolor = '#ffffff' } = options;

  if (!rootElement) throw new Error('captureCvThumbnail: rootElement không tồn tại');

  rootElement.classList.add('wl-no-transition');

  if (document.fonts?.ready) {
    try { await document.fonts.ready; } catch (_) { /* bỏ qua, vẫn tiếp tục chụp */ }
  }
  await new Promise((resolve) => requestAnimationFrame(resolve));

  const restorePageBreaks = withPageBreaks
    ? applyCvPageBreaks(rootElement, { pageGap: PAGE_GAP_PX }).restore
    : null;

  // Đợi thêm 1 nhịp để marginTop vừa gán phản ánh đúng vào layout trước khi đo kích thước
  if (withPageBreaks) {
    await new Promise((resolve) => requestAnimationFrame(resolve));
  }

  try {
    const blob = await domtoimage.toBlob(rootElement, {
      quality,
      bgcolor,
      width: rootElement.offsetWidth,
      height: rootElement.offsetHeight,
      loadExternalStyleSheet: true,
    });
    return blob;
  } finally {
    restorePageBreaks?.();
    rootElement.classList.remove('wl-no-transition');
  }
}

/**
 * Tiện ích: chụp thumbnail rồi bọc luôn thành File (sẵn để upload).
 * @param {HTMLElement} rootElement
 * @param {string} fileName - vd: `cv_thumbnail_${cvId}.jpg`
 * @param {Object} [options] - xem captureCvThumbnail
 */
export async function captureCvThumbnailAsFile(rootElement, fileName, options = {}) {
  const blob = await captureCvThumbnail(rootElement, options);
  return new File([blob], fileName, { type: 'image/jpeg' });
}
```

## File: `shared/EditableBlock.jsx`

```javascript
import React from "react";
import { ArrowUp, ArrowDown, Plus } from "lucide-react";

const EditableBlock = ({
  children,
  onUp,
  onDown,
  onDelete,
  onAdd,
  showAdd = false,
}) => {
  return (
    <div className="relative group border border-transparent hover:border-red-400 hover:border-dashed transition-colors duration-200">
      {children}
      <div className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center -mt-3 -mr-2 z-10 shadow-sm">
        {onUp && (
          <button
            onClick={onUp}
            className="px-1 bg-gray-500 text-white rounded-l text-[10px] hover:bg-gray-600"
          >
            <ArrowUp size={12} />
          </button>
        )}
        {onDown && (
          <button
            onClick={onDown}
            className="px-1 bg-gray-500 text-white border-l border-gray-400 text-[10px] hover:bg-gray-600"
          >
            <ArrowDown size={12} />
          </button>
        )}
        {onDelete && (
          <button
            onClick={onDelete}
            className="py-1 bg-red-500 text-white border-l border-red-400 text-[10px] hover:bg-red-600 flex items-center gap-1"
          >
            <span>Xóa</span>
          </button>
        )}
        {showAdd && onAdd && (
          <button
            onClick={onAdd}
            className="py-1 bg-[#00b14f] text-white border-l border-green-400 rounded-r text-[10px] hover:bg-green-600 flex items-center gap-1"
          >
            <Plus size={12} /> <span>Thêm</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default EditableBlock;
```

## File: `shared/EditableParagraphList.jsx`

```javascript
import React from "react";
import { ArrowUp, ArrowDown, Trash2, Plus } from "lucide-react";

const EditableParagraphList = ({
  items,
  sectionId,
  primaryColor,
  onUpdateItems,
  emptyItemTemplate,
}) => {
  const handleTextChange = (index, field, newText) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: newText };
    onUpdateItems(sectionId, updatedItems);
  };

  const handleHTMLBlur = (e, index, field) => {
    let val = e.currentTarget.innerHTML.trim();
    if (val === "<br>") val = "";
    handleTextChange(index, field, val);
  };

  const handleMoveUp = (index) => {
    if (index === 0) return;
    const updatedItems = [...items];
    [updatedItems[index - 1], updatedItems[index]] = [
      updatedItems[index],
      updatedItems[index - 1],
    ];
    onUpdateItems(sectionId, updatedItems);
  };

  const handleMoveDown = (index) => {
    if (index === items.length - 1) return;
    const updatedItems = [...items];
    [updatedItems[index + 1], updatedItems[index]] = [
      updatedItems[index],
      updatedItems[index + 1],
    ];
    onUpdateItems(sectionId, updatedItems);
  };

  const handleDelete = (index) => {
    const updatedItems = items.filter((_, i) => i !== index);
    onUpdateItems(sectionId, updatedItems);
  };

  const handleAddAfter = (index) => {
    const updatedItems = [...items];
    updatedItems.splice(index + 1, 0, { ...emptyItemTemplate });
    onUpdateItems(sectionId, updatedItems);
  };

  // Khi chưa có item nào, cần nút thêm item đầu tiên
  const handleAddFirst = () => {
    onUpdateItems(sectionId, [{ ...emptyItemTemplate }]);
  };

  const editableClasses =
    "outline-none focus:bg-blue-50 focus:ring-1 focus:ring-blue-300 rounded px-1 transition-all empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400 empty:before:pointer-events-none empty:before:block cursor-text w-full";

  return (
    <div className="w-full relative group/section">
      <div className="space-y-1 relative">
        {items.map((item, index) => (
          <div key={index} className="relative group/item transition-all">
            {/* Toolbar mini */}
            <div
              className="absolute right-0 -top-6 flex-row gap-1 bg-gray-50/90 shadow-sm border rounded-md px-1 z-10 opacity-0 invisible group-hover/item:opacity-100 group-hover/item:visible transition-all flex"
              contentEditable="false"
            >
              <button
                onClick={() => handleMoveUp(index)}
                disabled={index === 0}
                className="px-1 hover:bg-gray-200 rounded text-gray-600 disabled:opacity-30 transition-colors"
              >
                <ArrowUp size={14} />
              </button>
              <button
                onClick={() => handleMoveDown(index)}
                disabled={index === items.length - 1}
                className="px-1 hover:bg-gray-200 rounded text-gray-600 disabled:opacity-30 transition-colors"
              >
                <ArrowDown size={14} />
              </button>
              <div className="w-px h-4 bg-gray-300 self-center mx-1"></div>
              <button
                onClick={() => handleAddAfter(index)}
                className="px-1 hover:bg-green-100 rounded transition-colors"
                style={{ color: primaryColor }}
              >
                <Plus size={14} />
              </button>
              <div className="w-px h-4 bg-gray-300 self-center mx-1"></div>
              <button
                onClick={() => handleDelete(index)}
                className="px-1 hover:bg-red-100 rounded text-red-500 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>

            <div
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => handleHTMLBlur(e, index, "description")}
              className={`text-[1em] text-gray-700 whitespace-pre-wrap min-h-[40px] leading-relaxed ${editableClasses}`}
              data-placeholder="Nhập nội dung đoạn văn tự do..."
              dangerouslySetInnerHTML={{ __html: item.description || "" }}
            />
          </div>
        ))}

        {items.length === 0 && (
          <div
            className="flex items-center gap-1 text-[1em] italic py-2 cursor-pointer w-fit"
            style={{ color: primaryColor }}
            onClick={handleAddFirst}
          >
            <Plus size={14} /> Thêm đoạn văn
          </div>
        )}
      </div>
    </div>
  );
};

export default EditableParagraphList;
```

## File: `shared/EditableRowList.jsx`

```javascript
import React from "react";
import { ArrowUp, ArrowDown, Trash2, Plus } from "lucide-react";

const EditableRowList = ({
  items,
  sectionId,
  primaryColor,
  onUpdateItems,
  emptyItemTemplate,
}) => {
  const handleTextChange = (index, field, newText) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: newText };
    onUpdateItems(sectionId, updatedItems);
  };

  const handleHTMLBlur = (e, index, field) => {
    let val = e.currentTarget.innerHTML.trim();
    if (val === "<br>") val = "";
    handleTextChange(index, field, val);
  };

  const handleMoveUp = (index) => {
    if (index === 0) return;
    const updatedItems = [...items];
    [updatedItems[index - 1], updatedItems[index]] = [
      updatedItems[index],
      updatedItems[index - 1],
    ];
    onUpdateItems(sectionId, updatedItems);
  };

  const handleMoveDown = (index) => {
    if (index === items.length - 1) return;
    const updatedItems = [...items];
    [updatedItems[index + 1], updatedItems[index]] = [
      updatedItems[index],
      updatedItems[index + 1],
    ];
    onUpdateItems(sectionId, updatedItems);
  };

  const handleDelete = (index) => {
    const updatedItems = items.filter((_, i) => i !== index);
    onUpdateItems(sectionId, updatedItems);
  };

  const handleAddAfter = (index) => {
    const updatedItems = [...items];
    updatedItems.splice(index + 1, 0, { ...emptyItemTemplate });
    onUpdateItems(sectionId, updatedItems);
  };

  const handleAddFirst = () => {
    onUpdateItems(sectionId, [{ ...emptyItemTemplate }]);
  };

  const editableClasses =
    "outline-none focus:bg-blue-50 focus:ring-1 focus:ring-blue-300 rounded p-0.5 transition-all empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400 empty:before:pointer-events-none empty:before:block cursor-text";

  return (
    <div className="w-full relative group/section">
      <div className="space-y-1 relative">
        {items.map((item, index) => (
          <div
            key={index}
            data-cv-pagebreak-item=""
            className="relative pb-1 border-b border-gray-100 last:border-0 group/item transition-all"
          >
            <div
              className="absolute right-0 -top-4 flex-row gap-1 bg-gray-50/90 shadow-sm border rounded-md px-1 z-10 opacity-0 invisible group-hover/item:opacity-100 group-hover/item:visible transition-all flex"
              contentEditable="false"
            >
              <button
                onClick={() => handleMoveUp(index)}
                disabled={index === 0}
                className="px-1 hover:bg-gray-200 rounded text-gray-600 disabled:opacity-30 transition-colors"
              >
                <ArrowUp size={14} />
              </button>
              <button
                onClick={() => handleMoveDown(index)}
                disabled={index === items.length - 1}
                className="px-1 hover:bg-gray-200 rounded text-gray-600 disabled:opacity-30 transition-colors"
              >
                <ArrowDown size={14} />
              </button>
              <div className="w-px h-4 bg-gray-300 self-center mx-1"></div>
              <button
                onClick={() => handleAddAfter(index)}
                className="px-1 hover:bg-green-100 rounded transition-colors"
                style={{ color: primaryColor }}
              >
                <Plus size={14} />
              </button>
              <div className="w-px h-4 bg-gray-300 self-center mx-1"></div>
              <button
                onClick={() => handleDelete(index)}
                className="px-1 hover:bg-red-100 rounded text-red-500 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>

            <div className="flex justify-between items-start gap-4 mb-0.5">
              <div
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => handleHTMLBlur(e, index, "title")}
                className={`font-semibold text-gray-900 flex-1 ${editableClasses}`}
                data-placeholder="Tiêu đề chính..."
                dangerouslySetInnerHTML={{ __html: item.title || "" }}
              />
              <div
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => handleHTMLBlur(e, index, "date")}
                className={`text-[0.85em] font-semibold italic text-right min-w-[80px] ${editableClasses}`}
                style={{ color: primaryColor }}
                data-placeholder="Thời gian..."
                dangerouslySetInnerHTML={{ __html: item.date || "" }}
              />
            </div>
            <div
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => handleHTMLBlur(e, index, "subtitle")}
              className={`text-[1em] text-gray-600 mb-2 ${editableClasses}`}
              data-placeholder="Tiêu đề phụ / Vị trí..."
              dangerouslySetInnerHTML={{ __html: item.subtitle || "" }}
            />
            <div
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => handleHTMLBlur(e, index, "description")}
              className={`text-[1em] text-gray-700 whitespace-pre-wrap min-h-[20px] ${editableClasses}`}
              data-placeholder="Mô tả chi tiết..."
              dangerouslySetInnerHTML={{ __html: item.description || "" }}
            />
          </div>
        ))}

        {items.length === 0 && (
          <div
            className="flex items-center gap-1 text-[1em] italic py-2 cursor-pointer w-fit"
            style={{ color: primaryColor }}
            onClick={handleAddFirst}
          >
            <Plus size={14} /> Thêm mục mới
          </div>
        )}
      </div>
    </div>
  );
};

export default EditableRowList;
```

## File: `shared/EditableTagList.jsx`

```javascript
import React from "react";
import { Trash2, Plus, MoveLeft, MoveRight } from "lucide-react";

const EditableTagList = ({
  items,
  sectionId,
  primaryColor,
  onUpdateItems,
  emptyItemTemplate,
}) => {
  const handleTextChange = (index, field, newText) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: newText };
    onUpdateItems(sectionId, updatedItems);
  };

  const handleHTMLBlur = (e, index, field) => {
    let val = e.currentTarget.innerHTML.trim();
    if (val === "<br>") val = "";
    handleTextChange(index, field, val);
  };

  const handleMoveLeft = (index) => {
    if (index === 0) return;
    const updatedItems = [...items];
    [updatedItems[index - 1], updatedItems[index]] = [
      updatedItems[index],
      updatedItems[index - 1],
    ];
    onUpdateItems(sectionId, updatedItems);
  };

  const handleMoveRight = (index) => {
    if (index === items.length - 1) return;
    const updatedItems = [...items];
    [updatedItems[index + 1], updatedItems[index]] = [
      updatedItems[index],
      updatedItems[index + 1],
    ];
    onUpdateItems(sectionId, updatedItems);
  };

  const handleDelete = (index) => {
    const updatedItems = items.filter((_, i) => i !== index);
    onUpdateItems(sectionId, updatedItems);
  };

  // Tag: thêm ngay sau index được hover
  const handleAddAfter = (index) => {
    const updatedItems = [...items];
    updatedItems.splice(index + 1, 0, { ...emptyItemTemplate });
    onUpdateItems(sectionId, updatedItems);
  };

  const handleAddFirst = () => {
    onUpdateItems(sectionId, [{ ...emptyItemTemplate }]);
  };

  const hexToRgba = (hex, opacity) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, ${opacity})`
      : "#f3f4f6";
  };
  const tagBgColor = hexToRgba(primaryColor, 0.1);

  return (
    <div className="w-full relative group/section">
      <div className="flex flex-wrap gap-2.5 relative">
        {items.map((item, index) => (
          <div
            key={index}
            className="relative group/item transition-all flex items-center mt-2"
          >
            <div
              className="absolute -top-8 left-1/2 transform -translate-x-1/2 flex-row gap-1 bg-gray-50/90 shadow-sm border rounded-md px-1 z-10 opacity-0 invisible group-hover/item:opacity-100 group-hover/item:visible transition-all flex"
              contentEditable="false"
            >
              <button
                onClick={() => handleMoveLeft(index)}
                disabled={index === 0}
                className="px-1 hover:bg-gray-200 rounded text-gray-600 disabled:opacity-30"
              >
                <MoveLeft size={12} />
              </button>
              <button
                onClick={() => handleMoveRight(index)}
                disabled={index === items.length - 1}
                className="px-1 hover:bg-gray-200 rounded text-gray-600 disabled:opacity-30"
              >
                <MoveRight size={12} />
              </button>
              <div className="w-px h-3 bg-gray-300 self-center mx-0.5"></div>
              <button
                onClick={() => handleAddAfter(index)}
                className="px-1 hover:bg-green-100 rounded transition-colors"
                style={{ color: primaryColor }}
              >
                <Plus size={12} />
              </button>
              <div className="w-px h-3 bg-gray-300 self-center mx-0.5"></div>
              <button
                onClick={() => handleDelete(index)}
                className="px-1 hover:bg-red-100 rounded text-red-500"
              >
                <Trash2 size={12} />
              </button>
            </div>

            <div
              className="px-3 py-1.5 rounded border text-[1em] font-medium focus-within:ring-2 transition-colors inline-flex items-center min-w-[50px] justify-center"
              style={{
                backgroundColor: tagBgColor,
                borderColor: primaryColor,
                color: "#374151",
              }}
            >
              <span
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => handleHTMLBlur(e, index, "title")}
                className="outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400 empty:before:italic cursor-text"
                data-placeholder="Nhập nội dung..."
                dangerouslySetInnerHTML={{ __html: item.title || "" }}
              />
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <div
            className="flex items-center gap-1 text-sm italic py-2 cursor-pointer w-fit"
            style={{ color: primaryColor }}
            onClick={handleAddFirst}
          >
            <Plus size={14} /> Thêm tag
          </div>
        )}
      </div>
    </div>
  );
};

export default EditableTagList;

```

## File: `shared/EditableTimelineList.jsx`

```javascript
import React from "react";
import { ArrowUp, ArrowDown, Trash2, Plus } from "lucide-react";

const EditableTimelineList = ({
  items,
  sectionId,
  primaryColor,
  onUpdateItems,
  emptyItemTemplate,
}) => {
  const handleTextChange = (index, field, newText) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: newText };
    onUpdateItems(sectionId, updatedItems);
  };

  const handleHTMLBlur = (e, index, field) => {
    let val = e.currentTarget.innerHTML.trim();
    if (val === "<br>") val = "";
    handleTextChange(index, field, val);
  };

  const handleMoveUp = (index) => {
    if (index === 0) return;
    const updatedItems = [...items];
    [updatedItems[index - 1], updatedItems[index]] = [
      updatedItems[index],
      updatedItems[index - 1],
    ];
    onUpdateItems(sectionId, updatedItems);
  };

  const handleMoveDown = (index) => {
    if (index === items.length - 1) return;
    const updatedItems = [...items];
    [updatedItems[index + 1], updatedItems[index]] = [
      updatedItems[index],
      updatedItems[index + 1],
    ];
    onUpdateItems(sectionId, updatedItems);
  };

  const handleDelete = (index) => {
    const updatedItems = items.filter((_, i) => i !== index);
    onUpdateItems(sectionId, updatedItems);
  };

  const handleAddAfter = (index) => {
    const updatedItems = [...items];
    updatedItems.splice(index + 1, 0, { ...emptyItemTemplate });
    onUpdateItems(sectionId, updatedItems);
  };

  const handleAddFirst = () => {
    onUpdateItems(sectionId, [{ ...emptyItemTemplate }]);
  };

  const editableClasses =
    "outline-none focus:bg-blue-50 focus:ring-1 focus:ring-blue-300 rounded transition-all w-full empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400 empty:before:pointer-events-none empty:before:block cursor-text";

  return (
    <div className="w-full relative group/section">
      <div className="space-y-1 relative">
        {items.map((item, index) => (
          <div
            key={index}
            data-cv-pagebreak-item=""
            className="relative flex gap-1 pb-1 border-b border-gray-100 last:border-0 group/item transition-all pl-3"
            style={{ borderLeft: `2px solid ${primaryColor}` }}
          >
            <div
              className="absolute left-0 -top-8 flex-row gap-1 bg-gray-50/90 shadow-sm border rounded-md px-1 z-10 opacity-0 invisible group-hover/item:opacity-100 group-hover/item:visible transition-all flex"
              contentEditable="false"
            >
              <button
                onClick={() => handleMoveUp(index)}
                disabled={index === 0}
                className="px-1 hover:bg-gray-200 rounded text-gray-600 disabled:opacity-30 transition-colors"
              >
                <ArrowUp size={14} />
              </button>
              <button
                onClick={() => handleMoveDown(index)}
                disabled={index === items.length - 1}
                className="px-1 hover:bg-gray-200 rounded text-gray-600 disabled:opacity-30 transition-colors"
              >
                <ArrowDown size={14} />
              </button>
              <div className="w-px h-4 bg-gray-300 self-center mx-1"></div>
              <button
                onClick={() => handleAddAfter(index)}
                className="px-1 hover:bg-green-100 rounded transition-colors"
                style={{ color: primaryColor }}
              >
                <Plus size={14} />
              </button>
              <div className="w-px h-4 bg-gray-300 self-center mx-1"></div>
              <button
                onClick={() => handleDelete(index)}
                className="px-1 hover:bg-red-100 rounded text-red-500 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>

            <div className="w-1/8 flex-shrink-0">
              <div
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => handleHTMLBlur(e, index, "date")}
                className={`text-[0.85em] font-semibold italic ${editableClasses}`}
                style={{ color: primaryColor }}
                data-placeholder="Bắt đầu - Kết thúc"
                dangerouslySetInnerHTML={{ __html: item.date || "" }}
              />
            </div>
            <div className="flex-1 w-3/4">
              <div
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => handleHTMLBlur(e, index, "title")}
                className={`font-semibold text-gray-900 ${editableClasses}`}
                data-placeholder="Tiêu đề chính..."
                dangerouslySetInnerHTML={{ __html: item.title || "" }}
              />
              <div
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => handleHTMLBlur(e, index, "subtitle")}
                className={`text-[1em] text-gray-600 ${editableClasses}`}
                data-placeholder="Tiêu đề phụ / Vị trí..."
                dangerouslySetInnerHTML={{ __html: item.subtitle || "" }}
              />
              <div
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => handleHTMLBlur(e, index, "description")}
                className={`text-[1em] text-gray-700 whitespace-pre-wrap min-h-[20px] ${editableClasses}`}
                data-placeholder="Mô tả chi tiết..."
                dangerouslySetInnerHTML={{ __html: item.description || "" }}
              />
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <div
            className="flex items-center gap-1 text-[1em] italic py-2 cursor-pointer w-fit"
            style={{ color: primaryColor }}
            onClick={handleAddFirst}
          >
            <Plus size={14} /> Thêm mục mới
          </div>
        )}
      </div>
    </div>
  );
};

export default EditableTimelineList;
```

## File: `sidebar/DraggableItem.jsx`

```javascript
import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

const SECTION_NAMES = {
  avatar: "Ảnh đại diện",
  contactInfo: "Danh thiếp",
  personalInfo: "Thông tin cá nhân",
  objective: "Mục tiêu nghề nghiệp",
  education: "Học vấn",
  experience: "Kinh nghiệm làm việc",
  activities: "Hoạt động",
  certifications: "Chứng chỉ",
  awards: "Giải thưởng",
  skills: "Kỹ năng",
  references: "Người tham chiếu",
  hobbies: "Sở thích",
  projects: "Dự án",
  customSection: "Thông tin thêm",
};

const DraggableItem = ({
  id,
  itemId,
  primaryColor,
  variant = "default",
  isOverlay = false,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    isDragging,
    transform,
    transition,
  } = useSortable({
    id: id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isOverlay ? 999 : "auto",
  };

  // Tự động nhận diện ID "customSection_123..." thành "Thông tin thêm"
  const displayName = itemId?.startsWith("customSection")
    ? "Thông tin thêm"
    : SECTION_NAMES[itemId] || itemId;

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
          borderColor: primaryColor,
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
        ${isOverlay ? "shadow-xl scale-105 rotate-2 text-white" : "hover:shadow-md hover:-translate-y-0.5 text-slate-700"}
        ${variant === "unused" && !isOverlay ? "bg-slate-50 border-slate-200 hover:border-[#2563EB]" : ""}
      `}
      style={{
        ...style,
        // Nếu là Overlay -> Đổ full nền màu xanh. Nếu bình thường -> Nền trắng/xám
        backgroundColor: isOverlay
          ? primaryColor
          : variant === "unused"
            ? "#F8FAFC"
            : "#ffffff",
        borderColor: isOverlay ? primaryColor : "#E2E8F0",
      }}
    >
      <GripVertical
        size={14}
        className={`flex-shrink-0 ${isOverlay ? "text-white" : "text-slate-400"}`}
      />
      <span className="text-sm font-medium flex-1 truncate">{displayName}</span>
    </div>
  );
};

export default DraggableItem;
```

## File: `sidebar/LayoutSidebar.jsx`

```javascript
import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, rectSortingStrategy } from '@dnd-kit/sortable';
import { ArrowUp, ArrowDown, Trash2, Plus } from 'lucide-react';
import DraggableItem from './DraggableItem';

const getColumnWidths = (ratio) => {
  switch (ratio) {
    case '1-9':
    case '10-90':
      return { left: '10%', right: '90%' };

    case '2-8':
    case '20-80':
      return { left: '20%', right: '80%' };

    case '3-7':
    case '30-70':
      return { left: '30%', right: '70%' };

    case '4-6':
    case '40-60':
      return { left: '40%', right: '60%' };

    case '5-5':
    case '50-50':
      return { left: '50%', right: '50%' };

    case '6-4':
    case '60-40':
      return { left: '60%', right: '40%' };

    case '7-3':
    case '70-30':
      return { left: '70%', right: '30%' };

    case '8-2':
    case '80-20':
      return { left: '80%', right: '20%' };

    case '9-1':
    case '90-10':
      return { left: '90%', right: '10%' };

    case '10-0':
    case '100-0':
      return { left: '100%', right: '0%' };

    default:
      return { left: '100%', right: '0%' };
  }
};

const LayoutSidebar = ({ layout, onChangeRatio, primaryColor, onAddRow, onDeleteRow, onMoveRow }) => {
  const { activeRows, unusedItems } = layout;

  return (
    <div className="p-5">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-lg text-slate-800">Tùy chỉnh bố cục</h3>
      </div>
      
      <div className="space-y-4 mb-6">
        {activeRows.map((row, index) => (
          <RowBlock 
            key={row.id} 
            row={row} 
            rowIndex={index} 
            isLastRow={index === activeRows.length - 1}
            onChangeRatio={onChangeRatio} 
            primaryColor={primaryColor} 
            onDeleteRow={onDeleteRow}
            onMoveRow={onMoveRow}
          />
        ))}
      </div>

      {/* NÚT THÊM HÀNG MỚI */}
      <div className="flex justify-center mb-8">
        <button 
          onClick={onAddRow}
          className="flex items-center gap-2 px-4 py-2 border border-dashed rounded-xl transition-all hover:shadow-sm"
          style={{ borderColor: primaryColor, color: primaryColor }}
        >
          <Plus size={16} /> 
          <span className="text-sm font-semibold">Thêm hàng mới</span>
        </button>
      </div>

      <UnusedItemsPool items={unusedItems} primaryColor={primaryColor} />
    </div>
  );
};

const RowBlock = ({ row, rowIndex, isLastRow, onChangeRatio, primaryColor, onDeleteRow, onMoveRow }) => {
  const hasRightCol = row.ratio !== '10-0' && row.ratio !== '100-0';
  const widths = getColumnWidths(row.ratio);

  return (
    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl shadow-sm">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
        
        {/* TÊN HÀNG & THANH CÔNG CỤ (Lên/Xuống/Xóa) */}
        <div className="flex items-center gap-3">
          <span className="font-bold text-sm text-slate-700">Hàng {rowIndex + 1}</span>
          <div className="flex bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
            <button 
              onClick={() => onMoveRow(rowIndex, 'up')} 
              disabled={rowIndex === 0} 
              className="p-1 hover:bg-[#EFF6FF] hover:text-[#2563EB] text-slate-500 disabled:opacity-30 disabled:hover:bg-white transition-colors border-r border-slate-200"
              title="Di chuyển lên"
            >
              <ArrowUp size={13}/>
            </button>
            <button 
              onClick={() => onMoveRow(rowIndex, 'down')} 
              disabled={isLastRow} 
              className="p-1 hover:bg-[#EFF6FF] hover:text-[#2563EB] text-slate-500 disabled:opacity-30 disabled:hover:bg-white transition-colors border-r border-slate-200"
              title="Di chuyển xuống"
            >
              <ArrowDown size={13}/>
            </button>
            <button 
              onClick={() => onDeleteRow(row.id)} 
              className="p-1 hover:bg-red-50 text-red-500 transition-colors"
              title="Xóa hàng này"
            >
              <Trash2 size={13}/>
            </button>
          </div>
        </div>

        <select 
          value={row.ratio}
          onChange={(e) => onChangeRatio(row.id, e.target.value)}
          className="text-xs border border-slate-300 p-1.5 rounded-md bg-white text-slate-700 outline-none focus:ring-2 focus:ring-[#2563EB]/40 focus:border-[#2563EB] cursor-pointer transition-all"
        >
          <option value="10-90">2 cột (10-90)</option>
          <option value="20-80">2 cột (20-80)</option>
          <option value="30-70">2 cột (30-70)</option>
          <option value="40-60">2 cột (40-60)</option>
          <option value="50-50">2 cột (50-50)</option>
          <option value="60-40">2 cột (60-40)</option>
          <option value="70-30">2 cột (70-30)</option>
          <option value="80-20">2 cột (80-20)</option>
          <option value="90-10">2 cột (90-10)</option>
          <option value="100-0">1 cột (100%)</option>
        </select>
      </div>

      <div className="flex flex-row w-full gap-2 items-start">
        <DroppableColumn rowId={row.id} column="left" items={row.leftItems} primaryColor={primaryColor} label="Cột trái" width={widths.left} />
        {hasRightCol && (
          <DroppableColumn rowId={row.id} column="right" items={row.rightItems} primaryColor={primaryColor} label="Cột phải" width={widths.right} />
        )}
      </div>
    </div>
  );
};

const DroppableColumn = ({ rowId, column, items, primaryColor, label, width }) => {
  const droppableId = `droppable-${rowId}-${column}`;
  const { setNodeRef, isOver } = useDroppable({ id: droppableId });
  const sortableItems = items.map(id => `item-${id}`);

  return (
    <div
      ref={setNodeRef}
      className={`min-w-0 min-h-[120px] p-2 border-2 rounded-xl transition-all duration-300 ${isOver ? 'border-dashed' : 'border-slate-200'} bg-white`}
      style={{ width: width, borderColor: isOver ? primaryColor : '#e5e7eb', backgroundColor: isOver ? `${primaryColor}08` : '#ffffff' }}
    >
      <div className="text-[10px] font-semibold text-slate-400 mb-2 uppercase text-center truncate">{label}</div>
      <SortableContext items={sortableItems} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {items.length > 0 ? (
            items.map(itemId => <DraggableItem key={itemId} id={`item-${itemId}`} itemId={itemId} primaryColor={primaryColor} />)
          ) : (
            <div className="text-[10px] text-slate-400 italic py-6 text-center">Kéo thả vào đây</div>
          )}
        </div>
      </SortableContext>
    </div>
  );
};

const UnusedItemsPool = ({ items, primaryColor }) => {
  const { setNodeRef, isOver } = useDroppable({ id: 'unused-pool' });
  const sortableItems = items.map(id => `unused-${id}`);

  return (
    <div className="mt-4 pt-6 border-t border-dashed border-slate-300">
      <h4 className="font-bold text-sm text-slate-500 mb-3 uppercase">Mục chưa sử dụng</h4>
      <div
        ref={setNodeRef}
        className={`p-3 min-h-[100px] border-2 rounded-xl transition-all ${isOver ? 'border-dashed' : 'border-slate-200'} bg-white`}
        style={{ borderColor: isOver ? primaryColor : '#e5e7eb', backgroundColor: isOver ? `${primaryColor}08` : '#ffffff' }}
      >
        <SortableContext items={sortableItems} strategy={rectSortingStrategy}>
          <div className="flex flex-wrap gap-2">
            {items.length > 0 ? (
              items.map(itemId => <DraggableItem key={itemId} id={`unused-${itemId}`} itemId={itemId} primaryColor={primaryColor} variant="unused" />)
            ) : (
              <div className="text-xs text-slate-400 italic w-full text-center py-4">Tất cả mục đều đang sử dụng</div>
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  );
};

export default LayoutSidebar;
```

## File: `sidebar/TabPanel.jsx`

```javascript
import React from "react";
import {
  X,
  Square,
  Circle,
  List,
  Clock,
  LayoutGrid,
  AlignLeft,
} from "lucide-react";
import LayoutSidebar from "./LayoutSidebar";
import TextFormatToolbar from "./TextFormatToolbar";
import { CV_FONT_SIZES } from "../templates/cvTemplateCore";
import { SIMPLE_TEMPLATE_CONFIG } from "../templates/SimpleTemplate";
import { HARVARD_TEMPLATE_CONFIG } from "../templates/HarvardTemplate";
import { PROFESSIONAL_TEMPLATE_CONFIG } from "../templates/ProfessionalTemplate";

// Map templateId -> config, dùng để nạp lại layout mặc định khi người dùng đổi mẫu.
const TEMPLATE_CONFIGS = {
  simple: SIMPLE_TEMPLATE_CONFIG,
  harvard: HARVARD_TEMPLATE_CONFIG,
  professional: PROFESSIONAL_TEMPLATE_CONFIG,
};

// Khi đổi mẫu, cần "nạp lại" layout theo defaultLayout của mẫu mới (thay vì giữ
// nguyên layout cũ như hiện tại) — nhưng KHÔNG được làm mất các mục "Thông tin
// thêm" (customSection_xxx) mà người dùng đã tự tạo: những mục đó sẽ được gom
// về "Mục chưa sử dụng" của layout mới, tránh mất dữ liệu khi chuyển mẫu.
const remapLayoutForTemplate = (currentLayout, newConfig) => {
  const allCurrentIds = [
    ...currentLayout.activeRows.flatMap((r) => [...r.leftItems, ...r.rightItems]),
    ...currentLayout.unusedItems,
  ];
  const dynamicExtras = allCurrentIds.filter((id) => id.startsWith("customSection_"));

  return {
    activeRows: newConfig.defaultLayout.activeRows.map((r) => ({
      ...r,
      leftItems: [...r.leftItems],
      rightItems: [...r.rightItems],
    })),
    unusedItems: [...newConfig.defaultLayout.unusedItems, ...dynamicExtras],
  };
};

const FONT_OPTIONS = [
  "Roboto",
  "Arial",
  "Times New Roman",
  "Georgia",
  "Courier New",
];
const COLOR_THEMES = [
  { name: "Xanh dương Worklify", primary: "#2563EB", accent: "#EFF6FF" },
  { name: "Xanh ngọc", primary: "#14B8A6", accent: "#ECFDF5" },
  { name: "Tím", primary: "#7c3aed", accent: "#f3e8ff" },
  { name: "Đỏ", primary: "#dc2626", accent: "#fee2e2" },
  { name: "Cam", primary: "#ea580c", accent: "#fff7ed" },
];

const SECTION_NAMES = {
  avatar: "Ảnh đại diện",
  contactInfo: "Danh thiếp",
  personalInfo: "Thông tin cá nhân",
  objective: "Mục tiêu nghề nghiệp",
  education: "Học vấn",
  experience: "Kinh nghiệm làm việc",
  activities: "Hoạt động",
  certifications: "Chứng chỉ",
  awards: "Giải thưởng",
  skills: "Kỹ năng",
  references: "Người tham chiếu",
  hobbies: "Sở thích",
  projects: "Dự án",
  customSection: "Thông tin thêm",
};

const TabPanel = ({
  activeTab,
  isPanelOpen,
  setIsPanelOpen,
  cvData,
  setCvData,
  handleFontChange,
  handleColorChange,
  handleChangeRatio,
  handleAddRow,
  handleDeleteRow,
  handleMoveRow,
  handleSettingChange,
  selectedSection,
}) => {
  const handleSectionLayoutChange = (layoutType) => {
    const currentLayouts = cvData.settings.sectionLayouts || {};
    handleSettingChange("sectionLayouts", {
      ...currentLayouts,
      [selectedSection]: layoutType,
    });
  };

  const getCurrentLayoutType = (sectionId) => {
    if (cvData.settings.sectionLayouts?.[sectionId]) {
      return cvData.settings.sectionLayouts[sectionId];
    }
    if (["skills", "hobbies"].includes(sectionId)) return "tags";
    if (["experience", "education"].includes(sectionId)) return "timeline";
    return "row";
  };

  const supportsDynamicLayout = [
    "experience",
    "education",
    "activities",
    "projects",
    "certifications",
    "awards",
    "references",
    "skills",
    "hobbies",
    "objective",
  ];

  return (
    <div
      className={`transition-all duration-300 ${isPanelOpen ? "w-[320px] ml-4 my-4 mr-4" : "w-0 overflow-hidden"}`}
    >
      <div className="w-[320px] h-full bg-white rounded-2xl shadow-lg border border-slate-100 flex flex-col overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-slate-100 sticky top-0 bg-white/90 backdrop-blur-sm z-10">
          <h3 className="font-bold text-[15px] text-slate-800">
            {activeTab === "design" && "Thiết kế & Bố cục"}
            {activeTab === "layout" && "Tùy chỉnh Bố cục CV"}
            {activeTab === "template" && "Thay Đổi Mẫu CV"}
          </h3>
          <button
            onClick={() => setIsPanelOpen(false)}
            className="p-1.5 hover:bg-[#EFF6FF] hover:text-[#2563EB] rounded-full text-slate-400 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {activeTab === "design" && (
            <div className="animate-fadeIn">
              <TextFormatToolbar />

              {selectedSection &&
                supportsDynamicLayout.includes(selectedSection) && (
                  <div className="mb-6 pt-5 border-t border-gray-100 animate-fadeIn">
                    <label className="block font-semibold text-sm text-gray-700 mb-3">
                      Bố cục:{" "}
                      <span className="text-[#2563EB] uppercase">
                        {SECTION_NAMES[selectedSection] || selectedSection}
                      </span>
                    </label>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleSectionLayoutChange("timeline")}
                        className={`flex flex-col items-center justify-center gap-1.5 p-2 border rounded-lg transition-all ${getCurrentLayoutType(selectedSection) === "timeline" ? "border-[#2563EB] bg-[#EFF6FF] text-[#2563EB]" : "border-gray-200 text-gray-600 bg-white hover:bg-gray-50"}`}
                      >
                        <Clock size={16} />{" "}
                        <span className="text-[10px] font-medium">Dòng TG</span>
                      </button>

                      <button
                        onClick={() => handleSectionLayoutChange("row")}
                        className={`flex flex-col items-center justify-center gap-1.5 p-2 border rounded-lg transition-all ${getCurrentLayoutType(selectedSection) === "row" ? "border-[#2563EB] bg-[#EFF6FF] text-[#2563EB]" : "border-gray-200 text-gray-600 bg-white hover:bg-gray-50"}`}
                      >
                        <List size={16} />{" "}
                        <span className="text-[10px] font-medium">
                          Danh sách
                        </span>
                      </button>

                      <button
                        onClick={() => handleSectionLayoutChange("tags")}
                        className={`flex flex-col items-center justify-center gap-1.5 p-2 border rounded-lg transition-all ${getCurrentLayoutType(selectedSection) === "tags" ? "border-[#2563EB] bg-[#EFF6FF] text-[#2563EB]" : "border-gray-200 text-gray-600 bg-white hover:bg-gray-50"}`}
                      >
                        <LayoutGrid size={16} />{" "}
                        <span className="text-[10px] font-medium">
                          Dạng Thẻ
                        </span>
                      </button>

                      <button
                        onClick={() => handleSectionLayoutChange("paragraph")}
                        className={`flex flex-col items-center justify-center gap-1.5 p-2 border rounded-lg transition-all ${getCurrentLayoutType(selectedSection) === "paragraph" ? "border-[#2563EB] bg-[#EFF6FF] text-[#2563EB]" : "border-gray-200 text-gray-600 bg-white hover:bg-gray-50"}`}
                      >
                        <AlignLeft size={16} />{" "}
                        <span className="text-[10px] font-medium">
                          Đoạn văn
                        </span>
                      </button>
                    </div>
                  </div>
                )}

              {selectedSection === "avatar" && (
                <div className="mb-6 pt-5 border-t border-gray-100 animate-fadeIn">
                  <label className="block font-semibold text-sm text-gray-700 mb-3">
                    Tùy chỉnh Ảnh đại diện
                  </label>
                  <div className="flex gap-2 mb-3">
                    <button
                      onClick={() =>
                        handleSettingChange("avatarShape", "square")
                      }
                      className={`flex-1 flex items-center justify-center gap-2 p-2 border rounded-lg transition-all ${cvData.settings.avatarShape === "square" ? "border-[#2563EB] bg-[#EFF6FF] text-[#2563EB]" : "border-gray-200 text-gray-600 bg-white hover:bg-gray-50"}`}
                    >
                      {" "}
                      <Square size={16} /> Vuông{" "}
                    </button>
                    <button
                      onClick={() =>
                        handleSettingChange("avatarShape", "circle")
                      }
                      className={`flex-1 flex items-center justify-center gap-2 p-2 border rounded-lg transition-all ${cvData.settings.avatarShape === "circle" ? "border-[#2563EB] bg-[#EFF6FF] text-[#2563EB]" : "border-gray-200 text-gray-600 bg-white hover:bg-gray-50"}`}
                    >
                      {" "}
                      <Circle size={16} /> Tròn{" "}
                    </button>
                  </div>
                </div>
              )}

              {/* Phần Font chữ và Kích cỡ toàn CV */}
              <div className="mb-6 pt-5 border-t border-gray-100">
                <label className="block font-semibold text-sm text-gray-700 mb-3">
                  Font chữ toàn CV
                </label>
                <select
                  value={cvData.settings.font}
                  onChange={(e) => handleFontChange(e.target.value)}
                  className="w-full p-2.5 border rounded-lg bg-white text-sm focus:ring-1 focus:ring-[#2563EB] outline-none mb-4"
                >
                  {FONT_OPTIONS.map((font) => (
                    <option key={font} value={font}>
                      {font}
                    </option>
                  ))}
                </select>

                <label className="block font-semibold text-sm text-gray-700 mb-3">
                  Kích cỡ toàn CV
                </label>
                <div className="flex gap-2">
                  {CV_FONT_SIZES.map((size) => {
                    // Fallback mặc định là 'medium' nếu chưa có dữ liệu lưu
                    const currentSize = cvData.settings.fontSize || "medium";
                    const isActive = currentSize === size.value;

                    return (
                      <button
                        key={size.value}
                        onClick={() =>
                          handleSettingChange("fontSize", size.value)
                        }
                        className={`flex-1 py-1.5 text-[11px] font-medium border rounded transition-all ${
                          isActive
                            ? "border-[#2563EB] bg-[#EFF6FF] text-[#2563EB]"
                            : "border-gray-200 text-gray-600 bg-white hover:bg-gray-50"
                        }`}
                      >
                        {size.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-sm text-gray-700 mb-3">
                  Chủ đề màu sắc
                </label>
                <div className="space-y-2">
                  {COLOR_THEMES.map((theme) => (
                    <button
                      key={theme.name}
                      onClick={() =>
                        handleColorChange(theme.primary, theme.accent)
                      }
                      className={`w-full flex items-center gap-3 p-2.5 border rounded-xl transition-all hover:shadow-sm ${cvData.settings.primaryColor === theme.primary ? "border-[#2563EB] bg-[#EFF6FF] ring-1 ring-[#2563EB]" : "border-gray-200 hover:border-gray-300 bg-white"}`}
                    >
                      <div
                        className="w-5 h-5 rounded-full shadow-sm"
                        style={{ backgroundColor: theme.primary }}
                      />
                      <span className="text-sm font-medium text-gray-700">
                        {theme.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "layout" && (
            <div className="animate-fadeIn -m-5">
              <LayoutSidebar
                layout={cvData.layout}
                onChangeRatio={handleChangeRatio}
                primaryColor={cvData.settings.primaryColor}
                onAddRow={handleAddRow}
                onDeleteRow={handleDeleteRow}
                onMoveRow={handleMoveRow}
              />
            </div>
          )}

          {activeTab === "template" && (
            <div className="animate-fadeIn space-y-3">
              {/* Mẫu Tiêu Chuẩn */}
              <button
                onClick={() => {
                  if (cvData.settings.template === "simple") return;
                  setCvData({
                    ...cvData,
                    settings: { ...cvData.settings, template: "simple" },
                    layout: remapLayoutForTemplate(cvData.layout, SIMPLE_TEMPLATE_CONFIG),
                  });
                }}
                className={`block w-full p-4 rounded-xl font-medium border-2 transition-all text-left hover:shadow-sm ${cvData.settings.template === "simple" ? "border-[#2563EB] bg-[#EFF6FF] text-[#2563EB]" : "border-gray-200 text-gray-700 hover:border-[#2563EB]"}`}
              >
                <div className="font-bold mb-1 text-sm">Mẫu Tiêu Chuẩn</div>
                <div className="text-[11px] text-gray-500 font-normal">
                  Thiết kế tối giản, chuyên nghiệp.
                </div>
              </button>

              {/* Mẫu Harvard */}
              <button
                onClick={() => {
                  if (cvData.settings.template === "harvard") return;
                  setCvData({
                    ...cvData,
                    settings: { ...cvData.settings, template: "harvard" },
                    layout: remapLayoutForTemplate(cvData.layout, HARVARD_TEMPLATE_CONFIG),
                  });
                }}
                className={`block w-full p-4 rounded-xl font-medium border-2 transition-all text-left hover:shadow-sm ${cvData.settings.template === "harvard" ? "border-[#2563EB] bg-[#EFF6FF] text-[#2563EB]" : "border-gray-200 text-gray-700 hover:border-[#2563EB]"}`}
              >
                <div className="font-bold mb-1 text-sm">Mẫu Harvard</div>
                <div className="text-[11px] text-gray-500 font-normal">
                  Phong cách học thuật, thanh lịch và truyền thống.
                </div>
              </button>

              {/* Mẫu Professional */}
              <button
                onClick={() => {
                  if (cvData.settings.template === "professional") return;
                  setCvData({
                    ...cvData,
                    settings: { ...cvData.settings, template: "professional" },
                    layout: remapLayoutForTemplate(cvData.layout, PROFESSIONAL_TEMPLATE_CONFIG),
                  });
                }}
                className={`block w-full p-4 rounded-xl font-medium border-2 transition-all text-left hover:shadow-sm ${cvData.settings.template === "professional" ? "border-[#2563EB] bg-[#EFF6FF] text-[#2563EB]" : "border-gray-200 text-gray-700 hover:border-[#2563EB]"}`}
              >
                <div className="font-bold mb-1 text-sm">Mẫu Chuyên Nghiệp</div>
                <div className="text-[11px] text-gray-500 font-normal">
                  Thiết kế hiện đại, tinh tế cho môi trường doanh nghiệp.
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TabPanel;
```

## File: `sidebar/TextFormatToolbar.jsx`

```javascript
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
    "#000000",
    "#2563eb",
    "#14b8a6",
    "#374151",
    "#dc2626",
    "#16a34a",
    "#d97706",
    "#9333ea",
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
```

## File: `templates/cvTemplateCore.js`

```javascript
/**
 * cvTemplateCore.js
 */
import { createContext, useContext } from 'react';

export const CV_FONT_SIZES = [
  { label: 'Nhỏ',     value: 'small',  px: '10px' },
  { label: 'Vừa',     value: 'medium', px: '13px' },
  { label: 'Lớn',     value: 'large',  px: '16px' },
  { label: 'Rất lớn', value: 'xlarge', px: '20px' },
];

// Kích thước 1 trang A4 chuẩn ở 96dpi. Đây là NGUỒN DUY NHẤT cho kích thước trang
// trong toàn bộ ứng dụng — mọi nơi cần tới (khung giấy live editor, khung phân trang
// trong bản xem trước, mô phỏng ngắt trang khi chụp thumbnail...) đều import từ đây,
// tránh lặp lại số "magic" 794/1123 ở nhiều chỗ rồi lệch nhau khi cần đổi khổ giấy.
export const CV_PAGE_WIDTH_PX = 794;
export const CV_PAGE_HEIGHT_PX = 1123;

// 1. TẠO CONTEXT CHO TEMPLATE
export const TemplateContext = createContext(null);
export const useTemplateContext = () => useContext(TemplateContext);

// 2. CSS CLASS CONSTANTS
export const commonEditableClass =
  'outline-none focus:bg-blue-50 focus:ring-1 focus:ring-blue-300 rounded p-0.5 transition-all ' +
  'empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400 ' +
  'empty:before:pointer-events-none empty:before:block cursor-text inline-block min-w-[30px]';

export const contactEditableClass =
  'outline-none focus:bg-blue-50 focus:ring-1 focus:ring-blue-300 rounded px-1 transition-all ' +
  'empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400 ' +
  'empty:before:pointer-events-none empty:before:block cursor-text empty:border ' +
  'empty:border-dashed empty:border-red-400 empty:bg-red-50/20 min-w-[40px] inline-block';

// 3. HELPERS
export const handleHTMLBlur = (e, field, updateFn) => {
  let val = e.currentTarget.innerHTML.trim();
  if (val === '<br>') val = '';
  updateFn(field, val);
};

export const highlightClass = (isHighlighted) =>
  isHighlighted ? 'outline outline-2 outline-dashed outline-yellow-400 p-2 rounded' : '';

export const getGridClasses = (ratio) => {
  switch (ratio) {
    case '1-9':
    case '10-90':
      return { left: 'col-span-1', right: 'col-span-9' };

    case '2-8':
    case '20-80':
      return { left: 'col-span-2', right: 'col-span-8' };

    case '3-7':
    case '30-70':
      return { left: 'col-span-3', right: 'col-span-7' };

    case '4-6':
    case '40-60':
      return { left: 'col-span-4', right: 'col-span-6' };

    case '5-5':
    case '50-50':
      return { left: 'col-span-5', right: 'col-span-5' };

    case '6-4':
    case '60-40':
      return { left: 'col-span-6', right: 'col-span-4' };

    case '7-3':
    case '70-30':
      return { left: 'col-span-7', right: 'col-span-3' };

    case '8-2':
    case '80-20':
      return { left: 'col-span-8', right: 'col-span-2' };

    case '9-1':
    case '90-10':
      return { left: 'col-span-9', right: 'col-span-1' };

    case '10-0':
    case '100-0':
      return { left: 'col-span-10', right: 'hidden' };

    default:
      return { left: 'col-span-10', right: 'hidden' };
  }
};

// 4. DATA ADAPTERS
export const adaptDataForList = (data, type) => {
  if (!data || !Array.isArray(data)) return [];
  return data.map((item) => {
    switch (type) {
      case 'experience': return { date: item.duration, title: item.company, subtitle: item.role, description: item.description };
      case 'education': return { date: item.duration, title: item.school, subtitle: item.major, description: item.gpa ? `GPA: ${item.gpa}\n${item.description || ''}` : item.description };
      case 'activities': return { date: item.duration, title: item.organization, subtitle: item.role, description: item.description };
      case 'projects': return { date: item.duration, title: item.name, subtitle: item.role, description: item.description };
      case 'certifications': return { date: item.date, title: item.name, subtitle: item.issuer, description: '' };
      case 'awards': return { date: item.date, title: item.title, subtitle: item.issuer, description: '' };
      case 'references': return { date: '', title: item.name, subtitle: item.position ? `${item.position} - ${item.company}` : item.company, description: '' };
      case 'skills': return { date: '', title: item.name, subtitle: '', description: item.description };
      case 'hobbies': return { date: '', title: item.name, subtitle: '', description: '' };
      default: return item;
    }
  });
};

export const revertDataFromList = (listData, type) => {
  if (type === 'objective' && listData.length > 0) return listData[0].description;
  return listData.map((item) => {
    switch (type) {
      case 'experience': return { duration: item.date, company: item.title, role: item.subtitle, description: item.description };
      case 'education': {
        const gpaMatch = item.description?.match(/GPA:\s*(.*)\n?/);
        const desc = item.description?.replace(/GPA:\s*.*\n?/, '') || '';
        return { duration: item.date, school: item.title, major: item.subtitle, gpa: gpaMatch ? gpaMatch[1] : '', description: desc.trim() };
      }
      case 'activities': return { duration: item.date, organization: item.title, role: item.subtitle, description: item.description };
      case 'projects': return { duration: item.date, name: item.title, role: item.subtitle, description: item.description };
      case 'certifications': return { date: item.date, name: item.title, issuer: item.subtitle };
      case 'awards': return { date: item.date, title: item.title, issuer: item.subtitle };
      case 'references': {
        const [position, company] = item.subtitle ? item.subtitle.split(' - ') : ['', ''];
        return { name: item.title, position: position?.trim() || '', company: company?.trim() || '' };
      }
      case 'skills': return { name: item.title, description: item.description };
      case 'hobbies': return { name: item.title };
      default: return item;
    }
  });
};

// 5. NGẮT TRANG (dùng chung cho: khung xem trước live trong Modal + ảnh thumbnail)
// Đẩy nguyên khối .cv-section nào bị biên trang cắt ngang xuống đầu trang kế tiếp
// (gán margin-top), để không bao giờ cắt dở dang giữa 1 đoạn văn/1 mục kinh nghiệm.
// Trả về { height, restore } — height: chiều cao thật sau khi ngắt trang (dùng để tính
// lại số trang chính xác); restore: hàm khôi phục margin ban đầu (gọi khi không cần nữa).
// Selector đánh dấu 1 "mục" có title bên trong section (vd: từng dòng kinh nghiệm,
// học vấn... trong EditableRowList / EditableTimelineList). Xem ghi chú bên dưới.
const PAGEBREAK_ITEM_SELECTOR = '[data-cv-pagebreak-item]';

export const applyCvPageBreaks = (rootElement, options = {}) => {
  const {
    pageHeight = CV_PAGE_HEIGHT_PX,
    topPadding = 30,
    pageGap = 40,
  } = options;

  if (!rootElement) return { height: 0, restore: () => {} };

  const sections = Array.from(rootElement.querySelectorAll('.cv-section'));

  // Xây danh sách các "đơn vị ngắt trang" (breakable units) theo đúng thứ tự xuất
  // hiện trong DOM (từ trên xuống):
  //  - Nếu 1 section CÓ các item con được đánh dấu data-cv-pagebreak-item (mỗi item
  //    ứng với 1 "title" — 1 dòng kinh nghiệm/học vấn/hoạt động...), ngắt trang ở
  //    CẤP ITEM: chỉ item nào bị biên trang cắt ngang mới bị đẩy xuống, các item
  //    trước đó (title 1, title 2...) đã nằm trọn trong trang thì giữ nguyên vị trí.
  //  - Nếu section KHÔNG có item con đánh dấu (vd: mục tiêu nghề nghiệp dạng đoạn
  //    văn, section 1 khối...), vẫn ngắt ở CẤP SECTION như trước.
  const units = [];
  sections.forEach((sec) => {
    const items = Array.from(sec.querySelectorAll(PAGEBREAK_ITEM_SELECTOR));
    if (items.length > 0) {
      items.forEach((item) => units.push(item));
    } else {
      units.push(sec);
    }
  });

  const originalMargins = units.map((el) => el.style.marginTop);

  // Reset trước để phép đo không bị ảnh hưởng bởi lần ngắt trang trước đó
  units.forEach((el) => { el.style.marginTop = '0px'; });

  // Xử lý tuần tự từ trên xuống: mỗi lần đẩy 1 đơn vị (section hoặc item), các đơn vị
  // sau đọc lại đúng vị trí mới (getBoundingClientRect luôn ép reflow đồng bộ) nên
  // tính đúng dây chuyền — kể cả các item còn lại cùng section với item vừa bị đẩy.
  units.forEach((el) => {
    const canvasRect = rootElement.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    const top = elRect.top - canvasRect.top;
    const height = elRect.height;
    const bottom = top + height;
    const currentPage = Math.floor(top / pageHeight);
    const pageBottom = (currentPage + 1) * pageHeight;

    // Chỉ ngắt nếu đơn vị bị biên trang cắt ngang, và bản thân nó không dài hơn 1 trang
    if (bottom > pageBottom && height < pageHeight) {
      el.style.marginTop = `${pageBottom - top + topPadding + pageGap}px`;
    }
  });

  const height = rootElement.getBoundingClientRect().height;

  return {
    height,
    restore: () => { units.forEach((el, i) => { el.style.marginTop = originalMargins[i]; }); },
  };
};
```

## File: `templates/HarvardTemplate.jsx`

```javascript
import React, { useState, useEffect, useRef } from 'react';
import { ArrowUp, ArrowDown, Plus, MoveLeft, MoveRight, Trash2 } from 'lucide-react';
import EditableTimelineList from '../shared/EditableTimelineList';
import EditableRowList from '../shared/EditableRowList';
import EditableTagList from '../shared/EditableTagList';
import EditableParagraphList from '../shared/EditableParagraphList';
import {
  commonEditableClass,
  handleHTMLBlur,
  adaptDataForList,
  revertDataFromList,
  getGridClasses,
  TemplateContext,
  useTemplateContext,
} from './cvTemplateCore';

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE MASTER CONFIGURATION
// Cùng "hình dạng" với SIMPLE_TEMPLATE_CONFIG để tương thích với toàn bộ hạ tầng
// hiện có (TabPanel, LayoutSidebar, chuyển đổi template, khởi tạo CV mới...).
// Khác biệt chính: font mặc định Times New Roman, không ảnh đại diện mặc định,
// Education đặt trước Experience (chuẩn CV học thuật Harvard), contactInfo hiển
// thị dạng 1 dòng ở giữa trang thay vì cột nhãn:giá trị.
// ─────────────────────────────────────────────────────────────────────────────

export const HARVARD_TEMPLATE_CONFIG = {
  id: 'harvard',

  sectionOrder: [
    "avatar", "contactInfo", "personalInfo", "objective", "education",
    "experience", "activities", "certifications", "awards", "skills",
    "references", "hobbies", "projects", "customSection"
  ],

  defaultSettings: {
    template: "harvard",
    font: "Times New Roman",
    fontSize: "medium",
    primaryColor: "#111827",
    accentColor: "#111827",
    avatarShape: "square",
    avatarSize: 100,
  },

  defaultData: {
    sectionTitles: {},
    avatar: { url: "http://localhost:8080/uploads/logos/user.jpg" },
    personalInfo: { fullName: "", jobTitle: "" },
    contactInfo: [
      { label: "Địa chỉ",      value: "" },
      { label: "Điện thoại",   value: "" },
      { label: "Email",        value: "" },
      { label: "Website",      value: "" },
    ],
    objective: [], experience: [], education: [], activities: [],
    skills: [], hobbies: [], awards: [], certifications: [],
    projects: [], references: [],
  },

  // Bố cục mặc định: 1 cột duy nhất, Education đứng trước Experience — đúng chuẩn
  // CV Harvard cho sinh viên/mới ra trường. Avatar mặc định KHÔNG dùng (Harvard CV
  // truyền thống không có ảnh) nhưng vẫn nằm trong unusedItems để người dùng có thể
  // kéo vào layout qua tab "Bố cục" nếu muốn.
  // Chỉ bật sẵn 9/14 block đúng khung CV Harvard chuẩn: Header (2) + Mục tiêu +
  // Học vấn + Kinh nghiệm + Hoạt động + Giải thưởng + Kỹ năng + Người tham chiếu.
  // 5 block còn lại (Ảnh đại diện, Chứng chỉ, Dự án, Sở thích, Thông tin thêm) ít
  // xuất hiện trong CV học thuật truyền thống nên để mặc định ở "Mục chưa sử dụng" —
  // người dùng vẫn kéo vào layout bất cứ lúc nào qua tab "Bố cục".
  defaultLayout: {
    activeRows: [
      {
        id: 'row-1', ratio: '10-0',
        leftItems: ['personalInfo', 'contactInfo'],
        rightItems: [],
      },
      {
        id: 'row-2', ratio: '10-0',
        leftItems: [
          'objective', 'education', 'experience', 'activities',
          'awards', 'skills', 'references',
        ],
        rightItems: [],
      },
    ],
    unusedItems: ['avatar', 'certifications', 'projects', 'hobbies', 'customSection'],
  },

  placeholders: {
    personalInfo: { fullName: "HỌ VÀ TÊN", jobTitle: "Vị trí ứng tuyển" },
    contactInfo: { title: "Tiêu đề", value: "Nhập nội dung..." },
    sections: {
      objective: "MỤC TIÊU NGHỀ NGHIỆP",
      skills: "KỸ NĂNG",
      hobbies: "SỞ THÍCH",
      experience: "KINH NGHIỆM LÀM VIỆC",
      education: "HỌC VẤN",
      activities: "HOẠT ĐỘNG",
      projects: "DỰ ÁN",
      certifications: "CHỨNG CHỈ",
      awards: "GIẢI THƯỞNG",
      references: "NGƯỜI THAM CHIẾU",
      customSection: "Thông tin thêm"
    }
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PRIVATE CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────
const contactEditableClass = 'outline-none focus:bg-blue-50 focus:ring-1 focus:ring-blue-300 rounded px-1 transition-all empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400 empty:before:pointer-events-none empty:before:block cursor-text min-w-[20px] inline-block';

// flow-root: mỗi section tự tạo Block Formatting Context riêng, tránh margin của
// phần tử con "thoát ra ngoài" đè lên section phía trên (giống SimpleTemplate).
const sectionWrapClass = (isHighlighted) => `mb-2 flow-root cursor-pointer transition-all duration-200 ${isHighlighted ? 'rounded-lg' : ''}`;

const highlightStyle = (isHighlighted, primaryColor = '#111827') => ({
  outline: isHighlighted ? `2px dashed ${primaryColor}` : '2px dashed transparent',
  outlineOffset: '4px',
  backgroundColor: isHighlighted ? 'rgba(17, 24, 39, 0.03)' : 'transparent',
  borderRadius: '4px',
  // Padding cố định để bật/tắt viền không làm nhảy layout / vỡ chữ khi chụp thumbnail.
  padding: '2px',
});

const EMPTY_ITEM = { date: '', title: '', subtitle: '', description: '' };

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

// Danh thiếp kiểu Harvard: hiển thị 1 dòng ngang, canh giữa, ngăn cách bằng dấu "•".
// Vẫn dùng chung cấu trúc dữ liệu { label, value } như Simple để tương thích ngược.
const EditableHeaderContactList = ({ items, sectionId, primaryColor, onUpdateItems }) => {
  const config = useTemplateContext();

  const handleTextChange = (index, field, newText) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: newText };
    onUpdateItems(sectionId, updated);
  };
  const handleMoveLeft = (index) => {
    if (index === 0) return;
    const updated = [...items];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    onUpdateItems(sectionId, updated);
  };
  const handleMoveRight = (index) => {
    if (index === items.length - 1) return;
    const updated = [...items];
    [updated[index + 1], updated[index]] = [updated[index], updated[index + 1]];
    onUpdateItems(sectionId, updated);
  };
  const handleDelete = (index) => onUpdateItems(sectionId, items.filter((_, i) => i !== index));
  const handleAdd = (index) => {
    const updated = [...items];
    updated.splice(index + 1, 0, { label: '', value: '', placeholder: config.placeholders.contactInfo.value });
    onUpdateItems(sectionId, updated);
  };

  return (
    <div className="w-full relative group/section">
      <div className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1">
        {items.map((item, index) => (
          <React.Fragment key={index}>
            <div className="relative inline-flex items-baseline group/item">
              <div
                className="absolute left-1/2 -translate-x-1/2 -top-7 flex-row gap-0.5 bg-white shadow-lg border border-gray-200 rounded-md z-20 opacity-0 invisible group-hover/item:opacity-100 group-hover/item:visible transition-all flex"
                contentEditable="false"
              >
                <button onClick={() => handleMoveLeft(index)} disabled={index === 0} className="p-1 hover:bg-gray-100 rounded text-gray-600 disabled:opacity-30" title="Sang trái"><MoveLeft size={12} /></button>
                <button onClick={() => handleMoveRight(index)} disabled={index === items.length - 1} className="p-1 hover:bg-gray-100 rounded text-gray-600 disabled:opacity-30" title="Sang phải"><MoveRight size={12} /></button>
                <button onClick={() => handleAdd(index)} className="p-1 hover:bg-gray-100 rounded" style={{ color: primaryColor }} title="Thêm mục"><Plus size={12} /></button>
                <button onClick={() => handleDelete(index)} className="p-1 hover:bg-red-50 rounded text-red-500" title="Xóa"><Trash2 size={12} /></button>
              </div>

              <span
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => handleHTMLBlur(e, 'label', (f, v) => handleTextChange(index, f, v))}
                className={`text-[0.85em] uppercase tracking-wide text-gray-500 mr-1 ${contactEditableClass}`}
                data-placeholder={config.placeholders.contactInfo.title}
                dangerouslySetInnerHTML={{ __html: item.label }}
              />
              <span
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => handleHTMLBlur(e, 'value', (f, v) => handleTextChange(index, f, v))}
                className={`text-[0.95em] text-gray-800 ${contactEditableClass}`}
                data-placeholder={item.placeholder || config.placeholders.contactInfo.value}
                dangerouslySetInnerHTML={{ __html: item.value }}
              />
            </div>
            {index < items.length - 1 && <span className="text-gray-400 select-none">•</span>}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

const EditableSectionTitle = ({ sectionId, sectionTitle, allSectionTitles, primaryColor, onUpdateSectionData }) => {
  const config = useTemplateContext();
  const defaultTitle = config.placeholders.sections[sectionId.split('_')[0]] || "TIÊU ĐỀ";

  return (
    <h3 contentEditable suppressContentEditableWarning
      onBlur={(e) => handleHTMLBlur(e, sectionId, (f, v) => onUpdateSectionData('sectionTitles', { ...allSectionTitles, [f]: v }))}
      className={`font-bold text-[1.05em] uppercase tracking-[0.08em] mb-2 pb-1 w-full ${commonEditableClass}`}
      style={{ color: primaryColor, borderBottom: `1.5px solid ${primaryColor}` }}
      data-placeholder={defaultTitle}
      dangerouslySetInnerHTML={{ __html: sectionTitle ?? defaultTitle }}
    />
  );
};

const renderDynamicList = (layoutType, props) => {
  switch (layoutType) {
    case 'row': return <EditableRowList {...props} />;
    case 'tags': return <EditableTagList {...props} />;
    case 'paragraph': return <EditableParagraphList {...props} />;
    case 'timeline': default: return <EditableTimelineList {...props} />;
  }
};

const listProps = (dataType, data, sectionId, primaryColor, onUpdateSectionData) => ({
  items: adaptDataForList(data, dataType), sectionId, primaryColor, emptyItemTemplate: EMPTY_ITEM,
  onUpdateItems: (id, updated) => onUpdateSectionData(id, revertDataFromList(updated, dataType)),
});

// ─────────────────────────────────────────────────────────────────────────────
// SECTION RENDERERS
// Mọi section vẫn tôn trọng cvData.settings.sectionLayouts[sectionId] — đây chính
// là cầu nối để 4 nút "Bố cục" (Dòng TG / Danh sách / Dạng Thẻ / Đoạn văn) trong
// tab "Thiết kế" hoạt động y hệt SimpleTemplate.
// ─────────────────────────────────────────────────────────────────────────────
const SECTION_RENDERER = {
  avatar: ({ data, primaryColor, settings, isHighlighted, sectionId, onUpdateSectionData }) => {
    const defaultW = settings?.avatarSize || 100;
    const defaultH = settings?.avatarShape === 'circle'
      ? (settings?.avatarSize || 100)
      : (settings?.avatarSize || 100) * 1.25;

    const [dims, setDims] = useState({
      w: data?.customW || defaultW,
      h: data?.customH || defaultH,
    });
    const [isHovered, setIsHovered] = useState(false);
    const outerRef = useRef(null);
    const maxWRef = useRef(400);
    const fileInputRef = useRef(null);

    useEffect(() => {
      if (data?.customW || data?.customH) {
        setDims({ w: data.customW || defaultW, h: data.customH || defaultH });
      }
    }, [data?.customW, data?.customH]);

    useEffect(() => {
      const el = outerRef.current;
      if (!el) return;
      const getColEl = () => el.parentElement;
      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const colW = entry.contentRect.width;
          const newMaxW = Math.max(60, colW - 16);
          maxWRef.current = newMaxW;
          setDims((prev) => {
            const clampedW = Math.min(prev.w, newMaxW);
            if (clampedW !== prev.w) {
              setTimeout(() => {
                onUpdateSectionData(sectionId, { ...data, customW: clampedW, customH: prev.h });
              }, 0);
              return { ...prev, w: clampedW };
            }
            return prev;
          });
        }
      });
      const colEl = getColEl();
      if (colEl) observer.observe(colEl);
      return () => observer.disconnect();
    }, [sectionId, data, onUpdateSectionData]);

    const isCircle = settings?.avatarShape === 'circle';
    const pc = primaryColor || '#111827';

    const handleImageChange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onloadend = () => onUpdateSectionData(sectionId, { ...data, url: reader.result });
      reader.readAsDataURL(file);
    };

    const handleResizeMouseDown = (e, dirX, dirY) => {
      e.preventDefault();
      e.stopPropagation();
      const startX = e.clientX;
      const startY = e.clientY;
      const startW = dims.w;
      const startH = dims.h;
      const maxW = maxWRef.current;
      const maxH = 500;

      const onMouseMove = (moveEvent) => {
        const dx = (moveEvent.clientX - startX) * dirX;
        const dy = (moveEvent.clientY - startY) * dirY;
        setDims({
          w: dirX !== 0 ? Math.max(60, Math.min(maxW, startW + dx)) : startW,
          h: dirY !== 0 ? Math.max(60, Math.min(maxH, startH + dy)) : startH,
        });
      };
      const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        setDims((final) => {
          onUpdateSectionData(sectionId, { ...data, customW: final.w, customH: final.h });
          return final;
        });
      };
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    };

    const displayW = dims.w;
    const displayH = isCircle ? dims.w : dims.h;
    const borderRadius = isCircle ? '50%' : '2px';

    const handles = [
      { dirX: -1, dirY: -1, cursor: 'nwse-resize', style: { top: -10, left: -10 } },
      { dirX: 1, dirY: -1, cursor: 'nesw-resize', style: { top: -10, right: -10 } },
      { dirX: 1, dirY: 1, cursor: 'nwse-resize', style: { bottom: -10, right: -10 } },
      { dirX: -1, dirY: 1, cursor: 'nesw-resize', style: { bottom: -10, left: -10 } },
      { dirX: 0, dirY: -1, cursor: 'ns-resize', style: { top: -10, left: '50%', transform: 'translateX(-50%)' } },
      { dirX: 0, dirY: 1, cursor: 'ns-resize', style: { bottom: -10, left: '50%', transform: 'translateX(-50%)' } },
      { dirX: -1, dirY: 0, cursor: 'ew-resize', style: { left: -10, top: '50%', transform: 'translateY(-50%)' } },
      { dirX: 1, dirY: 0, cursor: 'ew-resize', style: { right: -10, top: '50%', transform: 'translateY(-50%)' } },
    ];
    const activeHandles = isCircle ? handles.slice(0, 4).map(h => ({ ...h, dirY: h.dirX })) : handles;

    return (
      <div
        ref={outerRef}
        className="flex justify-center transition-all"
        style={isHighlighted
          ? { outline: `2px dashed ${pc}`, outlineOffset: '6px', borderRadius: '4px' }
          : { outline: '2px dashed transparent', outlineOffset: '6px', borderRadius: '4px' }}
      >
        <div
          className="relative"
          style={{ width: `${displayW}px`, height: `${displayH}px`, flexShrink: 0 }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <img
            src={data?.url || 'http://localhost:8080/uploads/logos/user.jpg'}
            alt="Avatar"
            style={{
              width: '100%', height: '100%',
              objectFit: 'cover', objectPosition: 'center top',
              borderRadius, display: 'block',
              border: '1px solid #d1d5db',
              filter: 'grayscale(15%)',
            }}
          />
          {isHovered && (
            <div className="absolute inset-0 pointer-events-none"
              style={{ borderRadius, border: `2px dashed ${pc}`, boxSizing: 'border-box' }} />
          )}
          {isHovered && (
            <button
              onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
              className="absolute bottom-2 text-white px-3 py-1 rounded-full flex items-center justify-center gap-1.5 text-[11px] font-medium z-10 shadow w-max cursor-pointer"
              style={{ background: pc, left: '50%', transform: 'translateX(-50%)' }}
            >
              Sửa ảnh
            </button>
          )}
          {isHovered && activeHandles.map((h, i) => (
            <div key={i}
              onMouseDown={(e) => handleResizeMouseDown(e, h.dirX, h.dirY)}
              style={{ position: 'absolute', cursor: h.cursor, zIndex: 30, width: 10, height: 10, background: pc, borderRadius: 2, ...h.style }}
            />
          ))}
          <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
        </div>
      </div>
    );
  },

  personalInfo: ({ data, primaryColor, sectionId, onUpdateSectionData, isHighlighted }) => {
    const config = useTemplateContext();
    return (
      <div style={highlightStyle(isHighlighted, primaryColor)} className={`${sectionWrapClass(isHighlighted)} text-center`}>
        <h1 contentEditable suppressContentEditableWarning
          onBlur={(e) => handleHTMLBlur(e, 'fullName', (f, v) => onUpdateSectionData(sectionId, { ...data, [f]: v }))}
          className={`text-[1.9em] font-bold uppercase tracking-[0.14em] ${commonEditableClass}`}
          style={{ color: primaryColor }}
          data-placeholder={config.placeholders.personalInfo.fullName}
          dangerouslySetInnerHTML={{ __html: data?.fullName || '' }} />
        <br />
        <h2 contentEditable suppressContentEditableWarning
          onBlur={(e) => handleHTMLBlur(e, 'jobTitle', (f, v) => onUpdateSectionData(sectionId, { ...data, [f]: v }))}
          className={`text-[1em] italic mt-1 text-gray-600 ${commonEditableClass}`}
          data-placeholder={config.placeholders.personalInfo.jobTitle}
          dangerouslySetInnerHTML={{ __html: data?.jobTitle || '' }} />
      </div>
    );
  },

  // Danh thiếp nằm ngay dưới tên, canh giữa, có 1 đường kẻ mảnh phía dưới để tách
  // khối header khỏi phần thân — đặc trưng dễ nhận biết nhất của CV Harvard.
  contactInfo: ({ data, primaryColor, sectionId, onUpdateSectionData, isHighlighted }) => (
    <div
      style={highlightStyle(isHighlighted, primaryColor)}
      className={`${sectionWrapClass(isHighlighted)} pb-3 mb-4`}
    >
      <EditableHeaderContactList items={Array.isArray(data) ? data : []} sectionId={sectionId} primaryColor={primaryColor} onUpdateItems={onUpdateSectionData} />
      <div className="mt-3 border-b" style={{ borderColor: primaryColor, opacity: 0.6 }} />
    </div>
  ),

  objective: (props) => (
    <div style={highlightStyle(props.isHighlighted, props.primaryColor)} className={sectionWrapClass(props.isHighlighted)}>
      <EditableSectionTitle {...props} />
      {renderDynamicList(props.settings?.sectionLayouts?.[props.sectionId] || 'paragraph', {
        items: Array.isArray(props.data) ? props.data : props.data ? [{ description: props.data }] : [],
        sectionId: props.sectionId, primaryColor: props.primaryColor, emptyItemTemplate: { description: '' },
        onUpdateItems: (id, updated) => props.onUpdateSectionData(id, updated),
      })}
    </div>
  ),

  customSectionRenderer: ({ data, primaryColor, sectionId, onUpdateSectionData, isHighlighted }) => {
    const config = useTemplateContext();
    return (
      <div style={highlightStyle(isHighlighted, primaryColor)} className={sectionWrapClass(isHighlighted)}>
        <h3 contentEditable suppressContentEditableWarning
          onBlur={(e) => handleHTMLBlur(e, 'title', (f, v) => onUpdateSectionData(sectionId, { ...data, [f]: v }))}
          className={`font-bold text-[1.05em] uppercase tracking-[0.08em] mb-2 pb-1 inline-block min-w-[150px] w-full ${commonEditableClass}`}
          style={{ color: primaryColor, borderBottom: `1.5px solid ${primaryColor}` }}
          data-placeholder="Tên mục"
          dangerouslySetInnerHTML={{ __html: data?.title || config.placeholders.sections.customSection }} />
        <div contentEditable suppressContentEditableWarning
          onBlur={(e) => handleHTMLBlur(e, 'content', (f, v) => onUpdateSectionData(sectionId, { ...data, [f]: v }))}
          className={`text-[1em] text-gray-700 leading-relaxed whitespace-pre-wrap min-h-[40px] w-full ${commonEditableClass}`}
          data-placeholder="Nội dung thông tin thêm..."
          dangerouslySetInnerHTML={{ __html: data?.content || '' }} />
      </div>
    );
  },

  skills: (props) => <div style={highlightStyle(props.isHighlighted, props.primaryColor)} className={sectionWrapClass(props.isHighlighted)}><EditableSectionTitle {...props} />{renderDynamicList(props.settings?.sectionLayouts?.[props.sectionId] || 'row', listProps('skills', props.data, props.sectionId, props.primaryColor, props.onUpdateSectionData))}</div>,
  hobbies: (props) => <div style={highlightStyle(props.isHighlighted, props.primaryColor)} className={sectionWrapClass(props.isHighlighted)}><EditableSectionTitle {...props} />{renderDynamicList(props.settings?.sectionLayouts?.[props.sectionId] || 'row', listProps('hobbies', props.data, props.sectionId, props.primaryColor, props.onUpdateSectionData))}</div>,
  experience: (props) => <div style={highlightStyle(props.isHighlighted, props.primaryColor)} className={sectionWrapClass(props.isHighlighted)}><EditableSectionTitle {...props} />{renderDynamicList(props.settings?.sectionLayouts?.[props.sectionId] || 'row', listProps('experience', props.data, props.sectionId, props.primaryColor, props.onUpdateSectionData))}</div>,
  education: (props) => <div style={highlightStyle(props.isHighlighted, props.primaryColor)} className={sectionWrapClass(props.isHighlighted)}><EditableSectionTitle {...props} />{renderDynamicList(props.settings?.sectionLayouts?.[props.sectionId] || 'row', listProps('education', props.data, props.sectionId, props.primaryColor, props.onUpdateSectionData))}</div>,
  activities: (props) => <div style={highlightStyle(props.isHighlighted, props.primaryColor)} className={sectionWrapClass(props.isHighlighted)}><EditableSectionTitle {...props} />{renderDynamicList(props.settings?.sectionLayouts?.[props.sectionId] || 'row', listProps('activities', props.data, props.sectionId, props.primaryColor, props.onUpdateSectionData))}</div>,
  projects: (props) => <div style={highlightStyle(props.isHighlighted, props.primaryColor)} className={sectionWrapClass(props.isHighlighted)}><EditableSectionTitle {...props} />{renderDynamicList(props.settings?.sectionLayouts?.[props.sectionId] || 'row', listProps('projects', props.data, props.sectionId, props.primaryColor, props.onUpdateSectionData))}</div>,
  certifications: (props) => <div style={highlightStyle(props.isHighlighted, props.primaryColor)} className={sectionWrapClass(props.isHighlighted)}><EditableSectionTitle {...props} />{renderDynamicList(props.settings?.sectionLayouts?.[props.sectionId] || 'row', listProps('certifications', props.data, props.sectionId, props.primaryColor, props.onUpdateSectionData))}</div>,
  awards: (props) => <div style={highlightStyle(props.isHighlighted, props.primaryColor)} className={sectionWrapClass(props.isHighlighted)}><EditableSectionTitle {...props} />{renderDynamicList(props.settings?.sectionLayouts?.[props.sectionId] || 'row', listProps('awards', props.data, props.sectionId, props.primaryColor, props.onUpdateSectionData))}</div>,
  references: (props) => <div style={highlightStyle(props.isHighlighted, props.primaryColor)} className={sectionWrapClass(props.isHighlighted)}><EditableSectionTitle {...props} />{renderDynamicList(props.settings?.sectionLayouts?.[props.sectionId] || 'row', listProps('references', props.data, props.sectionId, props.primaryColor, props.onUpdateSectionData))}</div>,
};

const getFontSizeStyle = (sizeValue) => {
  switch (sizeValue) {
    case 'small': return '10px';
    case 'medium': return '13px';
    case 'large': return '16px';
    case 'xlarge': return '20px';
    default: return '13px';
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// HARVARD TEMPLATE MAIN COMPONENT
// Cấu trúc render (grid theo activeRows/ratio, click-to-select section...) giữ
// nguyên y hệt SimpleTemplate — đây là phần đảm bảo tab "Bố cục" (kéo thả hàng,
// đổi tỉ lệ cột trái/phải) hoạt động giống hệt nhau giữa 2 mẫu.
// ─────────────────────────────────────────────────────────────────────────────
const HarvardTemplate = ({ cvData, selectedSection, onSectionClick, onUpdateSectionData }) => {
  const { layout, data, settings } = cvData;
  const containerRef = useRef(null);

  const handleSectionClick = (e, sectionId) => {
    e.stopPropagation();
    if (onSectionClick) onSectionClick(sectionId);
  };

  const renderItems = (itemIds) =>
    itemIds.map((itemId) => {
      const isCustomSection = itemId.startsWith('customSection_');
      const SectionComponent = isCustomSection ? SECTION_RENDERER.customSectionRenderer : SECTION_RENDERER[itemId];
      if (!SectionComponent) return null;

      return (
        <div key={itemId} onClick={(e) => handleSectionClick(e, itemId)} className="transition-all cv-section flow-root">
          <SectionComponent
            data={data[itemId]}
            sectionTitle={data.sectionTitles?.[itemId]}
            allSectionTitles={data.sectionTitles || {}}
            primaryColor={settings.primaryColor}
            settings={settings}
            isHighlighted={selectedSection === itemId}
            sectionId={itemId}
            onUpdateSectionData={onUpdateSectionData}
          />
        </div>
      );
    });

  return (
    <TemplateContext.Provider value={HARVARD_TEMPLATE_CONFIG}>
      <div
        ref={containerRef}
        className="bg-white mx-auto px-10 py-8 box-border"
        style={{ fontFamily: `${settings.font}, serif`, fontSize: getFontSizeStyle(settings.fontSize), color: '#1f2937' }}
      >
        {layout.activeRows.map((row) => {
          const { left, right } = getGridClasses(row.ratio);
          return (
            <div key={row.id} className="grid grid-cols-10 gap-x-3">
              <div className={left}>{renderItems(row.leftItems)}</div>
              {row.ratio !== '10-0' && row.ratio !== '100-0' && (
                <div className={right}>{renderItems(row.rightItems)}</div>
              )}
            </div>
          );
        })}
      </div>
    </TemplateContext.Provider>
  );
};

export default HarvardTemplate;

```

## File: `templates/ProfessionalTemplate.jsx`

```javascript
import React, { useState, useEffect, useRef } from 'react';
import { ArrowUp, ArrowDown, Plus } from 'lucide-react';
import EditableTimelineList from '../shared/EditableTimelineList';
import EditableRowList from '../shared/EditableRowList';
import EditableTagList from '../shared/EditableTagList';
import EditableParagraphList from '../shared/EditableParagraphList';
import {
  commonEditableClass,
  handleHTMLBlur,
  adaptDataForList,
  revertDataFromList,
  getGridClasses,
  TemplateContext,
  useTemplateContext,
} from './cvTemplateCore';

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE MASTER CONFIGURATION
// Cùng hình dạng với SIMPLE_TEMPLATE_CONFIG / HARVARD_TEMPLATE_CONFIG để tương
// thích ngược với toàn bộ hạ tầng hiện có (TabPanel, LayoutSidebar...).
// Đặc trưng: 1 hàng duy nhất tỉ lệ 30-70 — cột trái là "sidebar" tối (ảnh, thông
// tin cá nhân, danh thiếp, học vấn, kỹ năng), cột phải là nội dung chính nền sáng.
// ─────────────────────────────────────────────────────────────────────────────

export const PROFESSIONAL_TEMPLATE_CONFIG = {
  id: 'professional',

  sectionOrder: [
    "avatar", "contactInfo", "personalInfo", "objective", "education",
    "experience", "activities", "certifications", "awards", "skills",
    "references", "hobbies", "projects", "customSection"
  ],

  defaultSettings: {
    template: "professional",
    font: "Roboto",
    fontSize: "medium",
    primaryColor: "#7C2D12",
    accentColor: "#F5E9DA",
    avatarShape: "circle",
    avatarSize: 110,
  },

  defaultData: {
    sectionTitles: {},
    avatar: { url: "http://localhost:8080/uploads/logos/user.jpg" },
    personalInfo: { fullName: "", jobTitle: "" },
    contactInfo: [
      { label: "Số điện thoại", value: "" },
      { label: "Ngày sinh",     value: "" },
      { label: "Email",        value: "" },
      { label: "Facebook",     value: "" },
      { label: "Địa chỉ",      value: "" },
    ],
    objective: [], experience: [], education: [], activities: [],
    skills: [], hobbies: [], awards: [], certifications: [],
    projects: [], references: [],
  },

  // 1 hàng duy nhất (không chia theo section) để nền tối của sidebar liền mạch,
  // không bị đứt quãng giữa các mục — khác với Simple/Harvard vốn tách hàng riêng
  // cho khối đầu trang. Nếu người dùng bấm "Thêm hàng mới", hàng mới sẽ hiển thị
  // nền sáng bình thường (xem ghi chú isSidebarRow trong component chính).
  defaultLayout: {
    activeRows: [
      {
        id: 'row-1', ratio: '30-70',
        leftItems: ['avatar', 'personalInfo', 'contactInfo', 'education', 'skills'],
        rightItems: [
          'objective', 'experience', 'awards', 'activities',
          'projects', 'certifications', 'references', 'hobbies',
        ],
      },
    ],
    unusedItems: ['customSection'],
  },

  placeholders: {
    personalInfo: { fullName: "HỌ VÀ TÊN", jobTitle: "Vị trí ứng tuyển" },
    contactInfo: { title: "Tiêu đề", value: "Nhập nội dung..." },
    sections: {
      objective: "MỤC TIÊU NGHỀ NGHIỆP",
      skills: "KỸ NĂNG",
      hobbies: "SỞ THÍCH",
      experience: "KINH NGHIỆM LÀM VIỆC",
      education: "HỌC VẤN",
      activities: "HOẠT ĐỘNG",
      projects: "DỰ ÁN",
      certifications: "CHỨNG CHỈ",
      awards: "DANH HIỆU VÀ GIẢI THƯỞNG",
      references: "NGƯỜI THAM CHIẾU",
      customSection: "Thông tin thêm"
    }
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// COLOR HELPERS — tự tính màu nền tối / màu tag từ primaryColor do người dùng
// chọn ở "Chủ đề màu sắc". Đây là phần LOGIC RIÊNG của ProfessionalTemplate,
// không có trong cvTemplateCore.js dùng chung.
// ─────────────────────────────────────────────────────────────────────────────
const hexToRgb = (hex) => {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || '');
  return m ? { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) } : { r: 124, g: 45, b: 18 };
};
// percent âm = tối hơn (pha đen), percent dương = sáng hơn (pha trắng)
const shadeRgb = (hex, percent) => {
  const { r, g, b } = hexToRgb(hex);
  const target = percent < 0 ? 0 : 255;
  const p = Math.min(1, Math.abs(percent));
  const mix = (c) => Math.round((target - c) * p) + c;
  return { r: mix(r), g: mix(g), b: mix(b) };
};
const rgbToCss = ({ r, g, b }) => `rgb(${r}, ${g}, ${b})`;

// Độ sáng tương đối theo công thức WCAG — dùng để TỰ ĐỘNG chọn chữ trắng hay đen
// dựa trên chính màu nền vừa tính ra, thay vì giả định cứng "nền tối thì luôn chữ
// trắng". Nhờ vậy nếu sau này thêm theme màu pastel/nhạt, chữ vẫn tự đảo màu đúng.
const getLuminance = ({ r, g, b }) => {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
};
const pickContrastColor = (bgRgb) => (getLuminance(bgRgb) < 0.5 ? '#FFFFFF' : '#111827');
const pickMutedContrastColor = (bgRgb) =>
  getLuminance(bgRgb) < 0.5 ? 'rgba(255,255,255,0.62)' : 'rgba(17,24,39,0.6)';

// Ép màu chữ của các list component DÙNG CHUNG (vốn code cứng cho nền sáng)
// sang màu sáng khi được đặt trong sidebar tối. Chỉ nhắm đúng các class Tailwind
// đã biết trong EditableRowList/EditableTimelineList/EditableParagraphList.
// Lưu ý: EditableTagList tô màu chữ bằng inline style nên KHÔNG override được
// bằng cách này — vì vậy tránh dùng layout "tags" cho các section trong sidebar.
const sidebarListOverrideClass =
  "[&_.text-gray-900]:!text-white [&_.text-gray-700]:!text-white/80 " +
  "[&_.text-gray-600]:!text-white/60 [&_.border-gray-100]:!border-white/10";

const EMPTY_ITEM = { date: '', title: '', subtitle: '', description: '' };

const highlightStyle = (isHighlighted, primaryColor) => ({
  outline: isHighlighted ? `2px dashed ${primaryColor}` : '2px dashed transparent',
  outlineOffset: '4px',
  borderRadius: '4px',
  padding: '2px',
});

const sectionWrapClass = (isHighlighted) => `mb-3 flow-root cursor-pointer transition-all duration-200 ${isHighlighted ? 'rounded-lg' : ''}`;

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTS — "danh thiếp" (contactInfo) tương thích 2 biến thể sáng/tối vì
// mục này có thể bị kéo sang cột phải qua tab "Bố cục".
// ─────────────────────────────────────────────────────────────────────────────
const ContactList = ({ items, sectionId, primaryColor, onUpdateItems, isDark, textColor, mutedColor }) => {
  const config = useTemplateContext();

  const handleTextChange = (index, field, newText) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: newText };
    onUpdateItems(sectionId, updated);
  };
  const handleMoveUp = (index) => {
    if (index === 0) return;
    const updated = [...items];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    onUpdateItems(sectionId, updated);
  };
  const handleMoveDown = (index) => {
    if (index === items.length - 1) return;
    const updated = [...items];
    [updated[index + 1], updated[index]] = [updated[index], updated[index + 1]];
    onUpdateItems(sectionId, updated);
  };
  const handleDelete = (index) => onUpdateItems(sectionId, items.filter((_, i) => i !== index));
  const handleAdd = (index) => {
    const updated = [...items];
    updated.splice(index + 1, 0, { label: '', value: '', placeholder: config.placeholders.contactInfo.value });
    onUpdateItems(sectionId, updated);
  };

  const labelStyle = isDark ? { color: mutedColor } : {};
  const valueStyle = isDark ? { color: textColor } : {};
  const labelClass = isDark
    ? "text-[0.72em] uppercase tracking-wide"
    : "text-[0.75em] uppercase tracking-wide text-gray-400";
  const valueClass = isDark
    ? "text-[0.92em] font-medium"
    : "text-[0.92em] text-gray-700 font-medium";
  const editableBase = "outline-none focus:bg-blue-50 focus:ring-1 focus:ring-blue-300 rounded transition-all cursor-text empty:before:content-[attr(data-placeholder)] empty:before:pointer-events-none empty:before:block";

  return (
    <div className={`w-full relative group/section ${isDark ? 'space-y-2.5' : 'space-y-1.5'}`}>
      {items.map((item, index) => (
        <div key={index} className="relative group/item">
          <div
            className={`absolute right-0 -top-6 flex-row gap-0.5 rounded-md z-20 opacity-0 invisible group-hover/item:opacity-100 group-hover/item:visible transition-all flex ${isDark ? 'bg-gray-800' : 'bg-white shadow-lg border border-gray-200'}`}
            contentEditable="false"
          >
            <button onClick={() => handleMoveUp(index)} disabled={index === 0} className={`px-1.5 py-1 rounded disabled:opacity-30 ${isDark ? 'hover:bg-white/10 text-white/70' : 'hover:bg-blue-50 text-blue-600'}`}><ArrowUp size={12} /></button>
            <button onClick={() => handleMoveDown(index)} disabled={index === items.length - 1} className={`px-1.5 py-1 rounded disabled:opacity-30 ${isDark ? 'hover:bg-white/10 text-white/70' : 'hover:bg-blue-50 text-blue-600'}`}><ArrowDown size={12} /></button>
            <button onClick={() => handleAdd(index)} className={`px-1.5 py-1 rounded ${isDark ? 'hover:bg-white/10 text-white/70' : 'hover:bg-blue-50 text-blue-600'}`}><Plus size={12} /></button>
            <button onClick={() => handleDelete(index)} className={`px-2 py-1 rounded text-[10px] text-white ${isDark ? 'bg-red-500/80 hover:bg-red-500' : 'bg-red-500 hover:bg-red-600'}`}>Xóa</button>
          </div>

          <div contentEditable suppressContentEditableWarning
            onBlur={(e) => handleHTMLBlur(e, 'label', (f, v) => handleTextChange(index, f, v))}
            className={`${labelClass} ${editableBase} ${isDark ? 'focus:bg-white/10' : 'focus:bg-blue-50 empty:before:text-gray-400'}`}
            style={labelStyle}
            data-placeholder={config.placeholders.contactInfo.title}
            dangerouslySetInnerHTML={{ __html: item.label }} />
          <div contentEditable suppressContentEditableWarning
            onBlur={(e) => handleHTMLBlur(e, 'value', (f, v) => handleTextChange(index, f, v))}
            className={`${valueClass} ${editableBase} ${isDark ? 'focus:bg-white/10' : 'focus:bg-blue-50 empty:before:text-gray-400'}`}
            style={valueStyle}
            data-placeholder={item.placeholder || config.placeholders.contactInfo.value}
            dangerouslySetInnerHTML={{ __html: item.value }} />
        </div>
      ))}
    </div>
  );
};

// Tiêu đề mục ở CỘT SÁNG: chữ đậm in hoa + ô vuông nhỏ màu primaryColor phía
// trước, viền dưới mảnh màu xám nhạt (không dùng primaryColor cho viền để giữ
// cột phải "sạch" như bản mẫu).
const MainSectionTitle = ({ sectionId, sectionTitle, allSectionTitles, primaryColor, onUpdateSectionData }) => {
  const config = useTemplateContext();
  const defaultTitle = config.placeholders.sections[sectionId.split('_')[0]] || "TIÊU ĐỀ";
  return (
    <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-gray-200">
      <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: primaryColor }} />
      <h3 contentEditable suppressContentEditableWarning
        onBlur={(e) => handleHTMLBlur(e, sectionId, (f, v) => onUpdateSectionData('sectionTitles', { ...allSectionTitles, [f]: v }))}
        className={`font-bold text-[1.05em] uppercase tracking-wide text-gray-800 flex-1 ${commonEditableClass}`}
        data-placeholder={defaultTitle}
        dangerouslySetInnerHTML={{ __html: sectionTitle ?? defaultTitle }}
      />
    </div>
  );
};

// Tiêu đề mục ở CỘT TỐI: dạng pill nổi trên nền tối/sáng — màu chữ và màu pill lấy
// từ textColor/pillBg do component cha tính theo độ tương phản thực tế của nền.
const SidebarSectionTitle = ({ sectionId, sectionTitle, allSectionTitles, onUpdateSectionData, textColor, pillBg }) => {
  const config = useTemplateContext();
  const defaultTitle = config.placeholders.sections[sectionId.split('_')[0]] || "TIÊU ĐỀ";
  return (
    <h3 contentEditable suppressContentEditableWarning
      onBlur={(e) => handleHTMLBlur(e, sectionId, (f, v) => onUpdateSectionData('sectionTitles', { ...allSectionTitles, [f]: v }))}
      className={`inline-block font-bold text-[0.8em] uppercase tracking-wider rounded-full px-3 py-1 mb-2.5 ${commonEditableClass}`}
      style={{ color: textColor, backgroundColor: pillBg }}
      data-placeholder={defaultTitle}
      dangerouslySetInnerHTML={{ __html: sectionTitle ?? defaultTitle }}
    />
  );
};

const renderDynamicList = (layoutType, props) => {
  switch (layoutType) {
    case 'timeline': return <EditableTimelineList {...props} />;
    case 'tags': return <EditableTagList {...props} />;
    case 'paragraph': return <EditableParagraphList {...props} />;
    case 'row': default: return <EditableRowList {...props} />;
  }
};

const listProps = (dataType, data, sectionId, primaryColor, onUpdateSectionData) => ({
  items: adaptDataForList(data, dataType), sectionId, primaryColor, emptyItemTemplate: EMPTY_ITEM,
  onUpdateItems: (id, updated) => onUpdateSectionData(id, revertDataFromList(updated, dataType)),
});

// Factory dùng chung cho mọi section dạng danh sách (education/experience/skills...):
// tự chọn tiêu đề sáng/tối và bọc override màu chữ khi section đang nằm ở cột tối
// (props.variant do component cha truyền xuống theo CỘT thực tế đang render, chứ
// không cố định theo sectionId — nhờ vậy kéo thả qua tab "Bố cục" vẫn ra đúng màu).
const makeListSectionRenderer = (dataType, defaultLayoutType) => (props) => {
  const { isHighlighted, primaryColor, variant, textColor, pillBg } = props;
  const isDark = variant === 'dark';
  return (
    <div style={highlightStyle(isHighlighted, primaryColor)} className={sectionWrapClass(isHighlighted)}>
      {isDark ? <SidebarSectionTitle {...props} textColor={textColor} pillBg={pillBg} /> : <MainSectionTitle {...props} />}
      <div className={isDark ? sidebarListOverrideClass : ''}>
        {renderDynamicList(
          props.settings?.sectionLayouts?.[props.sectionId] || defaultLayoutType,
          listProps(dataType, props.data, props.sectionId, primaryColor, props.onUpdateSectionData)
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SECTION RENDERERS
// ─────────────────────────────────────────────────────────────────────────────
const SECTION_RENDERER = {
  avatar: ({ data, primaryColor, settings, isHighlighted, sectionId, onUpdateSectionData, variant, textColor }) => {
    const isDark = variant !== 'light';
    const defaultW = settings?.avatarSize || 110;
    const defaultH = settings?.avatarShape === 'circle' ? (settings?.avatarSize || 110) : (settings?.avatarSize || 110) * 1.25;

    const [dims, setDims] = useState({ w: data?.customW || defaultW, h: data?.customH || defaultH });
    const [isHovered, setIsHovered] = useState(false);
    const outerRef = useRef(null);
    const maxWRef = useRef(400);
    const fileInputRef = useRef(null);

    useEffect(() => {
      if (data?.customW || data?.customH) setDims({ w: data.customW || defaultW, h: data.customH || defaultH });
    }, [data?.customW, data?.customH]);

    useEffect(() => {
      const el = outerRef.current;
      if (!el) return;
      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const newMaxW = Math.max(60, entry.contentRect.width - 16);
          maxWRef.current = newMaxW;
          setDims((prev) => {
            const clampedW = Math.min(prev.w, newMaxW);
            if (clampedW !== prev.w) {
              setTimeout(() => onUpdateSectionData(sectionId, { ...data, customW: clampedW, customH: prev.h }), 0);
              return { ...prev, w: clampedW };
            }
            return prev;
          });
        }
      });
      const colEl = el.parentElement;
      if (colEl) observer.observe(colEl);
      return () => observer.disconnect();
    }, [sectionId, data, onUpdateSectionData]);

    const isCircle = settings?.avatarShape === 'circle';
    const pc = primaryColor || '#7C2D12';

    const handleImageChange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onloadend = () => onUpdateSectionData(sectionId, { ...data, url: reader.result });
      reader.readAsDataURL(file);
    };

    const handleResizeMouseDown = (e, dirX, dirY) => {
      e.preventDefault(); e.stopPropagation();
      const startX = e.clientX, startY = e.clientY, startW = dims.w, startH = dims.h;
      const maxW = maxWRef.current, maxH = 500;
      const onMouseMove = (moveEvent) => {
        const dx = (moveEvent.clientX - startX) * dirX;
        const dy = (moveEvent.clientY - startY) * dirY;
        setDims({
          w: dirX !== 0 ? Math.max(60, Math.min(maxW, startW + dx)) : startW,
          h: dirY !== 0 ? Math.max(60, Math.min(maxH, startH + dy)) : startH,
        });
      };
      const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        setDims((final) => { onUpdateSectionData(sectionId, { ...data, customW: final.w, customH: final.h }); return final; });
      };
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    };

    const displayW = dims.w;
    const displayH = isCircle ? dims.w : dims.h;
    const borderRadius = isCircle ? '50%' : '4px';
    const handles = [
      { dirX: -1, dirY: -1, cursor: 'nwse-resize', style: { top: -10, left: -10 } },
      { dirX: 1, dirY: -1, cursor: 'nesw-resize', style: { top: -10, right: -10 } },
      { dirX: 1, dirY: 1, cursor: 'nwse-resize', style: { bottom: -10, right: -10 } },
      { dirX: -1, dirY: 1, cursor: 'nesw-resize', style: { bottom: -10, left: -10 } },
    ];
    const activeHandles = isCircle ? handles.map(h => ({ ...h, dirY: h.dirX })) : handles;

    return (
      <div
        ref={outerRef}
        className="flex justify-center transition-all mb-4"
        style={isHighlighted
          ? { outline: `2px dashed ${pc}`, outlineOffset: '6px', borderRadius: '4px' }
          : { outline: '2px dashed transparent', outlineOffset: '6px', borderRadius: '4px' }}
      >
        <div
          className="relative"
          style={{ width: `${displayW}px`, height: `${displayH}px`, flexShrink: 0 }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <img
            src={data?.url || 'http://localhost:8080/uploads/logos/user.jpg'}
            alt="Avatar"
            style={{
              width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top',
              borderRadius, display: 'block',
              border: isDark ? `3px solid ${textColor === '#FFFFFF' ? 'rgba(255,255,255,0.25)' : 'rgba(17,24,39,0.2)'}` : '3px solid #e5e7eb',
            }}
          />
          {isHovered && (
            <div className="absolute inset-0 pointer-events-none" style={{ borderRadius, border: `2px dashed ${pc}`, boxSizing: 'border-box' }} />
          )}
          {isHovered && (
            <button
              onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
              className="absolute bottom-2 text-white px-3 py-1 rounded-full text-[11px] font-medium z-10 shadow w-max cursor-pointer"
              style={{ background: pc, left: '50%', transform: 'translateX(-50%)' }}
            >
              Sửa ảnh
            </button>
          )}
          {isHovered && activeHandles.map((h, i) => (
            <div key={i} onMouseDown={(e) => handleResizeMouseDown(e, h.dirX, h.dirY)}
              style={{ position: 'absolute', cursor: h.cursor, zIndex: 30, width: 10, height: 10, background: pc, borderRadius: 2, ...h.style }} />
          ))}
          <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
        </div>
      </div>
    );
  },

  personalInfo: ({ data, primaryColor, sectionId, onUpdateSectionData, isHighlighted, variant, textColor, mutedColor }) => {
    const config = useTemplateContext();
    const isDark = variant !== 'light';
    return (
      <div
        style={highlightStyle(isHighlighted, primaryColor)}
        className={`${sectionWrapClass(isHighlighted)} ${isDark ? 'text-center mb-5' : 'text-left'}`}
      >
        <h1 contentEditable suppressContentEditableWarning
          onBlur={(e) => handleHTMLBlur(e, 'fullName', (f, v) => onUpdateSectionData(sectionId, { ...data, [f]: v }))}
          className={`font-bold leading-tight ${commonEditableClass} ${isDark ? 'text-[1.5em]' : 'text-[1.9em] text-gray-900'}`}
          style={isDark ? { color: textColor } : { color: primaryColor }}
          data-placeholder={config.placeholders.personalInfo.fullName}
          dangerouslySetInnerHTML={{ __html: data?.fullName || '' }} />
        <br />
        <h2 contentEditable suppressContentEditableWarning
          onBlur={(e) => handleHTMLBlur(e, 'jobTitle', (f, v) => onUpdateSectionData(sectionId, { ...data, [f]: v }))}
          className={`mt-1 ${commonEditableClass} ${isDark ? 'text-[0.95em] uppercase tracking-wide' : 'text-[1.1em] text-gray-600'}`}
          style={isDark ? { color: mutedColor } : {}}
          data-placeholder={config.placeholders.personalInfo.jobTitle}
          dangerouslySetInnerHTML={{ __html: data?.jobTitle || '' }} />
      </div>
    );
  },

  contactInfo: ({ data, primaryColor, sectionId, onUpdateSectionData, isHighlighted, variant, textColor, mutedColor }) => {
    const isDark = variant !== 'light';
    return (
      <div style={highlightStyle(isHighlighted, primaryColor)} className={sectionWrapClass(isHighlighted)}>
        <ContactList items={Array.isArray(data) ? data : []} sectionId={sectionId} primaryColor={primaryColor} onUpdateItems={onUpdateSectionData} isDark={isDark} textColor={textColor} mutedColor={mutedColor} />
      </div>
    );
  },

  objective: (props) => {
    const isDark = props.variant === 'dark';
    return (
      <div style={highlightStyle(props.isHighlighted, props.primaryColor)} className={sectionWrapClass(props.isHighlighted)}>
        {isDark ? <SidebarSectionTitle {...props} textColor={props.textColor} pillBg={props.pillBg} /> : <MainSectionTitle {...props} />}
        <div className={isDark ? sidebarListOverrideClass : ''}>
          {renderDynamicList(props.settings?.sectionLayouts?.[props.sectionId] || 'paragraph', {
            items: Array.isArray(props.data) ? props.data : props.data ? [{ description: props.data }] : [],
            sectionId: props.sectionId, primaryColor: props.primaryColor, emptyItemTemplate: { description: '' },
            onUpdateItems: (id, updated) => props.onUpdateSectionData(id, updated),
          })}
        </div>
      </div>
    );
  },

  customSectionRenderer: ({ data, primaryColor, sectionId, onUpdateSectionData, isHighlighted, variant, textColor, mutedColor }) => {
    const config = useTemplateContext();
    const isDark = variant === 'dark';
    return (
      <div style={highlightStyle(isHighlighted, primaryColor)} className={sectionWrapClass(isHighlighted)}>
        <h3 contentEditable suppressContentEditableWarning
          onBlur={(e) => handleHTMLBlur(e, 'title', (f, v) => onUpdateSectionData(sectionId, { ...data, [f]: v }))}
          className={`font-bold text-[1.05em] uppercase tracking-wide mb-2 pb-1.5 w-full ${commonEditableClass} ${isDark ? '' : 'text-gray-800 border-b border-gray-200'}`}
          style={isDark ? { color: textColor, borderBottom: `1px solid ${mutedColor}` } : {}}
          data-placeholder="Tên mục"
          dangerouslySetInnerHTML={{ __html: data?.title || config.placeholders.sections.customSection }} />
        <div contentEditable suppressContentEditableWarning
          onBlur={(e) => handleHTMLBlur(e, 'content', (f, v) => onUpdateSectionData(sectionId, { ...data, [f]: v }))}
          className={`text-[1em] leading-relaxed whitespace-pre-wrap min-h-[40px] w-full ${commonEditableClass} ${isDark ? '' : 'text-gray-700'}`}
          style={isDark ? { color: mutedColor } : {}}
          data-placeholder="Nội dung thông tin thêm..."
          dangerouslySetInnerHTML={{ __html: data?.content || '' }} />
      </div>
    );
  },

  education: makeListSectionRenderer('education', 'row'),
  experience: makeListSectionRenderer('experience', 'row'),
  activities: makeListSectionRenderer('activities', 'row'),
  projects: makeListSectionRenderer('projects', 'row'),
  certifications: makeListSectionRenderer('certifications', 'row'),
  awards: makeListSectionRenderer('awards', 'row'),
  references: makeListSectionRenderer('references', 'row'),
  hobbies: makeListSectionRenderer('hobbies', 'row'),
  // Kỹ năng mặc định layout "row" (không phải "tags") vì lý do đã giải thích ở
  // sidebarListOverrideClass — người dùng vẫn có thể tự đổi sang "Dạng Thẻ" ở
  // tab Thiết kế nếu section đang nằm ở cột sáng.
  skills: makeListSectionRenderer('skills', 'row'),
};

const getFontSizeStyle = (sizeValue) => {
  switch (sizeValue) {
    case 'small': return '10px';
    case 'medium': return '13px';
    case 'large': return '16px';
    case 'xlarge': return '20px';
    default: return '13px';
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PROFESSIONAL TEMPLATE MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const ProfessionalTemplate = ({ cvData, selectedSection, onSectionClick, onUpdateSectionData }) => {
  const { layout, data, settings } = cvData;
  const containerRef = useRef(null);
  const primaryColor = settings.primaryColor || '#7C2D12';
  const sidebarBgRgb = shadeRgb(primaryColor, -0.55);
  const sidebarBg = rgbToCss(sidebarBgRgb);
  // Tự động chọn chữ trắng hay đen dựa trên độ sáng THỰC TẾ của sidebarBg vừa tính,
  // thay vì giả định cứng "nền tối luôn là chữ trắng" — đúng yêu cầu tương phản tự động.
  const textColor = pickContrastColor(sidebarBgRgb);
  const mutedColor = pickMutedContrastColor(sidebarBgRgb);
  const pillBg = textColor === '#FFFFFF' ? 'rgba(255,255,255,0.12)' : 'rgba(17,24,39,0.08)';

  const handleSectionClick = (e, sectionId) => {
    e.stopPropagation();
    if (onSectionClick) onSectionClick(sectionId);
  };

  const renderItems = (itemIds, variant) =>
    itemIds.map((itemId) => {
      const isCustomSection = itemId.startsWith('customSection_');
      const SectionComponent = isCustomSection ? SECTION_RENDERER.customSectionRenderer : SECTION_RENDERER[itemId];
      if (!SectionComponent) return null;

      return (
        <div key={itemId} onClick={(e) => handleSectionClick(e, itemId)} className="transition-all cv-section flow-root">
          <SectionComponent
            data={data[itemId]}
            sectionTitle={data.sectionTitles?.[itemId]}
            allSectionTitles={data.sectionTitles || {}}
            primaryColor={primaryColor}
            settings={settings}
            isHighlighted={selectedSection === itemId}
            sectionId={itemId}
            onUpdateSectionData={onUpdateSectionData}
            variant={variant}
            textColor={variant === 'dark' ? textColor : undefined}
            mutedColor={variant === 'dark' ? mutedColor : undefined}
            pillBg={variant === 'dark' ? pillBg : undefined}
          />
        </div>
      );
    });

  return (
    <TemplateContext.Provider value={PROFESSIONAL_TEMPLATE_CONFIG}>
      <div
        ref={containerRef}
        className="bg-white mx-auto box-border"
        style={{ fontFamily: `${settings.font}, sans-serif`, fontSize: getFontSizeStyle(settings.fontSize) }}
      >
        {layout.activeRows.map((row) => {
          const { left, right } = getGridClasses(row.ratio);
          // Chỉ hàng 2 cột mới là "hàng sidebar" (cột trái tối, cột phải sáng).
          // Hàng 1 cột (10-0/100-0) — ví dụ khi người dùng bấm "Thêm hàng mới" —
          // hiển thị nền sáng bình thường, không ép tối để tránh vỡ layout.
          const hasRightCol = row.ratio !== '10-0' && row.ratio !== '100-0';

          return (
            <div key={row.id} className="grid grid-cols-10 items-stretch">
              <div className={`${left} ${hasRightCol ? 'p-4' : 'px-8 pt-8'}`}>
                {hasRightCol ? (
                  <div className="rounded-2xl h-full p-6" style={{ backgroundColor: sidebarBg }}>
                    {renderItems(row.leftItems, 'dark')}
                  </div>
                ) : (
                  renderItems(row.leftItems, 'light')
                )}
              </div>
              {hasRightCol && (
                <div className={`${right} p-8`}>
                  {renderItems(row.rightItems, 'light')}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </TemplateContext.Provider>
  );
};

export default ProfessionalTemplate;

```

## File: `templates/SimpleTemplate.jsx`

```javascript
import React, { useState, useEffect, useRef } from 'react';
import { ArrowUp, ArrowDown, Plus } from 'lucide-react';
import EditableTimelineList from '../shared/EditableTimelineList';
import EditableRowList from '../shared/EditableRowList';
import EditableTagList from '../shared/EditableTagList';
import EditableParagraphList from '../shared/EditableParagraphList';
import {
  commonEditableClass,
  handleHTMLBlur,
  adaptDataForList,
  revertDataFromList,
  getGridClasses,
  TemplateContext,
  useTemplateContext
} from './cvTemplateCore';

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE MASTER CONFIGURATION 
// Quản lý MỌI THỨ: Order, Data mặc định, Layout, Setting, Placeholder
// ─────────────────────────────────────────────────────────────────────────────

export const SIMPLE_TEMPLATE_CONFIG = {
  id: 'simple',
  // Thứ tự ưu tiên của block khi người dùng kéo thả hoặc khôi phục
  sectionOrder: [
    "avatar", "contactInfo", "personalInfo", "objective", "education",
    "experience", "activities", "certifications", "awards", "skills",
    "references", "hobbies", "projects", "customSection"
  ],
  
  defaultSettings: {
    template: "simple",
    font: "Roboto",
    fontSize: "medium",
    primaryColor: "#2563EB",
    accentColor: "#06B6D4",
    avatarShape: "square",
    avatarSize: 120,
  },

  defaultData: {
    sectionTitles: {},
    avatar: { url: "http://localhost:8080/uploads/logos/user.jpg" },
    personalInfo: { fullName: "", jobTitle: "" },
    contactInfo: [
      { label: "Ngày sinh",     value: "" },
      { label: "Giới tính",     value: "" },
      { label: "Số điện thoại", value: "" },
      { label: "Email",         value: "" },
      { label: "Website",       value: "" },
      { label: "Địa chỉ",      value: "" },
    ],
    objective: [], experience: [], education: [], activities: [],
    skills: [], hobbies: [], awards: [], certifications: [],
    projects: [], references: [],
  },

  defaultLayout: {
    activeRows: [
      {
        id: 'row-1', ratio: '30-70',
        leftItems: ['avatar'],
        rightItems: ['personalInfo', 'contactInfo'],
      },
      {
        id: 'row-2', ratio: '10-0',
        leftItems: [
          'objective', 'education', 'experience', 'activities',
          'certifications', 'awards', 'skills', 'references', 'hobbies', 'projects',
        ],
        rightItems: [],
      },
    ],
    unusedItems: ['customSection'],
  },

  // Quản lý placeholder (chữ mờ) riêng cho Simple Template
  placeholders: {
    personalInfo: { fullName: "HỌ VÀ TÊN", jobTitle: "Vị trí ứng tuyển" },
    contactInfo: { title: "Tiêu đề", value: "Nhập nội dung..." },
    sections: {
      objective: "MỤC TIÊU NGHỀ NGHIỆP",
      skills: "KỸ NĂNG",
      hobbies: "SỞ THÍCH",
      experience: "KINH NGHIỆM LÀM VIỆC",
      education: "HỌC VẤN",
      activities: "HOẠT ĐỘNG",
      projects: "DỰ ÁN",
      certifications: "CHỨNG CHỈ",
      awards: "GIẢI THƯỞNG",
      references: "NGƯỜI THAM CHIẾU",
      customSection: "Thông tin thêm"
    }
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// THEME COLORS - Dùng #2563EB làm gốc cho UI elements (không ảnh hưởng primaryColor)
// ─────────────────────────────────────────────────────────────────────────────
const THEME = {
  primary: '#2563EB',
  danger: '#EF4444',
  success: '#10B981',
};

// ─────────────────────────────────────────────────────────────────────────────
// PRIVATE CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────
const contactEditableClass = 'outline-none focus:bg-blue-50 focus:ring-2 focus:ring-blue-400 rounded px-0.5 transition-all empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400 empty:before:pointer-events-none empty:before:block cursor-text empty:border empty:border-dashed empty:border-blue-300 empty:bg-blue-50/40 min-w-[20px] inline-block';

// FIX: Sử dụng box-shadow inset thay vì outline + padding để tránh nhảy layout
// flow-root: ép mỗi section tạo Block Formatting Context riêng, chặn tuyệt đối
// hiện tượng margin-top của phần tử con "thoát" ra ngoài đè lên section phía trên.
const sectionWrapClass = (isHighlighted) => `mb-1 flow-root cursor-pointer transition-all duration-200 ${isHighlighted ? 'rounded-lg' : ''}`;

const highlightStyle = (isHighlighted, primaryColor = THEME.primary) => ({
  outline: isHighlighted ? `2px dashed ${primaryColor}` : '2px dashed transparent',
  outlineOffset: '4px',
  backgroundColor: isHighlighted ? 'rgba(37, 99, 235, 0.02)' : 'transparent',
  borderRadius: '4px',
  // Padding luôn giữ cố định 6px (không phụ thuộc isHighlighted) để việc bật/tắt viền
  // KHÔNG làm thay đổi kích thước khối -> không gây nhảy layout / vỡ chữ khi chụp thumbnail.
  padding: '2px',
});

const EMPTY_ITEM = { date: '', title: '', subtitle: '', description: '' };

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────
const EditableContactList = ({ items, sectionId, primaryColor, onUpdateItems }) => {
  const config = useTemplateContext(); // Lấy placeholder từ config
  
  const handleTextChange = (index, field, newText) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: newText };
    onUpdateItems(sectionId, updated);
  };
  const handleMoveUp = (index) => {
    if (index === 0) return;
    const updated = [...items];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    onUpdateItems(sectionId, updated);
  };
  const handleMoveDown = (index) => {
    if (index === items.length - 1) return;
    const updated = [...items];
    [updated[index + 1], updated[index]] = [updated[index], updated[index + 1]];
    onUpdateItems(sectionId, updated);
  };
  const handleDelete = (index) => onUpdateItems(sectionId, items.filter((_, i) => i !== index));
  const handleAdd = (index) => {
    const updated = [...items];
    updated.splice(index + 1, 0, { label: '', value: '', placeholder: config.placeholders.contactInfo.value });
    onUpdateItems(sectionId, updated);
  };

  return (
    <div className="w-full relative group/section">
      <div className="space-y-0.5 relative">
        {items.map((item, index) => (
          <div key={index} className="relative flex flex-wrap items-start group/item transition-all border border-transparent hover:border-dashed hover:border-gray-300 rounded">
            <div className="absolute right-0 -top-8 flex-row gap-0.5 bg-white shadow-lg border border-gray-200 rounded-lg z-20 opacity-0 invisible group-hover/item:opacity-100 group-hover/item:visible transition-all flex" contentEditable="false">
              <button onClick={() => handleMoveUp(index)} disabled={index === 0} className="px-1.5 hover:bg-blue-100 rounded-md text-blue-600 disabled:opacity-30 disabled:text-gray-300 transition-colors" title="Di chuyển lên"><ArrowUp size={13} /></button>
              <button onClick={() => handleMoveDown(index)} disabled={index === items.length - 1} className="px-1.5 hover:bg-blue-100 rounded-md text-blue-600 disabled:opacity-30 disabled:text-gray-300 transition-colors" title="Di chuyển xuống"><ArrowDown size={13} /></button>
              <button onClick={() => handleDelete(index)} className="px-2.5 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-md text-xs font-medium flex items-center gap-0.5 transition-colors shadow-sm">Xóa</button>
              <button onClick={() => handleAdd(index)} className="px-2.5 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-xs font-medium flex items-center gap-0.5 transition-colors shadow-sm" style={{ backgroundColor: primaryColor || THEME.primary }}><Plus size={13} /> Thêm</button>
            </div>

            <div contentEditable suppressContentEditableWarning
              onBlur={(e) => handleHTMLBlur(e, 'label', (f, v) => handleTextChange(index, f, v))}
              className={`font-bold text-[0.9em] ${contactEditableClass}`} style={{ color: primaryColor }}
              data-placeholder={config.placeholders.contactInfo.title}
              dangerouslySetInnerHTML={{ __html: item.label }} />
            <span className="font-bold text-[0.9em]" style={{ color: primaryColor }}>:</span>

            <div contentEditable suppressContentEditableWarning
              onBlur={(e) => handleHTMLBlur(e, 'value', (f, v) => handleTextChange(index, f, v))}
              className={`text-gray-700 flex-1 text-[0.9em] ${contactEditableClass}`}
              data-placeholder={item.placeholder || config.placeholders.contactInfo.value}
              dangerouslySetInnerHTML={{ __html: item.value }} />
          </div>
        ))}
      </div>
    </div>
  );
};

const EditableSectionTitle = ({ sectionId, sectionTitle, allSectionTitles, primaryColor, onUpdateSectionData }) => {
  const config = useTemplateContext();
  const defaultTitle = config.placeholders.sections[sectionId.split('_')[0]] || "TIÊU ĐỀ";
  
  return (
    <h3 contentEditable suppressContentEditableWarning
      onBlur={(e) => handleHTMLBlur(e, sectionId, (f, v) => onUpdateSectionData('sectionTitles', { ...allSectionTitles, [f]: v }))}
      className={`font-bold text-[1.1em] uppercase mb-1 pb-1.5 w-full ${commonEditableClass}`}
      style={{ color: primaryColor, borderBottom: `2px solid ${primaryColor}` }}
      data-placeholder={defaultTitle}
      dangerouslySetInnerHTML={{ __html: sectionTitle ?? defaultTitle }}
    />
  );
};

const renderDynamicList = (layoutType, props) => {
  switch (layoutType) {
    case 'row': return <EditableRowList {...props} />;
    case 'tags': return <EditableTagList {...props} />;
    case 'paragraph': return <EditableParagraphList {...props} />;
    case 'timeline': default: return <EditableTimelineList {...props} />;
  }
};

const listProps = (dataType, data, sectionId, primaryColor, onUpdateSectionData) => ({
  items: adaptDataForList(data, dataType), sectionId, primaryColor, emptyItemTemplate: EMPTY_ITEM,
  onUpdateItems: (id, updated) => onUpdateSectionData(id, revertDataFromList(updated, dataType)),
});

// ─────────────────────────────────────────────────────────────────────────────
// SECTION RENDERERS
// ─────────────────────────────────────────────────────────────────────────────
const SECTION_RENDERER = {
  avatar: ({ data, primaryColor, settings, isHighlighted, sectionId, onUpdateSectionData }) => {
    const defaultW = settings?.avatarSize || 120;
    const defaultH = settings?.avatarShape === 'circle'
      ? (settings?.avatarSize || 120)
      : (settings?.avatarSize || 120) * 1.33;

    const [dims, setDims] = useState({
      w: data?.customW || defaultW,
      h: data?.customH || defaultH,
    });
    const [isHovered, setIsHovered] = useState(false);

    const outerRef = useRef(null);
    // Lưu maxW hiện tại để dùng trong resize handler
    const maxWRef = useRef(400);

    // Sync từ data bên ngoài (Undo/Redo)
    useEffect(() => {
      if (data?.customW || data?.customH) {
        setDims({ w: data.customW || defaultW, h: data.customH || defaultH });
      }
    }, [data?.customW, data?.customH]);

    // ResizeObserver: theo dõi khi cột cha thay đổi kích thước
    useEffect(() => {
      const el = outerRef.current;
      if (!el) return;

      const getColEl = () => el.parentElement; // div.cv-section trong cột grid

      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const colW = entry.contentRect.width;
          const newMaxW = Math.max(60, colW - 16); // trừ padding nhỏ
          maxWRef.current = newMaxW;

          // Clamp dims nếu ảnh đang rộng hơn cột mới
          setDims((prev) => {
            const clampedW = Math.min(prev.w, newMaxW);
            if (clampedW !== prev.w) {
              // Cập nhật data để persist
              // dùng setTimeout tránh setState trong ResizeObserver callback
              setTimeout(() => {
                onUpdateSectionData(sectionId, {
                  ...data,
                  customW: clampedW,
                  customH: prev.h,
                });
              }, 0);
              return { ...prev, w: clampedW };
            }
            return prev;
          });
        }
      });

      const colEl = getColEl();
      if (colEl) observer.observe(colEl);

      return () => observer.disconnect();
    }, [sectionId, data, onUpdateSectionData]);

    const isCircle = settings?.avatarShape === 'circle';
    const fileInputRef = useRef(null);
    const pc = primaryColor || '#2563EB';

    const handleImageChange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onloadend = () => onUpdateSectionData(sectionId, { ...data, url: reader.result });
      reader.readAsDataURL(file);
    };

    const handleResizeMouseDown = (e, dirX, dirY) => {
      e.preventDefault();
      e.stopPropagation();
      const startX = e.clientX;
      const startY = e.clientY;
      const startW = dims.w;
      const startH = dims.h;

      // Dùng maxWRef đã được ResizeObserver cập nhật
      const maxW = maxWRef.current;
      const maxH = 500;

      const onMouseMove = (moveEvent) => {
        const dx = (moveEvent.clientX - startX) * dirX;
        const dy = (moveEvent.clientY - startY) * dirY;
        setDims({
          w: dirX !== 0 ? Math.max(60, Math.min(maxW, startW + dx)) : startW,
          h: dirY !== 0 ? Math.max(60, Math.min(maxH, startH + dy)) : startH,
        });
      };

      const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        setDims((final) => {
          onUpdateSectionData(sectionId, { ...data, customW: final.w, customH: final.h });
          return final;
        });
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    };

    const displayW = dims.w;
    const displayH = isCircle ? dims.w : dims.h;
    const borderRadius = isCircle ? '50%' : '6px';

    const handles = [
      { dirX: -1, dirY: -1, cursor: 'nwse-resize', style: { top: -10, left: -10 },             rotate: 0   },
      { dirX:  1, dirY: -1, cursor: 'nesw-resize', style: { top: -10, right: -10 },            rotate: 90  },
      { dirX:  1, dirY:  1, cursor: 'nwse-resize', style: { bottom: -10, right: -10 },         rotate: 180 },
      { dirX: -1, dirY:  1, cursor: 'nesw-resize', style: { bottom: -10, left: -10 },          rotate: 270 },
      { dirX:  0, dirY: -1, cursor: 'ns-resize',   style: { top: -10, left: '50%', transform: 'translateX(-50%)' },    rotate: 0,   straight: true },
      { dirX:  0, dirY:  1, cursor: 'ns-resize',   style: { bottom: -10, left: '50%', transform: 'translateX(-50%)' }, rotate: 180, straight: true },
      { dirX: -1, dirY:  0, cursor: 'ew-resize',   style: { left: -10, top: '50%', transform: 'translateY(-50%)' },    rotate: 270, straight: true },
      { dirX:  1, dirY:  0, cursor: 'ew-resize',   style: { right: -10, top: '50%', transform: 'translateY(-50%)' },   rotate: 90,  straight: true },
    ];

    const activeHandles = isCircle
      ? handles.slice(0, 4).map(h => ({ ...h, dirY: h.dirX }))
      : handles;

    const ArrowCorner = ({ color }) => (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M2 2h6M2 2v6" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M2 2l5 5" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
      </svg>
    );

    const ArrowStraight = ({ color }) => (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M9 3v-2M9 1l-2.5 3M9 1l2.5 3" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );

    return (
    <div
            ref={outerRef}
            className="flex justify-center transition-all"
            style={isHighlighted ? {
              outline: `2px dashed ${pc}`, // Đổi sang màu theme động theo primaryColor
              outlineOffset: '6px',
              borderRadius: '4px',
            } : {
              outline: '2px dashed transparent', // Giữ chỗ outline
              outlineOffset: '6px',
              borderRadius: '4px',
            }}
          >
        <div
          className="relative"
          style={{ width: `${displayW}px`, height: `${displayH}px`, flexShrink: 0 }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <img
            src={data?.url || 'http://localhost:8080/uploads/logos/user.jpg'}
            alt="Avatar"
            style={{
              width: '100%', height: '100%',
              objectFit: 'cover', objectPosition: 'center top',
              borderRadius, display: 'block',
            }}
          />

          {isHovered && (
            <div className="absolute inset-0 pointer-events-none"
              style={{ borderRadius, border: `2px dashed ${pc}`, boxSizing: 'border-box' }}
            />
          )}

          {isHovered && (
            <button
              onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
              className="absolute bottom-3 text-white px-3.5 py-1.5 rounded-full flex items-center justify-center gap-1.5 text-xs font-medium z-10 shadow w-max cursor-pointer"
              style={{ background: pc, left: '50%', transform: 'translateX(-50%)' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
              </svg>
              Sửa ảnh
            </button>
          )}

          {isHovered && activeHandles.map((h, i) => (
            <div key={i}
              onMouseDown={(e) => handleResizeMouseDown(e, h.dirX, h.dirY)}
              style={{
                position: 'absolute', cursor: h.cursor, zIndex: 30, padding: '2px',
                ...h.style,
                transform: [h.style.transform || '', `rotate(${h.rotate}deg)`].filter(Boolean).join(' '),
              }}
            >
              {h.straight ? <ArrowStraight color={pc} /> : <ArrowCorner color={pc} />}
            </div>
          ))}

          <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
        </div>
      </div>
    );
  },

  personalInfo: ({ data, primaryColor, sectionId, onUpdateSectionData, isHighlighted }) => {
    const config = useTemplateContext();
    return (
      <div style={highlightStyle(isHighlighted, primaryColor)} className={`${sectionWrapClass(isHighlighted)} text-left`}>
        <h1 contentEditable suppressContentEditableWarning
          onBlur={(e) => handleHTMLBlur(e, 'fullName', (f, v) => onUpdateSectionData(sectionId, { ...data, [f]: v }))}
          className={`text-[2em] font-extrabold tracking-tight min-w-[200px] ${commonEditableClass}`} style={{ color: primaryColor }}
          data-placeholder={config.placeholders.personalInfo.fullName}
          dangerouslySetInnerHTML={{ __html: data?.fullName || '' }} />
        <br />
        <h2 contentEditable suppressContentEditableWarning
          onBlur={(e) => handleHTMLBlur(e, 'jobTitle', (f, v) => onUpdateSectionData(sectionId, { ...data, [f]: v }))}
          className={`text-[1.15em] font-medium mt-1 text-gray-600 ${commonEditableClass}`}
          data-placeholder={config.placeholders.personalInfo.jobTitle}
          dangerouslySetInnerHTML={{ __html: data?.jobTitle || '' }} />
      </div>
    );
  },

  contactInfo: ({ data, primaryColor, sectionId, onUpdateSectionData, isHighlighted }) => (
    <div style={highlightStyle(isHighlighted, primaryColor)} className={sectionWrapClass(isHighlighted)}>
      <EditableContactList items={Array.isArray(data) ? data : []} sectionId={sectionId} primaryColor={primaryColor} onUpdateItems={onUpdateSectionData} />
    </div>
  ),

  objective: (props) => (
    <div style={highlightStyle(props.isHighlighted, props.primaryColor)} className={sectionWrapClass(props.isHighlighted)}>
      <EditableSectionTitle {...props} />
      {renderDynamicList(props.settings?.sectionLayouts?.[props.sectionId] || 'paragraph', {
        items: Array.isArray(props.data) ? props.data : props.data ? [{ description: props.data }] : [],
        sectionId: props.sectionId, primaryColor: props.primaryColor, emptyItemTemplate: { description: '' },
        onUpdateItems: (id, updated) => props.onUpdateSectionData(id, updated),
      })}
    </div>
  ),

  customSectionRenderer: ({ data, primaryColor, sectionId, onUpdateSectionData, isHighlighted }) => {
    const config = useTemplateContext();
    return (
      <div style={highlightStyle(isHighlighted, primaryColor)} className={sectionWrapClass(isHighlighted)}>
        <h3 contentEditable suppressContentEditableWarning
          onBlur={(e) => handleHTMLBlur(e, 'title', (f, v) => onUpdateSectionData(sectionId, { ...data, [f]: v }))}
          className={`font-bold text-[1.1em] uppercase mb-2 pb-1.5 inline-block min-w-[150px] w-full ${commonEditableClass}`}
          style={{ color: primaryColor, borderBottom: `2px solid ${primaryColor}` }}
          data-placeholder="Tên mục"
          dangerouslySetInnerHTML={{ __html: data?.title || config.placeholders.sections.customSection }} />
        <div contentEditable suppressContentEditableWarning
          onBlur={(e) => handleHTMLBlur(e, 'content', (f, v) => onUpdateSectionData(sectionId, { ...data, [f]: v }))}
          className={`text-[1em] text-gray-700 leading-relaxed whitespace-pre-wrap min-h-[40px] w-full ${commonEditableClass}`}
          data-placeholder="Nội dung thông tin thêm..."
          dangerouslySetInnerHTML={{ __html: data?.content || '' }} />
      </div>
    );
  },

  // Map cho các sections còn lại
  skills: (props) => <div style={highlightStyle(props.isHighlighted, props.primaryColor)} className={sectionWrapClass(props.isHighlighted)}><EditableSectionTitle {...props} />{renderDynamicList(props.settings?.sectionLayouts?.[props.sectionId] || 'tags', listProps('skills', props.data, props.sectionId, props.primaryColor, props.onUpdateSectionData))}</div>,
  hobbies: (props) => <div style={highlightStyle(props.isHighlighted, props.primaryColor)} className={sectionWrapClass(props.isHighlighted)}><EditableSectionTitle {...props} />{renderDynamicList(props.settings?.sectionLayouts?.[props.sectionId] || 'tags', listProps('hobbies', props.data, props.sectionId, props.primaryColor, props.onUpdateSectionData))}</div>,
  experience: (props) => <div style={highlightStyle(props.isHighlighted, props.primaryColor)} className={sectionWrapClass(props.isHighlighted)}><EditableSectionTitle {...props} />{renderDynamicList(props.settings?.sectionLayouts?.[props.sectionId] || 'timeline', listProps('experience', props.data, props.sectionId, props.primaryColor, props.onUpdateSectionData))}</div>,
  education: (props) => <div style={highlightStyle(props.isHighlighted, props.primaryColor)} className={sectionWrapClass(props.isHighlighted)}><EditableSectionTitle {...props} />{renderDynamicList(props.settings?.sectionLayouts?.[props.sectionId] || 'timeline', listProps('education', props.data, props.sectionId, props.primaryColor, props.onUpdateSectionData))}</div>,
  activities: (props) => <div style={highlightStyle(props.isHighlighted, props.primaryColor)} className={sectionWrapClass(props.isHighlighted)}><EditableSectionTitle {...props} />{renderDynamicList(props.settings?.sectionLayouts?.[props.sectionId] || 'row', listProps('activities', props.data, props.sectionId, props.primaryColor, props.onUpdateSectionData))}</div>,
  projects: (props) => <div style={highlightStyle(props.isHighlighted, props.primaryColor)} className={sectionWrapClass(props.isHighlighted)}><EditableSectionTitle {...props} />{renderDynamicList(props.settings?.sectionLayouts?.[props.sectionId] || 'row', listProps('projects', props.data, props.sectionId, props.primaryColor, props.onUpdateSectionData))}</div>,
  certifications: (props) => <div style={highlightStyle(props.isHighlighted, props.primaryColor)} className={sectionWrapClass(props.isHighlighted)}><EditableSectionTitle {...props} />{renderDynamicList(props.settings?.sectionLayouts?.[props.sectionId] || 'row', listProps('certifications', props.data, props.sectionId, props.primaryColor, props.onUpdateSectionData))}</div>,
  awards: (props) => <div style={highlightStyle(props.isHighlighted, props.primaryColor)} className={sectionWrapClass(props.isHighlighted)}><EditableSectionTitle {...props} />{renderDynamicList(props.settings?.sectionLayouts?.[props.sectionId] || 'row', listProps('awards', props.data, props.sectionId, props.primaryColor, props.onUpdateSectionData))}</div>,
  references: (props) => <div style={highlightStyle(props.isHighlighted, props.primaryColor)} className={sectionWrapClass(props.isHighlighted)}><EditableSectionTitle {...props} />{renderDynamicList(props.settings?.sectionLayouts?.[props.sectionId] || 'row', listProps('references', props.data, props.sectionId, props.primaryColor, props.onUpdateSectionData))}</div>,
};

const getFontSizeStyle = (sizeValue) => {
  // sizeValue khớp với CV_FONT_SIZES[i].value ('small'|'medium'|'large'|'xlarge')
  switch (sizeValue) {
    case 'small':  return '10px';
    case 'medium': return '13px';
    case 'large':  return '16px';
    case 'xlarge': return '20px';
    default:       return '13px';
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// SIMPLE TEMPLATE MAIN COMPONENT
// Bọc bằng TemplateContext.Provider để phát tán cấu hình xuống component con
// ─────────────────────────────────────────────────────────────────────────────

const SimpleTemplate = ({ cvData, selectedSection, onSectionClick, onUpdateSectionData }) => {
  const { layout, data, settings } = cvData;
  const containerRef = useRef(null);

  // Cơ chế phân trang A4 đã bị xóa - hiện tại là layout linh hoạt 1 trang dài

  const handleSectionClick = (e, sectionId) => {
    // Chặn sự kiện nổi bọt lên canvas cha, tránh bị hiểu nhầm là "click ra ngoài"
    // và bị setSelectedSection(null) đè ngay sau đó.
    e.stopPropagation();
    if (onSectionClick) onSectionClick(sectionId);
  };

  const renderItems = (itemIds) =>
    itemIds.map((itemId) => {
      const isCustomSection = itemId.startsWith('customSection_');
      const SectionComponent = isCustomSection ? SECTION_RENDERER.customSectionRenderer : SECTION_RENDERER[itemId];
      if (!SectionComponent) return null;

      return (
        <div key={itemId} onClick={(e) => handleSectionClick(e, itemId)} className="transition-all cv-section flow-root">
          <SectionComponent
            data={data[itemId]}
            sectionTitle={data.sectionTitles?.[itemId]}
            allSectionTitles={data.sectionTitles || {}}
            primaryColor={settings.primaryColor}
            settings={settings}
            isHighlighted={selectedSection === itemId}
            sectionId={itemId}
            onUpdateSectionData={onUpdateSectionData}
          />
        </div>
      );
    });

return (
    <TemplateContext.Provider value={SIMPLE_TEMPLATE_CONFIG}>
      <div
        ref={containerRef}
        className="bg-white mx-auto p-3 box-border" 
        style={{ fontFamily: `${settings.font}, sans-serif`, fontSize: getFontSizeStyle(settings.fontSize) }}
      >
        {layout.activeRows.map((row) => {
          const { left, right } = getGridClasses(row.ratio);
          return (
            <div key={row.id} className="grid grid-cols-10 gap-x-3">
              <div className={left}>{renderItems(row.leftItems)}</div>
              {row.ratio !== '10-0' && row.ratio !== '100-0' && (
                <div className={right}>{renderItems(row.rightItems)}</div>
              )}
            </div>
          );
        })}
      </div>
    </TemplateContext.Provider>
  );
};

export default SimpleTemplate;
```


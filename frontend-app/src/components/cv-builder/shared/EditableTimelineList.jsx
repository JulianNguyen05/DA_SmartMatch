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
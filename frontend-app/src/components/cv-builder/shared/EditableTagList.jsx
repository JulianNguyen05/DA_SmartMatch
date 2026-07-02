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

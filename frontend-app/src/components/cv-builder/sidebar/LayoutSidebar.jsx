import React from 'react';
import { useDroppable } from '@dnd-kit/core';
// Xóa các icon không dùng tới để code gọn hơn
import DraggableItem from './DraggableItem';

// Hàm dịch chuỗi ratio thành % độ rộng cho CSS
const getColumnWidths = (ratio) => {
  switch (ratio) {
    case '10-0': 
    case '100-0': 
      return { left: '100%', right: '0%' };
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
    default: 
      return { left: '100%', right: '0%' };
  }
};

const LayoutSidebar = ({ layout, onChangeRatio, primaryColor }) => {
  const { activeRows, unusedItems } = layout;

  return (
    <div className="p-5">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-lg">Tùy chỉnh bố cục</h3>
      </div>

      {/* === PHẦN CÁC HÀNG HOẠT ĐỘNG === */}
      <div className="space-y-4 mb-8">
        {activeRows.map((row, index) => (
          <RowBlock 
            key={row.id}
            row={row}
            rowIndex={index}
            onChangeRatio={onChangeRatio}
            primaryColor={primaryColor}
          />
        ))}
      </div>

      {/* === PHẦN KHO LƯU TRỮ === */}
      <UnusedItemsPool 
        items={unusedItems}
        primaryColor={primaryColor}
      />
    </div>
  );
};

// ============================================
// COMPONENT: RowBlock (Khối Hàng)
// ============================================
const RowBlock = ({ row, rowIndex, onChangeRatio, primaryColor }) => {
  const hasRightCol = row.ratio !== '10-0';
  
  // Tính toán độ rộng cho dòng hiện tại dựa vào ratio
  const widths = getColumnWidths(row.ratio);

  return (
    <div className="p-4 bg-gray-50 border rounded-lg">
      {/* HEADER - Title + Ratio Selector */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
        <span className="font-bold text-sm text-gray-700">Hàng {rowIndex + 1}</span>
        
        <select 
          value={row.ratio}
          onChange={(e) => onChangeRatio(row.id, e.target.value)}
          className="text-xs border p-1.5 rounded bg-white text-gray-700 outline-none focus:ring-1 transition-shadow"
          style={{ focusRing: primaryColor }}
        >
          <option value="10-0">1 cột (100%)</option>
          <option value="5-5">2 cột (50-50)</option>
          <option value="6-4">2 cột (60-40)</option>
          <option value="7-3">2 cột (70-30)</option>
          <option value="8-2">2 cột (80-20)</option>
        </select>
      </div>

      {/* COLUMNS CONTAINER - Ép thành hàng ngang */}
      <div className="flex flex-row w-full gap-2 items-start">
        {/* LEFT COLUMN */}
        <DroppableColumn 
          rowId={row.id}
          column="left"
          items={row.leftItems}
          primaryColor={primaryColor}
          label="Cột trái"
          width={widths.left}
        />

        {/* RIGHT COLUMN - Only if ratio !== 10-0 */}
        {hasRightCol && (
          <DroppableColumn 
            rowId={row.id}
            column="right"
            items={row.rightItems}
            primaryColor={primaryColor}
            label="Cột phải"
            width={widths.right}
          />
        )}
      </div>
    </div>
  );
};

// ============================================
// COMPONENT: DroppableColumn (Cột thả vào)
// ============================================
const DroppableColumn = ({ rowId, column, items, primaryColor, label, width }) => {
  const droppableId = `droppable-${rowId}-${column}`;
  const { setNodeRef, isOver } = useDroppable({
    id: droppableId,
  });

  return (
    <div
      ref={setNodeRef}
      // Thay đổi chính: Bỏ 'flex-1', thêm 'min-w-0' để text tự cắt khi quá dài, và thêm animation duration-300
      className={`min-w-0 min-h-[120px] p-2 border-2 rounded-lg transition-all duration-300 ${
        isOver 
          ? 'border-dashed' 
          : 'border-gray-200'
      } bg-white`}
      style={{
        width: width, // Áp dụng % độ rộng tính toán được vào CSS
        borderColor: isOver ? primaryColor : '#e5e7eb',
        backgroundColor: isOver ? `${primaryColor}08` : '#ffffff'
      }}
    >
      <div className="text-[10px] font-semibold text-gray-400 mb-2 uppercase text-center truncate">
        {label}
      </div>

      {/* Items trong cột */}
      <div className="space-y-2">
        {items.length > 0 ? (
          items.map(itemId => (
            <DraggableItem 
              key={itemId}
              id={`item-${itemId}`}
              itemId={itemId}
              primaryColor={primaryColor}
            />
          ))
        ) : (
          <div className="text-[10px] text-gray-400 italic py-6 text-center">
            Kéo thả vào đây
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================
// COMPONENT: UnusedItemsPool (Kho lưu trữ)
// ============================================
const UnusedItemsPool = ({ items, primaryColor }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: 'unused-pool',
  });

  return (
    <div className="mt-8 pt-4 border-t border-dashed border-gray-300">
      <h4 className="font-bold text-sm text-gray-500 mb-3 uppercase">
        Mục chưa sử dụng
      </h4>

      <div
        ref={setNodeRef}
        className={`p-3 min-h-[100px] border-2 rounded-lg transition-all ${
          isOver ? 'border-dashed' : 'border-gray-200'
        } bg-white`}
        style={{
          borderColor: isOver ? primaryColor : '#e5e7eb',
          backgroundColor: isOver ? `${primaryColor}08` : '#ffffff'
        }}
      >
        <div className="flex flex-wrap gap-2">
          {items.length > 0 ? (
            items.map(itemId => (
              <DraggableItem
                key={itemId}
                id={`unused-${itemId}`}
                itemId={itemId}
                primaryColor={primaryColor}
                variant="unused"
              />
            ))
          ) : (
            <div className="text-xs text-gray-400 italic w-full text-center py-4">
              Tất cả mục đều đang sử dụng
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LayoutSidebar;
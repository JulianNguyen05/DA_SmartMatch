import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Plus, Trash2, X } from 'lucide-react';
import DraggableItem from './DraggableItem';

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

  return (
    <div className="p-4 bg-gray-50 border rounded-lg">
      {/* HEADER - Title + Ratio Selector */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b">
        <span className="font-bold text-sm text-gray-700">Hàng {rowIndex + 1}</span>
        
        <select 
          value={row.ratio}
          onChange={(e) => onChangeRatio(row.id, e.target.value)}
          className="text-xs border p-1.5 rounded bg-white text-gray-700 outline-none focus:ring-2"
          style={{ focusRing: primaryColor }}
        >
          <option value="10-0">1 cột (100%)</option>
          <option value="5-5">2 cột (50-50)</option>
          <option value="6-4">2 cột (60-40)</option>
          <option value="7-3">2 cột (70-30)</option>
          <option value="8-2">2 cột (80-20)</option>
        </select>
      </div>

      {/* COLUMNS CONTAINER */}
      <div className="flex gap-3">
        {/* LEFT COLUMN */}
        <DroppableColumn 
          rowId={row.id}
          column="left"
          items={row.leftItems}
          primaryColor={primaryColor}
          label="Cột trái"
        />

        {/* RIGHT COLUMN - Only if ratio !== 10-0 */}
        {hasRightCol && (
          <DroppableColumn 
            rowId={row.id}
            column="right"
            items={row.rightItems}
            primaryColor={primaryColor}
            label="Cột phải"
          />
        )}
      </div>
    </div>
  );
};

// ============================================
// COMPONENT: DroppableColumn (Cột thả vào)
// ============================================
const DroppableColumn = ({ rowId, column, items, primaryColor, label }) => {
  const droppableId = `droppable-${rowId}-${column}`;
  const { setNodeRef, isOver } = useDroppable({
    id: droppableId,
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 min-h-[120px] p-3 border-2 rounded-lg transition-all ${
        isOver 
          ? 'border-dashed' 
          : 'border-gray-200'
      } bg-white`}
      style={{
        borderColor: isOver ? primaryColor : '#e5e7eb',
        backgroundColor: isOver ? `${primaryColor}08` : '#ffffff'
      }}
    >
      <div className="text-xs font-semibold text-gray-400 mb-2 uppercase">
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
          <div className="text-xs text-gray-400 italic py-6 text-center">
            Kéo item vào đây
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
    <div className="mt-8 pt-4 border-t border-dashed">
      <h4 className="font-bold text-sm text-gray-500 mb-3 uppercase">
        Mục chưa sử dụng
      </h4>

      <div
        ref={setNodeRef}
        className={`p-3 border-2 rounded-lg transition-all ${
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

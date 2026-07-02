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
// src/components/candidate-profile/sandbox/ProfileLayoutSandbox.jsx
import React, { useMemo, useState, useCallback } from 'react';
import GridLayout, { WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import ProfileBlockCard from './ProfileBlockCard';
import { DEFAULT_GRID_SIZE } from '../shared/blockConfig';
import authService from '../../../features/auth/authService';

const RGL = WidthProvider(GridLayout);

const COLS = 12;
const ROW_HEIGHT = 26; // px / hàng — kết hợp với h (số hàng) ra chiều cao thật
const GRID_MARGIN = [16, 16]; // [x, y] khoảng cách giữa các block (px)
const STORAGE_PREFIX = 'worklify_profile_grid_v1';

/**
 * Sinh layout lưới mặc định (x, y, w, h) cho các block CHƯA từng được người
 * dùng tự sắp xếp. Dùng compactType="vertical" của RGL nên chỉ cần set x/w
 * hợp lý theo hàng ngang — RGL tự dồn các item lên trên khi có khoảng trống.
 */
const buildDefaultGrid = (layoutItems) => {
  let cursorX = 0;
  return layoutItems.map((item) => {
    const size = DEFAULT_GRID_SIZE[item.blockType] || { w: 4, h: 6 };
    if (cursorX + size.w > COLS) cursorX = 0;
    const gridItem = { i: item.blockType, x: cursorX, y: 0, w: size.w, h: size.h, minW: 2, minH: 3 };
    cursorX += size.w;
    return gridItem;
  });
};

/**
 * Sandbox 2 chế độ trên lưới 12 cột:
 *  - isEditMode=true  → kéo-thả tự do + resize từng block, hiện tay cầm/nút sửa/ẩn,
 *                        vẫn hiện cả block đang bị ẩn (mờ đi) để người dùng bật lại được.
 *  - isEditMode=false → chỉ xem (không kéo/resize), CHỈ hiện các block có visible=true
 *                        — đúng như những gì khách xem portfolio sẽ thấy.
 *
 * Layout dạng lưới (x,y,w,h) được lưu ở localStorage theo từng user (chưa có
 * cột x/y/w/h ở backend) — "position" tuyến tính vẫn được tính lại và gửi qua
 * onReorder để tương thích API hiện tại.
 *
 * @param {Array}    layout       - [{ blockType, position, visible }], đã sort theo position
 * @param {object}   profileData  - response getFullProfile (chứa profile + 9 danh sách)
 * @param {Function} onReorder    - (newLayoutArray) => void — gọi sau khi kéo-thả/resize xong
 * @param {Function} onToggleVisibility - (blockType, nextVisible) => void
 * @param {boolean}  isEditMode   - true = đang chỉnh sửa bố cục, false = chỉ xem portfolio
 */
const ProfileLayoutSandbox = ({
  layout, profileData, onReorder, onToggleVisibility, isEditMode, userID, onSaved, onToast,
}) => {
  const userId = authService.getCurrentUser()?.userId;
  const storageKey = `${STORAGE_PREFIX}_${userId}`;

  const [gridLayout, setGridLayout] = useState(() => {
    try {
      const saved = window.localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        const knownTypes = new Set(layout.map((l) => l.blockType));
        const kept = parsed.filter((g) => knownTypes.has(g.i));
        const missingItems = layout.filter((l) => !parsed.some((g) => g.i === l.blockType));
        return [...kept, ...buildDefaultGrid(missingItems)];
      }
    } catch (e) {
      // localStorage lỗi/không đọc được JSON -> rơi về layout mặc định bên dưới
    }
    return buildDefaultGrid(layout);
  });

  // Tra cứu nhanh layoutItem gốc (visible, blockType...) theo blockType
  const layoutByType = useMemo(() => {
    const map = {};
    layout.forEach((l) => { map[l.blockType] = l; });
    return map;
  }, [layout]);

  // Chế độ xem: chỉ giữ lại các block visible=true, để khớp đúng với
  // những gì người xem portfolio (không phải chủ hồ sơ) sẽ thấy.
  const visibleGridLayout = useMemo(() => {
    if (isEditMode) return gridLayout;
    return gridLayout.filter((g) => layoutByType[g.i]?.visible);
  }, [gridLayout, layoutByType, isEditMode]);

  const handleLayoutChange = useCallback((newGridLayout) => {
    if (!isEditMode) return; // chế độ xem: không cho RGL ghi đè layout đã lưu
    setGridLayout(newGridLayout);
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(newGridLayout));
    } catch (e) {
      // bỏ qua nếu localStorage đầy hoặc bị chặn (chế độ ẩn danh...)
    }

    // Tính lại "position" tuyến tính theo thứ tự trên->dưới, trái->phải để
    // các phần khác của hệ thống (API reorder cũ, thứ tự trong CV...) vẫn hoạt động.
    const sorted = [...newGridLayout].sort((a, b) => (a.y - b.y) || (a.x - b.x));
    const reordered = sorted
      .map((g) => layoutByType[g.i])
      .filter(Boolean)
      .map((item, index) => ({ ...item, position: index }));
    onReorder(reordered);
  }, [isEditMode, storageKey, layoutByType, onReorder]);

  return (
    <div
      className={isEditMode ? 'border-[3px] border-black p-3 sm:p-4' : 'p-3 sm:p-4'}
      style={isEditMode ? {
        backgroundColor: '#F5F5F0',
        backgroundImage: 'radial-gradient(#00000022 1.5px, transparent 1.5px)',
        backgroundSize: '18px 18px',
      } : undefined}
    >
      {/* Reskin handle resize + placeholder khi kéo cho khớp phong cách neobrutalism */}
      {isEditMode && (
        <style>{`
          .react-grid-item.react-grid-placeholder {
            background: #111111 !important;
            opacity: 0.15 !important;
            border-radius: 0 !important;
          }
          .react-resizable-handle {
            width: 16px !important;
            height: 16px !important;
            background: #111111 !important;
            background-image: none !important;
            border: 2px solid #ffffff !important;
            bottom: -3px !important;
            right: -3px !important;
            opacity: 0;
            transition: opacity .12s ease;
          }
          .react-grid-item:hover .react-resizable-handle {
            opacity: 1;
          }
          .react-grid-item.resizing .react-resizable-handle,
          .react-grid-item.react-draggable-dragging {
            opacity: 1;
          }
        `}
        </style>
      )}

      <RGL
        layout={visibleGridLayout}
        cols={COLS}
        rowHeight={ROW_HEIGHT}
        margin={GRID_MARGIN}
        containerPadding={[0, 0]}
        onLayoutChange={handleLayoutChange}
        draggableHandle=".block-drag-handle"
        compactType="vertical"
        preventCollision={false}
        isDraggable={isEditMode}
        isResizable={isEditMode}
      >
        {visibleGridLayout.map((g) => {
          const layoutItem = layoutByType[g.i];
          if (!layoutItem) return null;
          return (
            <div key={g.i}>
              <ProfileBlockCard
                layoutItem={layoutItem}
                profileData={profileData}
                onToggleVisibility={onToggleVisibility}
                isEditMode={isEditMode}
                userId={userId}   
                onSaved={onSaved} 
                onToast={onToast} 
              />
            </div>
          );
        })}
      </RGL>
    </div>
  );
};

export default ProfileLayoutSandbox;

// src/components/candidate-profile/ProfileLayoutSandbox.jsx
import React from 'react';
import {
  DndContext, closestCenter, PointerSensor, KeyboardSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import {
  SortableContext, verticalListSortingStrategy, sortableKeyboardCoordinates, arrayMove,
} from '@dnd-kit/sortable';
import ProfileBlockCard from './ProfileBlockCard';

/**
 * Sandbox kéo-thả 12 block ProfilePage.
 * @param {Array}    layout       - danh sách layoutItem [{ blockType, position, visible }], đã sort theo position
 * @param {object}   profileData  - response getFullProfile (chứa profile + 9 danh sách)
 * @param {Function} onReorder    - (newLayoutArray) => void — gọi khi kéo-thả xong
 * @param {Function} onToggleVisibility - (blockType, nextVisible) => void
 * @param {Function} onEdit       - (blockType) => void
 */
const ProfileLayoutSandbox = ({ layout, profileData, onReorder, onToggleVisibility, onEdit }) => {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = layout.findIndex((l) => l.blockType === active.id);
    const newIndex = layout.findIndex((l) => l.blockType === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(layout, oldIndex, newIndex).map((item, index) => ({
      ...item,
      position: index,
    }));
    onReorder(reordered);
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={layout.map((l) => l.blockType)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {layout.map((layoutItem) => (
            <ProfileBlockCard
              key={layoutItem.blockType}
              layoutItem={layoutItem}
              profileData={profileData}
              onToggleVisibility={onToggleVisibility}
              onEdit={onEdit}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default ProfileLayoutSandbox;

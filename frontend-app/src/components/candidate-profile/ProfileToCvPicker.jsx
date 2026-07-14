// src/components/candidate-profile/ProfileToCvPicker.jsx
import React, { useState, useEffect } from 'react';
import { CheckSquare, Square } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import candidateService from '../../features/candidate/candidateService';
import { BLOCK_META } from './blockConfig';

// Các block luôn được đưa vào CV mặc định (không cần chọn item con)
const ALWAYS_INCLUDED = ['PERSONAL_INFO', 'AVATAR', 'SOCIAL_LINKS'];

/**
 * Modal chọn item từ hồ sơ để đưa vào 1 CV mới.
 * Quan trọng: việc CHỌN này độc lập với layout/visible trên ProfilePage —
 * candidate có thể ẩn Hobby khỏi ProfilePage công khai nhưng vẫn chọn đưa vào CV này.
 *
 * @param {number}   userId
 * @param {boolean}  isOpen
 * @param {Function} onClose
 * @param {Function} onConfirm - (selectedProfileData) => void
 *        selectedProfileData = { profile, experiences: [...đã lọc], educations: [...], ... }
 */
const ProfileToCvPicker = ({ userId, isOpen, onClose, onConfirm, onToast }) => {
  const [profileData, setProfileData] = useState(null);
  const [selectedIds, setSelectedIds] = useState({}); // { EXPERIENCE: Set(1,2), ... }
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !userId) return;
    setIsLoading(true);
    candidateService.getFullProfile(userId)
      .then((res) => {
        const data = res?.data;
        setProfileData(data);
        // Mặc định chọn TẤT CẢ item của các block đang visible=true trên ProfilePage
        const initial = {};
        Object.entries(BLOCK_META).forEach(([blockType, meta]) => {
          if (!meta.repeatable) return;
          const layoutItem = data?.layout?.find((l) => l.blockType === blockType);
          const items = data?.[meta.dataKey] || [];
          initial[blockType] = new Set(layoutItem?.visible !== false ? items.map((i) => i.id) : []);
        });
        setSelectedIds(initial);
      })
      .catch(() => onToast?.({ type: 'error', message: 'Không tải được dữ liệu hồ sơ.' }))
      .finally(() => setIsLoading(false));
  }, [isOpen, userId]);

  const toggleItem = (blockType, itemId) => {
    setSelectedIds((prev) => {
      const next = new Set(prev[blockType]);
      next.has(itemId) ? next.delete(itemId) : next.add(itemId);
      return { ...prev, [blockType]: next };
    });
  };

  const toggleAll = (blockType, items) => {
    setSelectedIds((prev) => {
      const allSelected = items.every((i) => prev[blockType]?.has(i.id));
      return { ...prev, [blockType]: new Set(allSelected ? [] : items.map((i) => i.id)) };
    });
  };

  const handleConfirm = () => {
    if (!profileData) return;
    const selected = { profile: profileData.profile };
    Object.entries(BLOCK_META).forEach(([blockType, meta]) => {
      if (!meta.repeatable) return;
      const items = profileData[meta.dataKey] || [];
      selected[meta.dataKey] = items.filter((i) => selectedIds[blockType]?.has(i.id));
    });
    onConfirm(selected);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Chọn nội dung đưa vào CV">
      <div className="p-5 min-w-[480px] max-w-[640px] max-h-[70vh] overflow-y-auto">
        {isLoading ? (
          <p className="text-sm text-gray-400 text-center py-10">Đang tải...</p>
        ) : (
          <div className="space-y-5">
            <p className="text-xs text-gray-400">
              Mặc định chọn sẵn theo trạng thái hiển thị trên ProfilePage — bạn có thể chọn lại tùy CV.
              Thông tin cá nhân, ảnh đại diện và liên kết mạng xã hội luôn được đưa vào.
            </p>

            {Object.entries(BLOCK_META)
              .filter(([, meta]) => meta.repeatable)
              .map(([blockType, meta]) => {
                const items = profileData?.[meta.dataKey] || [];
                if (items.length === 0) return null;
                const selectedSet = selectedIds[blockType] || new Set();
                const allSelected = items.every((i) => selectedSet.has(i.id));

                return (
                  <div key={blockType}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wide">{meta.label}</h4>
                      <button onClick={() => toggleAll(blockType, items)} className="text-xs text-indigo-600 hover:underline">
                        {allSelected ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                      </button>
                    </div>
                    <div className="space-y-1">
                      {items.map((item) => (
                        <label key={item.id} className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-gray-50 cursor-pointer text-sm text-gray-600">
                          {selectedSet.has(item.id) ? <CheckSquare size={16} className="text-indigo-600 shrink-0" /> : <Square size={16} className="text-gray-300 shrink-0" />}
                          <input type="checkbox" className="hidden" checked={selectedSet.has(item.id)} onChange={() => toggleItem(blockType, item.id)} />
                          <span className="truncate">{itemLabel(blockType, item)}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
          </div>
        )}

        <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-100">
          <Button variant="outline" onClick={onClose}>Hủy</Button>
          <Button onClick={handleConfirm} disabled={isLoading}>Tiếp tục tạo CV</Button>
        </div>
      </div>
    </Modal>
  );
};

const itemLabel = (blockType, item) => {
  switch (blockType) {
    case 'EXPERIENCE': return `${item.position || ''} ${item.companyName ? '— ' + item.companyName : ''}`.trim();
    case 'EDUCATION': return `${item.schoolName || ''} ${item.major ? '— ' + item.major : ''}`.trim();
    case 'SKILL': return item.skillName;
    case 'PROJECT': return item.projectName;
    case 'CERTIFICATION': return item.name;
    case 'AWARD': return item.title;
    case 'ACTIVITY': return item.organization;
    case 'LANGUAGE': return item.languageName;
    case 'HOBBY': return item.name;
    default: return `#${item.id}`;
  }
};

export default ProfileToCvPicker;

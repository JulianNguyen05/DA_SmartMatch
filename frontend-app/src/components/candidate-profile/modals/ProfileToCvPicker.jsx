// src/components/candidate-profile/modals/ProfileToCvPicker.jsx
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText } from 'lucide-react';
import Modal from '../../common/Modal';
import Button from '../../common/Button';
import { getBlockItems, BLOCK_META } from '../shared/blockConfig';
import { mapProfileToCvData } from '../../cv-builder/shared/mapProfileToCvData';

const TEMPLATE_OPTIONS = [
  { value: 'simple', label: 'Simple' },
  { value: 'harvard', label: 'Harvard' },
  { value: 'professional', label: 'Professional' },
];

const PICKABLE_BLOCK_TYPES = ['EXPERIENCE', 'EDUCATION', 'SKILL', 'PROJECT', 'CERTIFICATION', 'AWARD', 'ACTIVITY', 'HOBBY'];

/**
 * @param {object}  profileData - response getFullProfile (đã có sẵn ở ProfilePage, KHÔNG gọi lại API ở đây)
 * @param {boolean} isOpen
 * @param {Function} onClose
 */
const ProfileToCvPicker = ({ profileData, isOpen, onClose }) => {
  const navigate = useNavigate();
  const [template, setTemplate] = useState('simple');

  // Mặc định chọn sẵn item thuộc block đang HIỂN THỊ trên ProfilePage (visible=true)
  const initialSelected = useMemo(() => {
    const layoutByType = Object.fromEntries((profileData?.layout || []).map((l) => [l.blockType, l.visible]));
    const result = {};
    PICKABLE_BLOCK_TYPES.forEach((type) => {
      const items = getBlockItems(type, profileData);
      const defaultChecked = layoutByType[type] !== false;
      result[type] = new Set(defaultChecked ? items.map((i) => i.id) : []);
    });
    return result;
  }, [profileData]);

  const [selected, setSelected] = useState(initialSelected);

  const toggleItem = (blockType, id) => {
    setSelected((prev) => {
      const next = new Set(prev[blockType]);
      next.has(id) ? next.delete(id) : next.add(id);
      return { ...prev, [blockType]: next };
    });
  };

  const toggleAll = (blockType, items) => {
    setSelected((prev) => {
      const allChecked = items.every((i) => prev[blockType]?.has(i.id));
      return { ...prev, [blockType]: new Set(allChecked ? [] : items.map((i) => i.id)) };
    });
  };

  const handleCreate = () => {
    const filteredProfileData = { ...profileData };
    PICKABLE_BLOCK_TYPES.forEach((type) => {
      const meta = BLOCK_META[type];
      if (!meta?.dataKey) return;
      const items = getBlockItems(type, profileData);
      filteredProfileData[meta.dataKey] = items.filter((i) => selected[type]?.has(i.id));
    });

    // defaultData rỗng {} — CVBuilderPage sẽ tự merge tiếp với defaultData thật
    // của template đã chọn khi khởi tạo (xem snippet_10a_CVBuilderPage_MODIFY).
    const prefillData = mapProfileToCvData(filteredProfileData, {});

    navigate('/candidate/cv-builder', {
      state: { prefillData, prefillTemplate: template },
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tạo CV từ hồ sơ">
      <div className="p-5 min-w-[460px] max-w-[600px]">
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">Chọn mẫu CV</label>
          <div className="flex gap-2">
            {TEMPLATE_OPTIONS.map((t) => (
              <button
                key={t.value}
                onClick={() => setTemplate(t.value)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${
                  template === t.value ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <p className="text-sm text-gray-500 mb-3">
          Thông tin cá nhân, ảnh đại diện và liên kết mạng xã hội luôn được đưa vào CV.
          Chọn thêm nội dung bên dưới:
        </p>

        <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
          {PICKABLE_BLOCK_TYPES.map((type) => {
            const items = getBlockItems(type, profileData);
            if (items.length === 0) return null;
            const meta = BLOCK_META[type];
            const allChecked = items.every((i) => selected[type]?.has(i.id));

            return (
              <div key={type} className="border border-gray-100 rounded-xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-gray-700">{meta.label}</span>
                  <button onClick={() => toggleAll(type, items)} className="text-xs text-indigo-600 hover:underline">
                    {allChecked ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                  </button>
                </div>
                <div className="space-y-1.5">
                  {items.map((item) => (
                    <label key={item.id} className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selected[type]?.has(item.id) || false}
                        onChange={() => toggleItem(type, item.id)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="truncate">
                        {item.skillName || item.companyName || item.schoolName || item.projectName ||
                          item.name || item.title || item.organization || '(chưa đặt tên)'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-100">
          <Button variant="outline" onClick={onClose}>Hủy</Button>
          <Button onClick={handleCreate}>
            <FileText size={16} className="mr-1.5 inline" /> Tạo CV
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ProfileToCvPicker;

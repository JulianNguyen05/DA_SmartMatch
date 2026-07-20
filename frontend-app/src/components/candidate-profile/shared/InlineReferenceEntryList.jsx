// src/components/candidate-profile/shared/InlineReferenceEntryList.jsx
import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import candidateService from '../../../features/candidate/candidateService';
import ReferenceValueAutocomplete from './ReferenceValueAutocomplete';

let tempIdCounter = 0;
const nextTempId = () => `temp-${Date.now()}-${tempIdCounter++}`;

const LEVEL_OPTIONS = ['Cơ bản', 'Trung bình', 'Thành thạo', 'Chuyên gia'];
const PROFICIENCY_OPTIONS = ['Cơ bản', 'Trung cấp', 'Thành thạo', 'Bản ngữ'];

// Khác nhau giữa 2 loại: Skill gửi TÊN (text, BE tự đối chiếu/tạo đề xuất nếu
// chưa có), Language bắt buộc gửi ID có sẵn trong danh mục (không nhận text tự do).
const CONFIG = {
  SKILL: {
    label: 'kỹ năng',
    refType: 'SKILL',
    nameField: 'skillName',
    extraField: { name: 'level', label: 'Trình độ', options: LEVEL_OPTIONS, default: 'Trung bình' },
    buildPayload: (selected, extraValue) => ({ skillName: selected.name, level: extraValue, description: '' }),
    service: { create: 'createSkill', update: 'updateSkill', remove: 'removeSkill' },
  },
  LANGUAGE: {
    label: 'ngôn ngữ',
    refType: 'LANGUAGE',
    nameField: 'languageName',
    refIdField: 'languageId', // khác Skill: id dòng != id trong danh mục
    extraField: { name: 'proficiency', label: 'Mức độ', options: PROFICIENCY_OPTIONS, default: 'Trung cấp' },
    buildPayload: (selected, extraValue) => ({ languageId: selected.id, proficiency: extraValue }),
    service: { create: 'createLanguage', update: 'updateLanguage', remove: 'deleteLanguage' },
  },
};

/**
 * @param {'SKILL'|'LANGUAGE'} blockType
 * @param {number}   userId
 * @param {Array}    items
 * @param {Function} onSaved
 * @param {Function} onToast
 * @param {boolean}  [readOnly]
 */
const InlineReferenceEntryList = ({ blockType, userId, items, onSaved, onToast, readOnly = false }) => {
  const config = CONFIG[blockType];
  const [localItems, setLocalItems] = useState(() => (items || []).map((it) => ({ ...it })));

  useEffect(() => {
    setLocalItems((items || []).map((it) => ({ ...it })));
  }, [items]);

  if (!config) return null;

  const isDraft = (item) => String(item.id).startsWith('temp-');
  const selectedOf = (item) => (item[config.nameField]
    ? { id: item[config.refIdField] || item.id, name: item[config.nameField] }
    : null);

  const persist = async (index, selected, extraValue) => {
    const item = localItems[index];
    const payload = config.buildPayload(selected, extraValue);

    try {
      if (isDraft(item)) {
        const res = await candidateService[config.service.create](userId, payload);
        const saved = res?.data;
        if (saved) setLocalItems((prev) => prev.map((it, i) => (i === index ? saved : it)));
        onSaved?.();
      } else {
        await candidateService[config.service.update](userId, item.id, payload);
        setLocalItems((prev) => prev.map((it, i) => (i === index
          ? { ...it, [config.nameField]: selected.name, [config.extraField.name]: extraValue }
          : it)));
        onSaved?.();
      }
    } catch (error) {
      onToast?.({
        type: error.response?.status === 409 ? 'info' : 'error',
        message: error.response?.data?.message || 'Không lưu được, thử lại.',
      });
    }
  };

  const handleSelect = (index, refValue) => {
    if (!refValue) return; // ReferenceValueAutocomplete gọi onSelect(null) khi người dùng gõ lại — bỏ qua, chưa lưu
    const extraValue = localItems[index]?.[config.extraField.name] || config.extraField.default;
    persist(index, refValue, extraValue);
  };

  const handleExtraChange = (index, value) => {
    setLocalItems((prev) => prev.map((it, i) => (i === index ? { ...it, [config.extraField.name]: value } : it)));
    const item = localItems[index];
    const selected = selectedOf(item);
    if (selected) persist(index, selected, value); // chỉ lưu khi dòng đã có tên hợp lệ
  };

  const handleAdd = () => {
    setLocalItems((prev) => [...prev, { id: nextTempId(), [config.extraField.name]: config.extraField.default }]);
  };

  const handleDelete = async (index) => {
    const item = localItems[index];
    if (isDraft(item)) {
      setLocalItems((prev) => prev.filter((_, i) => i !== index));
      return;
    }
    if (!window.confirm(`Xóa "${item[config.nameField]}"?`)) return;
    try {
      await candidateService[config.service.remove](userId, item.id);
      setLocalItems((prev) => prev.filter((_, i) => i !== index));
      onToast?.({ type: 'success', message: 'Đã xóa.' });
      onSaved?.();
    } catch (error) {
      onToast?.({ type: 'error', message: 'Xóa thất bại.' });
    }
  };

  if (readOnly) {
    if (localItems.length === 0) return <p className="text-[17px] text-graphite/55 italic font-body">Chưa có dữ liệu</p>;
    return (
      <div className="flex flex-wrap gap-1.5">
        {localItems.map((item) => (
          <span key={item.id} className="inline-flex items-center gap-1 text-[15px] font-medium text-graphite bg-ink-light rounded-md px-2 py-1 font-body">
            {item[config.nameField]}
            <span className="text-graphite/60">· {item[config.extraField.name]}</span>
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {localItems.map((item, index) => (
        <div key={item.id} className="group/entry flex items-center gap-2">
          <div className="flex-1 min-w-0">
            <ReferenceValueAutocomplete
              type={config.refType}
              userId={userId}
              value={selectedOf(item)}
              onSelect={(refValue) => handleSelect(index, refValue)}
              onToast={onToast}
              placeholder={`Chọn ${config.label}...`}
              compact
            />
          </div>
          <select
            value={item[config.extraField.name] || config.extraField.default}
            onChange={(e) => handleExtraChange(index, e.target.value)}
            className="shrink-0 bg-ink-light text-ink text-[15px] font-medium font-body rounded-md px-2 py-2 border-none outline-none"
          >
            {config.extraField.options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
          </select>
          <button
            type="button"
            onClick={() => handleDelete(index)}
            className="shrink-0 p-1.5 text-graphite/45 opacity-0 group-hover/entry:opacity-100 hover:text-red-500 transition-all"
            title="Xóa"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={handleAdd}
        className="flex items-center gap-1.5 text-[15px] font-medium text-ink hover:text-ink-dark font-body"
      >
        <Plus size={13} /> Thêm {config.label}
      </button>
    </div>
  );
};

export default InlineReferenceEntryList;

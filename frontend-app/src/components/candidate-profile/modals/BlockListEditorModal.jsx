// src/components/candidate-profile/BlockListEditorModal.jsx
import React, { useState } from 'react';
import { Plus, Pencil, Trash2, ArrowLeft } from 'lucide-react';
import NeoModal from '../../common/neo/NeoModal';
import NeoButton from '../../common/neo/NeoButton';
import NeoInput from '../../common/neo/NeoInput';
import candidateService from '../../../features/candidate/candidateService';
import { BLOCK_FORM_CONFIGS } from '../shared/blockFormConfig';

/**
 * Modal CRUD generic cho 7 block danh sách "đơn giản" (Experience, Education,
 * Project, Certification, Award, Activity, Hobby).
 *
 * @param {string}   blockType
 * @param {number}   userId
 * @param {Array}    items       - danh sách item hiện tại (từ profileData)
 * @param {boolean}  isOpen
 * @param {Function} onClose
 * @param {Function} onSaved     - () => void, gọi sau khi create/update/delete thành công để cha refetch
 * @param {Function} onToast     - ({ type, message }) => void
 * @param {string}   [accentColor] - màu header, nên lấy từ BLOCK_COLOR[blockType] để đồng bộ với ProfileBlockCard
 */
const BlockListEditorModal = ({ blockType, userId, items, isOpen, onClose, onSaved, onToast, accentColor = '#2DD4BF' }) => {
  const config = BLOCK_FORM_CONFIGS[blockType];
  const [mode, setMode] = useState('list'); // 'list' | 'form'
  const [form, setForm] = useState(config?.emptyItem || {});
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!config) return null;

  const resetToList = () => {
    setMode('list');
    setForm(config.emptyItem);
    setEditingId(null);
  };

  const handleClose = () => {
    resetToList();
    onClose();
  };

  const openCreateForm = () => {
    setForm(config.emptyItem);
    setEditingId(null);
    setMode('form');
  };

  const openEditForm = (item) => {
    setForm({ ...config.emptyItem, ...item });
    setEditingId(item.id);
    setMode('form');
  };

  const handleFieldChange = (name, value) => setForm((prev) => ({ ...prev, [name]: value }));

  const handleSubmit = async () => {
    const requiredMissing = config.fields.some((f) => f.required && !String(form[f.name] || '').trim());
    if (requiredMissing) {
      onToast?.({ type: 'warning', message: 'Vui lòng điền đầy đủ thông tin bắt buộc.' });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = { ...form };
      config.fields.forEach((f) => {
        if ((f.type === 'date' || f.type === 'number') && payload[f.name] === '') {
          payload[f.name] = null;
        }
      });

      if (editingId) {
        await candidateService[`update${config.service}`](userId, editingId, payload);
        onToast?.({ type: 'success', message: 'Cập nhật thành công!' });
      } else {
        await candidateService[`create${config.service}`](userId, payload);
        onToast?.({ type: 'success', message: 'Thêm mới thành công!' });
      }
      onSaved?.();
      resetToList();
    } catch (error) {
      onToast?.({ type: 'error', message: error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Xóa mục "${item[config.titleField]}"?`)) return;
    try {
      await candidateService[`delete${config.service}`](userId, item.id);
      onToast?.({ type: 'success', message: 'Đã xóa.' });
      onSaved?.();
    } catch (error) {
      onToast?.({ type: 'error', message: error.response?.data?.message || 'Xóa thất bại.' });
    }
  };

  return (
    <NeoModal isOpen={isOpen} onClose={handleClose} title={config.label} accentColor={accentColor}>
      <div className="p-5 min-w-[420px] max-w-[560px]">
        {mode === 'list' ? (
          <>
            <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-0.5">
              {items.length === 0 && (
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wide text-center py-8 border-[3px] border-dashed border-gray-300">
                  Chưa có dữ liệu nào.
                </p>
              )}
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 p-3 bg-white border-[3px] border-black"
                  style={{ boxShadow: '3px 3px 0px 0px #111111' }}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-black text-black truncate">{item[config.titleField]}</p>
                    {config.subtitleField && item[config.subtitleField] && (
                      <p className="text-xs font-medium text-gray-500 truncate">{item[config.subtitleField]}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => openEditForm(item)}
                      className="p-1.5 bg-white border-2 border-black text-black hover:bg-black hover:text-white transition-colors"
                    >
                      <Pencil size={14} strokeWidth={2.5} />
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      className="p-1.5 bg-white border-2 border-black text-black hover:bg-[#F87171] transition-colors"
                    >
                      <Trash2 size={14} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={openCreateForm}
              className="w-full mt-4 py-3 border-[3px] border-dashed border-black text-black font-black uppercase tracking-wide text-sm
                hover:bg-black hover:text-white transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={16} strokeWidth={3} /> Thêm mới
            </button>
          </>
        ) : (
          <>
            <button onClick={resetToList} className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wide text-black hover:opacity-60 mb-4">
              <ArrowLeft size={15} strokeWidth={3} /> Quay lại danh sách
            </button>

            <div className="space-y-4">
              {config.fields.map((f) => (
                <FormField key={f.name} field={f} value={form[f.name]} onChange={handleFieldChange} />
              ))}
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <NeoButton variant="outline" onClick={resetToList}>Hủy</NeoButton>
              <NeoButton onClick={handleSubmit} isLoading={isSubmitting}>Lưu</NeoButton>
            </div>
          </>
        )}
      </div>
    </NeoModal>
  );
};

/** Render 1 field theo config.type */
const FormField = ({ field, value, onChange }) => {
  if (field.type === 'checkbox') {
    return (
      <label className="flex items-center gap-2.5 text-xs font-black uppercase tracking-wide text-black cursor-pointer">
        <input
          type="checkbox"
          checked={!!value}
          onChange={(e) => onChange(field.name, e.target.checked)}
          className="w-4 h-4 border-2 border-black accent-black cursor-pointer"
        />
        {field.label}
      </label>
    );
  }

  if (field.type === 'select') {
    return (
      <div>
        <label className="block text-xs font-black uppercase tracking-wide text-black mb-1.5">{field.label}</label>
        <select
          value={value || ''}
          onChange={(e) => onChange(field.name, e.target.value)}
          className="w-full px-3 py-2.5 text-sm font-medium bg-white text-black border-[3px] border-black outline-none
            focus:shadow-[4px_4px_0px_0px_#111111] focus:-translate-x-[1px] focus:-translate-y-[1px] transition-all duration-100"
        >
          {field.options.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      </div>
    );
  }

  if (field.type === 'textarea') {
    return (
      <div>
        <label className="block text-xs font-black uppercase tracking-wide text-black mb-1.5">{field.label}</label>
        <textarea
          rows={3}
          value={value || ''}
          onChange={(e) => onChange(field.name, e.target.value)}
          placeholder={field.placeholder}
          className="w-full px-3 py-2.5 text-sm font-medium bg-white text-black border-[3px] border-black outline-none resize-none
            placeholder:text-gray-400 placeholder:font-normal
            focus:shadow-[4px_4px_0px_0px_#111111] focus:-translate-x-[1px] focus:-translate-y-[1px] transition-all duration-100"
        />
      </div>
    );
  }

  return (
    <NeoInput
      label={field.label + (field.required ? ' *' : '')}
      type={field.type}
      step={field.step}
      value={value || ''}
      onChange={(e) => onChange(field.name, e.target.value)}
      placeholder={field.placeholder}
    />
  );
};

export default BlockListEditorModal;

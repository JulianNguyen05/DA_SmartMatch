// src/components/candidate-profile/BlockListEditorModal.jsx
import React, { useState } from 'react';
import { Plus, Pencil, Trash2, ArrowLeft } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import candidateService from '../../features/candidate/candidateService';
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
 */
const BlockListEditorModal = ({ blockType, userId, items, isOpen, onClose, onSaved, onToast }) => {
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
    <Modal isOpen={isOpen} onClose={handleClose} title={config.label}>
      <div className="p-5 min-w-[420px] max-w-[560px]">
        {mode === 'list' ? (
          <>
            <div className="space-y-2 max-h-[420px] overflow-y-auto">
              {items.length === 0 && (
                <p className="text-sm text-gray-400 italic text-center py-8">Chưa có dữ liệu nào.</p>
              )}
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 p-3 rounded-xl border border-gray-100 hover:border-gray-200">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{item[config.titleField]}</p>
                    {config.subtitleField && item[config.subtitleField] && (
                      <p className="text-xs text-gray-400 truncate">{item[config.subtitleField]}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => openEditForm(item)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => handleDelete(item)} className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={openCreateForm}
              className="w-full mt-4 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-semibold
                hover:text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50/50 transition-all flex items-center justify-center gap-2"
            >
              <Plus size={16} /> Thêm mới
            </button>
          </>
        ) : (
          <>
            <button onClick={resetToList} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4">
              <ArrowLeft size={15} /> Quay lại danh sách
            </button>

            <div className="space-y-4">
              {config.fields.map((f) => (
                <FormField key={f.name} field={f} value={form[f.name]} onChange={handleFieldChange} />
              ))}
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={resetToList}>Hủy</Button>
              <Button onClick={handleSubmit} isLoading={isSubmitting}>Lưu</Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

/** Render 1 field theo config.type */
const FormField = ({ field, value, onChange }) => {
  if (field.type === 'checkbox') {
    return (
      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
        <input
          type="checkbox"
          checked={!!value}
          onChange={(e) => onChange(field.name, e.target.checked)}
          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        {field.label}
      </label>
    );
  }

  if (field.type === 'select') {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
        <select
          value={value || ''}
          onChange={(e) => onChange(field.name, e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none
            focus:border-blue-500 focus:ring-1 focus:ring-blue-100 bg-white"
        >
          {field.options.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      </div>
    );
  }

  if (field.type === 'textarea') {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
        <textarea
          rows={3}
          value={value || ''}
          onChange={(e) => onChange(field.name, e.target.value)}
          placeholder={field.placeholder}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none
            focus:border-blue-500 focus:ring-1 focus:ring-blue-100 resize-none"
        />
      </div>
    );
  }

  return (
    <Input
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

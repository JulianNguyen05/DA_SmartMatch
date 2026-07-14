// src/components/candidate-profile/LanguageEditorModal.jsx
import React, { useState } from 'react';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';
import Modal from '../../common/Modal';
import Button from '../../common/Button';
import candidateService from '../../../features/candidate/candidateService';
import ReferenceValueAutocomplete from '../shared/ReferenceValueAutocomplete';

const PROFICIENCY_OPTIONS = ['Cơ bản', 'Trung cấp', 'Thành thạo', 'Bản ngữ'];

const LanguageEditorModal = ({ userId, items, isOpen, onClose, onSaved, onToast }) => {
  const [mode, setMode] = useState('list');
  const [selected, setSelected] = useState(null);
  const [proficiency, setProficiency] = useState('Trung cấp');
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetToList = () => {
    setMode('list');
    setSelected(null);
    setProficiency('Trung cấp');
    setEditingId(null);
  };

  const handleClose = () => { resetToList(); onClose(); };

  const openEditForm = (item) => {
    setSelected({ id: item.languageId, name: item.languageName });
    setProficiency(item.proficiency || 'Trung cấp');
    setEditingId(item.id);
    setMode('form');
  };

  const handleSubmit = async () => {
    if (!selected?.id) {
      onToast?.({ type: 'warning', message: 'Vui lòng chọn 1 ngôn ngữ có sẵn trong danh mục (nếu chưa có, hãy gửi đề xuất).' });
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = { languageId: selected.id, proficiency };
      if (editingId) {
        await candidateService.updateLanguage(userId, editingId, payload);
      } else {
        await candidateService.createLanguage(userId, payload);
      }
      onToast?.({ type: 'success', message: 'Đã lưu ngôn ngữ!' });
      onSaved?.();
      resetToList();
    } catch (error) {
      onToast?.({ type: 'error', message: error.response?.data?.message || 'Có lỗi xảy ra.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Xóa ngôn ngữ "${item.languageName}"?`)) return;
    try {
      await candidateService.deleteLanguage(userId, item.id);
      onToast?.({ type: 'success', message: 'Đã xóa.' });
      onSaved?.();
    } catch (error) {
      onToast?.({ type: 'error', message: 'Xóa thất bại.' });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Ngôn ngữ">
      <div className="p-5 min-w-[420px] max-w-[560px]">
        {mode === 'list' ? (
          <>
            <div className="space-y-2 max-h-[420px] overflow-y-auto">
              {items.length === 0 && <p className="text-sm text-gray-400 italic text-center py-8">Chưa có ngôn ngữ nào.</p>}
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 p-3 rounded-xl border border-gray-100 hover:border-gray-200">
                  <div className="min-w-0 flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-800">{item.languageName}</span>
                    <span className="text-xs bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full">{item.proficiency}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => openEditForm(item)} className="text-xs text-indigo-600 hover:underline px-2">Sửa</button>
                    <button onClick={() => handleDelete(item)} className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => { resetToList(); setMode('form'); }}
              className="w-full mt-4 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-semibold
                hover:text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50/50 transition-all flex items-center justify-center gap-2"
            >
              <Plus size={16} /> Thêm ngôn ngữ
            </button>
          </>
        ) : (
          <>
            <button onClick={resetToList} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4">
              <ArrowLeft size={15} /> Quay lại danh sách
            </button>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ngôn ngữ *</label>
                <ReferenceValueAutocomplete
                  type="LANGUAGE"
                  userId={userId}
                  value={selected}
                  onSelect={setSelected}
                  onToast={onToast}
                  placeholder="VD: Tiếng Anh, Tiếng Nhật..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mức độ thành thạo</label>
                <div className="grid grid-cols-2 gap-2">
                  {PROFICIENCY_OPTIONS.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setProficiency(p)}
                      className={`py-2 px-3 rounded-lg text-sm font-medium border transition-all ${
                        proficiency === p ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
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

export default LanguageEditorModal;

// src/components/candidate-profile/LanguageEditorModal.jsx
import React, { useState } from 'react';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';
import NeoModal from '../../common/neo/NeoModal';
import NeoButton from '../../common/neo/NeoButton';
import candidateService from '../../../features/candidate/candidateService';
import ReferenceValueAutocomplete from '../shared/ReferenceValueAutocomplete';

const PROFICIENCY_OPTIONS = ['Cơ bản', 'Trung cấp', 'Thành thạo', 'Bản ngữ'];

const LanguageEditorModal = ({ userId, items, isOpen, onClose, onSaved, onToast, accentColor = '#34D399' }) => {
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
    <NeoModal isOpen={isOpen} onClose={handleClose} title="Ngôn ngữ" accentColor={accentColor}>
      <div className="p-5 min-w-[420px] max-w-[560px]">
        {mode === 'list' ? (
          <>
            <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-0.5">
              {items.length === 0 && (
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wide text-center py-8 border-[3px] border-dashed border-gray-300">
                  Chưa có ngôn ngữ nào.
                </p>
              )}
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 p-3 bg-white border-[3px] border-black"
                  style={{ boxShadow: '3px 3px 0px 0px #111111' }}
                >
                  <div className="min-w-0 flex items-center gap-2">
                    <span className="text-sm font-black text-black">{item.languageName}</span>
                    <span className="text-[10px] font-black uppercase tracking-wide bg-[#34D399] text-black border-2 border-black px-2 py-0.5">
                      {item.proficiency}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => openEditForm(item)}
                      className="px-2.5 py-1 text-[11px] font-black uppercase bg-white border-2 border-black text-black hover:bg-black hover:text-white transition-colors"
                    >
                      Sửa
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
              onClick={() => { resetToList(); setMode('form'); }}
              className="w-full mt-4 py-3 border-[3px] border-dashed border-black text-black font-black uppercase tracking-wide text-sm
                hover:bg-black hover:text-white transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={16} strokeWidth={3} /> Thêm ngôn ngữ
            </button>
          </>
        ) : (
          <>
            <button onClick={resetToList} className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wide text-black hover:opacity-60 mb-4">
              <ArrowLeft size={15} strokeWidth={3} /> Quay lại danh sách
            </button>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wide text-black mb-1.5">Ngôn ngữ *</label>
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
                <label className="block text-xs font-black uppercase tracking-wide text-black mb-2">Mức độ thành thạo</label>
                <div className="grid grid-cols-2 gap-2">
                  {PROFICIENCY_OPTIONS.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setProficiency(p)}
                      className={`py-2.5 px-3 text-sm font-black uppercase tracking-wide border-[3px] border-black transition-all duration-100 ${
                        proficiency === p
                          ? 'bg-black text-white'
                          : 'bg-white text-black hover:shadow-[3px_3px_0px_0px_#111111] hover:-translate-x-[1px] hover:-translate-y-[1px]'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
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

export default LanguageEditorModal;

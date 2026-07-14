// src/components/candidate-profile/SkillEditorModal.jsx
import React, { useState } from 'react';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';
import NeoModal from '../../common/neo/NeoModal';
import NeoButton from '../../common/neo/NeoButton';
import candidateService from '../../../features/candidate/candidateService';
import ReferenceValueAutocomplete from '../shared/ReferenceValueAutocomplete';

const LEVEL_OPTIONS = ['Cơ bản', 'Trung bình', 'Thành thạo', 'Chuyên gia'];

const SkillEditorModal = ({ userId, items, isOpen, onClose, onSaved, onToast, accentColor = '#60A5FA' }) => {
  const [mode, setMode] = useState('list');
  const [selected, setSelected] = useState(null);
  const [level, setLevel] = useState('Trung bình');
  const [description, setDescription] = useState('');
  const [editingSkillId, setEditingSkillId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetToList = () => {
    setMode('list');
    setSelected(null);
    setLevel('Trung bình');
    setDescription('');
    setEditingSkillId(null);
  };

  const handleClose = () => { resetToList(); onClose(); };

  const openEditForm = (item) => {
    setSelected({ id: item.id, name: item.skillName });
    setLevel(item.level || 'Trung bình');
    setDescription(item.description || '');
    setEditingSkillId(item.id);
    setMode('form');
  };

  const handleSubmit = async () => {
    if (!selected?.name) {
      onToast?.({ type: 'warning', message: 'Vui lòng chọn 1 kỹ năng từ danh sách gợi ý.' });
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = { skillName: selected.name, level, description };
      if (editingSkillId) {
        await candidateService.updateSkill(userId, editingSkillId, payload);
      } else {
        await candidateService.createSkill(userId, payload);
      }
      onToast?.({ type: 'success', message: 'Đã lưu kỹ năng!' });
      onSaved?.();
      resetToList();
    } catch (error) {
      onToast?.({ type: error.response?.status === 409 ? 'info' : 'error', message: error.response?.data?.message || 'Có lỗi xảy ra.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Gỡ kỹ năng "${item.skillName}"?`)) return;
    try {
      await candidateService.removeSkill(userId, item.id);
      onToast?.({ type: 'success', message: 'Đã gỡ kỹ năng.' });
      onSaved?.();
    } catch (error) {
      onToast?.({ type: 'error', message: 'Xóa thất bại.' });
    }
  };

  return (
    <NeoModal isOpen={isOpen} onClose={handleClose} title="Kỹ năng" accentColor={accentColor}>
      <div className="p-5 min-w-[420px] max-w-[560px]">
        {mode === 'list' ? (
          <>
            <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-0.5">
              {items.length === 0 && (
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wide text-center py-8 border-[3px] border-dashed border-gray-300">
                  Chưa có kỹ năng nào.
                </p>
              )}
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 p-3 bg-white border-[3px] border-black"
                  style={{ boxShadow: '3px 3px 0px 0px #111111' }}
                >
                  <div className="min-w-0 flex items-center gap-2">
                    <span className="text-sm font-black text-black">{item.skillName}</span>
                    <span className="text-[10px] font-black uppercase tracking-wide bg-[#60A5FA] text-black border-2 border-black px-2 py-0.5">
                      {item.level}
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
              <Plus size={16} strokeWidth={3} /> Thêm kỹ năng
            </button>
          </>
        ) : (
          <>
            <button onClick={resetToList} className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wide text-black hover:opacity-60 mb-4">
              <ArrowLeft size={15} strokeWidth={3} /> Quay lại danh sách
            </button>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wide text-black mb-1.5">Tên kỹ năng *</label>
                <ReferenceValueAutocomplete
                  type="SKILL"
                  userId={userId}
                  value={selected}
                  onSelect={setSelected}
                  onToast={onToast}
                  placeholder="VD: ReactJS, Python, Quản lý dự án..."
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wide text-black mb-2">Trình độ</label>
                <div className="grid grid-cols-2 gap-2">
                  {LEVEL_OPTIONS.map((lv) => (
                    <button
                      key={lv}
                      type="button"
                      onClick={() => setLevel(lv)}
                      className={`py-2.5 px-3 text-sm font-black uppercase tracking-wide border-[3px] border-black transition-all duration-100 ${
                        level === lv
                          ? 'bg-black text-white'
                          : 'bg-white text-black hover:shadow-[3px_3px_0px_0px_#111111] hover:-translate-x-[1px] hover:-translate-y-[1px]'
                      }`}
                    >
                      {lv}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wide text-black mb-1.5">Mô tả (tùy chọn)</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm font-medium bg-white text-black border-[3px] border-black outline-none resize-none
                    placeholder:text-gray-400 placeholder:font-normal
                    focus:shadow-[4px_4px_0px_0px_#111111] focus:-translate-x-[1px] focus:-translate-y-[1px] transition-all duration-100"
                />
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

export default SkillEditorModal;

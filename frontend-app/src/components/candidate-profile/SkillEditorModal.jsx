// src/components/candidate-profile/SkillEditorModal.jsx
import React, { useState } from 'react';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import candidateService from '../../features/candidate/candidateService';
import ReferenceValueAutocomplete from './ReferenceValueAutocomplete';

const LEVEL_OPTIONS = ['Cơ bản', 'Trung bình', 'Thành thạo', 'Chuyên gia'];

const SkillEditorModal = ({ userId, items, isOpen, onClose, onSaved, onToast }) => {
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
    <Modal isOpen={isOpen} onClose={handleClose} title="Kỹ năng">
      <div className="p-5 min-w-[420px] max-w-[560px]">
        {mode === 'list' ? (
          <>
            <div className="space-y-2 max-h-[420px] overflow-y-auto">
              {items.length === 0 && <p className="text-sm text-gray-400 italic text-center py-8">Chưa có kỹ năng nào.</p>}
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 p-3 rounded-xl border border-gray-100 hover:border-gray-200">
                  <div className="min-w-0 flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-800">{item.skillName}</span>
                    <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{item.level}</span>
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
              <Plus size={16} /> Thêm kỹ năng
            </button>
          </>
        ) : (
          <>
            <button onClick={resetToList} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4">
              <ArrowLeft size={15} /> Quay lại danh sách
            </button>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên kỹ năng *</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Trình độ</label>
                <div className="grid grid-cols-2 gap-2">
                  {LEVEL_OPTIONS.map((lv) => (
                    <button
                      key={lv}
                      type="button"
                      onClick={() => setLevel(lv)}
                      className={`py-2 px-3 rounded-lg text-sm font-medium border transition-all ${
                        level === lv ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      {lv}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả (tùy chọn)</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none
                    focus:border-blue-500 focus:ring-1 focus:ring-blue-100 resize-none"
                />
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

export default SkillEditorModal;

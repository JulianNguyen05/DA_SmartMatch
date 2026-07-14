// src/components/candidate-profile/AvatarModal.jsx
import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import Modal from '../../common/Modal';
import Button from '../../common/Button';
import candidateService from '../../../features/candidate/candidateService';
import { getFileUrl } from '../../../utils/fileUrl';

const AvatarModal = ({ userId, currentAvatarUrl, isOpen, onClose, onSaved, onToast }) => {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
  };

  const handleClose = () => {
    setFile(null);
    setPreviewUrl(null);
    onClose();
  };

  const handleSubmit = async () => {
    if (!file) {
      onToast?.({ type: 'warning', message: 'Vui lòng chọn 1 ảnh trước.' });
      return;
    }
    setIsSubmitting(true);
    try {
      await candidateService.uploadAvatar(userId, file);
      onToast?.({ type: 'success', message: 'Cập nhật ảnh đại diện thành công!' });
      onSaved?.();
      handleClose();
    } catch (error) {
      onToast?.({ type: 'error', message: error.response?.data?.message || 'Tải ảnh thất bại.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // previewUrl là blob: URL cục bộ (từ URL.createObjectURL khi vừa chọn ảnh
  // mới) — giữ nguyên, không qua getFileUrl(). currentAvatarUrl là đường dẫn
  // tương đối do backend trả về, cần ghép thành URL đầy đủ trỏ về backend.
  const displayUrl = previewUrl || getFileUrl(currentAvatarUrl);

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Ảnh đại diện">
      <div className="p-6 min-w-[360px] flex flex-col items-center gap-4">
        {displayUrl ? (
          <img src={displayUrl} alt="avatar preview" className="w-32 h-32 rounded-full object-cover border border-gray-200" />
        ) : (
          <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center text-gray-300">
            <Upload size={28} />
          </div>
        )}

        <label className="cursor-pointer text-sm font-semibold text-indigo-600 hover:text-indigo-800">
          Chọn ảnh khác
          <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        </label>

        <div className="flex justify-end gap-2 w-full pt-2">
          <Button variant="outline" onClick={handleClose} className="flex-1">Hủy</Button>
          <Button onClick={handleSubmit} isLoading={isSubmitting} className="flex-1">Lưu</Button>
        </div>
      </div>
    </Modal>
  );
};

export default AvatarModal;

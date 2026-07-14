// src/components/candidate-profile/modals/AvatarModal.jsx
import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import NeoModal from '../../common/neo/NeoModal';
import NeoButton from '../../common/neo/NeoButton';
import candidateService from '../../../features/candidate/candidateService';
import { getFileUrl } from '../../../utils/fileUrl';
import { BLOCK_COLOR } from '../shared/blockConfig';

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

  // previewUrl là blob: URL cục bộ (vừa chọn ảnh mới) — giữ nguyên, KHÔNG qua
  // getFileUrl(). currentAvatarUrl là đường dẫn tương đối do backend trả về,
  // cần ghép thành URL đầy đủ trỏ về backend.
  const displayUrl = previewUrl || getFileUrl(currentAvatarUrl);

  return (
    <NeoModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Ảnh đại diện"
      accentColor={BLOCK_COLOR.AVATAR}
    >
      <div className="p-6 min-w-[320px] sm:min-w-[360px] flex flex-col items-center gap-4">
        {displayUrl ? (
          <img
            src={displayUrl}
            alt="avatar preview"
            className="w-40 h-40 object-cover border-[3px] border-black"
            style={{ boxShadow: '4px 4px 0px 0px #111111' }}
          />
        ) : (
          <div
            className="w-40 h-40 bg-white border-[3px] border-black flex items-center justify-center text-black"
            style={{ boxShadow: '4px 4px 0px 0px #111111' }}
          >
            <Upload size={28} strokeWidth={2.5} />
          </div>
        )}

        <label className="cursor-pointer text-xs font-black uppercase tracking-wide text-black border-b-[3px] border-black pb-0.5 hover:opacity-70 transition-opacity">
          Chọn ảnh khác
          <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        </label>

        <div className="flex justify-end gap-2.5 w-full pt-2">
          <NeoButton variant="outline" onClick={handleClose} className="flex-1">Hủy</NeoButton>
          <NeoButton onClick={handleSubmit} isLoading={isSubmitting} className="flex-1">Lưu</NeoButton>
        </div>
      </div>
    </NeoModal>
  );
};

export default AvatarModal;

// src/components/candidate-profile/shared/InlineAvatarCard.jsx
import React, { useState, useRef } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import candidateService from '../../../features/candidate/candidateService';
import { getFileUrl } from '../../../utils/fileUrl';

const InlineAvatarCard = ({ userId, avatarUrl, onSaved, onToast, readOnly = false }) => {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const displaySrc = previewUrl || getFileUrl(avatarUrl);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreviewUrl(URL.createObjectURL(file));
    setIsUploading(true);
    try {
      await candidateService.uploadAvatar(userId, file);
      onSaved?.();
    } catch (error) {
      setPreviewUrl(null);
      onToast?.({ type: 'error', message: error.response?.data?.message || 'Tải ảnh thất bại.' });
    } finally {
      setIsUploading(false);
    }
  };

  if (readOnly) {
    return displaySrc
      ? <div className="w-full h-full min-h-[80px]"><img src={displaySrc} alt="avatar" className="w-full h-full object-cover rounded-lg" /></div>
      : <p className="text-[17px] text-graphite/55 italic font-body">Chưa có ảnh đại diện</p>;
  }

  return (
    <div
      className="relative w-full h-full min-h-[100px] rounded-lg overflow-hidden cursor-pointer group/avatar bg-ink-light"
      onClick={() => fileInputRef.current?.click()}
    >
      {displaySrc ? (
        <img src={displaySrc} alt="avatar" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-graphite/45">
          <Upload size={22} />
        </div>
      )}

      <div className="absolute inset-0 bg-graphite/0 group-hover/avatar:bg-graphite/50 transition-colors flex items-center justify-center">
        {isUploading ? (
          <Loader2 size={18} className="text-white animate-spin" />
        ) : (
          <span className="text-white text-[15px] font-medium opacity-0 group-hover/avatar:opacity-100 transition-opacity font-body">
            Đổi ảnh
          </span>
        )}
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
    </div>
  );
};

export default InlineAvatarCard;

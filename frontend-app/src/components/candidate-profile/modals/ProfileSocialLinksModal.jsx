// src/components/candidate-profile/ProfileSocialLinksModal.jsx
import React, { useState, useEffect } from 'react';
import NeoModal from '../../common/neo/NeoModal';
import NeoButton from '../../common/neo/NeoButton';
import NeoInput from '../../common/neo/NeoInput';
import candidateService from '../../../features/candidate/candidateService';

// PERSONAL_INFO và SOCIAL_LINKS cùng lưu qua 1 API POST /profile (CandidateProfileRequest),
// nhưng tách UI thành 2 modal riêng để khớp đúng với 2 card trên ProfilePage.
// Form vẫn giữ TOÀN BỘ field của profile trong state (kể cả fullName/phone/...) để khi
// submit không vô tình ghi đè mất thông tin cá nhân đã lưu trước đó — modal này chỉ
// không hiển thị input cho các field đó.
const EMPTY_FORM = {
  fullName: '', headline: '', phone: '', emailContact: '', gender: 'Nam', dob: '', address: '',
  websiteUrl: '', linkedinUrl: '', githubUrl: '', summary: '',
};

const ProfileSocialLinksModal = ({ userId, profile, isOpen, onClose, onSaved, onToast, accentColor = '#B794F4' }) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) setForm({ ...EMPTY_FORM, ...profile });
  }, [isOpen, profile]);

  const handleChange = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    // fullName vẫn là field bắt buộc ở backend (CandidateProfileRequest) dù modal này
    // không hiển thị nó — nếu profile gốc chưa có tên, chặn lại và nhắc người dùng
    // cập nhật thông tin cá nhân trước để tránh lỗi 400 khó hiểu.
    if (!form.fullName?.trim()) {
      onToast?.({ type: 'warning', message: 'Vui lòng cập nhật Thông tin cá nhân (họ và tên) trước khi thêm liên kết.' });
      return;
    }
    setIsSubmitting(true);
    try {
      await candidateService.createOrUpdateProfile(userId, { ...form, dob: form.dob || null });
      onToast?.({ type: 'success', message: 'Cập nhật liên kết mạng xã hội thành công!' });
      onSaved?.();
      onClose();
    } catch (error) {
      onToast?.({ type: 'error', message: error.response?.data?.message || 'Cập nhật thất bại.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <NeoModal isOpen={isOpen} onClose={onClose} title="Liên kết mạng xã hội" accentColor={accentColor}>
      <div className="p-5 min-w-[420px] max-w-[560px] space-y-4">
        <NeoInput label="Website / Portfolio" value={form.websiteUrl} onChange={(e) => handleChange('websiteUrl', e.target.value)} placeholder="https://..." />
        <NeoInput label="LinkedIn" value={form.linkedinUrl} onChange={(e) => handleChange('linkedinUrl', e.target.value)} placeholder="https://linkedin.com/in/..." />
        <NeoInput label="GitHub" value={form.githubUrl} onChange={(e) => handleChange('githubUrl', e.target.value)} placeholder="https://github.com/..." />

        <div className="flex justify-end gap-2 pt-2">
          <NeoButton variant="outline" onClick={onClose}>Hủy</NeoButton>
          <NeoButton onClick={handleSubmit} isLoading={isSubmitting}>Lưu</NeoButton>
        </div>
      </div>
    </NeoModal>
  );
};

export default ProfileSocialLinksModal;

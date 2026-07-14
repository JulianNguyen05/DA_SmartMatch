// src/components/candidate-profile/ProfileInfoModal.jsx
import React, { useState, useEffect } from 'react';
import NeoModal from '../../common/neo/NeoModal';
import NeoButton from '../../common/neo/NeoButton';
import NeoInput from '../../common/neo/NeoInput';
import candidateService from '../../../features/candidate/candidateService';

// PERSONAL_INFO và SOCIAL_LINKS cùng lưu qua 1 API POST /profile (CandidateProfileRequest),
// nên gộp chung 1 modal — mở từ block nào cũng ra form này.
const EMPTY_FORM = {
  fullName: '', headline: '', phone: '', emailContact: '', gender: 'Nam', dob: '', address: '',
  websiteUrl: '', linkedinUrl: '', githubUrl: '', summary: '',
};

const ProfileInfoModal = ({ userId, profile, isOpen, onClose, onSaved, onToast, accentColor = '#2DD4BF' }) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) setForm({ ...EMPTY_FORM, ...profile });
  }, [isOpen, profile]);

  const handleChange = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    if (!form.fullName?.trim()) {
      onToast?.({ type: 'warning', message: 'Họ và tên là thông tin bắt buộc.' });
      return;
    }
    setIsSubmitting(true);
    try {
      await candidateService.createOrUpdateProfile(userId, { ...form, dob: form.dob || null });
      onToast?.({ type: 'success', message: 'Cập nhật hồ sơ thành công!' });
      onSaved?.();
      onClose();
    } catch (error) {
      onToast?.({ type: 'error', message: error.response?.data?.message || 'Cập nhật thất bại.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <NeoModal isOpen={isOpen} onClose={onClose} title="Thông tin cá nhân" accentColor={accentColor}>
      <div className="p-5 min-w-[420px] max-w-[560px] space-y-4 max-h-[70vh] overflow-y-auto">
        <NeoInput label="Họ và tên *" value={form.fullName} onChange={(e) => handleChange('fullName', e.target.value)} placeholder="Nguyễn Văn A" />
        <NeoInput label="Chức danh / vị trí mong muốn" value={form.headline} onChange={(e) => handleChange('headline', e.target.value)} placeholder="VD: Backend Developer" />

        <div className="grid grid-cols-2 gap-3">
          <NeoInput label="Số điện thoại" value={form.phone} onChange={(e) => handleChange('phone', e.target.value)} />
          <NeoInput label="Email liên hệ" type="email" value={form.emailContact} onChange={(e) => handleChange('emailContact', e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-black uppercase tracking-wide text-black mb-1.5">Giới tính</label>
            <select
              value={form.gender}
              onChange={(e) => handleChange('gender', e.target.value)}
              className="w-full px-3 py-2.5 text-sm font-medium bg-white text-black border-[3px] border-black outline-none
                focus:shadow-[4px_4px_0px_0px_#111111] focus:-translate-x-[1px] focus:-translate-y-[1px] transition-all duration-100"
            >
              <option>Nam</option><option>Nữ</option><option>Khác</option>
            </select>
          </div>
          <NeoInput label="Ngày sinh" type="date" value={form.dob} onChange={(e) => handleChange('dob', e.target.value)} />
        </div>

        <NeoInput label="Địa chỉ" value={form.address} onChange={(e) => handleChange('address', e.target.value)} />

        <div>
          <label className="block text-xs font-black uppercase tracking-wide text-black mb-1.5">Giới thiệu bản thân</label>
          <textarea
            rows={4}
            value={form.summary}
            onChange={(e) => handleChange('summary', e.target.value)}
            className="w-full px-3 py-2.5 text-sm font-medium bg-white text-black border-[3px] border-black outline-none resize-none
              placeholder:text-gray-400 placeholder:font-normal
              focus:shadow-[4px_4px_0px_0px_#111111] focus:-translate-x-[1px] focus:-translate-y-[1px] transition-all duration-100"
          />
        </div>

        <p className="text-xs font-black text-gray-400 uppercase tracking-widest pt-3 border-t-[3px] border-black">Liên kết mạng xã hội</p>
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

export default ProfileInfoModal;

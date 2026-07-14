// src/components/candidate-profile/ProfileInfoModal.jsx
import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import candidateService from '../../features/candidate/candidateService';

// PERSONAL_INFO và SOCIAL_LINKS cùng lưu qua 1 API POST /profile (CandidateProfileRequest),
// nên gộp chung 1 modal — mở từ block nào cũng ra form này.
const EMPTY_FORM = {
  fullName: '', headline: '', phone: '', emailContact: '', gender: 'Nam', dob: '', address: '',
  websiteUrl: '', linkedinUrl: '', githubUrl: '', summary: '',
};

const ProfileInfoModal = ({ userId, profile, isOpen, onClose, onSaved, onToast }) => {
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
    <Modal isOpen={isOpen} onClose={onClose} title="Thông tin cá nhân">
      <div className="p-5 min-w-[420px] max-w-[560px] space-y-4 max-h-[70vh] overflow-y-auto">
        <Input label="Họ và tên *" value={form.fullName} onChange={(e) => handleChange('fullName', e.target.value)} placeholder="Nguyễn Văn A" />
        <Input label="Chức danh / vị trí mong muốn" value={form.headline} onChange={(e) => handleChange('headline', e.target.value)} placeholder="VD: Backend Developer" />

        <div className="grid grid-cols-2 gap-3">
          <Input label="Số điện thoại" value={form.phone} onChange={(e) => handleChange('phone', e.target.value)} />
          <Input label="Email liên hệ" type="email" value={form.emailContact} onChange={(e) => handleChange('emailContact', e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Giới tính</label>
            <select
              value={form.gender}
              onChange={(e) => handleChange('gender', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100 bg-white"
            >
              <option>Nam</option><option>Nữ</option><option>Khác</option>
            </select>
          </div>
          <Input label="Ngày sinh" type="date" value={form.dob} onChange={(e) => handleChange('dob', e.target.value)} />
        </div>

        <Input label="Địa chỉ" value={form.address} onChange={(e) => handleChange('address', e.target.value)} />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Giới thiệu bản thân</label>
          <textarea
            rows={4}
            value={form.summary}
            onChange={(e) => handleChange('summary', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100 resize-none"
          />
        </div>

        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest pt-2 border-t border-gray-100">Liên kết mạng xã hội</p>
        <Input label="Website / Portfolio" value={form.websiteUrl} onChange={(e) => handleChange('websiteUrl', e.target.value)} placeholder="https://..." />
        <Input label="LinkedIn" value={form.linkedinUrl} onChange={(e) => handleChange('linkedinUrl', e.target.value)} placeholder="https://linkedin.com/in/..." />
        <Input label="GitHub" value={form.githubUrl} onChange={(e) => handleChange('githubUrl', e.target.value)} placeholder="https://github.com/..." />

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose}>Hủy</Button>
          <Button onClick={handleSubmit} isLoading={isSubmitting}>Lưu</Button>
        </div>
      </div>
    </Modal>
  );
};

export default ProfileInfoModal;

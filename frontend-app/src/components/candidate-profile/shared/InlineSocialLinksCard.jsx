// src/components/candidate-profile/shared/InlineSocialLinksCard.jsx
import React, { useState, useEffect } from 'react';
import { Globe, Link2, Code2 } from 'lucide-react';
import candidateService from '../../../features/candidate/candidateService';

const InlineSocialLinksCard = ({ userId, profile, onSaved, onToast, readOnly = false }) => {
  const [form, setForm] = useState(() => ({ ...profile }));

  useEffect(() => setForm({ ...profile }), [profile]);

  const handleChange = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleBlur = async () => {
    if (!form.fullName?.trim()) {
      onToast?.({ type: 'warning', message: 'Vui lòng cập nhật Thông tin cá nhân (họ và tên) trước khi thêm liên kết.' });
      return;
    }
    try {
      await candidateService.createOrUpdateProfile(userId, { ...form, dob: form.dob || null });
      onSaved?.();
    } catch (error) {
      onToast?.({ type: 'error', message: error.response?.data?.message || 'Không lưu được, thử lại.' });
    }
  };

  const fields = [
    { name: 'websiteUrl', icon: Globe, placeholder: 'Website / Portfolio' },
    { name: 'linkedinUrl', icon: Link2, placeholder: 'LinkedIn' },
    { name: 'githubUrl', icon: Code2, placeholder: 'GitHub' },
  ];

  if (readOnly) {
    const chips = fields.filter((f) => profile?.[f.name]);
    if (chips.length === 0) return <p className="text-sm text-graphite/30 italic font-body">Chưa thêm liên kết nào</p>;
    return (
      <div className="flex flex-wrap gap-1.5 font-body">
        {chips.map((f) => (
          <span key={f.name} className="inline-flex items-center gap-1.5 text-[11px] font-medium text-graphite bg-ink-light rounded-md px-2 py-1">
            <f.icon size={12} className="text-graphite/50" />
            <span className="truncate max-w-[160px]">{profile[f.name]}</span>
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2 font-body">
      {fields.map((f) => (
        <div key={f.name} className="flex items-center gap-2">
          <f.icon size={13} className="text-graphite/30 shrink-0" />
          <input
            value={form[f.name] || ''}
            onChange={(e) => handleChange(f.name, e.target.value)}
            onBlur={handleBlur}
            placeholder={f.placeholder}
            className="w-full min-w-0 bg-transparent border-none outline-none text-xs text-graphite/70
              placeholder:text-graphite/25 focus:bg-ink-light rounded px-1 -mx-1"
          />
        </div>
      ))}
    </div>
  );
};

export default InlineSocialLinksCard;

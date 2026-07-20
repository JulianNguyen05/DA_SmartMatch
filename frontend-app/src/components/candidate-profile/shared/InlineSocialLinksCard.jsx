// src/components/candidate-profile/shared/InlineSocialLinksCard.jsx
import React, { useState, useEffect } from 'react';
import { Globe, Link2, Code2 } from 'lucide-react';
import candidateService from '../../../features/candidate/candidateService';

/** Thêm https:// nếu người dùng nhập thiếu protocol, để href mở đúng thay vì bị hiểu là link nội bộ (VD "trongnguyen.dev" -> "/social/trongnguyen.dev") */
const ensureProtocol = (url) => {
  if (!url) return url;
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
};

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
    { name: 'websiteUrl', icon: Globe, label: 'Website', placeholder: 'Website / Portfolio' },
    { name: 'linkedinUrl', icon: Link2, label: 'LinkedIn', placeholder: 'LinkedIn' },
    { name: 'githubUrl', icon: Code2, label: 'GitHub', placeholder: 'GitHub' },
  ];

  if (readOnly) {
    const chips = fields.filter((f) => profile?.[f.name]);
    if (chips.length === 0) return <p className="text-[17px] text-graphite/55 italic font-body">Chưa thêm liên kết nào</p>;
    return (
      <div className="flex flex-wrap gap-1.5 font-body">
        {chips.map((f) => (
          <a
            key={f.name}
            href={ensureProtocol(profile[f.name])}
            target="_blank"
            rel="noopener noreferrer"
            title={profile[f.name]}
            className="inline-flex items-center gap-1.5 text-[14px] font-medium text-graphite bg-ink-light rounded-md px-2.5 py-1.5
              hover:bg-ink hover:text-white transition-colors"
          >
            <f.icon size={14} className="shrink-0" />
            {f.label}
          </a>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2 font-body">
      {fields.map((f) => (
        <div key={f.name} className="flex items-center gap-2">
          <f.icon size={13} className="text-graphite/55 shrink-0" />
          <input
            value={form[f.name] || ''}
            onChange={(e) => handleChange(f.name, e.target.value)}
            onBlur={handleBlur}
            placeholder={f.placeholder}
            className="w-full min-w-0 bg-transparent border-none outline-none text-[15px] text-graphite/90
              placeholder:text-graphite/25 focus:bg-ink-light rounded px-1 -mx-1"
          />
        </div>
      ))}
    </div>
  );
};

export default InlineSocialLinksCard;

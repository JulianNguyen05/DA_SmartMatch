// src/components/candidate-profile/shared/InlinePersonalInfoCard.jsx
import React, { useState, useEffect } from 'react';
import { Phone, Mail, Calendar, MapPin } from 'lucide-react';
import candidateService from '../../../features/candidate/candidateService';

const InlinePersonalInfoCard = ({ userId, profile, onSaved, onToast, readOnly = false }) => {
  const [form, setForm] = useState(() => ({ ...profile }));

  // Đồng bộ lại sau mỗi lần cha refetch (kể cả khi SOCIAL_LINKS lưu — vẫn cùng 1 object profile)
  useEffect(() => setForm({ ...profile }), [profile]);

  const handleChange = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleBlur = async () => {
    if (!form.fullName?.trim()) {
      onToast?.({ type: 'warning', message: 'Họ và tên là thông tin bắt buộc.' });
      return;
    }
    try {
      await candidateService.createOrUpdateProfile(userId, { ...form, dob: form.dob || null });
      onSaved?.();
    } catch (error) {
      onToast?.({ type: 'error', message: error.response?.data?.message || 'Không lưu được, thử lại.' });
    }
  };

  if (readOnly) {
    if (!profile?.fullName) return <p className="text-sm text-graphite/30 italic font-body">Chưa cập nhật thông tin cá nhân</p>;
    const chips = [
      profile.phone && { icon: Phone, text: profile.phone },
      profile.emailContact && { icon: Mail, text: profile.emailContact },
      (profile.gender || profile.dob) && { icon: Calendar, text: [profile.gender, profile.dob].filter(Boolean).join(' · ') },
      profile.address && { icon: MapPin, text: profile.address },
    ].filter(Boolean);
    return (
      <div className="space-y-2.5 font-body">
        <div>
          <p className="text-sm font-semibold text-graphite font-display">{profile.fullName}</p>
          {profile.headline && <p className="text-xs text-graphite/50">{profile.headline}</p>}
        </div>
        {chips.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {chips.map((c, i) => (
              <span key={i} className="inline-flex items-center gap-1 text-[11px] text-graphite/60 bg-ink-light rounded px-1.5 py-0.5">
                <c.icon size={11} /> {c.text}
              </span>
            ))}
          </div>
        )}
        {profile.summary && <p className="text-xs text-graphite/50 line-clamp-3">{profile.summary}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-2.5 font-body">
      <input
        value={form.fullName || ''}
        onChange={(e) => handleChange('fullName', e.target.value)}
        onBlur={handleBlur}
        placeholder="Họ và tên"
        className="w-full bg-transparent border-none outline-none text-sm font-semibold text-graphite
          font-display placeholder:text-graphite/30 placeholder:font-normal focus:bg-ink-light rounded px-1 -mx-1"
      />
      <input
        value={form.headline || ''}
        onChange={(e) => handleChange('headline', e.target.value)}
        onBlur={handleBlur}
        placeholder="Chức danh / vị trí mong muốn"
        className="w-full bg-transparent border-none outline-none text-xs text-graphite/60
          placeholder:text-graphite/25 focus:bg-ink-light rounded px-1 -mx-1"
      />

      <div className="grid grid-cols-2 gap-1.5 pt-1">
        <IconField icon={Phone} value={form.phone} onChange={(v) => handleChange('phone', v)} onBlur={handleBlur} placeholder="Số điện thoại" />
        <IconField icon={Mail} value={form.emailContact} onChange={(v) => handleChange('emailContact', v)} onBlur={handleBlur} placeholder="Email" type="email" />
        <div className="flex items-center gap-1.5">
          <Calendar size={12} className="text-graphite/30 shrink-0" />
          <select
            value={form.gender || 'Nam'}
            onChange={(e) => { handleChange('gender', e.target.value); }}
            onBlur={handleBlur}
            className="bg-transparent border-none outline-none text-xs text-graphite/60 focus:bg-ink-light rounded px-0.5"
          >
            <option>Nam</option><option>Nữ</option><option>Khác</option>
          </select>
          <input
            type="date"
            value={form.dob || ''}
            onChange={(e) => handleChange('dob', e.target.value)}
            onBlur={handleBlur}
            className="bg-transparent border-none outline-none text-xs text-graphite/60 focus:bg-ink-light rounded px-0.5 min-w-0"
          />
        </div>
        <IconField icon={MapPin} value={form.address} onChange={(v) => handleChange('address', v)} onBlur={handleBlur} placeholder="Địa chỉ" />
      </div>

      <textarea
        value={form.summary || ''}
        onChange={(e) => handleChange('summary', e.target.value)}
        onBlur={handleBlur}
        placeholder="Giới thiệu bản thân..."
        rows={2}
        className="w-full mt-1 bg-transparent border-none outline-none resize-none text-xs text-graphite/60
          leading-relaxed placeholder:text-graphite/25 focus:bg-ink-light rounded px-1 -mx-1"
      />
    </div>
  );
};

const IconField = ({ icon: Icon, value, onChange, onBlur, placeholder, type = 'text' }) => (
  <div className="flex items-center gap-1.5 min-w-0">
    <Icon size={12} className="text-graphite/30 shrink-0" />
    <input
      type={type}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      placeholder={placeholder}
      className="w-full min-w-0 bg-transparent border-none outline-none text-xs text-graphite/60
        placeholder:text-graphite/25 focus:bg-ink-light rounded px-0.5"
    />
  </div>
);

export default InlinePersonalInfoCard;

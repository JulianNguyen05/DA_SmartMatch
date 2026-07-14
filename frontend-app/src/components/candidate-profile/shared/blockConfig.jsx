// src/components/candidate-profile/shared/blockConfig.jsx
// ════════════════════════════════════════════════════════════════════════════
// Cấu hình trung tâm cho 12 loại block ProfilePage — PHẢI khớp đúng enum
// BlockType bên backend (domain.candidate.model.BlockType).
// ════════════════════════════════════════════════════════════════════════════

import React from 'react';
import { Phone, Mail, Calendar, MapPin, Globe, Link2, Code2 } from 'lucide-react';
import { getFileUrl } from '../../../utils/fileUrl';

// dataKey: field tương ứng trong response của candidateService.getFullProfile()
// repeatable: true nếu block chứa danh sách nhiều item (khớp BlockType.isRepeatable() backend)
export const BLOCK_META = {
  PERSONAL_INFO: { label: 'Thông tin cá nhân', repeatable: false, dataKey: null },
  AVATAR: { label: 'Ảnh đại diện', repeatable: false, dataKey: null },
  SOCIAL_LINKS: { label: 'Liên kết mạng xã hội', repeatable: false, dataKey: null },
  EXPERIENCE: { label: 'Kinh nghiệm làm việc', repeatable: true, dataKey: 'experiences' },
  EDUCATION: { label: 'Học vấn', repeatable: true, dataKey: 'educations' },
  SKILL: { label: 'Kỹ năng', repeatable: true, dataKey: 'skills' },
  PROJECT: { label: 'Dự án', repeatable: true, dataKey: 'projects' },
  CERTIFICATION: { label: 'Chứng chỉ', repeatable: true, dataKey: 'certifications' },
  AWARD: { label: 'Giải thưởng', repeatable: true, dataKey: 'awards' },
  ACTIVITY: { label: 'Hoạt động', repeatable: true, dataKey: 'activities' },
  LANGUAGE: { label: 'Ngôn ngữ', repeatable: true, dataKey: 'languages' },
  HOBBY: { label: 'Sở thích', repeatable: true, dataKey: 'hobbies' },
};

// ─── Màu nền header cho từng block trong sandbox neobrutalism ──────────────
export const BLOCK_COLOR = {
  PERSONAL_INFO: '#5B8DEF',
  AVATAR: '#2DD4BF',
  SOCIAL_LINKS: '#B794F4',
  EXPERIENCE: '#FB923C',
  EDUCATION: '#FDE047',
  SKILL: '#4ADE80',
  PROJECT: '#F472B6',
  CERTIFICATION: '#22D3EE',
  AWARD: '#F87171',
  ACTIVITY: '#818CF8',
  LANGUAGE: '#38BDF8',
  HOBBY: '#BEF264',
};

// ─── Kích thước mặc định trên lưới 12 cột khi chưa có layout đã lưu ────────
// PERSONAL_INFO cao hơn 1 chút (5 → 6 hàng) để đủ chỗ cho các chip + phần giới thiệu.
export const DEFAULT_GRID_SIZE = {
  PERSONAL_INFO: { w: 6, h: 6 },
  AVATAR: { w: 3, h: 5 },
  SOCIAL_LINKS: { w: 3, h: 5 },
  EXPERIENCE: { w: 6, h: 7 },
  EDUCATION: { w: 6, h: 6 },
  SKILL: { w: 4, h: 6 },
  PROJECT: { w: 4, h: 6 },
  CERTIFICATION: { w: 4, h: 6 },
  AWARD: { w: 4, h: 6 },
  ACTIVITY: { w: 4, h: 6 },
  LANGUAGE: { w: 4, h: 6 },
  HOBBY: { w: 4, h: 6 },
};

/** Lấy danh sách item của 1 block danh sách từ profileData (response getFullProfile) */
export const getBlockItems = (blockType, profileData) => {
  const meta = BLOCK_META[blockType];
  if (!meta || !meta.repeatable || !meta.dataKey) return [];
  return profileData?.[meta.dataKey] || [];
};

const MAX_PREVIEW_ITEMS = 3;

/** Chuỗi mô tả ngắn 1 dòng cho từng loại item — dùng để render preview trên card */
const describeItem = (blockType, item) => {
  switch (blockType) {
    case 'EXPERIENCE':
      return [item.position, item.companyName].filter(Boolean).join(' tại ');
    case 'EDUCATION':
      return [item.schoolName, item.major].filter(Boolean).join(' — ');
    case 'SKILL':
      return item.level ? `${item.skillName} (${item.level})` : item.skillName;
    case 'PROJECT':
      return [item.projectName, item.role].filter(Boolean).join(' — ');
    case 'CERTIFICATION':
      return [item.name, item.issuingOrg].filter(Boolean).join(' — ');
    case 'AWARD':
      return [item.title, item.issuer].filter(Boolean).join(' — ');
    case 'ACTIVITY':
      return [item.organization, item.role].filter(Boolean).join(' — ');
    case 'LANGUAGE':
      return item.proficiency ? `${item.languageName} (${item.proficiency})` : item.languageName;
    case 'HOBBY':
      return item.name;
    default:
      return '';
  }
};

/** dd/mm/yyyy từ chuỗi ISO "yyyy-mm-dd" (tránh lệch múi giờ so với new Date().toLocaleDateString) */
const formatDob = (dob) => {
  if (!dob) return '';
  const [y, m, d] = dob.split('-');
  return d && m && y ? `${d}/${m}/${y}` : dob;
};

/** Thẻ nhỏ viền đen kèm icon — đơn vị hiển thị lặp lại cho info chip / social link chip */
const InfoChip = ({ icon: Icon, text, maxWidth = '160px' }) => (
  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-black bg-white border-2 border-black px-2 py-1 leading-none">
    <Icon size={12} strokeWidth={2.5} className="shrink-0" />
    <span className="truncate" style={{ maxWidth }}>{text}</span>
  </span>
);

/**
 * Render nội dung tóm tắt cho 1 block (dùng trong ProfileBlockCard).
 * Với block đơn (PERSONAL_INFO/AVATAR/SOCIAL_LINKS) đọc trực tiếp profileData.profile.
 * Với block danh sách, hiện tối đa MAX_PREVIEW_ITEMS dòng + "còn N mục khác".
 */
export const renderBlockSummary = (blockType, profileData) => {
  const profile = profileData?.profile;

  if (blockType === 'PERSONAL_INFO') {
    if (!profile?.fullName) return <EmptyHint text="Chưa cập nhật thông tin cá nhân" />;

    const chips = [
      profile.phone && { icon: Phone, text: profile.phone },
      profile.emailContact && { icon: Mail, text: profile.emailContact },
      (profile.gender || profile.dob) && {
        icon: Calendar,
        text: [profile.gender, formatDob(profile.dob)].filter(Boolean).join(' · '),
      },
      profile.address && { icon: MapPin, text: profile.address },
    ].filter(Boolean);

    return (
      <div className="space-y-3">
        {/* Tên + chức danh */}
        <div className="pb-2.5 border-b-2 border-black/10">
          <p className="text-sm font-black text-black leading-tight">{profile.fullName}</p>
          {profile.headline && (
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mt-0.5">{profile.headline}</p>
          )}
        </div>

        {/* Chip thông tin liên hệ */}
        {chips.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {chips.map((chip, idx) => <InfoChip key={idx} icon={chip.icon} text={chip.text} />)}
          </div>
        )}

        {/* Giới thiệu bản thân */}
        {profile.summary && (
          <div className="border-2 border-dashed border-gray-300 px-2.5 py-2">
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Giới thiệu</p>
            <p className="text-xs text-gray-600 leading-snug line-clamp-3">{profile.summary}</p>
          </div>
        )}
      </div>
    );
  }

  if (blockType === 'AVATAR') {
    // Ảnh co giãn theo đúng khung cha (card sandbox) thay vì kích thước cố
    // định nhỏ — card resize to/nhỏ thế nào thì ảnh theo thế đó.
    const avatarSrc = getFileUrl(profile?.avatarUrl);
    return avatarSrc
      ? (
        <div className="w-full h-full min-h-[80px]">
          <img
            src={avatarSrc}
            alt="avatar"
            className="w-full h-full object-cover border-[3px] border-black"
          />
        </div>
      )
      : <EmptyHint text="Chưa có ảnh đại diện" />;
  }

  if (blockType === 'SOCIAL_LINKS') {
    const chips = [
      profile?.websiteUrl && { icon: Globe, text: profile.websiteUrl },
      profile?.linkedinUrl && { icon: Link2, text: profile.linkedinUrl },
      profile?.githubUrl && { icon: Code2, text: profile.githubUrl },
    ].filter(Boolean);

    return chips.length
      ? (
        <div className="flex flex-wrap gap-1.5">
          {chips.map((chip, idx) => <InfoChip key={idx} icon={chip.icon} text={chip.text} maxWidth="180px" />)}
        </div>
      )
      : <EmptyHint text="Chưa thêm liên kết nào" />;
  }

  // Block danh sách
  const items = getBlockItems(blockType, profileData);
  if (items.length === 0) return <EmptyHint text="Chưa có dữ liệu" />;

  const preview = items.slice(0, MAX_PREVIEW_ITEMS);
  const remaining = items.length - preview.length;

  return (
    <ul className="text-sm text-gray-700 space-y-1">
      {preview.map((item, idx) => (
        <li key={item.id ?? idx} className="truncate">• {describeItem(blockType, item) || '(chưa đặt tên)'}</li>
      ))}
      {remaining > 0 && (
        <li className="text-xs text-gray-400 italic">+ còn {remaining} mục khác</li>
      )}
    </ul>
  );
};

const EmptyHint = ({ text }) => <p className="text-sm text-gray-300 italic">{text}</p>;

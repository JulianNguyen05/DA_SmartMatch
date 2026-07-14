// src/components/candidate-profile/shared/blockConfig.jsx
// ════════════════════════════════════════════════════════════════════════════
// Cấu hình trung tâm cho 12 loại block ProfilePage — PHẢI khớp đúng enum
// BlockType bên backend (domain.candidate.model.BlockType).
// ════════════════════════════════════════════════════════════════════════════

import React from 'react';
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
export const DEFAULT_GRID_SIZE = {
  PERSONAL_INFO: { w: 6, h: 5 },
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

/**
 * Render nội dung tóm tắt cho 1 block (dùng trong ProfileBlockCard).
 * Với block đơn (PERSONAL_INFO/AVATAR/SOCIAL_LINKS) đọc trực tiếp profileData.profile.
 * Với block danh sách, hiện tối đa MAX_PREVIEW_ITEMS dòng + "còn N mục khác".
 */
export const renderBlockSummary = (blockType, profileData) => {
  const profile = profileData?.profile;

  if (blockType === 'PERSONAL_INFO') {
    if (!profile?.fullName) return <EmptyHint text="Chưa cập nhật thông tin cá nhân" />;
    return (
      <div className="text-sm text-gray-700">
        <span className="font-bold text-gray-900">{profile.fullName}</span>
        {profile.headline && <span className="text-gray-500"> · {profile.headline}</span>}
      </div>
    );
  }

  if (blockType === 'AVATAR') {
    // profile.avatarUrl là đường dẫn TƯƠNG ĐỐI do backend trả về (vd "avatars/1_x.jpg")
    // -> phải ghép thành URL đầy đủ trỏ về backend, nếu không ảnh sẽ vỡ (404)
    // vì trình duyệt tự ghép vào origin của frontend (localhost:5173).
    const avatarSrc = getFileUrl(profile?.avatarUrl);
    return avatarSrc
      ? <img src={avatarSrc} alt="avatar" className="w-12 h-12 border-2 border-black object-cover" />
      : <EmptyHint text="Chưa có ảnh đại diện" />;
  }

  if (blockType === 'SOCIAL_LINKS') {
    const links = [profile?.websiteUrl, profile?.linkedinUrl, profile?.githubUrl].filter(Boolean);
    return links.length
      ? <div className="text-sm text-gray-600">{links.length} liên kết đã thêm</div>
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

// src/components/candidate-profile/shared/blockConfig.jsx
// ════════════════════════════════════════════════════════════════════════════
// Cấu hình trung tâm cho 12 loại block ProfilePage — PHẢI khớp đúng enum
// BlockType bên backend (domain.candidate.model.BlockType).
//
// [Blueprint Dossier] Không còn 1 màu riêng/block (BLOCK_COLOR cầu vồng cũ) —
// giờ chỉ có 1 màu mực chính (--color-ink, xem index.css), block phân biệt
// bằng ICON (BLOCK_ICON) đặt cạnh nhãn góc kiểu chú thích bản vẽ kỹ thuật.
// ════════════════════════════════════════════════════════════════════════════

import React from 'react';
import {
  User, Image as ImageIcon, Link2, Briefcase, GraduationCap, Sparkles,
  FolderKanban, BadgeCheck, Trophy, Users, Languages, Heart,
  Phone, Mail, Calendar, MapPin, Globe, Code2,
} from 'lucide-react';
import { getFileUrl } from '../../../utils/fileUrl';

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

// Ký hiệu 3-4 chữ dùng trong nhãn góc kiểu bản vẽ (VD "EXP · 02")
export const BLOCK_TAG = {
  PERSONAL_INFO: 'INFO', AVATAR: 'IMG', SOCIAL_LINKS: 'LINK',
  EXPERIENCE: 'EXP', EDUCATION: 'EDU', SKILL: 'SKL', PROJECT: 'PRJ',
  CERTIFICATION: 'CERT', AWARD: 'AWD', ACTIVITY: 'ACT', LANGUAGE: 'LANG', HOBBY: 'HOB',
};

export const BLOCK_ICON = {
  PERSONAL_INFO: User, AVATAR: ImageIcon, SOCIAL_LINKS: Link2,
  EXPERIENCE: Briefcase, EDUCATION: GraduationCap, SKILL: Sparkles,
  PROJECT: FolderKanban, CERTIFICATION: BadgeCheck, AWARD: Trophy,
  ACTIVITY: Users, LANGUAGE: Languages, HOBBY: Heart,
};

// ─── Kích thước mặc định trên lưới 12 cột khi chưa có layout đã lưu ────────
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

/** dd/mm/yyyy từ chuỗi ISO "yyyy-mm-dd" (tránh lệch múi giờ so với new Date().toLocaleDateString) */
const formatDob = (dob) => {
  if (!dob) return '';
  const [y, m, d] = dob.split('-');
  return d && m && y ? `${d}/${m}/${y}` : dob;
};

/** Thẻ nhỏ viền mảnh kèm icon — dùng cho info chip / social link chip trong PERSONAL_INFO/SOCIAL_LINKS */
const InfoChip = ({ icon: Icon, text, maxWidth = '160px' }) => (
  <span className="inline-flex items-center gap-1.5 text-[14px] font-medium text-graphite bg-white border border-graphite/15 rounded-md px-2 py-1 leading-none font-body">
    <Icon size={12} strokeWidth={2} className="shrink-0 text-graphite/70" />
    <span className="truncate" style={{ maxWidth }}>{text}</span>
  </span>
);

/**
 * [Chỉ dùng cho block CHƯA chuyển sang inline-editing: PERSONAL_INFO/AVATAR/SOCIAL_LINKS
 * ở chế độ xem, hoặc SKILL/LANGUAGE trước khi làm bước 2]. 7 block danh sách đơn giản
 * (Experience, Education...) giờ dùng InlineEntryList, KHÔNG còn gọi hàm này nữa.
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
      <div className="space-y-3 font-body">
        <div className="pb-2.5 border-b border-graphite/10">
          <p className="text-[17px] font-semibold text-graphite leading-tight font-display">{profile.fullName}</p>
          {profile.headline && (
            <p className="text-[15px] font-medium text-graphite/70 mt-0.5">{profile.headline}</p>
          )}
        </div>
        {chips.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {chips.map((chip, idx) => <InfoChip key={idx} icon={chip.icon} text={chip.text} />)}
          </div>
        )}
        {profile.summary && (
          <p className="text-[15px] text-graphite/80 leading-snug line-clamp-3">{profile.summary}</p>
        )}
      </div>
    );
  }

  if (blockType === 'AVATAR') {
    const avatarSrc = getFileUrl(profile?.avatarUrl);
    return avatarSrc
      ? (
        <div className="w-full h-full min-h-[80px]">
          <img src={avatarSrc} alt="avatar" className="w-full h-full object-cover rounded-lg" />
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
      ? <div className="flex flex-wrap gap-1.5 font-body">{chips.map((chip, idx) => <InfoChip key={idx} icon={chip.icon} text={chip.text} maxWidth="180px" />)}</div>
      : <EmptyHint text="Chưa thêm liên kết nào" />;
  }

  return <EmptyHint text="Đang cập nhật" />;
};

const EmptyHint = ({ text }) => <p className="text-[17px] text-graphite/55 italic font-body">{text}</p>;

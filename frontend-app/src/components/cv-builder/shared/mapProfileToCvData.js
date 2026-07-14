// src/components/cv-builder/shared/mapProfileToCvData.js
// ════════════════════════════════════════════════════════════════════════════
// Chuyển đổi response getFullProfile() (schema backend: companyName, position,
// startDate, endDate...) sang schema mà CV Builder lưu trong cvData.data
// (schema: company, role, duration...) — xem SIMPLE_TEMPLATE_CONFIG.defaultData
// trong cvTemplateCore.js / SimpleTemplate.jsx.
//
// Đây KHÔNG phải schema hiển thị (adaptDataForList's date/title/subtitle) —
// đó là bước chuyển đổi kế tiếp do chính CV Builder tự làm khi render.
// Hàm này chỉ dừng lại ở "raw schema" lưu trong data.
// ════════════════════════════════════════════════════════════════════════════

/** "2023-01-15" + isCurrent → "01/2023 - Hiện tại" ; thiếu ngày → chuỗi rỗng */
const formatMonthYear = (isoDate) => {
  if (!isoDate) return '';
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return '';
  return `${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
};

/** "2000-05-20" → "20/05/2000" — dùng riêng cho ngày sinh (cần đủ ngày/tháng/năm) */
const formatFullDate = (isoDate) => {
  if (!isoDate) return '';
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return '';
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
};

const formatDuration = (startDate, endDate, isCurrent) => {
  const start = formatMonthYear(startDate);
  const end = isCurrent ? 'Hiện tại' : formatMonthYear(endDate);
  if (!start && !end) return '';
  if (!end) return start;
  if (!start) return end;
  return `${start} - ${end}`;
};

const mapExperience = (list = []) => list.map((e) => ({
  duration: formatDuration(e.startDate, e.endDate, e.isCurrent),
  company: e.companyName || '',
  role: e.position || '',
  description: e.description || '',
}));

const mapEducation = (list = []) => list.map((e) => ({
  duration: formatDuration(e.startDate, e.endDate, e.isCurrent),
  school: e.schoolName || '',
  major: e.major || '',
  gpa: e.gpa != null ? String(e.gpa) : '',
  description: e.description || '',
}));

const mapActivities = (list = []) => list.map((a) => ({
  duration: formatDuration(a.startDate, a.endDate, a.isCurrent),
  organization: a.organization || '',
  role: a.role || '',
  description: a.description || '',
}));

const mapProjects = (list = []) => list.map((p) => ({
  duration: formatDuration(p.startDate, p.endDate, p.isCurrent),
  name: p.projectName || '',
  role: p.role || '',
  // CV Builder không có field riêng cho tech stack -> gộp vào cuối mô tả
  description: p.techStack
    ? `${p.description || ''}${p.description ? '\n' : ''}Công nghệ: ${p.techStack}`
    : (p.description || ''),
}));

const mapCertifications = (list = []) => list.map((c) => ({
  date: formatMonthYear(c.issueDate),
  name: c.name || '',
  issuer: c.issuingOrg || '',
}));

const mapAwards = (list = []) => list.map((a) => ({
  date: formatMonthYear(a.awardedDate),
  title: a.title || '',
  issuer: a.issuer || '',
}));

const mapSkills = (list = []) => list.map((s) => ({
  name: s.skillName || '',
  // CV Builder không có field "level" riêng -> ghép vào description để không mất thông tin
  description: s.level ? `${s.level}${s.description ? ' — ' + s.description : ''}` : (s.description || ''),
}));

const mapHobbies = (list = []) => list.map((h) => ({ name: h.name || '' }));

/**
 * @param {object} profileFull - response CandidateProfileFullResponse (từ getFullProfile)
 * @param {object} defaultData - SIMPLE_TEMPLATE_CONFIG.defaultData (hoặc template khác) —
 *                                dùng làm nền, các field không map được giữ nguyên mặc định
 * @returns {object} - object khớp shape cvData.data, sẵn sàng gán thẳng vào setCvData
 */
export const mapProfileToCvData = (profileFull, defaultData) => {
  const profile = profileFull?.profile || {};

  const contactInfo = [
    { label: 'Ngày sinh', value: profile.dob ? formatFullDate(profile.dob) : '' },
    { label: 'Giới tính', value: profile.gender || '' },
    { label: 'Số điện thoại', value: profile.phone || '' },
    { label: 'Email', value: profile.emailContact || '' },
    { label: 'Website', value: profile.websiteUrl || '' },
    { label: 'Địa chỉ', value: profile.address || '' },
  ];
  if (profile.linkedinUrl) contactInfo.push({ label: 'LinkedIn', value: profile.linkedinUrl });
  if (profile.githubUrl) contactInfo.push({ label: 'GitHub', value: profile.githubUrl });

  return {
    ...defaultData,
    avatar: { url: profile.avatarUrl || defaultData.avatar?.url || '' },
    personalInfo: { fullName: profile.fullName || '', jobTitle: profile.headline || '' },
    contactInfo,
    objective: profile.summary || '',
    experience: mapExperience(profileFull.experiences),
    education: mapEducation(profileFull.educations),
    activities: mapActivities(profileFull.activities),
    projects: mapProjects(profileFull.projects),
    certifications: mapCertifications(profileFull.certifications),
    awards: mapAwards(profileFull.awards),
    skills: mapSkills(profileFull.skills),
    hobbies: mapHobbies(profileFull.hobbies),
  };
};
// src/components/candidate-profile/blockFormConfig.js
// ════════════════════════════════════════════════════════════════════════════
// Định nghĩa field cho 7 block danh sách "đơn giản" (không cần dropdown danh mục
// dùng chung) — SKILL và LANGUAGE có config riêng vì cần ReferenceValueAutocomplete.
// service: hậu tố method trong candidateService (createXxx/updateXxx/deleteXxx)
// ════════════════════════════════════════════════════════════════════════════

export const BLOCK_FORM_CONFIGS = {
  EXPERIENCE: {
    label: 'Kinh nghiệm làm việc',
    titleField: 'companyName',
    subtitleField: 'position',
    service: 'Experience',
    emptyItem: { companyName: '', position: '', employmentType: '', location: '', startDate: '', endDate: '', isCurrent: false, description: '' },
    fields: [
      { name: 'companyName', label: 'Công ty', type: 'text', required: true },
      { name: 'position', label: 'Vị trí', type: 'text' },
      { name: 'employmentType', label: 'Hình thức', type: 'select', options: [
        { value: '', label: '— Chọn —' },
        { value: 'FULL_TIME', label: 'Toàn thời gian' },
        { value: 'PART_TIME', label: 'Bán thời gian' },
        { value: 'INTERNSHIP', label: 'Thực tập' },
        { value: 'FREELANCE', label: 'Freelance' },
      ] },
      { name: 'location', label: 'Địa điểm', type: 'text' },
      { name: 'startDate', label: 'Bắt đầu', type: 'date' },
      { name: 'endDate', label: 'Kết thúc', type: 'date' },
      { name: 'isCurrent', label: 'Hiện đang làm việc tại đây', type: 'checkbox' },
      { name: 'description', label: 'Mô tả', type: 'textarea' },
    ],
  },

  EDUCATION: {
    label: 'Học vấn',
    titleField: 'schoolName',
    subtitleField: 'major',
    service: 'Education',
    emptyItem: { schoolName: '', major: '', degree: '', startDate: '', endDate: '', isCurrent: false, gpa: '', description: '' },
    fields: [
      { name: 'schoolName', label: 'Trường học', type: 'text', required: true },
      { name: 'major', label: 'Chuyên ngành', type: 'text' },
      { name: 'degree', label: 'Bằng cấp', type: 'select', options: [
        { value: '', label: '— Chọn —' },
        { value: 'Trung cấp', label: 'Trung cấp' },
        { value: 'Cao đẳng', label: 'Cao đẳng' },
        { value: 'Đại học', label: 'Đại học' },
        { value: 'Thạc sĩ', label: 'Thạc sĩ' },
        { value: 'Tiến sĩ', label: 'Tiến sĩ' },
      ] },
      { name: 'startDate', label: 'Bắt đầu', type: 'date' },
      { name: 'endDate', label: 'Kết thúc', type: 'date' },
      { name: 'isCurrent', label: 'Đang học tại đây', type: 'checkbox' },
      { name: 'gpa', label: 'GPA', type: 'number', step: '0.01' },
      { name: 'description', label: 'Mô tả', type: 'textarea' },
    ],
  },

  PROJECT: {
    label: 'Dự án',
    titleField: 'projectName',
    subtitleField: 'role',
    service: 'Project',
    emptyItem: { projectName: '', role: '', techStack: '', projectUrl: '', startDate: '', endDate: '', isCurrent: false, description: '' },
    fields: [
      { name: 'projectName', label: 'Tên dự án', type: 'text', required: true },
      { name: 'role', label: 'Vai trò', type: 'text' },
      { name: 'techStack', label: 'Công nghệ sử dụng', type: 'text', placeholder: 'React, Spring Boot, MySQL...' },
      { name: 'projectUrl', label: 'Link dự án', type: 'text' },
      { name: 'startDate', label: 'Bắt đầu', type: 'date' },
      { name: 'endDate', label: 'Kết thúc', type: 'date' },
      { name: 'isCurrent', label: 'Đang thực hiện', type: 'checkbox' },
      { name: 'description', label: 'Mô tả', type: 'textarea' },
    ],
  },

  CERTIFICATION: {
    label: 'Chứng chỉ',
    titleField: 'name',
    subtitleField: 'issuingOrg',
    service: 'Certification',
    emptyItem: { name: '', issuingOrg: '', issueDate: '', expiryDate: '', credentialId: '', credentialUrl: '' },
    fields: [
      { name: 'name', label: 'Tên chứng chỉ', type: 'text', required: true },
      { name: 'issuingOrg', label: 'Tổ chức cấp', type: 'text' },
      { name: 'issueDate', label: 'Ngày cấp', type: 'date' },
      { name: 'expiryDate', label: 'Ngày hết hạn', type: 'date' },
      { name: 'credentialId', label: 'Mã chứng chỉ', type: 'text' },
      { name: 'credentialUrl', label: 'Link xác thực', type: 'text' },
    ],
  },

  AWARD: {
    label: 'Giải thưởng',
    titleField: 'title',
    subtitleField: 'issuer',
    service: 'Award',
    emptyItem: { title: '', issuer: '', awardedDate: '', description: '' },
    fields: [
      { name: 'title', label: 'Tên giải thưởng', type: 'text', required: true },
      { name: 'issuer', label: 'Đơn vị trao', type: 'text' },
      { name: 'awardedDate', label: 'Ngày nhận', type: 'date' },
      { name: 'description', label: 'Mô tả', type: 'textarea' },
    ],
  },

  ACTIVITY: {
    label: 'Hoạt động',
    titleField: 'organization',
    subtitleField: 'role',
    service: 'Activity',
    emptyItem: { organization: '', role: '', startDate: '', endDate: '', isCurrent: false, description: '' },
    fields: [
      { name: 'organization', label: 'Tổ chức', type: 'text', required: true },
      { name: 'role', label: 'Vai trò', type: 'text' },
      { name: 'startDate', label: 'Bắt đầu', type: 'date' },
      { name: 'endDate', label: 'Kết thúc', type: 'date' },
      { name: 'isCurrent', label: 'Đang tham gia', type: 'checkbox' },
      { name: 'description', label: 'Mô tả', type: 'textarea' },
    ],
  },

  HOBBY: {
    label: 'Sở thích',
    titleField: 'name',
    subtitleField: null,
    service: 'Hobby',
    emptyItem: { name: '' },
    fields: [
      { name: 'name', label: 'Tên sở thích', type: 'text', required: true, placeholder: 'VD: Đọc sách, Chơi bóng đá...' },
    ],
  },
};
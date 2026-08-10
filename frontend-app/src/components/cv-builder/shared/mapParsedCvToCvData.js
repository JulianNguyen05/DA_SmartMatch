// src/components/cv-builder/shared/mapParsedCvToCvData.js
/**
 * Map ParsedCvResponse (JSON trả về từ backend-ml POST /parser/extract, đi
 * qua proxy endpoint của backend-core) sang đúng shape mà CV Builder dùng
 * (SIMPLE_TEMPLATE_CONFIG.defaultData trong SimpleTemplate.jsx).
 *
 * Dùng làm `prefillData` khi navigate sang CVBuilderPage — CÙNG CƠ CHẾ với
 * ProfileToCvPicker (xem index.jsx dòng ~200-222), không phải pipeline mới.
 *
 * Vì kết quả OCR/NER có thể sai/thiếu (confidence thấp), hàm này CHỈ điền
 * dữ liệu vào CV Builder để người dùng REVIEW/SỬA trước khi bấm Save — không
 * có bước nào ở đây ghi thẳng vào DB.
 */

const safeValue = (extractedField) => extractedField?.value || "";

/** Ghép start_date/end_date thành 1 chuỗi duration, bỏ qua phần rỗng. */
const formatDuration = (startDate, endDate) => {
  const start = safeValue(startDate);
  const end = safeValue(endDate);
  if (start && end) return `${start} - ${end}`;
  return start || end || "";
};

const mapEducations = (educations = []) =>
  educations.map((edu) => ({
    duration: formatDuration(edu.start_date, edu.end_date),
    school: safeValue(edu.school),
    // Template không có field "degree" riêng, "major" là chỗ gần nghĩa nhất
    // để hiển thị bằng cấp/chuyên ngành trích xuất được.
    major: safeValue(edu.degree),
    gpa: "",
    description: edu.raw_text || "",
  }));

const mapExperiences = (experiences = []) =>
  experiences.map((exp) => ({
    duration: formatDuration(exp.start_date, exp.end_date),
    company: safeValue(exp.company),
    role: safeValue(exp.job_title),
    description: exp.raw_text || "",
  }));

const mapSkills = (skills = []) =>
  skills.map((skill) => ({
    name: skill.name || "",
    description: "",
  }));

/**
 * contactInfo trong template là MẢNG CỐ ĐỊNH 6 phần tử theo label tiếng Việt
 * (không phải object keyed) — phải giữ đúng thứ tự/label này, chỉ đổi value.
 *
 * Website/GitHub/LinkedIn trong ParsedCvResponse là 3 field riêng nhưng
 * template chỉ có 1 ô "Website" — ưu tiên website_url, sau đó GitHub, cuối
 * cùng LinkedIn (đây là lossy do giới hạn của template, không phải bug).
 */
const mapContactInfo = (contact = {}, location) => {
  const websiteValue =
    safeValue(contact.website_url) ||
    safeValue(contact.github_url) ||
    safeValue(contact.linkedin_url) ||
    "";

  return [
    { label: "Ngày sinh", value: "" },
    { label: "Giới tính", value: "" },
    { label: "Số điện thoại", value: safeValue(contact.phone) },
    { label: "Email", value: safeValue(contact.email) },
    { label: "Website", value: websiteValue },
    { label: "Địa chỉ", value: safeValue(location) },
  ];
};

/**
 * @param {object} parsedCv - ParsedCvResponse JSON từ backend-ml
 * @returns {object} data object khớp shape defaultData, dùng làm prefillData
 */
export const mapParsedCvToCvData = (parsedCv) => {
  if (!parsedCv) return {};

  return {
    personalInfo: {
      fullName: safeValue(parsedCv.full_name),
      jobTitle: "",
    },
    contactInfo: mapContactInfo(parsedCv.contact, parsedCv.location),
    objective: parsedCv.summary_text || "",
    education: mapEducations(parsedCv.educations),
    experience: mapExperiences(parsedCv.experiences),
    skills: mapSkills(parsedCv.skills),
    // Parser hiện chưa trích xuất structured cho các mục này (xem warnings
    // của ParsedCvResponse) -> để trống, người dùng tự thêm tay trong CV
    // Builder như bình thường.
    activities: [],
    hobbies: [],
    awards: [],
    certifications: [],
    projects: [],
    references: [],
  };
};

export default mapParsedCvToCvData;
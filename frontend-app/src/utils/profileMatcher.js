/**
 * Hàm tự động điền dữ liệu (Auto-fill) từ Profile của ứng viên vào Form của Job
 * @param {Object} selectedProfile - Dữ liệu CV ứng viên đang chọn
 * @param {Array|String} jobTemplate - Template form do NTD thiết lập
 * @returns {Object} - Object chứa dữ liệu đã được map { fieldId: content }
 */
export const matchProfileToJob = (selectedProfile, jobTemplate) => {
  if (!selectedProfile) return {};

  let profileSections = [];
  try {
    profileSections = selectedProfile.sections ? JSON.parse(selectedProfile.sections) : [];
  } catch (e) {
    console.error("Lỗi parse sections JSON từ Profile:", e);
  }

  let templateFields = [];
  try {
    // Đảm bảo templateFields luôn là mảng
    templateFields = typeof jobTemplate === 'string' ? JSON.parse(jobTemplate) : (jobTemplate || []);
  } catch (e) {
    console.error("Lỗi parse template JSON từ Job:", e);
  }

  const autoFilledAnswers = {};

  templateFields.forEach(field => {
    // 1. Tìm block trong CV có type khớp với field.id hoặc field.autoFillKey
    // Ví dụ: NTD yêu cầu field.id = 'experience' -> Tìm block 'experience' trong CV
    const matchedBlock = profileSections.find(block => 
      block.type === field.id || block.type === field.autoFillKey
    );

    if (matchedBlock) {
      autoFilledAnswers[field.id] = matchedBlock.content || "";
    } else {
      // 2. Nếu không tìm thấy khối, kiểm tra các trường cơ bản tĩnh (Họ tên, Headline)
      autoFilledAnswers[field.id] = selectedProfile[field.autoFillKey] || selectedProfile[field.id] || "";
    }
  });

  return autoFilledAnswers;
};
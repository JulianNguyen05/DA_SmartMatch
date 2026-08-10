import axiosClient from '../../services/axiosClient';

const candidateService = {
  // ==========================================
  // 1. QUẢN LÝ CV (giữ nguyên như cũ)
  // ==========================================

  createCv: async (userId, payload) => {
    const response = await axiosClient.post(`/candidates/${userId}/cvs/generated`, payload);
    return response.data;
  },

  uploadCv: async (userId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axiosClient.post(`/candidates/${userId}/cvs`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  getCvs: async (userId) => {
    const response = await axiosClient.get(`/candidates/${userId}/cvs`);
    return response.data;
  },

  getMyCVs: async (candidateId) => {
    const response = await axiosClient.get(`/candidates/${candidateId}/cvs`);
    return response.data;
  },

  getCvDetail: async (userId, cvId) => {
    const response = await axiosClient.get(`/candidates/${userId}/cvs/${cvId}`);
    return response.data;
  },

  updateCv: async (userId, cvId, payload) => {
    const response = await axiosClient.put(`/candidates/${userId}/cvs/generated/${cvId}`, payload);
    return response.data;
  },

  renameCv: async (userId, cvId, newName) => {
    const response = await axiosClient.put(`/candidates/${userId}/cvs/${cvId}/rename`, null, {
      params: { newName }
    });
    return response.data;
  },

  uploadCvThumbnail: async (userId, cvId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axiosClient.post(`/candidates/${userId}/cvs/${cvId}/thumbnail`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  deleteCv: async (userId, cvId) => {
    const response = await axiosClient.delete(`/candidates/${userId}/cvs/${cvId}`);
    return response.data;
  },

  // ==========================================
  // 2. QUẢN LÝ PROFILE (giữ nguyên như cũ + avatar mới)
  // ==========================================

  getProfile: async (userId) => {
    const response = await axiosClient.get(`/candidates/${userId}/profile`);
    return response.data;
  },

  createOrUpdateProfile: async (userId, profileData) => {
    const response = await axiosClient.post(`/candidates/${userId}/profile`, profileData);
    return response.data;
  },

  uploadAvatar: async (userId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axiosClient.post(`/candidates/${userId}/avatar`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // [MỚI] Lấy toàn bộ ProfilePage (layout + 9 block danh sách) trong 1 lần gọi — Tiến độ 7
  getFullProfile: async (userId) => {
    const response = await axiosClient.get(`/candidates/${userId}/profile/full`);
    return response.data;
  },

  // ==========================================
  // 3. PROFILE LAYOUT (SANDBOX KÉO-THẢ) — [MỚI] Tiến độ 4
  // ==========================================

  getProfileLayout: async (userId) => {
    const response = await axiosClient.get(`/candidates/${userId}/profile/layout`);
    return response.data;
  },

  // items: [{ blockType, position }, ...]
  reorderProfileLayout: async (userId, items) => {
    const response = await axiosClient.put(`/candidates/${userId}/profile/layout/reorder`, { items });
    return response.data;
  },

  toggleBlockVisibility: async (userId, blockType, visible) => {
    const response = await axiosClient.patch(
      `/candidates/${userId}/profile/layout/${blockType}/visibility`,
      { visible }
    );
    return response.data;
  },

  // ==========================================
  // 4. QUẢN LÝ SKILLS (giữ nguyên + bổ sung reorder/assign/remove)
  // ==========================================

  getSkills: async (userId) => {
    const response = await axiosClient.get(`/candidates/${userId}/skills`);
    return response.data;
  },

  createSkill: async (userId, skillData) => {
    const response = await axiosClient.post(`/candidates/${userId}/skills`, skillData);
    return response.data;
  },

  updateSkill: async (userId, skillId, skillData) => {
    const response = await axiosClient.put(`/candidates/${userId}/skills/${skillId}`, skillData);
    return response.data;
  },

  // [MỚI] Gán nhanh 1 skill đã tồn tại (chọn từ dropdown), không cần nhập tên
  assignSkill: async (userId, skillId) => {
    const response = await axiosClient.post(`/candidates/${userId}/skills/${skillId}/assign`);
    return response.data;
  },

  removeSkill: async (userId, skillId) => {
    const response = await axiosClient.delete(`/candidates/${userId}/skills/${skillId}`);
    return response.data;
  },

  // [MỚI] Kéo-thả sắp xếp lại thứ tự skill — Tiến độ 6
  // items: [{ skillId, displayOrder }, ...]
  reorderSkills: async (userId, items) => {
    const response = await axiosClient.put(`/candidates/${userId}/skills/reorder`, { items });
    return response.data;
  },

  // ==========================================
  // 5. DROPDOWN SKILL/LANGUAGE + ĐỀ XUẤT ADMIN — [MỚI] Tiến độ 5
  // ==========================================

  searchReferenceValues: async (type, keyword = '') => {
    const response = await axiosClient.get(`/candidates/reference-values/search`, {
      params: { type, keyword }
    });
    return response.data;
  },

  // request: { type, name, requestType: 'CREATE'|'EDIT'|'DELETE', targetReferenceValueId? }
  suggestReferenceValue: async (userId, request) => {
    const response = await axiosClient.post(`/candidates/${userId}/reference-values/suggestions`, request);
    return response.data;
  },

  // ==========================================
  // 6. HỌC VẤN (EDUCATIONS) — [MỚI]
  // ==========================================

  getEducations: async (userId) => {
    const response = await axiosClient.get(`/candidates/${userId}/educations`);
    return response.data;
  },
  createEducation: async (userId, payload) => {
    const response = await axiosClient.post(`/candidates/${userId}/educations`, payload);
    return response.data;
  },
  updateEducation: async (userId, educationId, payload) => {
    const response = await axiosClient.put(`/candidates/${userId}/educations/${educationId}`, payload);
    return response.data;
  },
  deleteEducation: async (userId, educationId) => {
    const response = await axiosClient.delete(`/candidates/${userId}/educations/${educationId}`);
    return response.data;
  },

  // ==========================================
  // 7. KINH NGHIỆM LÀM VIỆC (EXPERIENCES) — [MỚI]
  // ==========================================

  getExperiences: async (userId) => {
    const response = await axiosClient.get(`/candidates/${userId}/experiences`);
    return response.data;
  },
  createExperience: async (userId, payload) => {
    const response = await axiosClient.post(`/candidates/${userId}/experiences`, payload);
    return response.data;
  },
  updateExperience: async (userId, experienceId, payload) => {
    const response = await axiosClient.put(`/candidates/${userId}/experiences/${experienceId}`, payload);
    return response.data;
  },
  deleteExperience: async (userId, experienceId) => {
    const response = await axiosClient.delete(`/candidates/${userId}/experiences/${experienceId}`);
    return response.data;
  },

  // ==========================================
  // 8. DỰ ÁN (PROJECTS) — [MỚI]
  // ==========================================

  getProjects: async (userId) => {
    const response = await axiosClient.get(`/candidates/${userId}/projects`);
    return response.data;
  },
  createProject: async (userId, payload) => {
    const response = await axiosClient.post(`/candidates/${userId}/projects`, payload);
    return response.data;
  },
  updateProject: async (userId, projectId, payload) => {
    const response = await axiosClient.put(`/candidates/${userId}/projects/${projectId}`, payload);
    return response.data;
  },
  deleteProject: async (userId, projectId) => {
    const response = await axiosClient.delete(`/candidates/${userId}/projects/${projectId}`);
    return response.data;
  },

  // ==========================================
  // 9. CHỨNG CHỈ (CERTIFICATIONS) — [MỚI]
  // ==========================================

  getCertifications: async (userId) => {
    const response = await axiosClient.get(`/candidates/${userId}/certifications`);
    return response.data;
  },
  createCertification: async (userId, payload) => {
    const response = await axiosClient.post(`/candidates/${userId}/certifications`, payload);
    return response.data;
  },
  updateCertification: async (userId, certificationId, payload) => {
    const response = await axiosClient.put(`/candidates/${userId}/certifications/${certificationId}`, payload);
    return response.data;
  },
  deleteCertification: async (userId, certificationId) => {
    const response = await axiosClient.delete(`/candidates/${userId}/certifications/${certificationId}`);
    return response.data;
  },

  // ==========================================
  // 10. HOẠT ĐỘNG (ACTIVITIES) — [MỚI]
  // ==========================================

  getActivities: async (userId) => {
    const response = await axiosClient.get(`/candidates/${userId}/activities`);
    return response.data;
  },
  createActivity: async (userId, payload) => {
    const response = await axiosClient.post(`/candidates/${userId}/activities`, payload);
    return response.data;
  },
  updateActivity: async (userId, activityId, payload) => {
    const response = await axiosClient.put(`/candidates/${userId}/activities/${activityId}`, payload);
    return response.data;
  },
  deleteActivity: async (userId, activityId) => {
    const response = await axiosClient.delete(`/candidates/${userId}/activities/${activityId}`);
    return response.data;
  },

  // ==========================================
  // 11. GIẢI THƯỞNG (AWARDS) — [MỚI]
  // ==========================================

  getAwards: async (userId) => {
    const response = await axiosClient.get(`/candidates/${userId}/awards`);
    return response.data;
  },
  createAward: async (userId, payload) => {
    const response = await axiosClient.post(`/candidates/${userId}/awards`, payload);
    return response.data;
  },
  updateAward: async (userId, awardId, payload) => {
    const response = await axiosClient.put(`/candidates/${userId}/awards/${awardId}`, payload);
    return response.data;
  },
  deleteAward: async (userId, awardId) => {
    const response = await axiosClient.delete(`/candidates/${userId}/awards/${awardId}`);
    return response.data;
  },

  // ==========================================
  // 12. SỞ THÍCH (HOBBIES) — [MỚI]
  // ==========================================

  getHobbies: async (userId) => {
    const response = await axiosClient.get(`/candidates/${userId}/hobbies`);
    return response.data;
  },
  createHobby: async (userId, payload) => {
    const response = await axiosClient.post(`/candidates/${userId}/hobbies`, payload);
    return response.data;
  },
  updateHobby: async (userId, hobbyId, payload) => {
    const response = await axiosClient.put(`/candidates/${userId}/hobbies/${hobbyId}`, payload);
    return response.data;
  },
  deleteHobby: async (userId, hobbyId) => {
    const response = await axiosClient.delete(`/candidates/${userId}/hobbies/${hobbyId}`);
    return response.data;
  },

  // ==========================================
  // 13. NGÔN NGỮ (LANGUAGES) — [MỚI]
  // ==========================================

  getLanguages: async (userId) => {
    const response = await axiosClient.get(`/candidates/${userId}/languages`);
    return response.data;
  },
  createLanguage: async (userId, payload) => {
    const response = await axiosClient.post(`/candidates/${userId}/languages`, payload);
    return response.data;
  },
  updateLanguage: async (userId, languageId, payload) => {
    const response = await axiosClient.put(`/candidates/${userId}/languages/${languageId}`, payload);
    return response.data;
  },
  deleteLanguage: async (userId, languageId) => {
    const response = await axiosClient.delete(`/candidates/${userId}/languages/${languageId}`);
    return response.data;
  },

  // ==========================================
  // 14. QUẢN LÝ ĐƠN ỨNG TUYỂN (giữ nguyên như cũ)
  // ==========================================

  getMyApplications: async (userId, page = 0, size = 10) => {
    const response = await axiosClient.get(`/applications/candidates/${userId}?page=${page}&size=${size}`);
    return response.data;
  },

  extractCv: async (userId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    // Không set Content-Type thủ công — để axios tự thêm boundary cho FormData
    const response = await axiosClient.post(`/candidates/${userId}/cvs/extract`, formData);
    return response.data; // = ApiResponse<ParsedCvResponse> nguyên vẹn — caller cần .data để lấy payload
  },
};

export default candidateService;
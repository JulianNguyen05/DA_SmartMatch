import axiosClient from '../../services/axiosClient';

const candidateService = {
  // ─── 1. QUẢN LÝ PROFILE ──────────────────────────────────────────────
  getProfile: async (userId) => {
    const response = await axiosClient.get(`/candidates/${userId}/profile`);
    return response.data;
  },
  
  createOrUpdateProfile: async (userId, profileData) => {
    const response = await axiosClient.post(`/candidates/${userId}/profile`, profileData);
    return response.data;
  },

  // ─── 2. QUẢN LÝ SKILLS ──────────────────────────────────────────────
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

  // ─── 3. QUẢN LÝ CV ──────────────────────────────────────────────────
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

  getCvDetail: async (userId, cvId) => {
    const response = await axiosClient.get(`/candidates/${userId}/cvs/${cvId}`);
    return response.data;
  },

  deleteCv: async (userId, cvId) => {
    const response = await axiosClient.delete(`/candidates/${userId}/cvs/${cvId}`);
    return response.data;
  },

  // Tạo CV Sandbox mới (payload chứa { title, rawText })
  createCv: async (userId, payload) => {
    const response = await axiosClient.post(`/candidates/${userId}/cvs/generated`, payload);
    return response.data;
  },

  // Cập nhật CV Sandbox đã có (payload chứa { title, rawText })
  updateCv: async (userId, cvId, payload) => {
    const response = await axiosClient.put(`/candidates/${userId}/cvs/generated/${cvId}`, payload);
    return response.data;
  },

  // ─── 4. QUẢN LÝ ĐƠN ỨNG TUYỂN ─────────────────────────────────────────
  getMyApplications: async (userId, page = 0, size = 10) => {
    const response = await axiosClient.get(`/applications/candidates/${userId}?page=${page}&size=${size}`);
    return response.data;
  },

  // Thêm vào cuối phần QUẢN LÝ CV (trước QUẢN LÝ ĐƠN ỨNG TUYỂN)
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

  getMyCVs: async (candidateId) => {
    // Sửa thành '/candidates/${candidateId}/cvs'
    const response = await axiosClient.get(`/candidates/${candidateId}/cvs`);
    return response.data;
  }
};

export default candidateService;
import api from './api';

export const candidateService = {
  // ================= QUẢN LÝ HỒ SƠ TRỰC TUYẾN (PROFILES TABS) =================
  
  // Lấy danh sách tất cả các Tab hồ sơ
  getMyProfiles: async () => {
    // Lưu ý: Đã đổi '/candidate/profile' thành '/candidate/profiles' (số nhiều)
    const res = await api.get('/candidate/profiles'); 
    return res.data;
  },
  
  // Lưu hồ sơ mới hoặc cập nhật hồ sơ cũ (dựa vào việc profileData có ID hay không)
  saveProfile: async (profileData) => {
    const res = await api.post('/candidate/profiles', profileData);
    return res.data;
  },

  // ================= QUẢN LÝ FILE CV ĐÍNH KÈM (PDF/DOCX) =================
  
  getMyResumes: async () => {
    const res = await api.get('/candidate/resumes/my');
    return res.data;
  },

  uploadResume: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/candidate/resumes/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },

  deleteResume: async (id) => {
    const res = await api.delete(`/candidate/resumes/${id}`);
    return res.data;
  }
};
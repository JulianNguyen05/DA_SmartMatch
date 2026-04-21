import api from './api';

export const candidateService = {
  // ================= PROFILE =================
  getMyProfile: async () => {
    const res = await api.get('/candidate/profile');
    return res.data;
  },
  
  saveProfile: async (profileData) => {
    const res = await api.post('/candidate/profile', profileData);
    return res.data;
  },

  // ================= RESUME (CV) =================
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
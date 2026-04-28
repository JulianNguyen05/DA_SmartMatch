// frontend-app/src/services/jobService.js
import api from './api';

export const jobService = {
  // ================= CỦA NHÀ TUYỂN DỤNG =================

  // Tạo tin mới
  createJob: async (data) => {
    const res = await api.post('/employer/jobs', data);
    return res.data;
  },

  // Lấy danh sách tin của tôi
  getMyJobs: async () => {
    const res = await api.get('/employer/jobs/my');
    return res.data;
  },

  // Lấy chi tiết 1 tin (dùng cho edit)
  getJobById: async (id) => {
    const res = await api.get(`/employer/jobs/${id}`);
    return res.data;
  },

  // Cập nhật tin
  updateJob: async (id, data) => {
    const res = await api.put(`/employer/jobs/${id}`, data);
    return res.data;
  },

  // Xóa tin
  deleteJob: async (id) => {
    const res = await api.delete(`/employer/jobs/${id}`);
    return res.data;
  },

  // ================= CỦA ỨNG VIÊN (PUBLIC) =================
  
  // Tìm kiếm tin tuyển dụng
  searchPublicJobs: async (params) => {
    const res = await api.get('/public/jobs/search', { params });
    return res.data;
  },

  // Lấy chi tiết tin tuyển dụng (đã sửa lỗi dư /api)
  getPublicJobById: async (id) => {
    const res = await api.get(`/public/jobs/${id}`);
    return res.data;
  }
};
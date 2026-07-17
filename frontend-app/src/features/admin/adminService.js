import axiosClient from '../../services/axiosClient';

const adminService = {
  // Lấy thống kê tổng quan cho Dashboard
  getDashboardStats: async () => {
    const response = await axiosClient.get('/admin/dashboard');
    return response.data;
  },

  // Kiểm duyệt tin tuyển dụng
  moderateJob: async (jobId, action, reason = '') => {
    const response = await axiosClient.patch(`/admin/jobs/${jobId}/moderate`, {
      action: action,
      reason: reason
    });
    return response.data;
  },

  // Khóa tài khoản người dùng
  banUser: async (userId) => {
    const response = await axiosClient.patch(`/admin/users/${userId}/ban`);
    return response.data;
  },

  // --- Các hàm lấy danh sách ---
  getUsers: async (page = 0, size = 10) => {
    const response = await axiosClient.get(`/admin/users?page=${page}&size=${size}`);
    return response.data;
  },

  // Lấy danh sách doanh nghiệp chờ duyệt
  getPendingCompanies: async () => {
    const response = await axiosClient.get('/admin/companies/pending');
    return response.data;
  },

  // Duyệt hoặc từ chối doanh nghiệp
  moderateCompany: async (companyId, action, reason = '') => {
    const response = await axiosClient.patch(`/admin/companies/${companyId}/moderate`, {
      action: action, // 'APPROVED' hoặc 'REJECTED'
      reason: reason
    });
    return response.data;
  },

  // Lấy danh sách tin chờ duyệt
  getPendingJobs: async () => {
    const response = await axiosClient.get(`/admin/jobs/pending`);
    return response.data;
  },

  // ==========================================
  // [MỚI] DUYỆT ĐỀ XUẤT SKILL/LANGUAGE (ReferenceValueSuggestion)
  // ==========================================

  // status: 'PENDING' | 'APPROVED' | 'REJECTED' | undefined (undefined -> BE mặc định PENDING)
  getSuggestions: async (status) => {
    const response = await axiosClient.get('/admin/suggestions', {
      params: status ? { status } : {},
    });
    return response.data;
  },

  approveSuggestion: async (suggestionId) => {
    const response = await axiosClient.patch(`/admin/suggestions/${suggestionId}/approve`);
    return response.data;
  },

  rejectSuggestion: async (suggestionId, reviewNote = '') => {
    const response = await axiosClient.patch(`/admin/suggestions/${suggestionId}/reject`, { reviewNote });
    return response.data;
  },
};

export default adminService;
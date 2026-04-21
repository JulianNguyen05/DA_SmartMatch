import api from './api';

export const applicationService = {
  // Lấy danh sách đơn ứng tuyển của ứng viên đang đăng nhập
  getMyApplications: async () => {
    const res = await api.get('/candidate/applications');
    return res.data;
  },

  // Nộp đơn ứng tuyển mới (dùng cho trang Chi tiết việc làm)
  applyForJob: async (data) => {
    const res = await api.post('/candidate/applications', data);
    return res.data;
  }
};
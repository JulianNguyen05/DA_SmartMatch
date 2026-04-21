import api from './api';

export const adminService = {
  // Lấy danh sách tất cả người dùng
  getAllUsers: async () => {
    const res = await api.get('/admin/users');
    return res.data;
  },

  // Khóa / Mở khóa tài khoản
  toggleUserStatus: async (userId, enabled) => {
    // Truyền trạng thái enabled (true = mở khóa, false = khóa)
    const res = await api.put(`/admin/users/${userId}/status`, { enabled });
    return res.data;
  },

  // Xóa tài khoản (nếu cần)
  deleteUser: async (userId) => {
    const res = await api.delete(`/admin/users/${userId}`);
    return res.data;
  }
};
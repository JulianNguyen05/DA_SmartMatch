// frontend-app\src\services\jobService.js
import api from './api';
const API_BASE = "http://localhost:8080/api";

const getToken = () => localStorage.getItem("accessToken");

export const jobService = {
  // Tạo tin mới
  createJob: async (data) => {
    const res = await fetch(`${API_BASE}/employer/jobs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Không thể tạo tin tuyển dụng");
    return res.json();
  },

  // Lấy danh sách tin của tôi
  getMyJobs: async () => {
    const res = await fetch(`${API_BASE}/employer/jobs/my`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (!res.ok) throw new Error("Không thể lấy danh sách tin");
    return res.json();
  },

  // Lấy chi tiết 1 tin (dùng cho edit)
  getJobById: async (id) => {
    const res = await fetch(`${API_BASE}/employer/jobs/${id}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (!res.ok) throw new Error("Không tìm thấy tin");
    return res.json();
  },

  // Cập nhật tin
  updateJob: async (id, data) => {
    const res = await fetch(`${API_BASE}/employer/jobs/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Không thể cập nhật tin");
    return res.json();
  },

  // Xóa tin
  deleteJob: async (id) => {
    const res = await fetch(`${API_BASE}/employer/jobs/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (!res.ok) throw new Error("Không thể xóa tin");
    return res.ok;
  },

  // ================= CỦA ỨNG VIÊN (PUBLIC) =================
  searchPublicJobs: async (params) => {
    // Gọi đến API GET /api/public/jobs/search
    const res = await api.get('/public/jobs/search', { params });
    return res.data;
  },

  getPublicJobById: async (id) => {
    const res = await api.get(`/public/jobs/${id}`);
    return res.data;
  }
};
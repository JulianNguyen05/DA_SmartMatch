// frontend-app\src\services\api.js
import axios from 'axios';

// Khởi tạo axios instance
const api = axios.create({
  baseURL: '/api', // Dùng '/api' để khớp với proxy trong vite.config.js
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: Tự động lấy token từ localStorage và gắn vào header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// BẮT BUỘC PHẢI CÓ DÒNG NÀY ĐỂ FIX LỖI BẠN ĐANG GẶP
export default api;
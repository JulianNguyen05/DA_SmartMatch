// frontend-app/src/services/authService.js
import axios from 'axios';

// Tạo một instance axios với cấu hình chung
const apiClient = axios.create({
  baseURL: '/api/auth', // Sẽ được Vite proxy thành http://localhost:8080/api/auth
  headers: {
    'Content-Type': 'application/json',
  },
});

export const login = async ({ usernameOrEmail, password }) => {
  try {
    // DTO Backend LoginRequest yêu cầu trường 'email'. 
    // Ta map giá trị usernameOrEmail từ Form vào trường email để gửi đi.
    const response = await apiClient.post('/login', {
      email: usernameOrEmail, 
      password: password
    });
    
    // Spring Boot sẽ trả về: { token, refreshToken, role, email }
    return response.data; 
  } catch (error) {
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message); // Lấy câu báo lỗi từ Backend
    }
    throw new Error("Không thể kết nối đến máy chủ.");
  }
};

export const register = async (userData) => {
  try {
    // userData từ RegisterPage chứa: { username, email, phoneNumber, password, role }
    // Khớp 100% với RegisterRequest DTO bên Spring Boot
    const response = await apiClient.post('/register', userData);
    return response.data;
  } catch (error) {
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error("Không thể kết nối đến máy chủ.");
  }
};
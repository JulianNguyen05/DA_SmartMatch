// frontend/src/store/userStore.js
import { create } from 'zustand';

export const useUserStore = create((set) => ({
  user: null, // Ban đầu chưa đăng nhập thì user là null
  
  // Hàm cập nhật thông tin user (được gọi ở LoginPage)
  setUser: (userData) => set({ user: userData }),
  
  // Hàm đăng xuất (gọi khi click nút Logout)
  logout: () => {
    localStorage.removeItem('accessToken');
    set({ user: null });
  },
}));
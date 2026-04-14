// frontend-app/src/routes/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useUserStore } from '../store/userStore';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user } = useUserStore();
  const token = localStorage.getItem('accessToken');

  // 1. Chưa đăng nhập (Không có token hoặc không có user trong store)
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // 2. Đã đăng nhập nhưng Role không nằm trong danh sách được phép
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Đẩy về trang chủ hoặc trang báo lỗi 403 (Không có quyền)
    return <Navigate to="/" replace />; 
  }

  // 3. Hợp lệ: Trả về Outlet để render các Route con bên trong
  return <Outlet />;
};

export default ProtectedRoute;
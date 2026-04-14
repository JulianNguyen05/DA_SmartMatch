//frontend-app/src/routes/AppRouter.jsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Import Pages (Đường dẫn import có thể thay đổi tùy cấu trúc file thực tế của bạn)
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import HomePage from '../pages/candidate/HomePage';
import AdminDashboard from '../pages/admin/AdminDashboard';
import EmployerDashboard from '../pages/employer/EmployerDashboard';
import CandidateDashboard from '../pages/candidate/CandidateDashboard';

// Import Component bảo vệ Route
import ProtectedRoute from './ProtectedRoute';

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* ================= PUBLIC ROUTES ================= */}
        {/* Ai cũng có thể truy cập */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* ================= ADMIN ROUTES ================= */}
        {/* Chỉ ADMIN mới vào được */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          {/* Thêm các route khác của Admin tại đây */}
        </Route>

        {/* ================= EMPLOYER ROUTES ================= */}
        {/* Chỉ EMPLOYER mới vào được */}
        <Route element={<ProtectedRoute allowedRoles={['EMPLOYER']} />}>
          <Route path="/employer/dashboard" element={<EmployerDashboard />} />
          {/* Thêm các route khác của Employer tại đây */}
        </Route>

        {/* ================= CANDIDATE ROUTES ================= */}
        {/* Chỉ CANDIDATE mới vào được */}
        <Route element={<ProtectedRoute allowedRoles={['CANDIDATE']} />}>
          <Route path="/candidate/dashboard" element={<CandidateDashboard />} />
          {/* Thêm các route khác của Candidate tại đây */}
        </Route>

        {/* Bắt lỗi 404 (Trang không tồn tại) */}
        <Route path="*" element={<div className="p-10 text-center">404 - Trang không tồn tại</div>} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
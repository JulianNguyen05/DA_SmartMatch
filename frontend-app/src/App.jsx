// frontend-app/src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import AdminLayout from './layouts/AdminLayout';
import CandidateLayout from './layouts/CandidateLayout';
import EmployerLayout from './layouts/EmployerLayout';

// Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import CandidateDashboard from './pages/candidate/CandidateDashboard';
import EmployerDashboard from './pages/employer/EmployerDashboard';
import ManageJobsPage from './pages/employer/ManageJobsPage';     // ← THÊM
import CreateJobPage from './pages/employer/CreateJobPage';       // ← THÊM

// Protected Route
import ProtectedRoute from './routes/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ================= PUBLIC ROUTES ================= */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Trang chủ mặc định chuyển sang login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* ================= ADMIN ROUTES ================= */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Route>
        </Route>

        {/* ================= EMPLOYER ROUTES ================= */}
        <Route element={<ProtectedRoute allowedRoles={['EMPLOYER']} />}>
          <Route element={<EmployerLayout />}>
            <Route path="/employer/dashboard" element={<EmployerDashboard />} />
            
            {/* === QUẢN LÝ TIN TUYỂN DỤNG === */}
            <Route path="/employer/jobs" element={<ManageJobsPage />} />
            <Route path="/employer/jobs/create" element={<CreateJobPage />} />
            <Route path="/employer/jobs/:id/edit" element={<CreateJobPage />} />
          </Route>
        </Route>

        {/* ================= CANDIDATE ROUTES ================= */}
        <Route element={<ProtectedRoute allowedRoles={['CANDIDATE']} />}>
          <Route element={<CandidateLayout />}>
            <Route path="/candidate/dashboard" element={<CandidateDashboard />} />
          </Route>
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
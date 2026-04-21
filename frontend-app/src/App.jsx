// frontend-app/src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Layouts
import AdminLayout from "./layouts/AdminLayout";
import CandidateLayout from "./layouts/CandidateLayout";
import EmployerLayout from "./layouts/EmployerLayout";

// Pages
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import CandidateDashboard from "./pages/candidate/CandidateDashboard";
import EmployerDashboard from "./pages/employer/EmployerDashboard";
import ManageJobsPage from "./pages/employer/ManageJobsPage";
import CreateJobPage from "./pages/employer/CreateJobPage";
import CompanyProfilePage from "./pages/employer/CompanyProfilePage";
import JobSearchPage from './pages/candidate/JobSearchPage';
import ProfilePage from './pages/candidate/ProfilePage';
import JobDetailPage from './pages/candidate/JobDetailPage';
import CandidateApplicationsPage from './pages/candidate/CandidateApplicationsPage';
import ResumesPage from './pages/candidate/ResumesPage'; // <-- IMPORT TRANG QUẢN LÝ CV

// Protected Route
import ProtectedRoute from "./routes/ProtectedRoute";

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
        <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Route>
        </Route>

        {/* ================= EMPLOYER ROUTES ================= */}
        <Route element={<ProtectedRoute allowedRoles={["EMPLOYER"]} />}>
          <Route element={<EmployerLayout />}>
            <Route path="/employer/dashboard" element={<EmployerDashboard />} />
            
            {/* === QUẢN LÝ CÔNG TY === */}
            <Route path="/employer/company" element={<CompanyProfilePage />} />
            
            {/* === QUẢN LÝ TIN TUYỂN DỤNG === */}
            <Route path="/employer/jobs" element={<ManageJobsPage />} />
            <Route path="/employer/jobs/create" element={<CreateJobPage />} />
            <Route path="/employer/jobs/:id/edit" element={<CreateJobPage />} />
          </Route>
        </Route>

        {/* ================= CANDIDATE ROUTES ================= */}
        {/* Đã xóa phần lặp và gộp chung lại */}
        <Route element={<ProtectedRoute allowedRoles={["CANDIDATE"]} />}>
          <Route element={<CandidateLayout />}>
            <Route path="/candidate/dashboard" element={<CandidateDashboard />} />
            <Route path="/candidate/applications" element={<CandidateApplicationsPage />} />
            <Route path="/candidate/jobs" element={<JobSearchPage />} />
            <Route path="/candidate/profile" element={<ProfilePage />} />
            <Route path="/candidate/jobs/:id" element={<JobDetailPage />} />
            
            {/* <-- THÊM ROUTE QUẢN LÝ CV VÀO ĐÂY --> */}
            <Route path="/candidate/resumes" element={<ResumesPage />} />
          </Route>
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
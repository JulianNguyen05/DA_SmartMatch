import { createBrowserRouter, Navigate } from "react-router-dom";

// ==========================================
// 1. IMPORT LAYOUTS
// ==========================================
import MainLayout from "../components/layout/MainLayout";
import AuthLayout from "../components/layout/AuthLayout";
import AdminLayout from "../components/layout/AdminLayout";
import EmployerLayout from "../components/layout/EmployerLayout";

// ==========================================
// 2. IMPORT PUBLIC PAGES
// ==========================================
import HomePage from "../pages/public/HomePage";
import JobListPage from "../pages/public/JobListPage";
import JobDetailPage from "../pages/public/JobDetailPage";
import CompanyListPage from "../pages/public/CompanyListPage";
import CompanyDetailPage from "../pages/public/CompanyDetailPage";
import NotFoundPage from "../pages/public/NotFoundPage";

// ==========================================
// 3. IMPORT AUTH PAGES
// ==========================================
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";

// ==========================================
// 4. IMPORT CANDIDATE PAGES
// ==========================================
import CandidateDashboard from "../pages/candidate/DashboardPage";
import CVManagerPage from "../pages/candidate/CVManagerPage";
import CVTemplatesPage from "../pages/candidate/CVTemplatesPage";
import CVBuilderPage from "../pages/candidate/CVBuilderPage";
import MyApplicationsPage from "../pages/candidate/MyApplicationsPage";
import CandidateProfile from "../pages/candidate/ProfilePage";
import CandidateSettings from "../pages/candidate/SettingsPage";

// ==========================================
// 5. IMPORT EMPLOYER PAGES
// ==========================================
import EmployerDashboard from "../pages/employer/DashboardPage";
import CompanyProfilePage from "../pages/employer/CompanyProfilePage";
import JobManagementPage from "../pages/employer/JobManagementPage";
import JobCreatePage from "../pages/employer/JobCreatePage";
import JobEditPage from "../pages/employer/JobEditPage";
import ApplicationListPage from "../pages/employer/ApplicationListPage";
import ApplicationDetailPage from "../pages/employer/ApplicationDetailPage";
import CandidateSearchPage from "../pages/employer/CandidateSearchPage";
import EmployerSettings from "../pages/employer/SettingsPage";

// ==========================================
// 6. IMPORT ADMIN PAGES
// ==========================================
import AdminDashboard from "../pages/admin/DashboardPage";
import UserManagementPage from "../pages/admin/UserManagementPage";
import JobModerationPage from "../pages/admin/JobModerationPage";
import CompanyModerationPage from "../pages/admin/CompanyModerationPage";
import CategoryManagementPage from "../pages/admin/CategoryManagementPage";
import ReportExportPage from "../pages/admin/ReportExportPage";

// ==========================================
// CONFIGURATION ROUTER
// ==========================================
export const router = createBrowserRouter([
  // --- NHÓM 1: PUBLIC & CANDIDATE (Dùng chung MainLayout) ---
  {
    path: "/",
    element: <MainLayout />,
    errorElement: <NotFoundPage />,
    children: [
      // Public Routes
      { index: true, element: <HomePage /> },
      { path: "jobs", element: <JobListPage /> },
      { path: "jobs/:id", element: <JobDetailPage /> },
      { path: "companies", element: <CompanyListPage /> },
      { path: "companies/:id", element: <CompanyDetailPage /> },

      // Candidate Routes
      { path: "candidate/dashboard", element: <CandidateDashboard /> },
      { path: "candidate/cv-manager", element: <CVManagerPage /> },
      { path: "candidate/cv-templates", element: <CVTemplatesPage /> },
      { path: "candidate/cv-builder/:id", element: <CVBuilderPage /> },
      { path: "candidate/applications", element: <MyApplicationsPage /> },
      { path: "candidate/profile", element: <CandidateProfile /> },
      { path: "candidate/settings", element: <CandidateSettings /> },
    ],
  },

  // --- NHÓM 2: AUTHENTICATION (Dùng AuthLayout) ---
  {
    path: "/auth",
    element: <AuthLayout />,
    children: [
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
      { path: "forgot-password", element: <ForgotPasswordPage /> },
    ],
  },

  // --- NHÓM 3: EMPLOYER (Dùng EmployerLayout) ---
  {
    path: "/employer",
    element: <EmployerLayout />,
    children: [
      { index: true, element: <Navigate to="/employer/dashboard" replace /> },
      { path: "dashboard", element: <EmployerDashboard /> },
      { path: "profile", element: <CompanyProfilePage /> },
      { path: "jobs", element: <JobManagementPage /> },
      { path: "jobs/create", element: <JobCreatePage /> },
      { path: "jobs/edit/:id", element: <JobEditPage /> },
      { path: "applications", element: <ApplicationListPage /> },
      { path: "applications/:id", element: <ApplicationDetailPage /> },
      { path: "candidates/search", element: <CandidateSearchPage /> },
      { path: "settings", element: <EmployerSettings /> },
    ],
  },

  // --- NHÓM 4: ADMIN (Dùng AdminLayout) ---
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      // 1. Thêm dòng này: Tự động chuyển hướng /admin thành /admin/dashboard
      { index: true, element: <Navigate to="/admin/dashboard" replace /> },

      // 2. Thêm dòng này: Khai báo rõ đường dẫn dashboard
      { path: "dashboard", element: <AdminDashboard /> },

      { path: "users", element: <UserManagementPage /> },
      { path: "jobs-moderation", element: <JobModerationPage /> },
      { path: "company-moderation", element: <CompanyModerationPage /> },
      { path: "categories", element: <CategoryManagementPage /> },
      { path: "reports", element: <ReportExportPage /> },
    ],
  },
]);

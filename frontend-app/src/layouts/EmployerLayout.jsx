// frontend/src/layouts/EmployerLayout.jsx
import React from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  Briefcase,
  FileText,
  LogOut,
  Sparkles,
  Building,
} from "lucide-react";
import { useUserStore } from "../store/userStore";

const EmployerLayout = () => {
  const { user, logout } = useUserStore();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { icon: Home, label: "Dashboard", path: "/employer/dashboard" },
    {
      icon: Briefcase,
      label: "Quản lý tin tuyển dụng",
      path: "/employer/jobs",
    },
    { icon: FileText, label: "Resume Scanner", path: "/employer/scan" },
    { icon: Sparkles, label: "AI Matches", path: "/employer/matches" },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-72 bg-white border-r border-gray-100 flex flex-col">
        <div className="p-6 border-b">
          <Link
            to="/employer/dashboard"
            className="flex items-center gap-3 text-2xl font-black text-[var(--color-blue-pure)]"
          >
            <Sparkles /> SmartMatch
          </Link>
        </div>

        <div className="flex-1 px-3 py-6 space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname.includes(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-colors font-medium ${
                  isActive
                    ? "bg-[var(--color-blue-pure)] text-white shadow-md shadow-blue-500/20"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <item.icon size={22} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t">
          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="w-full flex items-center justify-center gap-2 text-red-600 hover:bg-red-50 py-3 rounded-2xl font-medium transition-colors"
          >
            <LogOut size={20} /> Đăng xuất
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b flex items-center px-8 justify-between">
          <h1 className="text-xl font-semibold text-gray-800">
            Xin chào, {user?.name || "HR"} 👋
          </h1>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-emerald-600 flex items-center justify-end gap-1">
                <Building size={14} /> Nhà tuyển dụng
              </p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
            <div className="w-9 h-9 bg-emerald-100 rounded-2xl flex items-center justify-center text-xl">
              🏢
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default EmployerLayout;

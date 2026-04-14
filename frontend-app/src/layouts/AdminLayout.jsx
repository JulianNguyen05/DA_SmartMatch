// frontend/src/layouts/AdminLayout.jsx
import React from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import {
  User,
  Home,
  Briefcase,
  LogOut,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { useUserStore } from "../store/userStore";

const AdminLayout = () => {
  const { user, logout } = useUserStore();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { icon: Home, label: "Dashboard", path: "/admin/dashboard" },
    { icon: User, label: "Quản lý người dùng", path: "/admin/users" },
    { icon: Briefcase, label: "Quản lý việc làm", path: "/admin/jobs" },
    { icon: Sparkles, label: "AI Logs", path: "/admin/ai-logs" },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-72 bg-white border-r border-gray-100 flex flex-col">
        <div className="p-6 border-b">
          <Link
            to="/admin/dashboard"
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b flex items-center px-8 justify-between">
          <h1 className="text-xl font-semibold text-gray-800">
            Xin chào, {user?.name || "Admin"} 👋
          </h1>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-purple-600 flex items-center justify-end gap-1">
                <ShieldCheck size={14} /> Quản trị viên
              </p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
            <div className="w-9 h-9 bg-purple-100 rounded-2xl flex items-center justify-center text-xl">
              ⚙️
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

export default AdminLayout;

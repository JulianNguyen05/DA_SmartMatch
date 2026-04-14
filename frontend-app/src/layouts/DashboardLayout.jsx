import React, { useState } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { LogOut, Sparkles } from "lucide-react";
import { useUserStore } from "../store/userStore";

const DashboardLayout = ({ menuItems, roleConfig }) => {
  const { user, logout } = useUserStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans overflow-hidden">
      {/* ==================== SIDEBAR (THEME: AUTH LAYOUT) ==================== */}
      <div
        className={`bg-gradient-to-b from-[var(--color-navy-light)] via-[var(--color-blue-electric)] to-[var(--color-navy-dark)] flex flex-col transition-all duration-300 ease-in-out relative shrink-0 z-20 ${
          isSidebarExpanded ? "w-72" : "w-20"
        }`}
        onMouseEnter={() => setIsSidebarExpanded(true)}
        onMouseLeave={() => setIsSidebarExpanded(false)}
      >
        {/* Lớp nền blur (Tùy chọn cho đẹp giống AuthLayout) */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-20%] w-[200px] h-[200px] rounded-full bg-[var(--color-purple-mid)] opacity-20 blur-[80px]"></div>
        </div>

        {/* LOGO AREA - Fixed Height h-20 để khớp 100% với Navbar */}
        <div className="h-20 px-5 flex items-center border-b border-white/10 shrink-0 relative z-10">
          <Link
            to={roleConfig.logoLink}
            className="flex items-center gap-3 overflow-hidden whitespace-nowrap"
          >
            {/* Box chứa icon */}
            <div className="w-10 h-10 shrink-0 bg-white/10 backdrop-blur-xl rounded-xl flex items-center justify-center border border-white/20">
              <Sparkles className="w-6 h-6 text-[var(--color-pink-light)]" />
            </div>

            {/* Text Logo */}
            <span
              className={`text-2xl font-black text-white tracking-tighter transition-opacity duration-300 ${
                isSidebarExpanded ? "opacity-100" : "opacity-0"
              }`}
            >
              SmartMatch
            </span>
          </Link>
        </div>

        {/* MENU ITEMS */}
        <div className="flex-1 px-3 py-6 space-y-2 overflow-y-auto overflow-x-hidden relative z-10 custom-scrollbar">
          {menuItems.map((item) => {
            const isActive = location.pathname.includes(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 overflow-hidden whitespace-nowrap group relative ${
                  isActive
                    ? "bg-white/25 text-white shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-white/30 backdrop-blur-md font-semibold"
                    : "text-white/70 hover:bg-white/10 hover:text-white font-medium"
                }`}
              >
                {/* Vạch trắng nổi bật bên trái khi Active */}
                {isActive && (
                  <div className="absolute left-0 top-2 bottom-2 w-1.5 bg-white rounded-r-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>
                )}

                <item.icon
                  size={22}
                  className={`shrink-0 transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-110"}`}
                />
                <span
                  className={`transition-opacity duration-300 tracking-wide ${
                    isSidebarExpanded ? "opacity-100" : "opacity-0"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>

        {/* LOGOUT */}
        <div className="p-4 border-t border-white/10 shrink-0 relative z-10">
          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl bg-rose-500/15 text-rose-300 border border-rose-500/20 hover:bg-rose-500/30 hover:text-white hover:border-rose-500/40 hover:shadow-[0_0_15px_rgba(244,63,94,0.2)] transition-all duration-300 font-semibold overflow-hidden whitespace-nowrap group"
          >
            <LogOut
              size={22}
              className="shrink-0 transition-transform duration-300 group-hover:-translate-x-1"
            />
            <span
              className={`transition-opacity duration-300 ${
                isSidebarExpanded ? "opacity-100" : "opacity-0"
              }`}
            >
              Đăng xuất
            </span>
          </button>
        </div>
      </div>

      {/* ==================== MAIN CONTENT ==================== */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* NAVBAR - Fixed Height h-20 giống hệt phần Logo */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center px-8 justify-between shrink-0 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-gray-800 tracking-tight">
              Xin chào, {user?.name || roleConfig.defaultName} 👋
            </h1>
          </div>

          <div className="flex items-center gap-5">
            <div className="text-right hidden sm:block">
              <p
                className={`text-sm font-bold flex items-center justify-end gap-1.5 ${roleConfig.textColor}`}
              >
                <roleConfig.RoleIcon size={16} strokeWidth={2.5} />{" "}
                {roleConfig.roleLabel}
              </p>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                {user?.email}
              </p>
            </div>

            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shadow-sm border border-gray-100 ${roleConfig.bgColor}`}
            >
              {roleConfig.avatarEmoji}
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-auto p-6 md:p-8 relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

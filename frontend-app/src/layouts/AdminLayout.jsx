import React from "react";
import { User, Home, Briefcase, Sparkles, ShieldCheck } from "lucide-react";
import DashboardLayout from "./DashboardLayout";

const AdminLayout = () => {
  const menuItems = [
    { icon: Home, label: "Dashboard", path: "/admin/dashboard" },
    { icon: User, label: "Quản lý người dùng", path: "/admin/users" },
    { icon: Briefcase, label: "Quản lý việc làm", path: "/admin/jobs" },
    { icon: Sparkles, label: "AI Logs", path: "/admin/ai-logs" },
  ];

  const roleConfig = {
    logoLink: "/admin/dashboard",
    defaultName: "Admin",
    roleLabel: "Quản trị viên",
    RoleIcon: ShieldCheck,
    textColor: "text-purple-600",
    bgColor: "bg-purple-100",
    avatarEmoji: "⚙️",
  };

  return <DashboardLayout menuItems={menuItems} roleConfig={roleConfig} />;
};

export default AdminLayout;
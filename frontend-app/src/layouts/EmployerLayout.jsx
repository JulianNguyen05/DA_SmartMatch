import React from "react";
import { Home, Briefcase, FileText, Sparkles, Building } from "lucide-react";
import DashboardLayout from "./DashboardLayout";

const EmployerLayout = () => {
  const menuItems = [
    { icon: Home, label: "Dashboard", path: "/employer/dashboard" },
    { icon: Briefcase, label: "Quản lý tin tuyển dụng", path: "/employer/jobs" },
    { icon: FileText, label: "Resume Scanner", path: "/employer/scan" },
    { icon: Sparkles, label: "AI Matches", path: "/employer/matches" },
  ];

  const roleConfig = {
    logoLink: "/employer/dashboard",
    defaultName: "HR",
    roleLabel: "Nhà tuyển dụng",
    RoleIcon: Building,
    textColor: "text-emerald-600",
    bgColor: "bg-emerald-100",
    avatarEmoji: "🏢",
  };

  return <DashboardLayout menuItems={menuItems} roleConfig={roleConfig} />;
};

export default EmployerLayout;
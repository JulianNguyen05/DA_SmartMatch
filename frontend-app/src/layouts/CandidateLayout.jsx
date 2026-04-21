import React from "react";
import {
  User,
  Home,
  Briefcase,
  FileText,
  Sparkles,
  FileStack,
} from "lucide-react";
import DashboardLayout from "./DashboardLayout";

const CandidateLayout = () => {
  const menuItems = [
    { icon: Home, label: "Trang chủ", path: "/candidate/dashboard" },
    { icon: FileStack, label: "Quản lý CV", path: "/candidate/resumes" },
    { icon: Briefcase, label: "Việc làm", path: "/candidate/jobs" },
    { icon: FileText, label: "Đơn ứng tuyển", path: "/candidate/applications" },
    { icon: User, label: "Hồ sơ", path: "/candidate/profile" },
    { icon: Sparkles, label: "AI Gợi ý", path: "/candidate/ai-match" },
  ];

  const roleConfig = {
    logoLink: "/candidate/dashboard",
    defaultName: "Ứng viên",
    roleLabel: "Ứng viên",
    RoleIcon: User,
    textColor: "text-[var(--color-blue-pure)]",
    bgColor: "bg-blue-100",
    avatarEmoji: "👤",
  };

  return <DashboardLayout menuItems={menuItems} roleConfig={roleConfig} />;
};

export default CandidateLayout;

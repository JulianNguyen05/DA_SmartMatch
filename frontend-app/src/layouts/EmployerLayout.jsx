import React, { useEffect, useState } from "react";
import { Home, Briefcase, FileText, Sparkles, Building, Building2 } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import DashboardLayout from "./DashboardLayout";
import { getMyCompany } from "../services/companyService";

const EmployerLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [hasCompany, setHasCompany] = useState(false); // Thêm state khóa UI

  useEffect(() => {
    const checkCompanyData = async () => {
      try {
        const company = await getMyCompany();
        if (company) {
          setHasCompany(true);
        } else {
          // Chưa có công ty
          if (location.pathname !== '/employer/company') {
            navigate('/employer/company', { replace: true });
          }
        }
      } catch (error) {
        console.error("Lỗi kiểm tra dữ liệu công ty:", error);
        // BẮT BUỘC ĐẨY VỀ TRANG TẠO CÔNG TY DÙ CÓ LỖI MẠNG / LỖI 500
        if (location.pathname !== '/employer/company') {
          navigate('/employer/company', { replace: true });
        }
      } finally {
        setIsChecking(false);
      }
    };
    
    checkCompanyData();
  }, [location.pathname, navigate]);

  const menuItems = [
    { icon: Home, label: "Trang chủ", path: "/employer/dashboard" },
    { icon: Briefcase, label: "Quản lý tin tuyển dụng", path: "/employer/jobs" },
    { icon: Building2, label: "Hồ sơ công ty", path: "/employer/company" },
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

  if (isChecking) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium">Đang thiết lập không gian làm việc...</p>
        </div>
      </div>
    );
  }

  // KHÓA GIAO DIỆN: Nếu chưa có thông tin công ty, không được phép render DashboardLayout
  if (!hasCompany && location.pathname !== '/employer/company') {
    return null; 
  }

  return <DashboardLayout menuItems={menuItems} roleConfig={roleConfig} />;
};

export default EmployerLayout;
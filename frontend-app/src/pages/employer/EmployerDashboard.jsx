import React from "react";
import {
  Users,
  FileText,
  Activity,
  PlusCircle,
  Sparkles,
  Briefcase,
  ChevronRight,
} from "lucide-react";
import { Link } from "react-router-dom";

const EmployerDashboard = () => {
  const stats = [
    {
      title: "Chiến dịch đang mở",
      count: 5,
      icon: Activity,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      title: "Tổng ứng viên",
      count: 142,
      icon: Users,
      color: "text-emerald-600",
      bg: "bg-emerald-100",
    },
    {
      title: "CV chờ đánh giá",
      count: 28,
      icon: FileText,
      color: "text-amber-600",
      bg: "bg-amber-100",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Bảng điều khiển Tuyển dụng 🏢
          </h1>
          <p className="text-gray-500 mt-1">
            Quản lý các chiến dịch và tìm kiếm nhân tài nhanh chóng.
          </p>
        </div>
        <Link
          to="/employer/jobs/create"
          className="flex items-center justify-center gap-2 bg-[var(--color-blue-pure)] text-white px-6 py-3 rounded-xl font-semibold hover:brightness-110 transition-all shadow-lg shadow-blue-500/30"
        >
          <PlusCircle size={20} /> Tạo chiến dịch mới
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5 hover:shadow-md transition-shadow"
          >
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center ${stat.bg} ${stat.color}`}
            >
              <stat.icon size={28} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">
                {stat.title}
              </p>
              <p className="text-2xl font-bold text-gray-900 leading-none">
                {stat.count}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Jobs */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-900">
              Chiến dịch gần đây
            </h2>
            <Link
              to="/employer/jobs"
              className="text-sm font-semibold text-[var(--color-blue-pure)] hover:underline flex items-center"
            >
              Quản lý tin <ChevronRight size={16} />
            </Link>
          </div>
          <div className="space-y-4">
            {[1, 2].map((item) => (
              <div
                key={item}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors gap-4"
              >
                <div className="flex gap-4 items-center">
                  <div className="w-12 h-12 bg-blue-50 text-[var(--color-blue-pure)] rounded-xl flex items-center justify-center">
                    <Briefcase size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">
                      Backend Node.js Developer
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Hết hạn: 30/05/2026
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 items-center">
                  <div className="text-center">
                    <p className="text-xl font-bold text-gray-900">24</p>
                    <p className="text-xs font-medium text-gray-500">
                      Ứng viên
                    </p>
                  </div>
                  <button className="px-4 py-2 text-sm font-semibold text-[var(--color-blue-pure)] bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                    Xem CV
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Call to Action */}
        <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden flex flex-col justify-center">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500 rounded-full blur-[60px] opacity-40"></div>
          <Sparkles className="text-purple-300 mb-4" size={32} />
          <h2 className="text-xl font-bold mb-3">Phân tích CV bằng AI</h2>
          <p className="text-indigo-200 mb-6 text-sm leading-relaxed">
            Hệ thống SmartMatch tự động chấm điểm và trích xuất kỹ năng từ hàng
            trăm CV chỉ trong vài giây.
          </p>
          <Link
            to="/employer/scan"
            className="text-center bg-white text-indigo-900 px-5 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-colors shadow-lg"
          >
            Mở Smart Scanner
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EmployerDashboard;

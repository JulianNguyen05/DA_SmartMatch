import React from "react";
import {
  Users,
  Building2,
  Briefcase,
  ShieldAlert,
  TrendingUp,
  BarChart3,
  Settings,
} from "lucide-react";

const AdminDashboard = () => {
  const stats = [
    {
      title: "Tổng Người dùng",
      count: "12,450",
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      title: "Công ty đối tác",
      count: "432",
      icon: Building2,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
    {
      title: "Job đang mở",
      count: "1,890",
      icon: Briefcase,
      color: "text-emerald-600",
      bg: "bg-emerald-100",
    },
    {
      title: "Báo cáo vi phạm",
      count: "5",
      icon: ShieldAlert,
      color: "text-red-600",
      bg: "bg-red-100",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Tổng quan Hệ thống ⚙️
        </h1>
        <p className="text-gray-500 mt-1">
          Báo cáo real-time về hoạt động của nền tảng SmartMatch.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
          >
            <div className="flex justify-between items-start mb-4">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}
              >
                <stat.icon size={24} />
              </div>
              <span className="flex items-center text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                <TrendingUp size={12} className="mr-1" /> +12%
              </span>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">{stat.count}</p>
              <p className="text-sm font-medium text-gray-500 mt-1">
                {stat.title}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* System Logs / Quick Actions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Settings className="text-gray-400" size={20} /> Tác vụ nhanh
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 rounded-2xl hover:border-[var(--color-blue-pure)] hover:bg-blue-50 group transition-all">
              <div className="w-12 h-12 bg-gray-100 group-hover:bg-[var(--color-blue-pure)] group-hover:text-white text-gray-600 rounded-full flex items-center justify-center mb-3 transition-colors">
                <Building2 size={24} />
              </div>
              <span className="font-semibold text-gray-700 group-hover:text-[var(--color-blue-pure)] text-sm">
                Duyệt Doanh nghiệp
              </span>
            </button>

            <button className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 rounded-2xl hover:border-purple-500 hover:bg-purple-50 group transition-all">
              <div className="w-12 h-12 bg-gray-100 group-hover:bg-purple-500 group-hover:text-white text-gray-600 rounded-full flex items-center justify-center mb-3 transition-colors">
                <BarChart3 size={24} />
              </div>
              <span className="font-semibold text-gray-700 group-hover:text-purple-600 text-sm">
                Cấu hình AI Matching
              </span>
            </button>
          </div>
        </div>

        {/* Recent Server Activity */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">
            Nhật ký hoạt động
          </h2>
          <div className="space-y-5 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
            {/* Log Item */}
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-white bg-emerald-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10"></div>
              <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] bg-gray-50 p-3 rounded-lg border border-gray-100">
                <div className="flex items-center justify-between mb-1">
                  <div className="font-semibold text-sm text-gray-900">
                    Người dùng mới đăng ký
                  </div>
                  <time className="text-xs font-medium text-gray-500">
                    2 phút trước
                  </time>
                </div>
                <div className="text-xs text-gray-600">
                  Candidate: nguyenvan_a@gmail.com
                </div>
              </div>
            </div>

            {/* Log Item */}
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-white bg-blue-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10"></div>
              <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] bg-gray-50 p-3 rounded-lg border border-gray-100">
                <div className="flex items-center justify-between mb-1">
                  <div className="font-semibold text-sm text-gray-900">
                    Job Post Created
                  </div>
                  <time className="text-xs font-medium text-gray-500">
                    15 phút trước
                  </time>
                </div>
                <div className="text-xs text-gray-600">
                  Công ty FPT Software đã đăng 1 job mới.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

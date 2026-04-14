import React from "react";
import { Briefcase, Bookmark, Eye, Clock, ChevronRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const CandidateDashboard = () => {
  const stats = [
    { title: "Việc đã ứng tuyển", count: 12, icon: Briefcase, color: "text-blue-600", bg: "bg-blue-100" },
    { title: "Việc làm đã lưu", count: 8, icon: Bookmark, color: "text-emerald-600", bg: "bg-emerald-100" },
    { title: "Lượt xem hồ sơ", count: 34, icon: Eye, color: "text-purple-600", bg: "bg-purple-100" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tổng quan hoạt động 🚀</h1>
        <p className="text-gray-500 mt-1">Theo dõi tiến độ tìm việc và các cơ hội mới nhất của bạn.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5 hover:shadow-md transition-shadow">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
              <stat.icon size={28} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900 leading-none">{stat.count}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Applications */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-900">Ứng tuyển gần đây</h2>
            <Link to="/candidate/applications" className="text-sm font-semibold text-[var(--color-blue-pure)] hover:underline flex items-center">
              Xem tất cả <ChevronRight size={16} />
            </Link>
          </div>
          <div className="space-y-4 flex-1">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-center justify-between p-4 rounded-xl border border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 font-bold">Logo</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Frontend Developer</h3>
                    <p className="text-sm text-gray-500">TechCorp Vietnam • Hồ Chí Minh</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg font-medium">
                  <Clock size={16} /> Chờ duyệt
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Suggested Jobs */}
        <div className="bg-gradient-to-br from-[#f8f9fa] to-[#eef2f6] rounded-2xl shadow-sm border border-blue-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="text-[var(--color-blue-pure)]" size={20} /> Gợi ý từ AI
            </h2>
          </div>
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-xl border border-blue-50 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-[var(--color-blue-pure)]"></div>
              <h3 className="font-bold text-gray-900 text-lg">Senior ReactJS Engineer</h3>
              <p className="text-sm text-gray-500 mb-3">SmartSolutions JSC • Remote</p>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-md">Độ phù hợp: 95%</span>
                <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md">$1500 - $2500</span>
              </div>
            </div>
            <button className="w-full py-3 border-2 border-dashed border-blue-200 text-[var(--color-blue-pure)] font-semibold rounded-xl hover:bg-blue-50 transition-colors">
              Khám phá thêm việc làm phù hợp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateDashboard;
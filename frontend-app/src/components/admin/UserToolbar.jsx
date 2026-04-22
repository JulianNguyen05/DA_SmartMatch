import React from 'react';
import { Search, Plus } from 'lucide-react';

// Nhận thêm prop activeTab
const UserToolbar = ({ searchTerm, onSearchChange, activeTab }) => {
  
  // Logic đổi tên nút theo Tab
  const buttonText = activeTab === 'CANDIDATE' ? 'Thêm Ứng viên' : 'Thêm Nhà tuyển dụng';

  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
      <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto flex-1">
        {/* Search Bar */}
        <div className="relative w-full sm:max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Tìm kiếm theo email hoặc tên đăng nhập..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
          />
        </div>
      </div>

      {/* Button hiển thị text linh hoạt */}
      <button className="w-full md:w-auto flex items-center justify-center gap-2 bg-purple-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-purple-700 transition shadow-lg shadow-purple-200">
        <Plus size={18} /> {buttonText}
      </button>
    </div>
  );
};

export default UserToolbar;
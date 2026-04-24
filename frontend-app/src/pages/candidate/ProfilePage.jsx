// frontend-app/src/pages/candidate/ProfilePage.jsx
import React, { useState, useEffect } from "react";
import { candidateService } from "../../services/candidateService";
import ResumeManager from '../../components/candidate/ResumeManager';
import { Loader2, AlertCircle } from "lucide-react";

const ProfilePage = () => {
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState([]);
  const [error, setError] = useState("");

  // Cập nhật useEffect để khởi tạo luồng quản lý nhiều hồ sơ
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    setError("");
    try {
      // Gọi API lấy danh sách tất cả các Tab hồ sơ của ứng viên
      const data = await candidateService.getMyProfiles();
      
      // Đảm bảo dữ liệu nhận về là một mảng
      const profileList = Array.isArray(data) ? data : data.content || data.data || [];
      setProfiles(profileList);
    } catch (err) {
      console.error("Lỗi khi tải danh sách hồ sơ:", err);
      setError("Không thể tải dữ liệu hồ sơ. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-96 text-gray-500">
        <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
        <span className="font-medium text-lg">Đang thiết lập không gian làm việc...</span>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-20">
      {/* Header trang hồ sơ */}
      <div className="mb-8 px-4 sm:px-0">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Hồ sơ của tôi
        </h1>
        <p className="text-gray-500 mt-2">
          Quản lý các phiên bản hồ sơ trực tuyến và file CV của bạn để sẵn sàng ứng tuyển.
        </p>
      </div>

      {error && (
        <div className="mb-6 mx-4 sm:mx-0 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-700">
          <AlertCircle size={20} />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* ResumeManager bây giờ sẽ nhận danh sách profiles 
          để tự xử lý việc hiển thị Tabs, Edit và View bên trong nó.
      */}
      <div className="px-4 sm:px-0">
        <ResumeManager 
          initialProfiles={profiles} 
          onRefresh={fetchInitialData} 
        />
      </div>

      <div className="mt-12 p-6 bg-blue-50 rounded-3xl border border-blue-100 mx-4 sm:mx-0">
        <h4 className="text-blue-800 font-bold mb-2 flex items-center gap-2">
          💡 Mẹo SmartMatch
        </h4>
        <p className="text-blue-700 text-sm leading-relaxed">
          Bạn có thể tạo nhiều "Tab Hồ sơ" khác nhau (ví dụ: một tab cho Frontend, một tab cho Backend). 
          Khi ứng tuyển, hệ thống sẽ cho phép bạn chọn một trong các hồ sơ này để tự động điền thông tin 
          khớp với yêu cầu của nhà tuyển dụng.
        </p>
      </div>
    </div>
  );
};

export default ProfilePage;
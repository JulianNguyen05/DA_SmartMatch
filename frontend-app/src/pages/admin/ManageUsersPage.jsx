import React, { useState, useEffect } from "react";
import { User, Briefcase } from "lucide-react";
import { adminService } from "../../services/adminService";
import UserToolbar from "../../components/admin/UserToolbar";
import UserTable from "../../components/admin/UserTable";

const ManageUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  // State quản lý tab hiện tại
  const [activeTab, setActiveTab] = useState("CANDIDATE");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error("Lỗi tải danh sách người dùng:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId, currentEnabled) => {
    if (
      !window.confirm(
        `Bạn có chắc muốn ${currentEnabled ? "khóa" : "mở khóa"} người dùng này?`,
      )
    )
      return;
    try {
      setActionLoading(userId);
      await adminService.toggleUserStatus(userId, !currentEnabled);
      fetchUsers();
    } catch {
      alert("Cập nhật trạng thái thất bại!");
    } finally {
      setActionLoading(null);
    }
  };

  // Lọc user theo Tab VÀ theo ô tìm kiếm
  const filteredUsers = users.filter((user) => {
    const matchTab = user.role === activeTab;
    const matchSearch =
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchTab && matchSearch;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            Quản lý Người dùng 👥
          </h1>
          <p className="text-gray-500 mt-1">
            Quản lý tài khoản và phân quyền hệ thống.
          </p>
        </div>
      </div>

      {/* ================= DÃY TABS ================= */}
      <div className="flex gap-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("CANDIDATE")}
          className={`pb-4 px-2 text-sm font-bold flex items-center gap-2 transition-all relative ${
            activeTab === "CANDIDATE"
              ? "text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <User size={18} /> Ứng viên
          {activeTab === "CANDIDATE" && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full"></div>
          )}
        </button>
        <button
          onClick={() => setActiveTab("EMPLOYER")}
          className={`pb-4 px-2 text-sm font-bold flex items-center gap-2 transition-all relative ${
            activeTab === "EMPLOYER"
              ? "text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Briefcase size={18} /> Nhà tuyển dụng
          {activeTab === "EMPLOYER" && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full"></div>
          )}
        </button>
      </div>

      <UserToolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        activeTab={activeTab}
      />

      <UserTable
        users={filteredUsers}
        loading={loading}
        actionLoading={actionLoading}
        onToggleStatus={handleToggleStatus}
      />
    </div>
  );
};

export default ManageUsersPage;

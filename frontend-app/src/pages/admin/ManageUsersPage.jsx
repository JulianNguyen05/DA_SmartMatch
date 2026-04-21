import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import UserToolbar from '../../components/admin/UserToolbar';
import UserTable from '../../components/admin/UserTable';

const ManageUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

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
    if (!window.confirm(`Bạn có chắc muốn ${currentEnabled ? 'khóa' : 'mở khóa'} người dùng này?`)) return;
    
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

  // Lọc user theo ô tìm kiếm
  const filteredUsers = users.filter(user => 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            Quản lý Người dùng 👥
          </h1>
          <p className="text-gray-500 mt-1">Quản lý tài khoản và phân quyền hệ thống.</p>
        </div>
      </div>

      <UserToolbar 
        searchTerm={searchTerm} 
        onSearchChange={setSearchTerm} 
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
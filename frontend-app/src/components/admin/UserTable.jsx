import React from 'react';
import { ShieldCheck, User, Briefcase, Lock, CheckCircle, MoreVertical, Loader2 } from 'lucide-react';

const ROLE_CONFIG = {
  ADMIN: { label: 'Quản trị viên', color: 'bg-purple-100 text-purple-700 border-purple-200', icon: ShieldCheck },
  EMPLOYER: { label: 'Nhà tuyển dụng', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Briefcase },
  CANDIDATE: { label: 'Ứng viên', color: 'bg-gray-100 text-gray-700 border-gray-200', icon: User },
};

const UserTable = ({ users, loading, actionLoading, onToggleStatus }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 bg-white rounded-3xl shadow-sm border border-gray-100">
        <Loader2 className="animate-spin text-purple-600" size={32} />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100 text-sm font-semibold text-gray-500 uppercase tracking-wider">
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">Người dùng</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Vai trò</th>
              <th className="px-6 py-4">Trạng thái</th>
              <th className="px-6 py-4 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((user) => {
              const role = ROLE_CONFIG[user.role] || ROLE_CONFIG.CANDIDATE;
              const RoleIcon = role.icon;
              const isEnabled = user.enabled;

              return (
                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4 text-sm text-gray-500 font-medium">#{user.id}</td>
                  
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center font-bold text-purple-700 shrink-0">
                        {user.username?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <span className="font-semibold text-gray-900">{user.username}</span>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>

                  <td className="px-6 py-4">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold ${role.color}`}>
                      <RoleIcon size={14} /> {role.label}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    {isEnabled ? (
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Hoạt động
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                        <span className="w-2 h-2 rounded-full bg-red-500"></span> Đã khóa
                      </div>
                    )}
                  </td>

                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => onToggleStatus(user.id, isEnabled)}
                        disabled={actionLoading === user.id || user.role === 'ADMIN'}
                        className={`p-2 rounded-lg transition ${
                          isEnabled ? 'text-gray-400 hover:text-red-600 hover:bg-red-50' : 'text-gray-400 hover:text-emerald-600 hover:bg-emerald-50'
                        }`} 
                        title={isEnabled ? "Khóa tài khoản" : "Mở khóa"}
                      >
                        {actionLoading === user.id ? <Loader2 size={18} className="animate-spin" /> : (isEnabled ? <Lock size={18} /> : <CheckCircle size={18} />)}
                      </button>
                      
                      <button className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition">
                        <MoreVertical size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
        <span className="text-sm text-gray-500 font-medium">Hiển thị {users.length} người dùng</span>
      </div>
    </div>
  );
};

export default UserTable;
// src/components/candidate/resume/ResumeCard.jsx
import React from "react";
import { FileText, Edit2, Trash2 } from "lucide-react";

const ResumeCard = ({ profile, onEdit, onDelete }) => {
  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group relative">
      <div className="flex justify-between items-start mb-4">
        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
          <FileText className="text-blue-600" size={24} />
        </div>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(profile)}
            className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
            title="Chỉnh sửa"
          >
            <Edit2 size={18} />
          </button>
          <button
            onClick={() => onDelete(profile.id)}
            className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
            title="Xóa hồ sơ"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <h4
        className="font-bold text-gray-900 text-lg truncate"
        title={profile.profileName}
      >
        {profile.profileName}
      </h4>
      <p className="text-gray-500 text-sm mt-1">
        Cập nhật:{" "}
        {profile.updatedAt
          ? new Date(profile.updatedAt).toLocaleDateString("vi-VN")
          : "Mới tạo"}
      </p>

      <button
        onClick={() => onEdit(profile)}
        className="w-full mt-6 py-2.5 bg-gray-50 text-gray-700 font-semibold rounded-xl hover:bg-blue-600 hover:text-white transition-colors"
      >
        Chỉnh sửa hồ sơ
      </button>
    </div>
  );
};

export default ResumeCard;
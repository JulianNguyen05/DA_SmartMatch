// frontend-app/src/components/employer/JobCard.jsx
import React from "react";
import { MapPin, Calendar, Users, Edit, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import StatusBadge from "../common/StatusBadge";

const JobCard = ({ job, onDelete }) => {
  const navigate = useNavigate();

  const handleEdit = () => {
    navigate(`/employer/jobs/${job.id}/edit`);
  };

  const handleDelete = () => {
    if (window.confirm("Bạn chắc chắn muốn xóa tin tuyển dụng này?")) {
      onDelete(job.id);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-3xl p-6 hover:shadow-xl transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-xl text-gray-900 line-clamp-2">{job.title}</h3>
          <p className="text-gray-500 flex items-center gap-1 mt-1">
            <MapPin size={16} />
            {job.location}
          </p>
        </div>
        <StatusBadge status={job.status} />
      </div>

      <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
        <div className="flex items-center gap-1">
          <Calendar size={16} />
          {job.deadline ? new Date(job.deadline).toLocaleDateString("vi-VN") : "Không có hạn"}
        </div>
        <div className="flex items-center gap-1">
          <Users size={16} />
          <span>{job.applicants || 0} ứng viên</span>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <button
          onClick={handleEdit}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
        >
          <Edit size={18} />
          Chỉnh sửa
        </button>
        <button
          onClick={handleDelete}
          className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium"
        >
          <Trash2 size={18} />
          Xóa
        </button>
      </div>
    </div>
  );
};

export default JobCard;
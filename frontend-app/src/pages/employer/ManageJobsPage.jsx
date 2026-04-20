// frontend-app/src/pages/employer/ManageJobsPage.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { PlusCircle } from "lucide-react";
import JobCard from "../../components/employer/JobCard";
import { jobService } from "../../services/jobService";

const ManageJobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    jobService
      .getMyJobs()
      .then(setJobs)
      .catch(() => alert("Không thể tải danh sách tin"))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa tin tuyển dụng này?")) return;

    try {
      await jobService.deleteJob(id);
      setJobs((prevJobs) => prevJobs.filter((j) => j.id !== id));
    } catch {
      // Bỏ tên biến err để tránh lỗi ESLint no-unused-vars
      alert("Không thể xóa tin này. Vui lòng thử lại!");
    }
  };

  if (loading)
    return <div className="text-center py-20">Đang tải danh sách tin...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Quản lý tin tuyển dụng</h1>
        <Link
          to="/employer/jobs/create"
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-semibold hover:bg-blue-700"
        >
          <PlusCircle size={22} /> Tạo tin mới
        </Link>
      </div>

      {jobs.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          Chưa có tin tuyển dụng nào
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageJobsPage;
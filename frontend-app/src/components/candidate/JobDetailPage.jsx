import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, DollarSign, Briefcase, Clock, ArrowLeft, Send, CheckCircle } from 'lucide-react';
import { jobService } from '../../services/jobService';
import ApplyModal from '../../components/candidate/ApplyModal';

const JobDetailPage = () => {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // State quản lý Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);

  useEffect(() => {
    const fetchJobDetail = async () => {
      try {
        const data = await jobService.getPublicJobById(id);
        setJob(data);
      } catch (error) {
        console.error("Lỗi khi tải chi tiết công việc:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchJobDetail();
  }, [id]);

  if (loading) return <div className="text-center py-20 text-gray-500">Đang tải thông tin...</div>;
  if (!job) return <div className="text-center py-20 text-red-500 font-bold">Không tìm thấy công việc!</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6 relative">
      <Link to="/candidate/jobs" className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 transition font-medium mb-4">
        <ArrowLeft size={18} /> Quay lại danh sách
      </Link>

      {/* Thông báo ứng tuyển thành công */}
      {applySuccess && (
        <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl border border-emerald-200 flex items-center gap-3 mb-6">
          <CheckCircle className="text-emerald-500" />
          <span className="font-semibold">Nộp đơn thành công! Nhà tuyển dụng sẽ sớm liên hệ với bạn.</span>
        </div>
      )}

      {/* Header Info */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{job.title}</h1>
          <div className="flex flex-wrap gap-4 text-sm text-gray-600 font-medium">
            <span className="flex items-center gap-1.5"><MapPin size={18} className="text-blue-500"/> {job.location}</span>
            <span className="flex items-center gap-1.5"><DollarSign size={18} className="text-emerald-500"/> {job.minSalary} - {job.maxSalary} {job.currency}</span>
            <span className="flex items-center gap-1.5"><Briefcase size={18} className="text-purple-500"/> {job.experienceLevel}</span>
            <span className="flex items-center gap-1.5"><Clock size={18} className="text-orange-500"/> Hạn nộp: {new Date(job.deadline).toLocaleDateString('vi-VN')}</span>
          </div>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          disabled={applySuccess}
          className="w-full md:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition shadow-lg shadow-blue-200"
        >
          {applySuccess ? 'Đã ứng tuyển' : <><Send size={20} /> Ứng tuyển ngay</>}
        </button>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-8">
        <section>
          <h3 className="text-xl font-bold text-gray-900 mb-4">Mô tả công việc</h3>
          <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{job.description}</p>
        </section>

        <div className="h-px w-full bg-gray-100"></div>

        <section>
          <h3 className="text-xl font-bold text-gray-900 mb-4">Yêu cầu ứng viên</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            {job.requirements?.length > 0 
              ? job.requirements.map((req, idx) => <li key={idx}>{req}</li>)
              : <p>Chưa cập nhật yêu cầu cụ thể.</p>}
          </ul>
        </section>

        <div className="h-px w-full bg-gray-100"></div>

        <section>
          <h3 className="text-xl font-bold text-gray-900 mb-4">Quyền lợi</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            {job.benefits?.length > 0 
              ? job.benefits.map((ben, idx) => <li key={idx}>{ben}</li>)
              : <p>Chưa cập nhật quyền lợi.</p>}
          </ul>
        </section>
      </div>

      {/* Render Modal Ứng tuyển */}
      <ApplyModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        job={job}
        onSuccess={() => setApplySuccess(true)}
      />
    </div>
  );
};

export default JobDetailPage;
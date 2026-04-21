import React, { useState, useEffect } from 'react';
import { applicationService } from '../../services/applicationService';
import { Building2, Clock, CheckCircle, XCircle, Eye, Calendar, FileText, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';

// Cấu hình UI cho từng trạng thái đơn ứng tuyển (Khớp với Enum Backend)
const STATUS_CONFIG = {
  PENDING: { label: 'Chờ duyệt', color: 'bg-yellow-50 text-yellow-700 border-yellow-200', icon: Clock },
  REVIEWED: { label: 'Đã xem CV', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: Eye },
  INTERVIEWING: { label: 'Phỏng vấn', color: 'bg-purple-50 text-purple-700 border-purple-200', icon: Calendar },
  OFFERED: { label: 'Đề nghị NV', color: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: Briefcase },
  HIRED: { label: 'Trúng tuyển', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle },
  REJECTED: { label: 'Từ chối', color: 'bg-red-50 text-red-700 border-red-200', icon: XCircle }
};

const CandidateApplicationsPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const data = await applicationService.getMyApplications();
      setApplications(data);
    } catch (error) {
      console.error("Lỗi khi tải đơn ứng tuyển:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-500">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 font-medium">Đang tải danh sách...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 sm:p-10 text-white shadow-lg flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <FileText size={32} /> Quản lý đơn ứng tuyển
          </h1>
          <p className="text-blue-100 text-lg">Theo dõi trạng thái các công việc bạn đã nộp CV.</p>
        </div>
        <div className="hidden md:flex bg-white/20 p-4 rounded-2xl backdrop-blur-sm text-center">
          <div>
            <div className="text-3xl font-bold">{applications.length}</div>
            <div className="text-sm text-blue-100">Việc đã nộp</div>
          </div>
        </div>
      </div>

      {applications.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl shadow-sm border border-gray-100 text-center">
          <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Briefcase className="text-blue-400" size={40} />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Bạn chưa nộp đơn ứng tuyển nào</h3>
          <p className="text-gray-500 mb-6">Hãy khám phá các cơ hội việc làm và nộp CV ngay nhé!</p>
          <Link to="/candidate/jobs" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition">
            Tìm việc ngay
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {applications.map((app) => {
            const config = STATUS_CONFIG[app.status] || STATUS_CONFIG.PENDING;
            const StatusIcon = config.icon;

            return (
              <div key={app.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <Link to={`/candidate/jobs/${app.jobId}`} className="text-xl font-bold text-gray-900 hover:text-blue-600 transition line-clamp-2 pr-4">
                      {app.jobTitle}
                    </Link>
                    <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border whitespace-nowrap ${config.color}`}>
                      <StatusIcon size={16} />
                      {config.label}
                    </span>
                  </div>

                  <div className="space-y-2 text-gray-600 text-sm">
                    <div className="flex items-center gap-2">
                      <Building2 size={16} className="text-gray-400" />
                      <span className="font-medium">{app.companyName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-gray-400" />
                      <span>Ngày nộp: {new Date(app.appliedAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </div>
                  
                  {app.coverLetter && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100 text-sm text-gray-600 line-clamp-2 italic">
                      "{app.coverLetter}"
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CandidateApplicationsPage;
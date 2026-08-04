import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  MapPin, DollarSign, Briefcase, Clock, Calendar, 
  Building2, Send, Heart, CheckCircle2, AlertCircle, Loader2
} from 'lucide-react';
import DOMPurify from 'dompurify';

import jobService from '../../../features/job/jobService';
import authService from '../../../features/auth/authService';
import applicationService from '../../../features/application/applicationService';
import candidateService from '../../../features/candidate/candidateService';
import Button from '../../../components/common/Button';
import Modal from '../../../components/common/Modal';
import Toast from '../../../components/common/Toast';

export default function JobDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [job, setJob] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // State ứng tuyển
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [cvList, setCvList] = useState([]);
  const [selectedCvId, setSelectedCvId] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: null, message: '' });
  const [isSaved, setIsSaved] = useState(false); // State cho nút Lưu tin

  useEffect(() => {
    fetchJobDetail();
    // Ẩn Toast sau 3 giây
    if (statusMsg.message) {
      const timer = setTimeout(() => setStatusMsg({ type: null, message: '' }), 3000);
      return () => clearTimeout(timer);
    }
  }, [id, statusMsg.message]);

  const fetchJobDetail = async () => {
    try {
      const res = await jobService.getJobDetail(id);
      setJob(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenApplyModal = async () => {
    const user = authService.getCurrentUser();
    if (!user || user.role !== 'CANDIDATE') {
      setStatusMsg({ type: 'error', message: 'Vui lòng đăng nhập tài khoản Ứng viên để ứng tuyển!' });
      setTimeout(() => navigate('/auth/login'), 1500);
      return;
    }

    try {
      const res = await candidateService.getMyCVs(user.userId);
      setCvList(res.data || []);
      setIsApplyModalOpen(true);
    } catch (err) {
      setStatusMsg({ type: 'error', message: 'Không thể tải danh sách CV của bạn.' });
    }
  };

  const handleApply = async () => {
    if (!selectedCvId) {
      setStatusMsg({ type: 'error', message: 'Vui lòng chọn 1 CV để ứng tuyển!' });
      return;
    }

    setIsApplying(true);
    try {
      const user = authService.getCurrentUser();
      await applicationService.submitApplication(user.userId, {
        jobId: job.id,
        cvId: selectedCvId,
        coverLetter: coverLetter
      });
      setStatusMsg({ type: 'success', message: '🎉 Đã nộp hồ sơ ứng tuyển thành công!' });
      setIsApplyModalOpen(false);
    } catch (err) {
      setStatusMsg({ type: 'error', message: 'Ứng tuyển thất bại. Bạn có thể đã nộp đơn cho vị trí này rồi.' });
    } finally {
      setIsApplying(false);
    }
  };

  const toggleSaveJob = () => {
    setIsSaved(!isSaved);
    setStatusMsg({ type: 'success', message: isSaved ? 'Đã bỏ lưu tin.' : 'Đã lưu tin tuyển dụng!' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-blue-600">
        <Loader2 className="w-12 h-12 animate-spin mb-4" />
        <p className="font-medium text-gray-500">Đang tải chi tiết công việc...</p>
      </div>
    );
  }

  if (!job) return <div className="text-center py-20 text-xl font-bold text-gray-600">Không tìm thấy công việc này!</div>;

  // Render nội dung HTML từ RichTextEditor một cách an toàn (loại bỏ script/thẻ nguy hiểm).
  // Chỉ cho phép các thẻ cơ bản mà RichTextEditor (TipTap StarterKit) có thể sinh ra.
  const renderHtml = (html) => ({
    __html: DOMPurify.sanitize(html || '', {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li'],
    }),
  });

  // =================================================================
  // ĐÃ CẬP NHẬT: XỬ LÝ ĐỒNG BỘ JSON (HỖ TRỢ ĐA DẠNG CẤU TRÚC BACKEND)
  // =================================================================
  const actualCompanyName = 
    job.company?.companyName || 
    job.company?.name || 
    job.companyName || 
    job.company_name || 
    `Công ty ID: ${job.companyId || job.company_id}`;

  const actualLogoUrl = 
    job.company?.logoUrl || 
    job.company?.logo_url || 
    job.companyLogo || 
    job.company_logo || 
    job.logoUrl || 
    job.logo_url;

  const actualSalaryRange = job.salaryRange || job.salary_range;
  const actualCreatedAt = job.createdAt || job.created_at;

  let displayLogo = null;
  if (actualLogoUrl) {
    displayLogo = actualLogoUrl.startsWith('http') 
      ? actualLogoUrl 
      : `http://localhost:8080${actualLogoUrl.startsWith('/') ? '' : '/'}${actualLogoUrl}`;
  }

  return (
    <div className="bg-slate-50 min-h-screen pb-20 font-sans">
      {statusMsg.type && (
        <div className="fixed top-24 right-8 z-50">
          <Toast type={statusMsg.type} message={statusMsg.message} />
        </div>
      )}

      {/* ================= HERO SECTION (HEADER) ================= */}
      <div className="bg-white border-b border-gray-200 pt-8 pb-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex gap-6 items-center w-full lg:w-2/3">
            {/* KHUNG HIỂN THỊ LOGO */}
            <div className="w-24 h-24 shrink-0 bg-white border border-gray-100 rounded-2xl shadow-sm flex items-center justify-center p-2 overflow-hidden">
              {displayLogo ? (
                <img 
                  src={displayLogo} 
                  alt={actualCompanyName} 
                  className="w-full h-full object-contain" 
                  onError={(e) => { 
                    e.target.onerror = null; 
                    e.target.src = 'https://via.placeholder.com/150?text=Logo'; 
                  }}
                />
              ) : (
                <Building2 className="w-10 h-10 text-gray-300" />
              )}
            </div>
            {/* Title & Tags */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 leading-tight">{job.title}</h1>
              <p className="text-lg text-blue-700 font-semibold mb-4 hover:underline cursor-pointer">{actualCompanyName}</p>
              <div className="flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-50 text-green-700 text-sm font-medium border border-green-200">
                  <DollarSign className="w-4 h-4" /> {actualSalaryRange || 'Thỏa thuận'}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 text-sm font-medium border border-gray-200">
                  <MapPin className="w-4 h-4" /> {job.location || 'Chưa cập nhật'}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="w-full lg:w-1/3 flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <Button 
              onClick={handleOpenApplyModal} 
              className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg rounded-xl shadow-md shadow-blue-200 flex items-center justify-center gap-2"
            >
              <Send className="w-5 h-5" /> Ứng tuyển ngay
            </Button>
            <Button 
              onClick={toggleSaveJob}
              variant="outline" 
              className={`w-full h-12 font-semibold rounded-xl flex items-center justify-center gap-2 ${isSaved ? 'text-rose-600 border-rose-200 bg-rose-50' : 'text-gray-600 border-gray-300 bg-white hover:bg-gray-50'}`}
            >
              <Heart className={`w-5 h-5 ${isSaved ? 'fill-rose-500' : ''}`} /> 
              {isSaved ? 'Đã lưu tin' : 'Lưu tin này'}
            </Button>
          </div>
        </div>
      </div>

      {/* ================= MAIN CONTENT ================= */}
      <div className="max-w-6xl mx-auto px-4 mt-8 flex flex-col lg:flex-row gap-8">
        
        {/* CỘT TRÁI: Chi tiết công việc */}
        <div className="w-full lg:w-2/3 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-100 pb-4 mb-6 flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-blue-600" /> Chi tiết tin tuyển dụng
            </h2>
            
            <div className="space-y-8">
              {/* Mô tả */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-3">Mô tả công việc</h3>
                <div
                  className="text-gray-600 leading-relaxed prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={renderHtml(job.description)}
                />
              </div>

              {/* Yêu cầu */}
              {job.requirements && (
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-3">Yêu cầu ứng viên</h3>
                  <div
                    className="text-gray-600 leading-relaxed prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={renderHtml(job.requirements)}
                  />
                </div>
              )}
            </div>
          </div>
          
          {/* Cảnh báo an toàn */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800 leading-relaxed">
              <strong>Báo cáo gian lận:</strong> Worklify không bao giờ yêu cầu ứng viên nộp phí. Nếu bạn thấy có dấu hiệu lừa đảo, vui lòng cảnh giác và báo cáo ngay cho chúng tôi.
            </p>
          </div>
        </div>

        {/* CỘT PHẢI: Tóm tắt & Thông tin chung */}
        <div className="w-full lg:w-1/3 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Tổng quan công việc</h3>
            
            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Hình thức làm việc</p>
                  <p className="font-semibold text-gray-800">{job.workType === 'FULL_TIME' ? 'Toàn thời gian' : job.workType === 'PART_TIME' ? 'Bán thời gian' : job.workType}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Hạn nộp hồ sơ</p>
                  <p className="font-semibold text-gray-800">
                    {job.expiresAt ? new Date(job.expiresAt).toLocaleDateString('vi-VN') : 'Đang mở'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Ngày đăng tin</p>
                  <p className="font-semibold text-gray-800">
                    {actualCreatedAt ? new Date(actualCreatedAt).toLocaleDateString('vi-VN') : 'Mới đây'}
                  </p>
                </div>
              </div>
            </div>
            
            <hr className="my-6 border-gray-100" />
            
            {/* Thông tin cty nhỏ */}
            <div className="text-center">
               <p className="text-sm text-gray-500 mb-2">Được đăng bởi</p>
               <h4 className="font-bold text-gray-800">{actualCompanyName}</h4>
               <Button variant="link" className="text-blue-600 text-sm mt-1" onClick={() => navigate(`/companies/${job.companyId || job.company_id || job.company?.id}`)}>Xem trang công ty &rarr;</Button>
            </div>
          </div>
        </div>
      </div>

      {/* ================= MODAL ỨNG TUYỂN ================= */}
      <Modal isOpen={isApplyModalOpen} onClose={() => setIsApplyModalOpen(false)} title="Ứng tuyển công việc này">
        <div className="p-2 space-y-6">
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800">
              Bạn đang ứng tuyển vị trí <span className="font-bold">{job.title}</span> tại <span className="font-bold">{actualCompanyName}</span>.
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700">Chọn CV của bạn <span className="text-red-500">*</span></label>
            <select 
              className="w-full border border-gray-300 p-3.5 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-700 bg-white" 
              onChange={(e) => setSelectedCvId(e.target.value)}
              value={selectedCvId}
            >
              <option value="" disabled>-- Vui lòng chọn CV --</option>
              {cvList.map(cv => (
                <option key={cv.id} value={cv.id}>
                  {cv.fileName || `CV tạo hệ thống (${new Date(cv.createdAt).toLocaleDateString('vi-VN')})`}
                </option>
              ))}
            </select>
            {cvList.length === 0 && (
              <p className="text-sm text-rose-500 mt-1">Bạn chưa có CV nào. Hãy vào trang cá nhân để Upload hoặc tạo CV nhé.</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700">Thư giới thiệu (Cover Letter)</label>
            <textarea 
              className="w-full border border-gray-300 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-700 bg-white resize-none h-32 placeholder-gray-400" 
              placeholder="Viết vài lời giới thiệu điểm mạnh của bạn để thu hút nhà tuyển dụng..."
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsApplyModalOpen(false)} className="rounded-xl px-6">
              Hủy
            </Button>
            <Button onClick={handleApply} isLoading={isApplying} disabled={cvList.length === 0} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-8 flex items-center gap-2">
              <Send className="w-4 h-4" /> Gửi hồ sơ
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

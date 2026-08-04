import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import employerService from '../../../features/employer/employerService';
import authService from '../../../features/auth/authService';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import Toast from '../../../components/common/Toast';
import RichTextEditor from '../../../components/common/RichTextEditor';

// Loại bỏ thẻ HTML để kiểm tra rỗng — dùng cho validate vì
// RichTextEditor lưu HTML nên input required native không còn tác dụng
const stripHtml = (html) => html?.replace(/<[^>]*>/g, '').trim() || '';

export default function JobCreatePage() {
  const navigate = useNavigate();
  const [companyId, setCompanyId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    salaryRange: '',
    workType: 'FULL_TIME',
    expiresAt: '',
    description: '',
    requirements: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState({ type: null, message: '' });

  useEffect(() => {
    let isMounted = true;
    const fetchCompanyData = async () => {
      const user = authService.getCurrentUser();
      if (!user?.userId) {
        navigate('/auth/login');
        return;
      }
      try {
        const profile = await employerService.getCompanyProfile(user.userId);
        if (isMounted) {
          if (profile?.data?.id) {
            setCompanyId(profile.data.id);
          } else {
            handleMissingProfile();
          }
        }
      } catch (error) {
        if (isMounted) handleMissingProfile();
      } finally {
        if (isMounted) setIsPageLoading(false);
      }
    };
    fetchCompanyData();
    return () => { isMounted = false; };
  }, [navigate]);

  const handleMissingProfile = () => {
    setStatusMsg({ type: 'error', message: 'Bạn cần tạo Hồ sơ Doanh nghiệp trước khi đăng tin!' });
    setTimeout(() => navigate('/employer/profile'), 3000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!companyId) return setStatusMsg({ type: 'error', message: 'Thông tin doanh nghiệp chưa hợp lệ.' });

    // Validate thủ công cho 2 field rich text (không còn dựa vào <textarea required>)
    if (!stripHtml(formData.description)) {
      return setStatusMsg({ type: 'error', message: 'Mô tả công việc không được để trống.' });
    }
    if (!stripHtml(formData.requirements)) {
      return setStatusMsg({ type: 'error', message: 'Yêu cầu công việc không được để trống.' });
    }

    setIsLoading(true);
    setStatusMsg({ type: null, message: '' });
    
    try {
      const submitData = { ...formData };
      if (submitData.expiresAt) {
        submitData.expiresAt = submitData.expiresAt.length === 16 
          ? `${submitData.expiresAt}:00` 
          : submitData.expiresAt;
      }
      await employerService.createJobPosting(companyId, submitData);
      setStatusMsg({ type: 'success', message: 'Đăng tin thành công! Tin đang chờ Admin kiểm duyệt.' });
      setTimeout(() => navigate('/employer/jobs'), 2000);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Lỗi khi đăng tin. Vui lòng kiểm tra lại hệ thống.';
      setStatusMsg({ type: 'error', message: errorMsg });
    } finally {
      setIsLoading(false);
    }
  };

  // Class dùng chung cho các input field để đồng nhất UI
  const inputClassName = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200 bg-gray-50/50 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 text-gray-700 placeholder-gray-400";

  return (
    <div className="min-h-screen bg-gray-50/30 py-8 px-4 sm:px-6 lg:px-8">
      <div className="bg-white p-6 sm:p-10 rounded-2xl shadow-xl shadow-gray-200/40 border border-gray-100 max-w-4xl mx-auto transition-all">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Đăng tin tuyển dụng mới</h2>
            <p className="text-sm text-gray-500 mt-1.5 flex items-center gap-1.5">
              <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Tin đăng sẽ được đưa vào hàng đợi kiểm duyệt trước khi hiển thị.
            </p>
          </div>
          <button 
            onClick={() => navigate('/employer/jobs')} 
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors bg-gray-50 hover:bg-indigo-50 px-4 py-2 rounded-lg"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Quay lại
          </button>
        </div>
        
        {statusMsg.type && <div className="mb-8"><Toast type={statusMsg.type} message={statusMsg.message} /></div>}

        {isPageLoading ? (
          /* Hiệu ứng Skeleton Loading */
          <div className="animate-pulse space-y-8">
            <div className="h-12 bg-gray-100 rounded-xl w-full"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-12 bg-gray-100 rounded-xl"></div>
              <div className="h-12 bg-gray-100 rounded-xl"></div>
            </div>
            <div className="h-32 bg-gray-100 rounded-xl w-full"></div>
            <div className="h-32 bg-gray-100 rounded-xl w-full"></div>
          </div>
        ) : companyId ? (
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Nhóm 1: Thông tin cơ bản */}
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b pb-2">1. Thông tin chung</h3>
              
              <Input 
                label="Tiêu đề công việc" 
                name="title" 
                value={formData.title} 
                onChange={handleChange} 
                required 
                maxLength={255}
                placeholder="VD: Senior ReactJS Developer" 
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input 
                  label="Địa điểm làm việc" 
                  name="location" 
                  value={formData.location} 
                  onChange={handleChange} 
                  required 
                  maxLength={255}
                  placeholder="VD: Tòa nhà AB, Quận 1, TP.HCM" 
                />
                <Input 
                  label="Mức lương (Tùy chọn)" 
                  name="salaryRange" 
                  value={formData.salaryRange} 
                  onChange={handleChange} 
                  maxLength={100}
                  placeholder="VD: 15,000,000 - 25,000,000 VND" 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-700">Hình thức làm việc</label>
                  <select 
                    name="workType" 
                    value={formData.workType} 
                    onChange={handleChange} 
                    required
                    className={inputClassName}
                  >
                    <option value="FULL_TIME">Toàn thời gian (Full-time)</option>
                    <option value="PART_TIME">Bán thời gian (Part-time)</option>
                    <option value="INTERNSHIP">Thực tập sinh (Internship)</option>
                    <option value="REMOTE">Làm việc từ xa (Remote)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-700">Hạn nộp hồ sơ <span className="text-red-500">*</span></label>
                  <input 
                    type="datetime-local" 
                    name="expiresAt" 
                    value={formData.expiresAt} 
                    onChange={handleChange} 
                    required
                    className={inputClassName}
                  />
                </div>
              </div>
            </div>

            {/* Nhóm 2: Chi tiết & Yêu cầu */}
            <div className="space-y-6 pt-4">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b pb-2">2. Chi tiết công việc</h3>
              
              <RichTextEditor
                label="Mô tả công việc (Job Description)"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                placeholder="Mô tả chi tiết các công việc, nhiệm vụ hàng ngày ứng viên cần thực hiện..."
              />

              <RichTextEditor
                label="Yêu cầu ứng viên (Requirements)"
                name="requirements"
                value={formData.requirements}
                onChange={handleChange}
                required
                placeholder="- Tốt nghiệp chuyên ngành CNTT&#10;- Có kinh nghiệm 2 năm với ReactJS&#10;- Kỹ năng làm việc nhóm tốt..."
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end pt-8 border-t border-gray-100">
              <Button 
                type="submit" 
                isLoading={isLoading}
                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-200 transition-all font-semibold"
              >
                Gửi Yêu Cầu Kiểm Duyệt
              </Button>
            </div>
            
          </form>
        ) : (
          <div className="py-20 text-center text-gray-500 font-medium">
            Không tìm thấy thông tin doanh nghiệp.
          </div>
        )}
      </div>
    </div>
  );
}

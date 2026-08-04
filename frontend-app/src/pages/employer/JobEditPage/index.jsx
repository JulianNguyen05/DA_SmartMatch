import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import employerService from '../../../features/employer/employerService';
import authService from '../../../features/auth/authService';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import Toast from '../../../components/common/Toast';
import RichTextEditor from '../../../components/common/RichTextEditor';

// Loại bỏ thẻ HTML để kiểm tra rỗng — dùng cho validate vì
// RichTextEditor lưu HTML nên input required native không còn tác dụng
const stripHtml = (html) => html?.replace(/<[^>]*>/g, '').trim() || '';

export default function JobEditPage() {
  const { id } = useParams(); 
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
  const [isFetching, setIsFetching] = useState(true); // Đang kéo dữ liệu cũ từ DB
  const [statusMsg, setStatusMsg] = useState({ type: null, message: '' });

  useEffect(() => {
    let isMounted = true;

    const initEditPage = async () => {
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
            // Kéo chi tiết bài đăng sau khi xác thực doanh nghiệp thành công
            await loadJobDetail();
          } else {
            handleMissingProfile();
          }
        }
      } catch (error) {
        if (isMounted) handleMissingProfile();
      } finally {
        if (isMounted) setIsFetching(false);
      }
    };

    const loadJobDetail = async () => {
      try {
        const response = await employerService.getJobDetail(id);
        if (isMounted && response?.data) {
          const jobData = response.data;
          
          // Định dạng LocalDateTime (YYYY-MM-DDThh:mm:ss) sang (YYYY-MM-DDThh:mm) cho ô datetime-local
          if (jobData.expiresAt) {
            jobData.expiresAt = jobData.expiresAt.substring(0, 16);
          }

          setFormData({
            title: jobData.title || '',
            location: jobData.location || '',
            salaryRange: jobData.salaryRange || '',
            workType: jobData.workType || 'FULL_TIME',
            expiresAt: jobData.expiresAt || '',
            description: jobData.description || '',
            requirements: jobData.requirements || ''
          });
        } else if (isMounted) {
          setStatusMsg({ type: 'error', message: 'Không tìm thấy dữ liệu tin tuyển dụng này.' });
        }
      } catch (error) {
        if (isMounted) {
          setStatusMsg({ type: 'error', message: 'Không thể tải chi tiết tin tuyển dụng từ hệ thống.' });
        }
      }
    };

    initEditPage();
    return () => { isMounted = false; };
  }, [id, navigate]);

  const handleMissingProfile = () => {
    setStatusMsg({ type: 'error', message: 'Không tìm thấy Hồ sơ Doanh nghiệp của bạn!' });
    setTimeout(() => navigate('/employer/profile'), 3000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.expiresAt) return setStatusMsg({ type: 'error', message: 'Vui lòng chọn Hạn nộp hồ sơ!' });

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
      if (submitData.expiresAt && submitData.expiresAt.length === 16) {
        submitData.expiresAt = `${submitData.expiresAt}:00`;
      }

      await employerService.updateJobPosting(companyId, id, submitData);
      setStatusMsg({ type: 'success', message: 'Cập nhật tin tuyển dụng thành công!' });
      setTimeout(() => navigate('/employer/jobs'), 2000);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Có lỗi xảy ra khi lưu thông tin. Vui lòng thử lại.';
      setStatusMsg({ type: 'error', message: errorMsg });
    } finally {
      setIsLoading(false);
    }
  };

  // Class dùng chung cho các input field để đồng nhất UI toàn hệ thống
  const inputClassName = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200 bg-gray-50/50 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 text-gray-700 placeholder-gray-400";

  return (
    <div className="min-h-screen bg-gray-50/30 py-8 px-4 sm:px-6 lg:px-8">
      <div className="bg-white p-6 sm:p-10 rounded-2xl shadow-xl shadow-gray-200/40 border border-gray-100 max-w-4xl mx-auto transition-all">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Chỉnh sửa tin tuyển dụng</h2>
            <p className="text-sm text-gray-500 mt-1.5 flex items-center gap-1.5">
              <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Cập nhật lại nội dung chính xác để thu hút ứng viên nộp hồ sơ.
            </p>
          </div>
          <button 
            onClick={() => navigate('/employer/jobs')} 
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors bg-gray-50 hover:bg-indigo-50 px-4 py-2 rounded-lg"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Quay lại danh sách
          </button>
        </div>
        
        {statusMsg.type && <div className="mb-8"><Toast type={statusMsg.type} message={statusMsg.message} /></div>}

        {isFetching ? (
          /* Hiệu ứng Skeleton Loading cao cấp lúc đang đợi nạp dữ liệu cũ */
          <div className="animate-pulse space-y-8">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-12 bg-gray-100 rounded-xl w-full"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-12 bg-gray-100 rounded-xl"></div>
              <div className="h-12 bg-gray-100 rounded-xl"></div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-1/4 pt-4"></div>
            <div className="h-32 bg-gray-100 rounded-xl w-full"></div>
            <div className="h-32 bg-gray-100 rounded-xl w-full"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Nhóm 1: Thông tin chung */}
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b pb-2">1. Thông tin chung</h3>
              
              <Input 
                label="Tiêu đề công việc" 
                name="title" 
                value={formData.title} 
                onChange={handleChange} 
                required 
                maxLength={255} // Khớp cấu trúc DB VARCHAR(255)
                placeholder="VD: Senior ReactJS Developer" 
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input 
                  label="Địa điểm làm việc" 
                  name="location" 
                  value={formData.location} 
                  onChange={handleChange} 
                  required 
                  maxLength={255} // Khớp cấu trúc DB VARCHAR(255)
                  placeholder="VD: Tòa nhà AB, Quận 1, TP.HCM" 
                />
                <Input 
                  label="Mức lương (Tùy chọn)" 
                  name="salaryRange" 
                  value={formData.salaryRange} 
                  onChange={handleChange} 
                  maxLength={100} // Khớp cấu trúc DB VARCHAR(100)
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

            {/* Nhóm 2: Chi tiết tin đăng */}
            <div className="space-y-6 pt-4">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b pb-2">2. Chi tiết tuyển dụng</h3>
              
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
                placeholder="- Tốt nghiệp chuyên ngành CNTT hoặc liên quan&#10;- Có kinh nghiệm làm việc ở vị trí tương đương&#10;- Kỹ năng giao tiếp và làm việc nhóm tốt..."
              />
            </div>

            {/* Bottom Actions Form */}
            <div className="flex justify-end pt-8 border-t border-gray-100 gap-4">
              <button 
                type="button" 
                onClick={() => navigate('/employer/jobs')}
                className="px-6 py-3 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all"
                disabled={isLoading}
              >
                Hủy bỏ
              </button>
              <Button 
                type="submit" 
                isLoading={isLoading}
                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-200 transition-all font-semibold"
              >
                Lưu thay đổi
              </Button>
            </div>
            
          </form>
        )}
      </div>
    </div>
  );
}

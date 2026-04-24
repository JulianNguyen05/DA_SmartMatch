// frontend-app/src/components/candidate/ApplyModal.jsx
import React, { useState, useEffect } from 'react';
import { X, UploadCloud, Loader2 } from 'lucide-react';
import { applicationService } from '../../services/applicationService';
import { candidateService } from '../../services/candidateService';

const ApplyModal = ({ isOpen, onClose, job, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Các state mới cho Form động
  const [formTemplate, setFormTemplate] = useState([]);
  const [dynamicAnswers, setDynamicAnswers] = useState({});

  // Logic: Tự động đọc Template và điền dữ liệu từ Profile
  useEffect(() => {
    if (isOpen && job) {
      // 1. Phân tích Template từ tin tuyển dụng
      const template = job.customFormTemplate ? JSON.parse(job.customFormTemplate) : [];
      setFormTemplate(template);

      // 2. Tải Profile ứng viên để Auto-fill
      candidateService.getMyProfile()
        .then(profile => {
          const initialAnswers = {};
          template.forEach(field => {
            // Nếu field có autoFillKey khớp với thông tin trong Profile thì tự điền
            if (field.autoFillKey && profile[field.autoFillKey]) {
              initialAnswers[field.id] = profile[field.autoFillKey];
            } else {
              initialAnswers[field.id] = '';
            }
          });
          setDynamicAnswers(initialAnswers);
        })
        .catch(() => {
          // Nếu chưa có profile thì để trống các trường
          const blankAnswers = {};
          template.forEach(field => blankAnswers[field.id] = '');
          setDynamicAnswers(blankAnswers);
        });
    }
  }, [isOpen, job]);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.size > 5 * 1024 * 1024) {
      setError('File CV không được vượt quá 5MB');
      setFile(null);
      return;
    }
    setFile(selectedFile);
    setError('');
  };

  const handleDynamicInputChange = (id, value) => {
    setDynamicAnswers(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Vui lòng đính kèm CV của bạn!');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('jobId', job.id);
      formData.append('coverLetter', coverLetter);
      formData.append('cvFile', file);
      
      // Đóng gói các câu trả lời form động thành chuỗi JSON
      formData.append('customAnswers', JSON.stringify(dynamicAnswers));

      await applicationService.applyJob(formData);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Đã có lỗi xảy ra khi nộp đơn.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Ứng tuyển vị trí</h2>
            <p className="text-blue-600 font-medium">{job?.title}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={24} className="text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          {/* Phần Render Form Động từ Nhà tuyển dụng */}
          {formTemplate.length > 0 && (
            <div className="space-y-4 p-5 bg-blue-50/50 rounded-2xl border border-blue-100">
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Thông tin yêu cầu</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formTemplate.map((field) => (
                  <div key={field.id} className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 ml-1">
                      {field.label} {field.required && <span className="text-red-500">*</span>}
                    </label>
                    <input
                      type="text"
                      value={dynamicAnswers[field.id] || ''}
                      onChange={(e) => handleDynamicInputChange(field.id, e.target.value)}
                      required={field.required}
                      placeholder={`Nhập ${field.label.toLowerCase()}...`}
                      className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload CV */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 ml-1">Hồ sơ ứng tuyển (CV) *</label>
            <div className="relative group">
              <input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.docx"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition-all ${file ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-gray-50 group-hover:border-blue-400 group-hover:bg-blue-50'}`}>
                <UploadCloud size={40} className={file ? 'text-green-500' : 'text-gray-400'} />
                <p className="mt-2 text-sm font-medium text-gray-600">
                  {file ? file.name : 'Nhấn hoặc kéo thả file CV vào đây'}
                </p>
                <p className="text-xs text-gray-400 mt-1">Hỗ trợ PDF, DOCX (Tối đa 5MB)</p>
              </div>
            </div>
          </div>

          {/* Cover Letter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 ml-1">Thư giới thiệu (Cover Letter)</label>
            <textarea 
              rows="4" 
              placeholder="Chia sẻ lý do bạn phù hợp với vị trí này..."
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-6 py-3 rounded-xl font-medium text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Hủy
            </button>
            <button 
              type="submit" 
              disabled={submitting}
              className="flex items-center gap-2 bg-blue-600 text-white px-10 py-3 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-70 shadow-lg shadow-blue-200 transition-all active:scale-95"
            >
              {submitting ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Đang xử lý...
                </>
              ) : (
                'Nộp đơn ngay'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplyModal;
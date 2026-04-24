// frontend-app/src/components/candidate/ApplyModal.jsx
import React, { useState, useEffect } from 'react';
import { X, UploadCloud, Loader2, UserCircle } from 'lucide-react';
import { applicationService } from '../../services/applicationService';
import { candidateService } from '../../services/candidateService';

const ApplyModal = ({ isOpen, onClose, job, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // States quản lý danh sách Profile và Form động
  const [profiles, setProfiles] = useState([]); // Danh sách tất cả profile của user
  const [selectedProfileId, setSelectedProfileId] = useState(''); // ID profile đang chọn để auto-fill
  const [formTemplate, setFormTemplate] = useState([]);
  const [dynamicAnswers, setDynamicAnswers] = useState({});

  // 1. Khởi tạo template và lấy danh sách Profile khi mở Modal
  useEffect(() => {
    if (isOpen && job) {
      // Phân tích Template từ tin tuyển dụng
      const template = job.customFormTemplate ? JSON.parse(job.customFormTemplate) : [];
      setFormTemplate(template);

      // Lấy danh sách tất cả profile của ứng viên
      candidateService.getMyProfiles()
        .then(data => {
          const profileList = Array.isArray(data) ? data : data.content || [];
          setProfiles(profileList);
          
          // Nếu có profile, mặc định chọn cái đầu tiên để auto-fill
          if (profileList.length > 0) {
            setSelectedProfileId(profileList[0].id);
            autoFillFromProfile(profileList[0], template);
          } else {
            // Nếu không có profile nào, khởi tạo answers trống
            const blankAnswers = {};
            template.forEach(field => blankAnswers[field.id] = '');
            setDynamicAnswers(blankAnswers);
          }
        })
        .catch(err => console.error("Lỗi lấy danh sách profiles:", err));
    }
  }, [isOpen, job]);

  // 2. Logic Auto-fill: Map dữ liệu từ profile vào template
  const autoFillFromProfile = (profile, template) => {
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
  };

  // 3. Xử lý khi ứng viên thay đổi lựa chọn Profile trong Dropdown
  const handleProfileChange = (e) => {
    const profileId = e.target.value;
    setSelectedProfileId(profileId);
    const selectedProfile = profiles.find(p => p.id === parseInt(profileId));
    if (selectedProfile) {
      autoFillFromProfile(selectedProfile, formTemplate);
    }
  };

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

          {/* CHỌN HỒ SƠ ĐỂ AUTO-FILL */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 ml-1">
              <UserCircle size={18} className="text-blue-500" />
              Chọn hồ sơ của bạn để tự động điền
            </label>
            <select
              value={selectedProfileId}
              onChange={handleProfileChange}
              className="w-full p-3 bg-blue-50 border border-blue-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium text-blue-800 transition-all"
            >
              {profiles.length > 0 ? (
                profiles.map(p => (
                  <option key={p.id} value={p.id}>{p.profileName}</option>
                ))
              ) : (
                <option value="">Bạn chưa có hồ sơ trực tuyến nào</option>
              )}
            </select>
          </div>

          {/* PHẦN RENDER FORM ĐỘNG */}
          {formTemplate.length > 0 && (
            <div className="space-y-4 p-5 bg-gray-50 rounded-2xl border border-gray-100">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Thông tin yêu cầu từ nhà tuyển dụng</h3>
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

          {/* UPLOAD CV */}
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

          {/* COVER LETTER */}
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
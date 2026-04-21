import React, { useState } from 'react';
import { X, UploadCloud, Send, Loader2 } from 'lucide-react';
import { applicationService } from '../../services/applicationService';

const ApplyModal = ({ isOpen, onClose, job, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Vui lòng đính kèm CV của bạn!');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // Dùng FormData để gửi file và dữ liệu
      const formData = new FormData();
      formData.append('jobId', job.id);
      formData.append('coverLetter', coverLetter);
      formData.append('cvFile', file); 

      // Gọi API nộp đơn (bạn cần đảm bảo applicationService.applyForJob nhận formData)
      await applicationService.applyForJob(formData);
      
      onSuccess(); // Gọi hàm thông báo thành công từ component cha
      onClose();   // Đóng modal
    } catch (err) {
      setError('Có lỗi xảy ra khi nộp đơn. Vui lòng thử lại sau.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="text-xl font-bold text-gray-900">Ứng tuyển vị trí</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="bg-blue-50 text-blue-700 p-4 rounded-xl border border-blue-100 font-semibold">
            {job?.title}
          </div>

          {error && <div className="text-red-500 text-sm font-medium">{error}</div>}

          {/* Upload CV */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">CV / Hồ sơ của bạn *</label>
            <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 flex flex-col items-center justify-center hover:bg-gray-50 hover:border-blue-400 transition cursor-pointer relative">
              <input 
                type="file" 
                accept=".pdf,.doc,.docx" 
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <UploadCloud size={40} className="text-blue-500 mb-3" />
              <p className="text-sm font-medium text-gray-700">
                {file ? file.name : 'Nhấn hoặc kéo thả file CV vào đây'}
              </p>
              <p className="text-xs text-gray-500 mt-1">Hỗ trợ PDF, DOCX (Tối đa 5MB)</p>
            </div>
          </div>

          {/* Cover Letter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Thư giới thiệu (Cover Letter)</label>
            <textarea 
              rows="4" 
              placeholder="Chia sẻ lý do bạn phù hợp với vị trí này..."
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl font-medium text-gray-600 hover:bg-gray-100">
              Hủy
            </button>
            <button 
              type="submit" 
              disabled={submitting}
              className="flex items-center gap-2 bg-blue-600 text-white px-8 py-2.5 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-70"
            >
              {submitting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
              {submitting ? 'Đang gửi...' : 'Gửi đơn ứng tuyển'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplyModal;
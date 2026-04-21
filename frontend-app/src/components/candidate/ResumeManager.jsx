import React, { useState, useEffect, useRef } from 'react';
import { FileText, UploadCloud, Trash2, Loader2, File, CheckCircle } from 'lucide-react';
import { candidateService } from '../../services/candidateService';

const ResumeManager = () => {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    setLoading(true);
    try {
      const data = await candidateService.getMyResumes();
      // Backend có thể trả về mảng trực tiếp hoặc object chứa content
      setResumes(Array.isArray(data) ? data : data.content || []);
    } catch (error) {
      console.error("Lỗi khi tải danh sách CV:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate size (5MB) và type
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'File không được vượt quá 5MB!' });
      return;
    }

    setUploading(true);
    setMessage('');
    try {
      await candidateService.uploadResume(file);
      setMessage({ type: 'success', text: 'Tải CV lên thành công! 🎉' });
      fetchResumes(); // Gọi lại API để cập nhật list
    } catch {
      setMessage({ type: 'error', text: 'Lỗi tải file. Vui lòng thử lại.' });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = ''; // Reset input
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa CV này không?')) return;
    
    try {
      await candidateService.deleteResume(id);
      setMessage({ type: 'success', text: 'Đã xóa CV!' });
      fetchResumes();
    } catch {
      setMessage({ type: 'error', text: 'Không thể xóa CV lúc này.' });
    }
  };

  if (loading) return <div className="animate-pulse h-32 bg-gray-100 rounded-3xl mt-6"></div>;

  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 mt-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <FileText className="text-blue-600" size={24} /> Quản lý CV đính kèm
        </h3>
        
        {/* Nút Upload Ẩn Input */}
        <div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept=".pdf,.doc,.docx" 
            className="hidden" 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 bg-blue-50 text-blue-600 px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-600 hover:text-white transition disabled:opacity-50"
          >
            {uploading ? <Loader2 className="animate-spin" size={18} /> : <UploadCloud size={18} />}
            {uploading ? 'Đang tải lên...' : 'Tải CV mới'}
          </button>
        </div>
      </div>

      {message && (
        <div className={`p-4 mb-6 rounded-xl flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message.type === 'success' && <CheckCircle size={18} />}
          {message.text}
        </div>
      )}

      {/* Danh sách CV */}
      {resumes.length === 0 ? (
        <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-2xl">
          <File className="mx-auto text-gray-300 mb-3" size={40} />
          <p className="text-gray-500 font-medium">Bạn chưa tải lên CV nào.</p>
          <p className="text-sm text-gray-400 mt-1">Hỗ trợ định dạng PDF, DOCX (Tối đa 5MB)</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {resumes.map((cv) => (
            <div key={cv.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-2xl hover:border-blue-300 transition group">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center shrink-0">
                  <FileText className="text-red-500" size={20} />
                </div>
                <div className="truncate">
                  <p className="font-semibold text-gray-800 truncate" title={cv.fileName}>
                    {cv.fileName || 'Hồ sơ xin việc.pdf'}
                  </p>
                  <p className="text-xs text-gray-500">
                    Tải lên: {new Date(cv.uploadedAt || cv.createdAt).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 shrink-0">
                <a 
                  href={cv.fileUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  title="Xem/Tải xuống"
                >
                  <UploadCloud size={18} className="rotate-180" />
                </a>
                <button 
                  onClick={() => handleDelete(cv.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                  title="Xóa file"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResumeManager;
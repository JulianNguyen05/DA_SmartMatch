import React, { useState, useEffect, useRef } from 'react';
import { FileText, UploadCloud, Trash2, Loader2, File, CheckCircle, Plus, Save, User } from 'lucide-react';
import { candidateService } from '../../services/candidateService';

const ResumeManager = () => {
  // ================= STATE: QUẢN LÝ TAB HỒ SƠ =================
  const [profiles, setProfiles] = useState([]);
  const [activeTabId, setActiveTabId] = useState(null);
  const [formData, setFormData] = useState({});
  const [savingProfile, setSavingProfile] = useState(false);

  // ================= STATE: QUẢN LÝ FILE UPLOAD =================
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      // Chạy song song 2 API: Lấy danh sách Profile (Tab) và Danh sách File
      await Promise.all([fetchProfiles(), fetchResumes()]);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- LOGIC: TABS PROFILE ---
  const fetchProfiles = async () => {
    try {
      const data = await candidateService.getMyProfiles(); // API trả về mảng profiles
      const profileList = Array.isArray(data) ? data : data.content || data.data || [];
      setProfiles(profileList);
      
      // Nếu có data và chưa chọn tab nào, mặc định chọn tab đầu tiên
      if (profileList.length > 0 && !activeTabId) {
        handleSelectTab(profileList[0]);
      } else if (profileList.length === 0) {
        handleCreateNewTab();
      }
    } catch (err) {
      console.error("Lỗi tải danh sách Profile", err);
    }
  };

  const handleSelectTab = (profile) => {
    setActiveTabId(profile.id);
    setFormData(profile);
  };

  const handleCreateNewTab = () => {
    const newProfile = {
      profileName: "Hồ sơ mới",
      fullName: "",
      headline: "",
      summary: "",
      skills: "",
      education: "",
      experience: ""
    };
    setFormData(newProfile);
    setActiveTabId("new");
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      // Gọi API lưu hoặc cập nhật (Backend đã xử lý saveOrUpdate)
      await candidateService.saveProfile(formData);
      setMessage({ type: 'success', text: 'Đã lưu hồ sơ trực tuyến!' });
      await fetchProfiles(); // Tải lại để lấy ID mới nếu vừa tạo
    } catch {
      setMessage({ type: 'error', text: 'Lỗi khi lưu hồ sơ.' });
    } finally {
      setSavingProfile(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  // --- LOGIC: FILE UPLOAD (Code cũ của bạn) ---
  const fetchResumes = async () => {
    try {
      const data = await candidateService.getMyResumes();
      setResumes(Array.isArray(data) ? data : data.content || data.data || []);
    } catch (error) {
      console.error("Lỗi khi tải danh sách CV file:", error);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'File không được vượt quá 5MB!' });
      return;
    }

    setUploading(true);
    setMessage('');
    try {
      await candidateService.uploadResume(file);
      setMessage({ type: 'success', text: 'Tải CV file lên thành công! 🎉' });
      fetchResumes();
    } catch {
      setMessage({ type: 'error', text: 'Lỗi tải file. Vui lòng thử lại.' });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleDeleteFile = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa CV này không?')) return;
    try {
      await candidateService.deleteResume(id);
      setMessage({ type: 'success', text: 'Đã xóa CV đính kèm!' });
      fetchResumes();
    } catch {
      setMessage({ type: 'error', text: 'Không thể xóa CV lúc này.' });
    } finally {
      setTimeout(() => setMessage(''), 3000);
    }
  };

  if (loading) return <div className="animate-pulse h-64 bg-gray-100 rounded-3xl mt-6"></div>;

  return (
    <div className="space-y-6 mt-6">
      
      {/* THÔNG BÁO CHUNG */}
      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
          {message.type === 'success' && <CheckCircle size={18} />}
          {message.text}
        </div>
      )}

      {/* ================= PHẦN 1: QUẢN LÝ HỒ SƠ TRỰC TUYẾN (TABS) ================= */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <User className="text-blue-600" size={24} /> Hồ sơ trực tuyến (SmartMatch)
          </h3>
          <button 
            type="button"
            onClick={handleCreateNewTab}
            className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-xl font-medium hover:bg-blue-100 transition"
          >
            <Plus size={18} /> Tạo Tab Hồ Sơ Mới
          </button>
        </div>

        {/* Thanh Tabs */}
        <div className="flex border-b mb-6 gap-6 overflow-x-auto custom-scrollbar">
          {profiles.map(p => (
            <button
              key={p.id}
              onClick={() => handleSelectTab(p)}
              className={`pb-3 font-semibold whitespace-nowrap transition-colors border-b-2 ${
                activeTabId === p.id 
                  ? "text-blue-600 border-blue-600" 
                  : "text-gray-500 border-transparent hover:text-gray-800"
              }`}
            >
              {p.profileName}
            </button>
          ))}
          {activeTabId === "new" && (
            <button className="pb-3 font-semibold whitespace-nowrap text-blue-600 border-b-2 border-blue-600">
              {formData.profileName || 'Hồ sơ mới'} *
            </button>
          )}
        </div>

        {/* Form Nhập Liệu */}
        <form onSubmit={handleSaveProfile} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Tên Hồ Sơ (VD: Frontend Dev) *</label>
              <input name="profileName" value={formData.profileName || ''} onChange={handleProfileChange} required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:border-blue-500 rounded-xl outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Họ và tên *</label>
              <input name="fullName" value={formData.fullName || ''} onChange={handleProfileChange} required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:border-blue-500 rounded-xl outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Chức danh / Headline</label>
            <input name="headline" value={formData.headline || ''} onChange={handleProfileChange} placeholder="Senior React Developer" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:border-blue-500 rounded-xl outline-none" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Kỹ năng (Skills)</label>
              <textarea name="skills" value={formData.skills || ''} onChange={handleProfileChange} rows="3" placeholder="React, Node.js, Spring Boot..." className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:border-blue-500 rounded-xl outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Học vấn (Education)</label>
              <textarea name="education" value={formData.education || ''} onChange={handleProfileChange} rows="3" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:border-blue-500 rounded-xl outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Kinh nghiệm làm việc</label>
            <textarea name="experience" value={formData.experience || ''} onChange={handleProfileChange} rows="4" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:border-blue-500 rounded-xl outline-none" />
          </div>

          <div className="flex justify-end pt-2">
            <button 
              type="submit" 
              disabled={savingProfile}
              className="flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-70 transition-all active:scale-95"
            >
              {savingProfile ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              Lưu Hồ Sơ
            </button>
          </div>
        </form>
      </div>


      {/* ================= PHẦN 2: QUẢN LÝ FILE CV ĐÍNH KÈM ================= */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="text-blue-600" size={24} /> Quản lý File CV đính kèm
          </h3>
          
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
              className="flex items-center gap-2 bg-gray-100 text-gray-700 px-6 py-2.5 rounded-xl font-semibold hover:bg-gray-200 transition disabled:opacity-50"
            >
              {uploading ? <Loader2 className="animate-spin" size={18} /> : <UploadCloud size={18} />}
              {uploading ? 'Đang tải lên...' : 'Tải File CV Lên'}
            </button>
          </div>
        </div>

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
                    onClick={() => handleDeleteFile(cv.id)}
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

    </div>
  );
};

export default ResumeManager;
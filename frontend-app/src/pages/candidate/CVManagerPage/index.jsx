import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/common/Button';
import Toast from '../../../components/common/Toast';
import candidateService from '../../../features/candidate/candidateService';
import authService from '../../../features/auth/authService';

const SectionCard = ({ title, children, actionButton }) => (
  <div style={{
    background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px',
    padding: '20px 24px', marginBottom: '24px',
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
      <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1f2937', margin: 0 }}>{title}</h3>
      {actionButton && actionButton}
    </div>
    {children}
  </div>
);

const CVManagerPage = () => {
  const navigate = useNavigate();
  const currentUser = authService?.getCurrentUser ? authService.getCurrentUser() : null;
  const userId = currentUser?.userId || currentUser?.id;

  const [cvList, setCvList] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const [status, setStatus] = useState({ type: null, message: '' });
  
  // Dành cho Upload
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  const loadCvs = async () => {
    if (!userId) return;
    try {
      setIsFetching(true);
      // Gọi API lấy danh sách CV đã có sẵn trong file của bạn
      const res = await candidateService.getCvs(userId); 
      setCvList(Array.isArray(res) ? res : res?.data || []);
    } catch {
      setStatus({ type: 'error', message: 'Không thể tải danh sách CV.' });
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => { loadCvs(); }, [userId]);

  // Phân loại CV: is_generated = true (Tạo trên web) / false (Tải lên)
  const uploadedCvs = cvList.filter(cv => !cv.isGenerated);
  const generatedCvs = cvList.filter(cv => cv.isGenerated);

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setStatus({ type: 'error', message: 'File vượt quá giới hạn 5MB.' });
      return;
    }
    
    // Upload ngay lập tức khi chọn file (giống TopCV)
    setIsLoading(true);
    try {
      await candidateService.uploadCv(userId, file);
      setStatus({ type: 'success', message: 'Tải CV lên thành công!' });
      await loadCvs();
    } catch (error) {
      setStatus({ type: 'error', message: 'Lỗi tải lên. Vui lòng thử lại.' });
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (cvId) => {
    if (!window.confirm('Bạn có chắc muốn xóa CV này?')) return;
    try {
      await candidateService.deleteCv(userId, cvId);
      setStatus({ type: 'success', message: 'Xóa CV thành công.' });
      await loadCvs();
    } catch {
      setStatus({ type: 'error', message: 'Xóa CV thất bại.' });
    }
  };

  if (!userId) return <div style={{ textAlign: 'center', marginTop: '50px' }}><h2>Vui lòng đăng nhập.</h2></div>;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>Quản lý CV của bạn</h1>
      </div>

      {status.type && (
        <div style={{ marginBottom: '16px' }}>
          <Toast type={status.type} message={status.message} />
        </div>
      )}

      {/* KHU VỰC 1: CV TẠO TRÊN HỆ THỐNG */}
      <SectionCard 
        title="✨ CV Đã Tạo Trên Worklify" 
        actionButton={
          <Button onClick={() => navigate('/candidate/cv-templates')} style={{ background: '#10b981' }}>
            + Tạo CV mới
          </Button>
        }
      >
        {isFetching ? <p>Đang tải...</p> : generatedCvs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0', background: '#f9fafb', borderRadius: '8px' }}>
            <p style={{ color: '#6b7280', marginBottom: '12px' }}>Bạn chưa tạo CV nào trên hệ thống.</p>
            <Button onClick={() => navigate('/candidate/cv-templates')}>Trải nghiệm CV Builder ngay</Button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
            {generatedCvs.map(cv => (
              <div key={cv.id} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px' }}>
                <div style={{ height: '120px', background: '#f3f4f6', borderRadius: '6px', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' }}>
                  📝
                </div>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '15px' }}>{cv.fileName || 'CV chưa đặt tên'}</h4>
                <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: '#9ca3af' }}>Cập nhật lần cuối: {new Date(cv.createdAt).toLocaleDateString('vi-VN')}</p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Button onClick={() => navigate(`/candidate/cv-builder/${cv.id}`)} style={{ flex: 1, padding: '6px' }}>Sửa</Button>
                  <button onClick={() => handleDelete(cv.id)} style={{ background: 'transparent', border: '1px solid #fca5a5', color: '#ef4444', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer' }}>Xóa</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {/* KHU VỰC 2: CV TẢI LÊN (PDF) */}
      <SectionCard 
        title="📤 CV Tải Lên Từ Máy Tính"
        actionButton={
          <Button onClick={handleUploadClick} disabled={isLoading} style={{ background: '#2563eb' }}>
            {isLoading ? 'Đang tải...' : 'Tải CV lên (PDF/DOCX)'}
          </Button>
        }
      >
        <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} style={{ display: 'none' }} />
        
        {isFetching ? <p>Đang tải...</p> : uploadedCvs.length === 0 ? (
          <p style={{ color: '#6b7280', textAlign: 'center' }}>Không có CV nào được tải lên.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {uploadedCvs.map((cv) => (
              <li key={cv.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '24px' }}>{cv.fileName?.toLowerCase().endsWith('.pdf') ? '🔴' : '📘'}</span>
                  <div>
                    <p style={{ fontWeight: 500, margin: 0 }}>{cv.fileName || 'CV Không tên'}</p>
                    <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>{new Date(cv.createdAt).toLocaleDateString('vi-VN')}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => window.open(`http://localhost:8080${cv.filePath}`, '_blank')} style={{ background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1d4ed8', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer' }}>👁️ Xem</button>
                  <button onClick={() => handleDelete(cv.id)} style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#ef4444', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer' }}>Xóa</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </div>
  );
};

export default CVManagerPage;
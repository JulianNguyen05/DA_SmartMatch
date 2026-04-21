import React from 'react';
import ResumeManager from '../../components/candidate/ResumeManager';

const ResumesPage = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 sm:p-10 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Quản lý CV của bạn 📄</h1>
        <p className="text-blue-100 text-lg">
          Tải lên, cập nhật và quản lý các bản CV (PDF/DOCX) để sẵn sàng ứng tuyển nhanh chóng.
        </p>
      </div>
      
      {/* Gọi Component Quản lý File đã viết */}
      <ResumeManager />
    </div>
  );
};

export default ResumesPage;
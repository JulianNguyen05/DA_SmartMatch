import React from 'react';

const ProfessionalTemplate = ({ cvData }) => {
  return (
    <div className="w-full h-full bg-white flex border-4 border-blue-200">
      <div className="w-1/3 p-10 text-white" style={{ backgroundColor: cvData?.settings?.color || '#1e3a8a' }}>
        <h2 className="text-xl font-bold">CỘT TRÁI</h2>
        <p className="mt-4 opacity-80">Chứa ảnh và thông tin liên hệ.</p>
      </div>
      <div className="w-2/3 p-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Mẫu Chuyên Nghiệp</h1>
        <p className="text-gray-500">Bố cục 2 cột hiện đại, chia mảng rõ ràng.</p>
        <div className="mt-6">
          <p><strong>Người ứng tuyển:</strong> {cvData?.personalInfo?.fullName || 'Chưa nhập'}</p>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalTemplate;
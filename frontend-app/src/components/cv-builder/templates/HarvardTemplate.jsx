import React from 'react';

const HarvardTemplate = ({ cvData }) => {
  return (
    <div className="w-full h-full bg-white p-10 flex flex-col items-center justify-start border-4 border-black">
      <h1 className="text-3xl font-bold text-black uppercase border-b-2 border-black w-full text-center pb-4 mb-4">
        {cvData?.personalInfo?.fullName || 'TÊN ỨNG VIÊN'}
      </h1>
      <h2 className="text-xl font-bold text-gray-800 mb-4">ĐÂY LÀ MẪU HARVARD</h2>
      <p className="text-gray-600 text-center">
        Chuẩn học thuật Mỹ. Không cột, không ảnh, không màu sắc sặc sỡ.
      </p>
    </div>
  );
};

export default HarvardTemplate;
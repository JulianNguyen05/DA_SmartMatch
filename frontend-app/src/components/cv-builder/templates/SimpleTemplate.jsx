import React, { useState } from 'react';
import { Mail, MapPin, Phone, Globe } from 'lucide-react';

// Từ điển mapping Component tương ứng với từng chuỗi ID
const SECTION_RENDERER = {
  avatar: ({ data, primaryColor, isHighlighted }) => (
    <div className={`mb-6 flex justify-center cursor-pointer transition-all ${isHighlighted ? 'outline outline-2 outline-dashed outline-yellow-400 p-2 rounded' : ''}`}>
      <img 
        src={data?.url || 'https://via.placeholder.com/150'} 
        alt="Avatar" 
        className="w-32 h-32 rounded-full object-cover border-4"
        style={{ borderColor: primaryColor }}
      />
    </div>
  ),

  personalInfo: ({ data, primaryColor, isHighlighted }) => (
    <div className={`mb-4 text-center cursor-pointer transition-all ${isHighlighted ? 'outline outline-2 outline-dashed outline-yellow-400 p-2 rounded' : ''}`}>
      <h1 className="text-3xl font-bold text-gray-900 uppercase tracking-wide">{data?.fullName || 'HỌ VÀ TÊN'}</h1>
      <h2 className="text-lg font-medium mt-1" style={{ color: primaryColor }}>{data?.jobTitle || 'Vị trí ứng tuyển'}</h2>
    </div>
  ),

  contactInfo: ({ data, primaryColor, isHighlighted }) => (
    <div 
      className={`mb-6 pb-6 cursor-pointer transition-all ${isHighlighted ? 'outline outline-2 outline-dashed outline-yellow-400 p-2 rounded' : ''}`}
      style={{ borderBottom: `2px solid ${primaryColor}` }}
    >
      <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-gray-700">
        {data?.dateOfBirth && <div><span className="font-semibold">Ngày sinh:</span> {data.dateOfBirth}</div>}
        {data?.gender && <div><span className="font-semibold">Giới tính:</span> {data.gender}</div>}
        {data?.phone && <div className="flex items-center gap-1"><Phone size={14}/> {data.phone}</div>}
        {data?.email && <div className="flex items-center gap-1"><Mail size={14}/> {data.email}</div>}
        {data?.website && <div className="flex items-center gap-1"><Globe size={14}/> {data.website}</div>}
        {data?.address && <div className="flex items-center gap-1"><MapPin size={14}/> {data.address}</div>}
        {(!data?.phone && !data?.email && !data?.address) && <div className="text-gray-400 italic">Chưa nhập thông tin liên hệ...</div>}
      </div>
    </div>
  ),

  objective: ({ data, primaryColor, isHighlighted }) => (
    <div className={`mb-6 cursor-pointer transition-all ${isHighlighted ? 'outline outline-2 outline-dashed outline-yellow-400 p-2 rounded' : ''}`}>
      <h3 className="font-bold text-lg text-gray-900 uppercase mb-3" style={{ borderBottom: `2px solid ${primaryColor}`, paddingBottom: '8px' }}>
        Mục tiêu nghề nghiệp
      </h3>
      <p className="text-sm text-gray-700 leading-relaxed">{data || 'Chưa nhập nội dung...'}</p>
    </div>
  ),

  experience: ({ data, primaryColor, isHighlighted }) => (
    <div className={`mb-6 cursor-pointer transition-all ${isHighlighted ? 'outline outline-2 outline-dashed outline-yellow-400 p-2 rounded' : ''}`}>
      <h3 className="font-bold text-lg text-gray-900 uppercase mb-3" style={{ borderBottom: `2px solid ${primaryColor}`, paddingBottom: '8px' }}>
        Kinh nghiệm làm việc
      </h3>
      <div className="space-y-4">
        {data && data.length > 0 ? (
          data.map((exp, idx) => (
            <div key={idx} className="pb-3 border-b border-gray-200 last:border-0">
              <div className="flex justify-between items-start mb-1">
                <div>
                  <h4 className="font-semibold text-gray-900">{exp.company}</h4>
                  <p className="text-sm text-gray-600">{exp.role}</p>
                </div>
                <span className="text-xs text-gray-500">{exp.duration}</span>
              </div>
              <p className="text-sm text-gray-700 mt-2">{exp.description}</p>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500">Chưa có kinh nghiệm</p>
        )}
      </div>
    </div>
  ),

  education: ({ data, primaryColor, isHighlighted }) => (
    <div className={`mb-6 cursor-pointer transition-all ${isHighlighted ? 'outline outline-2 outline-dashed outline-yellow-400 p-2 rounded' : ''}`}>
      <h3 className="font-bold text-lg text-gray-900 uppercase mb-3" style={{ borderBottom: `2px solid ${primaryColor}`, paddingBottom: '8px' }}>
        Học vấn
      </h3>
      <div className="space-y-3">
        {data && data.length > 0 ? (
          data.map((edu, idx) => (
            <div key={idx} className="pb-2 border-b border-gray-200 last:border-0">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-gray-900">{edu.school}</h4>
                  <p className="text-sm text-gray-600">{edu.major}</p>
                </div>
                <span className="text-xs text-gray-500">{edu.duration}</span>
              </div>
              {edu.gpa && <p className="text-xs text-gray-500 mt-1">GPA: {edu.gpa}</p>}
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500">Chưa có thông tin học vấn</p>
        )}
      </div>
    </div>
  ),

  skills: ({ data, primaryColor, isHighlighted }) => (
    <div className={`mb-6 cursor-pointer transition-all ${isHighlighted ? 'outline outline-2 outline-dashed outline-yellow-400 p-2 rounded' : ''}`}>
      <h3 className="font-bold text-lg text-gray-900 uppercase mb-3" style={{ borderBottom: `2px solid ${primaryColor}`, paddingBottom: '8px' }}>
        Kỹ năng
      </h3>
      <div className="flex flex-wrap gap-2">
        {data && data.length > 0 ? (
          data.map(skill => (
            <span 
              key={skill} 
              className="px-3 py-1 text-xs rounded-full text-white"
              style={{ backgroundColor: primaryColor }}
            >
              {skill}
            </span>
          ))
        ) : (
          <p className="text-sm text-gray-500">Chưa có kỹ năng</p>
        )}
      </div>
    </div>
  ),

  hobbies: ({ data, primaryColor, isHighlighted }) => (
    <div className={`mb-6 cursor-pointer transition-all ${isHighlighted ? 'outline outline-2 outline-dashed outline-yellow-400 p-2 rounded' : ''}`}>
      <h3 className="font-bold text-lg text-gray-900 uppercase mb-3" style={{ borderBottom: `2px solid ${primaryColor}`, paddingBottom: '8px' }}>
        Sở thích
      </h3>
      <div className="flex flex-wrap gap-2">
        {data && data.length > 0 ? (
          data.map(hobby => (
            <span key={hobby} className="text-sm text-gray-700 px-2 py-1 bg-gray-100 rounded">
              {hobby}
            </span>
          ))
        ) : (
          <p className="text-sm text-gray-500">Chưa có sở thích</p>
        )}
      </div>
    </div>
  ),

  awards: ({ data, primaryColor, isHighlighted }) => (
    <div className={`mb-6 cursor-pointer transition-all ${isHighlighted ? 'outline outline-2 outline-dashed outline-yellow-400 p-2 rounded' : ''}`}>
      <h3 className="font-bold text-lg text-gray-900 uppercase mb-3" style={{ borderBottom: `2px solid ${primaryColor}`, paddingBottom: '8px' }}>
        Danh hiệu & Giải thưởng
      </h3>
      <div className="space-y-2">
        {data && data.length > 0 ? (
          data.map((award, idx) => (
            <div key={idx} className="pb-2 border-b border-gray-100 last:border-0">
              <div className="flex justify-between items-start">
                <h4 className="font-semibold text-gray-900 text-sm">{award.title}</h4>
                <span className="text-xs text-gray-500">{award.date}</span>
              </div>
              <p className="text-xs text-gray-600">{award.issuer}</p>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500">Chưa có danh hiệu</p>
        )}
      </div>
    </div>
  ),

  certifications: ({ data, primaryColor, isHighlighted }) => (
    <div className={`mb-6 cursor-pointer transition-all ${isHighlighted ? 'outline outline-2 outline-dashed outline-yellow-400 p-2 rounded' : ''}`}>
      <h3 className="font-bold text-lg text-gray-900 uppercase mb-3" style={{ borderBottom: `2px solid ${primaryColor}`, paddingBottom: '8px' }}>
        Chứng chỉ
      </h3>
      <div className="space-y-2">
        {data && data.length > 0 ? (
          data.map((cert, idx) => (
            <div key={idx} className="pb-2 border-b border-gray-100 last:border-0">
              <div className="flex justify-between items-start">
                <h4 className="font-semibold text-gray-900 text-sm">{cert.name}</h4>
                <span className="text-xs text-gray-500">{cert.date}</span>
              </div>
              <p className="text-xs text-gray-600">{cert.issuer}</p>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500">Chưa có chứng chỉ</p>
        )}
      </div>
    </div>
  ),

  projects: ({ data, primaryColor, isHighlighted }) => (
    <div className={`mb-6 cursor-pointer transition-all ${isHighlighted ? 'outline outline-2 outline-dashed outline-yellow-400 p-2 rounded' : ''}`}>
      <h3 className="font-bold text-lg text-gray-900 uppercase mb-3" style={{ borderBottom: `2px solid ${primaryColor}`, paddingBottom: '8px' }}>
        Dự án
      </h3>
      <div className="space-y-2">
        {data && data.length > 0 ? (
          data.map((project, idx) => (
            <div key={idx} className="pb-2 border-b border-gray-100 last:border-0">
              <h4 className="font-semibold text-gray-900 text-sm">{project.name}</h4>
              <p className="text-xs text-gray-600">{project.description}</p>
              {project.link && (
                <p className="text-xs text-blue-600 mt-1">{project.link}</p>
              )}
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500">Chưa có dự án</p>
        )}
      </div>
    </div>
  ),

  references: ({ data, primaryColor, isHighlighted }) => (
    <div className={`mb-6 cursor-pointer transition-all ${isHighlighted ? 'outline outline-2 outline-dashed outline-yellow-400 p-2 rounded' : ''}`}>
      <h3 className="font-bold text-lg text-gray-900 uppercase mb-3" style={{ borderBottom: `2px solid ${primaryColor}`, paddingBottom: '8px' }}>
        Người tham chiếu
      </h3>
      <div className="space-y-2">
        {data && data.length > 0 ? (
          data.map((ref, idx) => (
            <div key={idx} className="pb-2 border-b border-gray-100 last:border-0">
              <h4 className="font-semibold text-gray-900 text-sm">{ref.name}</h4>
              <p className="text-xs text-gray-600">{ref.position} - {ref.company}</p>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500">Chưa có người tham chiếu</p>
        )}
      </div>
    </div>
  ),

  customSectionRenderer: ({ data, primaryColor, isHighlighted }) => (
    <div className={`mb-6 cursor-pointer transition-all ${isHighlighted ? 'outline outline-2 outline-dashed outline-yellow-400 p-2 rounded' : ''}`}>
      <h3 className="font-bold text-lg text-gray-900 uppercase mb-3" style={{ borderBottom: `2px solid ${primaryColor}`, paddingBottom: '8px' }}>
        {data?.title || 'Thông tin thêm'}
      </h3>
      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
        {data?.content || 'Chưa nhập nội dung. Nhấp vào đây để chỉnh sửa...'}
      </p>
    </div>
  )
};

const getGridClasses = (ratio) => {
  switch (ratio) {
    case '10-0': case '100-0': return { left: 'col-span-10', right: 'hidden' };
    case '5-5': case '50-50': return { left: 'col-span-5', right: 'col-span-5' };
    case '6-4': case '60-40': return { left: 'col-span-6', right: 'col-span-4' };
    case '7-3': case '70-30': return { left: 'col-span-7', right: 'col-span-3' };
    case '8-2': case '80-20': return { left: 'col-span-8', right: 'col-span-2' };
    default: return { left: 'col-span-10', right: 'hidden' };
  }
};

const SimpleTemplate = ({ cvData, onSectionClick }) => {
  const { layout, data, settings } = cvData;
  const [highlightedSection, setHighlightedSection] = useState(null);

  const handleSectionClick = (sectionId) => {
    setHighlightedSection(sectionId);
    if (onSectionClick) onSectionClick(sectionId);
  };

  const renderItems = (itemIds) => {
    return itemIds.map(itemId => {
      // XỬ LÝ KHỐI ĐỘNG: Nếu id bắt đầu bằng 'customSection_', ta gọi renderer động
      const isCustomSection = itemId.startsWith('customSection_');
      const SectionComponent = isCustomSection ? SECTION_RENDERER.customSectionRenderer : SECTION_RENDERER[itemId];
      
      if (!SectionComponent) return null;
      
      return (
        <div key={itemId} onClick={() => handleSectionClick(itemId)} className="transition-all">
          <SectionComponent data={data[itemId]} primaryColor={settings.primaryColor} isHighlighted={highlightedSection === itemId} />
        </div>
      );
    });
  };

  return (
    <div className="w-full h-full bg-white p-10 text-gray-800" style={{ fontFamily: `${settings.font}, sans-serif` }}>
      {layout.activeRows.map(row => {
        const { left, right } = getGridClasses(row.ratio);
        return (
          <div key={row.id} className="grid grid-cols-10 gap-8 mb-4">
            <div className={left}>{renderItems(row.leftItems)}</div>
            {row.ratio !== '10-0' && row.ratio !== '100-0' && (
              <div className={right}>{renderItems(row.rightItems)}</div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default SimpleTemplate;

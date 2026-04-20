import React from 'react';
import { Edit, MapPin, Globe, Users, Building2 } from 'lucide-react';

const getFullImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `http://localhost:8080${path}`; // Nối thủ công port Backend
};
const CompanyDetail = ({ company, onEdit }) => {
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Banner & Logo */}
      <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600 relative">
        <button 
          onClick={onEdit}
          className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg backdrop-blur-sm transition-all"
        >
          <Edit size={20} />
        </button>
      </div>
      
      <div className="px-8 pb-8 relative">
        <div className="flex items-end justify-between -mt-12 mb-6">
          <div className="w-24 h-24 bg-white rounded-2xl p-1 shadow-md border border-gray-100">
            {company.logoUrl ? (
              <img src={getFullImageUrl(company.logoUrl)} alt="Logo" className="w-full h-full object-cover rounded-xl" />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center rounded-xl">
                <Building2 size={32} className="text-gray-400" />
              </div>
            )}
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900">{company.name}</h1>
        <p className="text-blue-600 font-medium mb-6">{company.industry}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="flex items-center gap-3 text-gray-600">
            <Users size={18} className="text-gray-400" />
            <span>Quy mô: <strong>{company.companySize || 'Chưa cập nhật'}</strong></span>
          </div>
          <div className="flex items-center gap-3 text-gray-600">
            <Globe size={18} className="text-gray-400" />
            <span>{company.website ? <a href={company.website} target="_blank" rel="noreferrer" className="hover:text-blue-600 underline">{company.website}</a> : 'Chưa cập nhật'}</span>
          </div>
          <div className="flex items-center gap-3 text-gray-600 md:col-span-2">
            <MapPin size={18} className="text-gray-400 shrink-0" />
            <span>{company.address ? `${company.address}, ${company.location}` : 'Chưa cập nhật địa chỉ'}</span>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-3">Giới thiệu công ty</h3>
          <div className="text-gray-600 whitespace-pre-wrap leading-relaxed">
            {company.description || 'Chưa có thông tin giới thiệu.'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyDetail;
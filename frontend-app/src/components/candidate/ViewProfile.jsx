import React from 'react';
import { Edit3, X, Award, PenTool, Briefcase, BookOpen } from 'lucide-react';

const ViewProfile = ({ profile, message, onClearMessage, onEdit }) => {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {message && (
        <div className="p-4 rounded-xl bg-green-50 text-green-700 border border-green-200 flex justify-between items-center">
          {message}
          <button onClick={onClearMessage}><X size={18} /></button>
        </div>
      )}

      {/* Banner & Basic Info */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative">
        <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700"></div>
        <div className="px-8 pb-8 relative">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end -mt-12 mb-6">
            <div className="flex items-end gap-6">
              <div className="w-28 h-28 bg-white rounded-2xl p-1 shadow-lg flex items-center justify-center">
                <div className="w-full h-full bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 text-4xl font-bold">
                  {profile.fullName?.charAt(0).toUpperCase()}
                </div>
              </div>
              <div className="mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{profile.fullName}</h1>
                <p className="text-lg text-blue-600 font-medium">{profile.headline || 'Chưa cập nhật chức danh'}</p>
              </div>
            </div>
            <button 
              onClick={onEdit}
              className="mt-4 sm:mt-0 flex items-center gap-2 bg-blue-50 text-blue-600 px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-100 transition"
            >
              <Edit3 size={18} /> Chỉnh sửa
            </button>
          </div>
        </div>
      </div>

      {/* Detailed Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Award className="text-blue-600" size={20} /> Kỹ năng
            </h3>
            <div className="flex flex-wrap gap-2">
              {profile.skills ? profile.skills.split(',').map((skill, idx) => (
                <span key={idx} className="px-4 py-1.5 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium">
                  {skill.trim()}
                </span>
              )) : <span className="text-gray-400 text-sm">Chưa cập nhật</span>}
            </div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-lg">
              <PenTool className="text-blue-600" size={20} /> Giới thiệu
            </h3>
            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
              {profile.summary || 'Chưa có thông tin.'}
            </p>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-lg">
              <Briefcase className="text-blue-600" size={20} /> Kinh nghiệm
            </h3>
            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
              {profile.experience || 'Chưa có thông tin.'}
            </p>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-lg">
              <BookOpen className="text-blue-600" size={20} /> Học vấn
            </h3>
            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
              {profile.education || 'Chưa có thông tin.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewProfile;
import React from 'react';
import { Save, User, X, PenTool, Briefcase, BookOpen } from 'lucide-react';

const EditProfileForm = ({ form, isNewProfile, saving, message, onChange, onSubmit, onCancel }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 relative">
        {!isNewProfile && (
          <button 
            onClick={onCancel}
            className="absolute top-8 right-8 text-gray-400 hover:text-red-500 transition"
          >
            <X size={24} />
          </button>
        )}

        <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
          <User className="text-blue-600" /> 
          {isNewProfile ? 'Tạo hồ sơ cá nhân' : 'Cập nhật hồ sơ'}
        </h2>

        {message && (
          <div className="p-4 mb-6 rounded-xl bg-red-50 text-red-700 border border-red-200">
            {message}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Họ và tên *</label>
              <input type="text" name="fullName" required value={form.fullName} onChange={onChange}
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Chức danh</label>
              <input type="text" name="headline" value={form.headline} onChange={onChange}
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <PenTool size={16} /> Giới thiệu bản thân
            </label>
            <textarea name="summary" rows="4" value={form.summary} onChange={onChange}
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Kỹ năng chuyên môn (cách nhau bởi dấu phẩy)</label>
            <input type="text" name="skills" value={form.skills} onChange={onChange}
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Briefcase size={16} /> Kinh nghiệm làm việc
              </label>
              <textarea name="experience" rows="5" value={form.experience} onChange={onChange}
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <BookOpen size={16} /> Học vấn
              </label>
              <textarea name="education" rows="5" value={form.education} onChange={onChange}
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t border-gray-100">
            {!isNewProfile && (
              <button type="button" onClick={onCancel} className="px-6 py-3 rounded-xl font-semibold text-gray-600 hover:bg-gray-100">
                Hủy
              </button>
            )}
            <button type="submit" disabled={saving} className="flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-70">
              <Save size={20} /> {saving ? 'Đang lưu...' : 'Lưu Hồ Sơ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileForm;
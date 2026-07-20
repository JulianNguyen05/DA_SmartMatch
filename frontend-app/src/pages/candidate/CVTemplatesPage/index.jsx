import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../../features/auth/authService';
import candidateService from '../../../features/candidate/candidateService';
import Toast from '../../../components/common/Toast';
import { LayoutGrid, Briefcase, LayoutTemplate, GraduationCap } from 'lucide-react';
import { mapProfileToCvData } from '../../../components/cv-builder/shared/mapProfileToCvData';
import { SIMPLE_TEMPLATE_CONFIG } from '../../../components/cv-builder/templates/SimpleTemplate';
import { HARVARD_TEMPLATE_CONFIG } from '../../../components/cv-builder/templates/HarvardTemplate';
import { PROFESSIONAL_TEMPLATE_CONFIG } from '../../../components/cv-builder/templates/ProfessionalTemplate';

// Tra config (defaultData/defaultSettings/defaultLayout) theo id mẫu — dùng để build
// prefillData đúng schema của TỪNG mẫu (không phải object tự chế như trước).
const TEMPLATE_CONFIG_REGISTRY = {
  simple: SIMPLE_TEMPLATE_CONFIG,
  professional: PROFESSIONAL_TEMPLATE_CONFIG,
  harvard: HARVARD_TEMPLATE_CONFIG,
};

// 1. CẤU HÌNH DỮ LIỆU CHÍNH XÁC 3 MẪU CV (Đã bỏ mảng colors, chỉ giữ 1 màu mặc định)
const TEMPLATES = [
  {
    id: 'simple',
    name: 'Mẫu Tiêu Chuẩn',
    categories: ['Tiêu chuẩn'],
    color: '#1f2937', // Màu mặc định: Đen xám
    thumbnail: 'http://localhost:8080/uploads/logos/user.jpg', 
  },
  {
    id: 'professional',
    name: 'Mẫu Chuyên Nghiệp',
    categories: ['Chuyên nghiệp'],
    color: '#1e3a8a', // Màu mặc định: Xanh Navy
    thumbnail: 'http://localhost:8080/uploads/logos/user.jpg',
  },
  {
    id: 'harvard',
    name: 'Mẫu Harvard',
    categories: ['Harvard'],
    color: '#000000', // Màu mặc định: Đen
    thumbnail: 'http://localhost:8080/uploads/logos/user.jpg',
  }
];

// Danh mục bộ lọc
const CATEGORIES = [
  { id: 'Tất cả', icon: LayoutGrid },
  { id: 'Tiêu chuẩn', icon: LayoutTemplate },
  { id: 'Chuyên nghiệp', icon: Briefcase },
  { id: 'Harvard', icon: GraduationCap }
];

const CVTemplatesPage = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('Tất cả');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Lọc template theo danh mục
  const filteredTemplates = activeCategory === 'Tất cả' 
    ? TEMPLATES 
    : TEMPLATES.filter(t => t.categories.includes(activeCategory));

  // 2. HÀM XỬ LÝ KHI CHỌN MẪU CV
  // Không tạo CV rỗng ngay tại đây nữa — lấy hồ sơ ứng viên (getFullProfile), map sang
  // đúng schema cvData.data của mẫu đã chọn (mapProfileToCvData), rồi điều hướng sang
  // CVBuilderPage kèm prefillData qua location.state. CVBuilderPage (khi không có cvId
  // trên URL) sẽ tự đọc location.state.prefillData để điền sẵn, và chỉ THỰC SỰ tạo CV
  // trong DB khi người dùng bấm "Lưu thay đổi" ở đó.
  const handleUseTemplate = async (template) => {
    const currentUser = authService?.getCurrentUser ? authService.getCurrentUser() : null;
    const userId = currentUser?.userId || currentUser?.id;

    if (!userId) {
      setError('Vui lòng đăng nhập để tạo CV.');
      return;
    }

    setIsLoading(true);
    setError(null);

    const tplConfig = TEMPLATE_CONFIG_REGISTRY[template.id] || SIMPLE_TEMPLATE_CONFIG;
    let prefillData;

    try {
      const profileRes = await candidateService.getFullProfile(userId);
      // candidateService trả nguyên response.data (bao gồm envelope {code, message, data}
      // của backend) — CandidateProfileFullResponse thật sự nằm ở field "data" bên trong.
      const profileFull = profileRes?.data || profileRes;
      prefillData = mapProfileToCvData(profileFull, tplConfig.defaultData);
    } catch (err) {
      // Chưa có hồ sơ ứng viên (chưa từng điền ProfilePage) hoặc lỗi mạng tạm thời —
      // vẫn cho tạo CV bình thường, chỉ là không có gì để điền sẵn (prefillData undefined
      // -> CVBuilderPage tự dùng defaultData rỗng của mẫu như trước giờ).
      console.warn('Không lấy được hồ sơ để điền sẵn CV, tạo CV trống:', err);
    }

    setIsLoading(false);
    navigate('/candidate/cv-builder', {
      state: { prefillData, prefillTemplate: template.id },
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 bg-white min-h-screen">
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Mẫu CV xin việc tiếng Việt chuẩn 2026
        </h1>
        <p className="text-gray-600">
          Tuyển chọn {TEMPLATES.length} mẫu CV đa dạng phong cách, giúp bạn tạo dấu ấn cá nhân và kết nối mạnh mẽ hơn với nhà tuyển dụng.
        </p>
      </div>

      {error && (
        <div className="mb-6">
          <Toast type="error" message={error} />
        </div>
      )}

      {/* FILTER BAR (Các nút hình viên thuốc) */}
      <div className="flex flex-wrap items-center gap-3 mb-10 pb-4 border-b border-gray-100">
        {CATEGORIES.map(category => {
          const Icon = category.icon;
          const isActive = activeCategory === category.id;
          return (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm border transition-all duration-200 ${
                isActive 
                  ? 'bg-[#00b14f] text-white border-[#00b14f] shadow-sm' 
                  : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
              }`}
            >
              <Icon className="w-4 h-4" />
              {category.id}
            </button>
          );
        })}
      </div>

      {/* TEMPLATES GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-5xl">
        {filteredTemplates.map((template) => (
          <div key={template.id} className="flex flex-col gap-3">
            
            {/* VÙNG CHỨA ẢNH (Nền xám nhạt, border bo góc) */}
            <div className="group relative bg-[#f3f4f6] p-4 rounded-xl border border-gray-200 transition-all hover:border-[#00b14f] hover:shadow-md">
              
              {/* Thumbnail CV khổ A4 (Tỷ lệ 21/29.7) */}
              <div className="relative w-full aspect-[21/29.7] bg-white shadow-sm overflow-hidden border border-gray-200">
                <img 
                  src={template.thumbnail} 
                  alt={template.name} 
                  className="w-full h-full object-cover object-top"
                />
                
                {/* Overlay khi Hover */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[1px]">
                  <button
                    onClick={() => handleUseTemplate(template)}
                    disabled={isLoading}
                    className="bg-[#00b14f] hover:bg-[#009643] text-white font-semibold py-2 px-6 rounded-full transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 shadow-lg"
                  >
                    {isLoading ? 'Đang tạo...' : 'Sử dụng mẫu này'}
                  </button>
                </div>
              </div>
            </div>

            {/* VÙNG THÔNG TIN MẪU */}
            <div className="px-1 mt-2">
              {/* Tên mẫu */}
              <h3 className="text-[17px] font-bold text-gray-800 mb-2">{template.name}</h3>

              {/* Các Tag phân loại */}
              <div className="flex flex-wrap gap-2">
                {template.categories.map((cat, idx) => (
                  <span 
                    key={idx} 
                    className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};

export default CVTemplatesPage;
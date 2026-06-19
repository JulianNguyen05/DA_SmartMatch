import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../../features/auth/authService';
import candidateService from '../../../features/candidate/candidateService';
import Toast from '../../../components/common/Toast';
import { LayoutGrid, Star, Briefcase, LayoutTemplate, GraduationCap, FileCheck2, Globe } from 'lucide-react';

// 1. CẤU HÌNH DỮ LIỆU MẪU (Giống cấu trúc TopCV)
const TEMPLATES = [
  {
    id: 'simple',
    name: 'Tiêu chuẩn',
    categories: ['Đơn giản', 'ATS'],
    colors: ['#1f2937', '#dc2626', '#2563eb', '#16a34a'], // Đen, Đỏ, Xanh dương, Xanh lá
    // Thay URL này bằng ảnh chụp màn hình mẫu CV của bạn (khổ A4)
    thumbnail: 'http://localhost:8080/uploads/logos/user.jpg', 
  },
  {
    id: 'professional',
    name: 'Ấn tượng 6',
    categories: ['Chuyên nghiệp', 'Hiện đại', 'Ấn tượng'],
    colors: ['#451a03', '#1e3a8a', '#14532d', '#701a75'], // Nâu, Xanh navy, Xanh rêu, Tím
    thumbnail: 'http://localhost:8080/uploads/logos/user.jpg',
  },
  {
    id: 'harvard',
    name: 'Senior (Harvard)',
    categories: ['Harvard', 'Đơn giản', 'ATS'],
    colors: ['#000000', '#1e3a8a'], // Đen, Xanh navy
    thumbnail: 'http://localhost:8080/uploads/logos/user.jpg',
  }
];

// Danh mục bộ lọc kèm Icon
const CATEGORIES = [
  { id: 'Tất cả', icon: LayoutGrid },
  { id: 'Đơn giản', icon: LayoutTemplate },
  { id: 'Chuyên nghiệp', icon: Briefcase },
  { id: 'Hiện đại', icon: Star },
  { id: 'Ấn tượng', icon: Globe },
  { id: 'Harvard', icon: GraduationCap },
  { id: 'ATS', icon: FileCheck2 },
];

const CVTemplatesPage = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('Tất cả');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // State lưu trữ màu được chọn tạm thời cho từng mẫu { templateId: colorIndex }
  const [selectedColors, setSelectedColors] = useState({});

  // Lọc template theo danh mục
  const filteredTemplates = activeCategory === 'Tất cả' 
    ? TEMPLATES 
    : TEMPLATES.filter(t => t.categories.includes(activeCategory));

  // 2. HÀM XỬ LÝ KHI CHỌN MẪU CV
  const handleUseTemplate = async (template) => {
    const currentUser = authService?.getCurrentUser ? authService.getCurrentUser() : null;
    const userId = currentUser?.userId || currentUser?.id;

    if (!userId) {
      setError('Vui lòng đăng nhập để tạo CV.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Lấy màu đang được chọn, nếu không có thì lấy màu đầu tiên của template
      const selectedColorIndex = selectedColors[template.id] || 0;
      const themeColor = template.colors[selectedColorIndex];

      const defaultCVData = {
        settings: {
          template: template.id,
          color: themeColor,
          font: 'Roboto',
          fontSize: 'medium'
        },
        personalInfo: {
          fullName: currentUser.fullName || '',
          jobTitle: '',
          email: currentUser.email || '',
          phone: currentUser.phone || '',
          address: '',
          avatar: ''
        },
        objective: '',
        experiences: [],
        educations: [],
        skills: []
      };

      const payload = {
        fileName: 'CV Chưa đặt tên',
        title: 'CV Chưa đặt tên', 
        rawText: JSON.stringify(defaultCVData) 
      };

      const response = await candidateService.createCv(userId, payload);
      const newCvId = response?.data?.id || response?.id; 

      if (newCvId) {
        navigate(`/candidate/cv-builder/${newCvId}`);
      } else {
        throw new Error('Không nhận được ID của CV mới từ máy chủ.');
      }

    } catch (err) {
      console.error(err);
      setError('Đã xảy ra lỗi khi khởi tạo CV. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 bg-white min-h-screen">
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Mẫu CV xin việc tiếng Việt, Anh, Nhật, Trung chuẩn 2026
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
                  ? 'bg-[#00b14f] text-white border-[#00b14f] shadow-sm' // Màu xanh đặc trưng của TopCV
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredTemplates.map((template) => {
          const activeColorIdx = selectedColors[template.id] || 0;

          return (
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
              <div className="px-1">
                {/* Các chấm màu */}
                <div className="flex items-center gap-2 mb-3">
                  {template.colors.map((color, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedColors(prev => ({ ...prev, [template.id]: idx }))}
                      className={`w-5 h-5 rounded-full border-2 transition-transform ${
                        activeColorIdx === idx ? 'scale-125 border-gray-400' : 'border-transparent hover:scale-110'
                      }`}
                      style={{ backgroundColor: color }}
                      title="Đổi màu"
                    />
                  ))}
                </div>

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
          );
        })}
      </div>
    </div>
  );
};

export default CVTemplatesPage;
import React from 'react';
import { X, Square, Circle, List, Clock, LayoutGrid, AlignLeft } from 'lucide-react';
import LayoutSidebar from './LayoutSidebar';
import TextFormatToolbar from './TextFormatToolbar';
import { CV_FONT_SIZES } from '../templates/cvTemplateCore';

const FONT_OPTIONS = ['Roboto', 'Arial', 'Times New Roman', 'Georgia', 'Courier New'];
const COLOR_THEMES = [
  { name: 'Xanh lá', primary: '#00b14f', accent: '#e8f7ee' },
  { name: 'Xanh dương', primary: '#0066cc', accent: '#e6f2ff' },
  { name: 'Đỏ', primary: '#dc2626', accent: '#fee2e2' },
  { name: 'Tím', primary: '#7c3aed', accent: '#f3e8ff' },
  { name: 'Cam đen', primary: '#ea580c', accent: '#fffbeb' },
];

const SECTION_NAMES = {
  avatar: 'Ảnh đại diện',
  contactInfo: 'Danh thiếp',
  personalInfo: 'Thông tin cá nhân',
  objective: 'Mục tiêu nghề nghiệp',
  education: 'Học vấn',
  experience: 'Kinh nghiệm làm việc',
  activities: 'Hoạt động',
  certifications: 'Chứng chỉ',
  awards: 'Giải thưởng',
  skills: 'Kỹ năng',
  references: 'Người tham chiếu',
  hobbies: 'Sở thích',
  projects: 'Dự án',
  customSection: 'Thông tin thêm'
};

const TabPanel = ({
  activeTab, isPanelOpen, setIsPanelOpen, cvData, setCvData, handleFontChange, handleColorChange, handleChangeRatio, handleAddRow, handleDeleteRow, handleMoveRow, handleSettingChange, selectedSection
}) => {

  const handleSectionLayoutChange = (layoutType) => {
    const currentLayouts = cvData.settings.sectionLayouts || {};
    handleSettingChange('sectionLayouts', { ...currentLayouts, [selectedSection]: layoutType });
  };

  const getCurrentLayoutType = (sectionId) => {
    if (cvData.settings.sectionLayouts?.[sectionId]) {
      return cvData.settings.sectionLayouts[sectionId];
    }
    if (['skills', 'hobbies'].includes(sectionId)) return 'tags';
    if (['experience', 'education'].includes(sectionId)) return 'timeline';
    return 'row'; 
  };

  const supportsDynamicLayout = ['experience', 'education', 'activities', 'projects', 'certifications', 'awards', 'references', 'skills', 'hobbies', 'objective'];

  return (
    <div className={`transition-all duration-300 ${isPanelOpen ? 'w-[320px] ml-4 my-4 mr-4' : 'w-0 overflow-hidden'}`}>
      <div className="w-[320px] h-full bg-white rounded-xl shadow-md flex flex-col overflow-hidden">
        
        <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white z-10">
          <h3 className="font-bold text-[15px] text-gray-800">
            {activeTab === 'design' && 'Thiết kế & Bố cục'}
            {activeTab === 'layout' && 'Tùy chỉnh Bố cục CV'}
            {activeTab === 'template' && 'Thay Đổi Mẫu CV'}
          </h3>
          <button onClick={() => setIsPanelOpen(false)} className="p-1 hover:bg-gray-100 rounded-full text-gray-500"><X size={16}/></button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          
          {activeTab === 'design' && (
            <div className="animate-fadeIn">
              
              <TextFormatToolbar />

              {selectedSection && supportsDynamicLayout.includes(selectedSection) && (
                <div className="mb-6 pt-5 border-t border-gray-100 animate-fadeIn">
                  <label className="block font-semibold text-sm text-gray-700 mb-3">
                    Bố cục: <span className="text-[#00b14f] uppercase">{SECTION_NAMES[selectedSection] || selectedSection}</span>
                  </label>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleSectionLayoutChange('timeline')}
                      className={`flex flex-col items-center justify-center gap-1.5 p-2 border rounded-lg transition-all ${getCurrentLayoutType(selectedSection) === 'timeline' ? 'border-[#00b14f] bg-[#e8f7ee] text-[#00b14f]' : 'border-gray-200 text-gray-600 bg-white hover:bg-gray-50'}`}
                    >
                      <Clock size={16}/> <span className="text-[10px] font-medium">Dòng TG</span>
                    </button>
                    
                    <button
                      onClick={() => handleSectionLayoutChange('row')}
                      className={`flex flex-col items-center justify-center gap-1.5 p-2 border rounded-lg transition-all ${getCurrentLayoutType(selectedSection) === 'row' ? 'border-[#00b14f] bg-[#e8f7ee] text-[#00b14f]' : 'border-gray-200 text-gray-600 bg-white hover:bg-gray-50'}`}
                    >
                      <List size={16}/> <span className="text-[10px] font-medium">Danh sách</span>
                    </button>
                    
                    <button
                      onClick={() => handleSectionLayoutChange('tags')}
                      className={`flex flex-col items-center justify-center gap-1.5 p-2 border rounded-lg transition-all ${getCurrentLayoutType(selectedSection) === 'tags' ? 'border-[#00b14f] bg-[#e8f7ee] text-[#00b14f]' : 'border-gray-200 text-gray-600 bg-white hover:bg-gray-50'}`}
                    >
                      <LayoutGrid size={16}/> <span className="text-[10px] font-medium">Dạng Thẻ</span>
                    </button>

                    <button
                      onClick={() => handleSectionLayoutChange('paragraph')}
                      className={`flex flex-col items-center justify-center gap-1.5 p-2 border rounded-lg transition-all ${getCurrentLayoutType(selectedSection) === 'paragraph' ? 'border-[#00b14f] bg-[#e8f7ee] text-[#00b14f]' : 'border-gray-200 text-gray-600 bg-white hover:bg-gray-50'}`}
                    >
                      <AlignLeft size={16}/> <span className="text-[10px] font-medium">Đoạn văn</span>
                    </button>
                  </div>
                </div>
              )}

              {selectedSection === 'avatar' && (
                <div className="mb-6 pt-5 border-t border-gray-100 animate-fadeIn">
                  <label className="block font-semibold text-sm text-gray-700 mb-3">Tùy chỉnh Ảnh đại diện</label>
                  <div className="flex gap-2 mb-3">
                    <button onClick={() => handleSettingChange('avatarShape', 'square')} className={`flex-1 flex items-center justify-center gap-2 p-2 border rounded-lg transition-all ${cvData.settings.avatarShape === 'square' ? 'border-[#00b14f] bg-[#e8f7ee] text-[#00b14f]' : 'border-gray-200 text-gray-600 bg-white hover:bg-gray-50'}`}> <Square size={16}/> Vuông </button>
                    <button onClick={() => handleSettingChange('avatarShape', 'circle')} className={`flex-1 flex items-center justify-center gap-2 p-2 border rounded-lg transition-all ${cvData.settings.avatarShape === 'circle' ? 'border-[#00b14f] bg-[#e8f7ee] text-[#00b14f]' : 'border-gray-200 text-gray-600 bg-white hover:bg-gray-50'}`}> <Circle size={16}/> Tròn </button>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1"> <span>Nhỏ</span><span>Vừa</span><span>Lớn</span> </div>
                    <input type="range" min="80" max="180" step="10" value={cvData.settings.avatarSize} onChange={(e) => handleSettingChange('avatarSize', parseInt(e.target.value))} className="w-full accent-[#00b14f]" />
                  </div>
                </div>
              )}

              {/* Phần Font chữ và Kích cỡ toàn CV */}
              <div className="mb-6 pt-5 border-t border-gray-100">
                <label className="block font-semibold text-sm text-gray-700 mb-3">Font chữ toàn CV</label>
                <select value={cvData.settings.font} onChange={(e) => handleFontChange(e.target.value)} className="w-full p-2.5 border rounded-lg bg-white text-sm focus:ring-1 focus:ring-[#00b14f] outline-none mb-4">
                  {FONT_OPTIONS.map(font => <option key={font} value={font}>{font}</option>)}
                </select>

                <label className="block font-semibold text-sm text-gray-700 mb-3">Kích cỡ toàn CV</label>
                <div className="flex gap-2">
                  {CV_FONT_SIZES.map(size => {
                    // Fallback mặc định là 'medium' nếu chưa có dữ liệu lưu
                    const currentSize = cvData.settings.fontSize || 'medium';
                    const isActive = currentSize === size.value;
                    
                    return (
                      <button
                        key={size.value}
                        onClick={() => handleSettingChange('fontSize', size.value)}
                        className={`flex-1 py-1.5 text-[11px] font-medium border rounded transition-all ${
                          isActive 
                            ? 'border-[#00b14f] bg-[#e8f7ee] text-[#00b14f]' 
                            : 'border-gray-200 text-gray-600 bg-white hover:bg-gray-50'
                        }`}
                      >
                        {size.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-sm text-gray-700 mb-3">Chủ đề màu sắc</label>
                <div className="space-y-2">
                  {COLOR_THEMES.map(theme => (
                    <button key={theme.name} onClick={() => handleColorChange(theme.primary, theme.accent)} className={`w-full flex items-center gap-3 p-2.5 border rounded-lg transition-all ${cvData.settings.primaryColor === theme.primary ? 'border-[#00b14f] bg-[#e8f7ee] ring-1 ring-[#00b14f]' : 'border-gray-200 hover:border-gray-300 bg-white'}`}>
                      <div className="w-5 h-5 rounded-full shadow-sm" style={{ backgroundColor: theme.primary }} />
                      <span className="text-sm font-medium text-gray-700">{theme.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'layout' && (
            <div className="animate-fadeIn -m-5">
              <LayoutSidebar layout={cvData.layout} onChangeRatio={handleChangeRatio} primaryColor={cvData.settings.primaryColor} onAddRow={handleAddRow} onDeleteRow={handleDeleteRow} onMoveRow={handleMoveRow} />
            </div>
          )}

          {activeTab === 'template' && (
            <div className="animate-fadeIn space-y-3">
              {/* Mẫu Tiêu Chuẩn */}
              <button onClick={() => setCvData({...cvData, settings: {...cvData.settings, template: 'simple'}})} className={`block w-full p-4 rounded-lg font-medium border-2 transition-all text-left ${cvData.settings.template === 'simple' ? 'border-[#00b14f] bg-[#e8f7ee] text-[#00b14f]' : 'border-gray-200 text-gray-700 hover:border-[#00b14f]'}`}>
                <div className="font-bold mb-1 text-sm">Mẫu Tiêu Chuẩn</div>
                <div className="text-[11px] text-gray-500 font-normal">Thiết kế tối giản, chuyên nghiệp.</div>
              </button>

              {/* Mẫu Harvard */}
              <button onClick={() => setCvData({...cvData, settings: {...cvData.settings, template: 'harvard'}})} className={`block w-full p-4 rounded-lg font-medium border-2 transition-all text-left ${cvData.settings.template === 'harvard' ? 'border-[#00b14f] bg-[#e8f7ee] text-[#00b14f]' : 'border-gray-200 text-gray-700 hover:border-[#00b14f]'}`}>
                <div className="font-bold mb-1 text-sm">Mẫu Harvard</div>
                <div className="text-[11px] text-gray-500 font-normal">Phong cách học thuật, thanh lịch và truyền thống.</div>
              </button>

              {/* Mẫu Professional */}
              <button onClick={() => setCvData({...cvData, settings: {...cvData.settings, template: 'professional'}})} className={`block w-full p-4 rounded-lg font-medium border-2 transition-all text-left ${cvData.settings.template === 'professional' ? 'border-[#00b14f] bg-[#e8f7ee] text-[#00b14f]' : 'border-gray-200 text-gray-700 hover:border-[#00b14f]'}`}>
                <div className="font-bold mb-1 text-sm">Mẫu Chuyên Nghiệp</div>
                <div className="text-[11px] text-gray-500 font-normal">Thiết kế hiện đại, tinh tế cho môi trường doanh nghiệp.</div>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TabPanel;
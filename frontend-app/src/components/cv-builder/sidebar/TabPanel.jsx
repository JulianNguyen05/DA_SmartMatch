import React from 'react';
import { X } from 'lucide-react';
// DndContext import can be removed since it's no longer used here
import LayoutSidebar from './LayoutSidebar';

// Mang các hằng số cấu hình sang đây cho gọn file index
const FONT_OPTIONS = ['Roboto', 'Arial', 'Times New Roman', 'Georgia', 'Courier New'];
const COLOR_THEMES = [
  { name: 'Xanh lá', primary: '#00b14f', accent: '#e8f7ee' },
  { name: 'Xanh dương', primary: '#0066cc', accent: '#e6f2ff' },
  { name: 'Đỏ', primary: '#dc2626', accent: '#fee2e2' },
  { name: 'Tím', primary: '#7c3aed', accent: '#f3e8ff' },
];

const TabPanel = ({
  activeTab,
  isPanelOpen,
  setIsPanelOpen,
  cvData,
  setCvData,
  handleFontChange,
  handleColorChange,
  handleDragEnd,
  handleChangeRatio
}) => {
  return (
    <div className={`transition-all duration-300 ${isPanelOpen ? 'w-[500px] ml-4 my-4 mr-4' : 'w-0 overflow-hidden'}`}>
      <div className="w-[500px] h-full bg-white rounded-xl shadow-md flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b sticky top-0 bg-white z-10">
          <h3 className="font-bold text-lg text-gray-800">
            {activeTab === 'design' && 'Thiết kế & Font'}
            {activeTab === 'layout' && 'Bố cục CV'}
            {activeTab === 'template' && 'Đổi mẫu CV'}
          </h3>
          <button 
            onClick={() => setIsPanelOpen(false)} 
            className="p-1.5 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
          >
            <X size={18}/>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
          
          {/* TAB: DESIGN */}
          {activeTab === 'design' && (
            <div className="animate-fadeIn">
              <div className="mb-6">
                <label className="block font-semibold text-sm text-gray-700 mb-3">Chọn Font</label>
                <select 
                  value={cvData.settings.font}
                  onChange={(e) => handleFontChange(e.target.value)}
                  className="w-full p-2.5 border rounded-lg bg-white text-sm focus:outline-none focus:border-[#00b14f] focus:ring-1 focus:ring-[#00b14f]"
                >
                  {FONT_OPTIONS.map(font => (
                    <option key={font} value={font}>{font}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-sm text-gray-700 mb-3">Chủ đề màu sắc</label>
                <div className="space-y-3">
                  {COLOR_THEMES.map(theme => (
                    <button
                      key={theme.name}
                      onClick={() => handleColorChange(theme.primary, theme.accent)}
                      className={`w-full flex items-center gap-3 p-3 border rounded-lg transition-all ${
                        cvData.settings.primaryColor === theme.primary 
                          ? 'border-[#00b14f] bg-[#e8f7ee] ring-1 ring-[#00b14f]' 
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div 
                        className="w-6 h-6 rounded-full shadow-sm"
                        style={{ backgroundColor: theme.primary }}
                      />
                      <span className="text-sm font-medium text-gray-700">{theme.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: LAYOUT */}
          {activeTab === 'layout' && (
            <div className="animate-fadeIn">
              {/* Added back LayoutSidebar WITHOUT the DndContext wrapper */}
              <LayoutSidebar 
                layout={cvData.layout}
                onChangeRatio={handleChangeRatio}
                primaryColor={cvData.settings.primaryColor}
              />
            </div>
          )}

          {/* TAB: TEMPLATE */}
          {activeTab === 'template' && (
            <div className="animate-fadeIn">
              <button 
                onClick={() => setCvData({...cvData, settings: {...cvData.settings, template: 'simple'}})} 
                className={`block w-full p-4 rounded-lg font-medium border-2 transition-all text-left ${
                  cvData.settings.template === 'simple'
                    ? 'border-[#00b14f] bg-[#e8f7ee] text-[#00b14f]'
                    : 'border-gray-200 text-gray-700 hover:border-[#00b14f]'
                }`}
              >
                <div className="font-bold mb-1">Mẫu Tiêu Chuẩn</div>
                <div className="text-xs text-gray-500 font-normal">Thiết kế tối giản, chuyên nghiệp phù hợp với mọi ngành nghề.</div>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TabPanel;
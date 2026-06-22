import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Palette, LayoutList, LayoutTemplate, X } from 'lucide-react';
import { DndContext } from '@dnd-kit/core';
import SimpleTemplate from '../../../components/cv-builder/templates/SimpleTemplate';
import LayoutSidebar from '../../../components/cv-builder/sidebar/LayoutSidebar';

const TEMPLATE_COMPONENTS = {
  'simple': SimpleTemplate,
};

const FONT_OPTIONS = ['Roboto', 'Arial', 'Times New Roman', 'Georgia', 'Courier New'];
const COLOR_THEMES = [
  { name: 'Xanh lá', primary: '#00b14f', accent: '#e8f7ee' },
  { name: 'Xanh dương', primary: '#0066cc', accent: '#e6f2ff' },
  { name: 'Đỏ', primary: '#dc2626', accent: '#fee2e2' },
  { name: 'Tím', primary: '#7c3aed', accent: '#f3e8ff' },
];

const ALL_AVAILABLE_SECTIONS = [
  'personalInfo', 'objective', 'experience', 'education', 
  'skills', 'hobbies', 'awards', 'certifications', 'projects', 'references'
];

const CVBuilderPage = () => {
  const { id: cvId } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('layout');
  const [isPanelOpen, setIsPanelOpen] = useState(true);

  // === STATE CHÍNH - QUẢN LÝ CẢ CV ===
  const [cvData, setCvData] = useState({
    settings: { 
      template: 'simple', 
      font: 'Roboto',
      primaryColor: '#00b14f',
      accentColor: '#e8f7ee'
    },
    
    // Layout state - này là trái tim của tính năng
    layout: {
      activeRows: [
        { id: 'row-1', ratio: '10-0', leftItems: ['personalInfo'], rightItems: [] },
        { id: 'row-2', ratio: '7-3', leftItems: ['objective', 'experience', 'education', 'hobbies'], rightItems: ['skills', 'awards'] }
      ],
      unusedItems: ['projects', 'references', 'certifications']
    },
    
    // Mockdata
    data: {
      personalInfo: { 
        fullName: 'Trọng Hữu', 
        jobTitle: 'Software Developer',
        avatar: 'https://via.placeholder.com/100',
        phone: '(123) 456-7890',
        email: 'trong.huu@example.com',
        website: 'github.com/tronghuu',
        address: 'Đà Nẵng, Việt Nam',
        dateOfBirth: '15/05/2002',
        gender: 'Nam'
      },
      objective: 'Mục tiêu trở thành Senior Developer với 5+ năm kinh nghiệm. Đam mê công nghệ mới và giải quyết các bài toán phức tạp.',
      experience: [
        { 
          company: 'Tech Company A', 
          role: 'Junior Developer', 
          duration: '01/2023 - Hiện tại',
          description: 'Phát triển và bảo trì ứng dụng web ReactJS'
        },
        { 
          company: 'Startup B', 
          role: 'Intern', 
          duration: '06/2022 - 12/2022',
          description: 'Hỗ trợ phát triển tính năng frontend'
        }
      ],
      education: [
        { 
          school: 'Đại học Bách Khoa Đà Nẵng', 
          major: 'Công nghệ Thông tin',
          duration: '2020 - 2024',
          gpa: '3.8/4.0'
        }
      ],
      skills: ['ReactJS', 'NodeJS', 'JavaScript/ES6+', 'HTML/CSS', 'MongoDB', 'PostgreSQL', 'Git', 'Docker'],
      hobbies: ['Lập trình', 'Đọc sách', 'Chơi game'],
      awards: [
        { title: 'Best Developer Award', issuer: 'Tech Company A', date: '2023' }
      ],
      certifications: [
        { name: 'React Advanced', issuer: 'Udemy', date: '2023' }
      ],
      projects: [
        { name: 'E-commerce', description: 'MERN stack', link: 'github.com' }
      ],
      references: [
        { name: 'Phạm Thị Kim Ngoan', position: 'Senior Manager', company: 'Tech Company A' }
      ]
    }
  });

  // === HÀM CẬP NHẬT LAYOUT TỪ SIDEBAR ===
  const updateLayout = (newLayout) => {
    setCvData(prev => ({
      ...prev,
      layout: newLayout
    }));
  };

  // === HÀM XỬ LÝ DRAG & DROP ===
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over) return;

    // Lấy active item và over container
    const activeId = active.id; // VD: 'item-experience'
    const overId = over.id;     // VD: 'droppable-row-2-left'

    // Parse IDs
    const activeType = String(activeId).split('-')[0]; // 'item' hoặc 'unused'
    const itemId = String(activeId).split('-').slice(1).join('-'); // 'experience' hoặc 'projects'
    
    const overType = String(overId).split('-')[0]; // 'droppable'
    const overLocation = String(overId).split('-').slice(1).join('-'); // 'row-1-left'

    // Copy current layout
    let newLayout = JSON.parse(JSON.stringify(cvData.layout));

    // 1. Xóa item khỏi vị trí cũ
    if (activeType === 'item') {
      // Item đang ở trong activeRows
      newLayout.activeRows = newLayout.activeRows.map(row => ({
        ...row,
        leftItems: row.leftItems.filter(id => id !== itemId),
        rightItems: row.rightItems.filter(id => id !== itemId)
      }));
    } else if (activeType === 'unused') {
      // Item đang ở trong unusedItems
      newLayout.unusedItems = newLayout.unusedItems.filter(id => id !== itemId);
    }

    // 2. Thêm item vào vị trí mới
    if (overType === 'droppable') {
      const [rowIdStr, colStr] = overLocation.split('-');
      const rowId = `row-${rowIdStr}`;
      const column = colStr; // 'left' hoặc 'right'

      newLayout.activeRows = newLayout.activeRows.map(row => {
        if (row.id === rowId) {
          if (column === 'left') {
            return { ...row, leftItems: [...row.leftItems, itemId] };
          } else if (column === 'right') {
            return { ...row, rightItems: [...row.rightItems, itemId] };
          }
        }
        return row;
      });
    } else if (overType === 'unused') {
      // Thả vào kho lưu trữ
      newLayout.unusedItems = [...newLayout.unusedItems, itemId];
    }

    // 3. Cập nhật state
    updateLayout(newLayout);
  };

  // === HÀM ĐỔI TỶ LỆ CỘT ===
  const handleChangeRatio = (rowId, newRatio) => {
    let newLayout = JSON.parse(JSON.stringify(cvData.layout));
    newLayout.activeRows = newLayout.activeRows.map(row => 
      row.id === rowId ? { ...row, ratio: newRatio } : row
    );
    updateLayout(newLayout);
  };

  // === HÀM ĐỔI MÀU & FONT ===
  const handleColorChange = (primaryColor, accentColor) => {
    setCvData(prev => ({
      ...prev,
      settings: { ...prev.settings, primaryColor, accentColor }
    }));
  };

  const handleFontChange = (font) => {
    setCvData(prev => ({
      ...prev,
      settings: { ...prev.settings, font }
    }));
  };

  // === HÀM TỪ TEMPLATE GỌI LẠI - CLICK SECTION TRONG CV ===
  const handleSectionClick = (sectionId) => {
    // Nếu click vào section trong CV, scroll sidebar đến section đó
    // Có thể highlight section trong sidebar
    console.log('Clicked section:', sectionId);
    // TODO: Implement focus/highlight logic
  };

  const SelectedTemplate = TEMPLATE_COMPONENTS[cvData.settings.template] || SimpleTemplate;

  return (
    <div className="flex flex-col h-screen bg-[#f3f4f6]">
      {/* HEADER */}
      <header className="h-14 bg-white border-b flex items-center p-4 shadow-sm z-20 font-bold text-gray-700">
        Worklify CV Builder
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* === NAVBAR BÊN TRÁI === */}
        <div className="w-[150px] bg-white border-r z-20 shadow-sm flex flex-col items-center py-4 gap-4">
          <button 
            onClick={() => { setActiveTab('design'); setIsPanelOpen(true); }} 
            className={`p-3 rounded-lg flex flex-col items-center transition-all ${activeTab === 'design' && isPanelOpen ? 'bg-[#e8f7ee] text-[#00b14f]' : 'text-gray-500 hover:bg-gray-100'}`}
            title="Thiết kế & Font"
          >
            <Palette size={20}/>
            <span className="text-[10px] mt-1 font-medium text-center">Thiết kế & Font</span>
          </button>

          <button 
            onClick={() => { setActiveTab('layout'); setIsPanelOpen(true); }} 
            className={`p-3 rounded-lg flex flex-col items-center transition-all ${activeTab === 'layout' && isPanelOpen ? 'bg-[#e8f7ee] text-[#00b14f]' : 'text-gray-500 hover:bg-gray-100'}`}
            title="Bố cục CV"
          >
            <LayoutList size={20}/>
            <span className="text-[10px] mt-1 font-medium">Bố cục</span>
          </button>

          <button 
            onClick={() => { setActiveTab('template'); setIsPanelOpen(true); }} 
            className={`p-3 rounded-lg flex flex-col items-center transition-all ${activeTab === 'template' && isPanelOpen ? 'bg-[#e8f7ee] text-[#00b14f]' : 'text-gray-500 hover:bg-gray-100'}`}
            title="Đổi mẫu CV"
          >
            <LayoutTemplate size={20}/>
            <span className="text-[10px] mt-1 font-medium text-center">Mẫu CV</span>
          </button>
        </div>

        {/* === TAB PANEL === */}
        <div className={`w-[500px] bg-white border-r z-10 overflow-y-auto transition-transform shadow-lg ${isPanelOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          
          {/* TAB: DESIGN */}
          {activeTab === 'design' && (
            <div className="p-5">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg">Thiết kế & Font</h3>
                <button onClick={() => setIsPanelOpen(false)} className="hover:bg-gray-100 p-1 rounded">
                  <X size={16}/>
                </button>
              </div>

              {/* Font */}
              <div className="mb-6">
                <label className="block font-semibold text-sm text-gray-700 mb-3">Chọn Font</label>
                <select 
                  value={cvData.settings.font}
                  onChange={(e) => handleFontChange(e.target.value)}
                  className="w-full p-2 border rounded bg-white text-sm focus:outline-none focus:border-[#00b14f]"
                >
                  {FONT_OPTIONS.map(font => (
                    <option key={font} value={font}>{font}</option>
                  ))}
                </select>
              </div>

              {/* Color Theme */}
              <div>
                <label className="block font-semibold text-sm text-gray-700 mb-3">Chủ đề màu sắc</label>
                <div className="space-y-2">
                  {COLOR_THEMES.map(theme => (
                    <button
                      key={theme.name}
                      onClick={() => handleColorChange(theme.primary, theme.accent)}
                      className={`w-full flex items-center gap-3 p-3 border-2 rounded-lg transition-all ${
                        cvData.settings.primaryColor === theme.primary 
                          ? 'border-[#00b14f] bg-[#e8f7ee]' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div 
                        className="w-8 h-8 rounded-full border border-gray-300"
                        style={{ backgroundColor: theme.primary }}
                      />
                      <span className="text-sm font-medium text-gray-700">{theme.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: LAYOUT - DND VERSION */}
          {activeTab === 'layout' && (
            <DndContext onDragEnd={handleDragEnd}>
              <LayoutSidebar 
                layout={cvData.layout}
                onChangeRatio={handleChangeRatio}
                primaryColor={cvData.settings.primaryColor}
              />
            </DndContext>
          )}

          {/* TAB: TEMPLATE */}
          {activeTab === 'template' && (
            <div className="p-5">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg">Đổi mẫu CV</h3>
                <button onClick={() => setIsPanelOpen(false)} className="hover:bg-gray-100 p-1 rounded">
                  <X size={16}/>
                </button>
              </div>
              
              <button 
                onClick={() => setCvData({...cvData, settings: {...cvData.settings, template: 'simple'}})} 
                className={`block w-full p-3 mb-2 rounded font-medium border-2 transition-all ${
                  cvData.settings.template === 'simple'
                    ? 'border-[#00b14f] bg-[#e8f7ee] text-[#00b14f]'
                    : 'border-gray-200 text-gray-700 hover:border-[#00b14f]'
                }`}
              >
                Mẫu Tiêu Chuẩn
              </button>
            </div>
          )}
        </div>

        {/* === CANVAS A4 === */}
        <div 
          className="flex-1 overflow-y-auto bg-gray-200 relative flex justify-center py-10 transition-all"
          style={{ marginLeft: isPanelOpen ? '150px' : '0' }}
        >
          <div className="w-[794px] min-h-[1123px] shadow-xl bg-white">
            <SelectedTemplate 
              cvData={cvData}
              onSectionClick={handleSectionClick}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CVBuilderPage;

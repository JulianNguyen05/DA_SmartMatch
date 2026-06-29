import React, { useState, useEffect, useRef } from 'react';
import { ArrowUp, ArrowDown, Plus } from 'lucide-react';
import EditableTimelineList from '../shared/EditableTimelineList';
import EditableRowList from '../shared/EditableRowList';
import EditableTagList from '../shared/EditableTagList';
import EditableParagraphList from '../shared/EditableParagraphList';
import {
  commonEditableClass,
  handleHTMLBlur,
  adaptDataForList,
  revertDataFromList,
  getGridClasses,
  setupPagination,
  TemplateContext,
  useTemplateContext
} from './cvTemplateCore';

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE MASTER CONFIGURATION 
// Quản lý MỌI THỨ: Order, Data mặc định, Layout, Setting, Placeholder
// ─────────────────────────────────────────────────────────────────────────────

export const SIMPLE_TEMPLATE_CONFIG = {
  id: 'simple',
  // Thứ tự ưu tiên của block khi người dùng kéo thả hoặc khôi phục
  sectionOrder: [
    "avatar", "contactInfo", "personalInfo", "objective", "education",
    "experience", "activities", "certifications", "awards", "skills",
    "references", "hobbies", "projects", "customSection"
  ],
  
  defaultSettings: {
    template: "simple",
    font: "Roboto",
    fontSize: "medium",
    primaryColor: "#00b14f",
    accentColor: "#e8f7ee",
    avatarShape: "square",
    avatarSize: 120,
  },

  defaultData: {
    sectionTitles: {},
    avatar: { url: "http://localhost:8080/uploads/logos/user.jpg" },
    personalInfo: { fullName: "", jobTitle: "" },
    contactInfo: [
      { label: "Ngày sinh",     value: "" },
      { label: "Giới tính",     value: "" },
      { label: "Số điện thoại", value: "" },
      { label: "Email",         value: "" },
      { label: "Website",       value: "" },
      { label: "Địa chỉ",      value: "" },
    ],
    objective: [], experience: [], education: [], activities: [],
    skills: [], hobbies: [], awards: [], certifications: [],
    projects: [], references: [],
  },

  defaultLayout: {
    activeRows: [
      {
        id: 'row-1', ratio: '30-70',
        leftItems: ['avatar'],
        rightItems: ['personalInfo', 'contactInfo'],
      },
      {
        id: 'row-2', ratio: '10-0',
        leftItems: [
          'objective', 'education', 'experience', 'activities',
          'certifications', 'awards', 'skills', 'references', 'hobbies', 'projects',
        ],
        rightItems: [],
      },
    ],
    unusedItems: ['customSection'],
  },

  // Quản lý placeholder (chữ mờ) riêng cho Simple Template
  placeholders: {
    personalInfo: { fullName: "HỌ VÀ TÊN", jobTitle: "Vị trí ứng tuyển" },
    contactInfo: { title: "Tiêu đề", value: "Nhập nội dung..." },
    sections: {
      objective: "MỤC TIÊU NGHỀ NGHIỆP",
      skills: "KỸ NĂNG",
      hobbies: "SỞ THÍCH",
      experience: "KINH NGHIỆM LÀM VIỆC",
      education: "HỌC VẤN",
      activities: "HOẠT ĐỘNG",
      projects: "DỰ ÁN",
      certifications: "CHỨNG CHỈ",
      awards: "GIẢI THƯỞNG",
      references: "NGƯỜI THAM CHIẾU",
      customSection: "Thông tin thêm"
    }
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PRIVATE CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────
const contactEditableClass = 'outline-none focus:bg-blue-50 focus:ring-1 focus:ring-blue-300 rounded px-1 transition-all empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400 empty:before:pointer-events-none empty:before:block cursor-text empty:border empty:border-dashed empty:border-red-400 empty:bg-red-50/20 min-w-[40px] inline-block';
const sectionWrapClass = (isHighlighted) => `mb-6 cursor-pointer transition-all ${isHighlighted ? 'outline outline-2 outline-dashed outline-yellow-400 p-2 rounded' : ''}`;
const EMPTY_ITEM = { date: '', title: '', subtitle: '', description: '' };

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────
const EditableContactList = ({ items, sectionId, primaryColor, onUpdateItems }) => {
  const config = useTemplateContext(); // Lấy placeholder từ config
  
  const handleTextChange = (index, field, newText) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: newText };
    onUpdateItems(sectionId, updated);
  };
  const handleMoveUp = (index) => {
    if (index === 0) return;
    const updated = [...items];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    onUpdateItems(sectionId, updated);
  };
  const handleMoveDown = (index) => {
    if (index === items.length - 1) return;
    const updated = [...items];
    [updated[index + 1], updated[index]] = [updated[index], updated[index + 1]];
    onUpdateItems(sectionId, updated);
  };
  const handleDelete = (index) => onUpdateItems(sectionId, items.filter((_, i) => i !== index));
  const handleAdd = (index) => {
    const updated = [...items];
    updated.splice(index + 1, 0, { label: '', value: '', placeholder: config.placeholders.contactInfo.value });
    onUpdateItems(sectionId, updated);
  };

  return (
    <div className="w-full relative group/section mt-3">
      <div className="space-y-1 relative">
        {items.map((item, index) => (
          <div key={index} className="relative flex flex-wrap items-start group/item transition-all border border-transparent hover:border-dashed hover:border-gray-300 p-1 -ml-1 rounded">
            <div className="absolute right-0 -top-8 flex-row gap-1 bg-gray-100 shadow-md border border-gray-200 rounded p-1 z-20 opacity-0 invisible group-hover/item:opacity-100 group-hover/item:visible transition-all flex" contentEditable="false">
              <button onClick={() => handleMoveUp(index)} disabled={index === 0} className="p-1 hover:bg-gray-300 rounded text-gray-600 disabled:opacity-30"><ArrowUp size={12} /></button>
              <button onClick={() => handleMoveDown(index)} disabled={index === items.length - 1} className="p-1 hover:bg-gray-300 rounded text-gray-600 disabled:opacity-30"><ArrowDown size={12} /></button>
              <button onClick={() => handleDelete(index)} className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs flex items-center gap-1">Xóa</button>
              <button onClick={() => handleAdd(index)} className="px-2 py-1 bg-[#00b14f] hover:bg-green-600 text-white rounded text-xs flex items-center gap-1"><Plus size={12} /> Thêm</button>
            </div>

            <div contentEditable suppressContentEditableWarning
              onBlur={(e) => handleHTMLBlur(e, 'label', (f, v) => handleTextChange(index, f, v))}
              className={`font-bold text-[0.9em] mr-1 mt-0.5 ${contactEditableClass}`} style={{ color: primaryColor }}
              data-placeholder={config.placeholders.contactInfo.title}
              dangerouslySetInnerHTML={{ __html: item.label }} />
            <span className="font-bold text-[0.9em] mr-2 mt-0.5" style={{ color: primaryColor }}>:</span>

            <div contentEditable suppressContentEditableWarning
              onBlur={(e) => handleHTMLBlur(e, 'value', (f, v) => handleTextChange(index, f, v))}
              className={`text-gray-700 flex-1 text-[0.9em] mt-0.5 ${contactEditableClass}`}
              data-placeholder={item.placeholder || config.placeholders.contactInfo.value}
              dangerouslySetInnerHTML={{ __html: item.value }} />
          </div>
        ))}
      </div>
    </div>
  );
};

const EditableSectionTitle = ({ sectionId, sectionTitle, allSectionTitles, primaryColor, onUpdateSectionData }) => {
  const config = useTemplateContext();
  const defaultTitle = config.placeholders.sections[sectionId.split('_')[0]] || "TIÊU ĐỀ";
  
  return (
    <h3 contentEditable suppressContentEditableWarning
      onBlur={(e) => handleHTMLBlur(e, sectionId, (f, v) => onUpdateSectionData('sectionTitles', { ...allSectionTitles, [f]: v }))}
      className={`font-bold text-[1.1em] uppercase mb-3 pb-1.5 w-full ${commonEditableClass}`}
      style={{ color: primaryColor, borderBottom: `2px solid ${primaryColor}` }}
      data-placeholder={defaultTitle}
      dangerouslySetInnerHTML={{ __html: sectionTitle ?? defaultTitle }}
    />
  );
};

const renderDynamicList = (layoutType, props) => {
  switch (layoutType) {
    case 'row': return <EditableRowList {...props} />;
    case 'tags': return <EditableTagList {...props} />;
    case 'paragraph': return <EditableParagraphList {...props} />;
    case 'timeline': default: return <EditableTimelineList {...props} />;
  }
};

const listProps = (dataType, data, sectionId, primaryColor, onUpdateSectionData) => ({
  items: adaptDataForList(data, dataType), sectionId, primaryColor, emptyItemTemplate: EMPTY_ITEM,
  onUpdateItems: (id, updated) => onUpdateSectionData(id, revertDataFromList(updated, dataType)),
});

// ─────────────────────────────────────────────────────────────────────────────
// SECTION RENDERERS
// ─────────────────────────────────────────────────────────────────────────────
const SECTION_RENDERER = {
  avatar: ({ data, primaryColor, settings, isHighlighted, sectionId, onUpdateSectionData }) => {
    const size = settings?.avatarSize || 120;
    const isCircle = settings?.avatarShape === 'circle';
    const fileInputRef = useRef(null);
    const handleImageChange = (e) => {
      const file = e.target.files[0]; if (!file) return;
      const reader = new FileReader();
      reader.onloadend = () => onUpdateSectionData(sectionId, { ...data, url: reader.result });
      reader.readAsDataURL(file);
    };
    const imgStyle = { width: `${size}px`, height: isCircle ? `${size}px` : `${size * 1.33}px`, borderRadius: isCircle ? '50%' : '8px', border: `3px solid ${primaryColor}` };

    return (
      <div className={`mb-4 flex justify-start cursor-pointer transition-all relative group ${isHighlighted ? 'outline outline-2 outline-dashed outline-yellow-400 p-2 rounded' : ''}`} onClick={() => fileInputRef.current?.click()}>
        <img src={data?.url || 'http://localhost:8080/uploads/logos/user.jpg'} alt="Avatar" className="bg-gray-200 object-cover" style={imgStyle} />
        <div className="absolute flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity" style={imgStyle}><span className="text-white text-xs font-semibold">Đổi ảnh</span></div>
        <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
      </div>
    );
  },

personalInfo: ({ data, primaryColor, sectionId, onUpdateSectionData, isHighlighted }) => {
    const config = useTemplateContext();
    return (
      <div className={`mb-2 text-left cursor-pointer transition-all ${isHighlighted ? 'outline outline-2 outline-dashed outline-yellow-400 p-2 rounded' : ''}`}>
        <h1 contentEditable suppressContentEditableWarning
          onBlur={(e) => handleHTMLBlur(e, 'fullName', (f, v) => onUpdateSectionData(sectionId, { ...data, [f]: v }))}
          className={`text-[2em] font-extrabold tracking-tight min-w-[200px] ${commonEditableClass}`} style={{ color: primaryColor }}
          data-placeholder={config.placeholders.personalInfo.fullName}
          dangerouslySetInnerHTML={{ __html: data?.fullName || '' }} />
        <br />
        <h2 contentEditable suppressContentEditableWarning
          onBlur={(e) => handleHTMLBlur(e, 'jobTitle', (f, v) => onUpdateSectionData(sectionId, { ...data, [f]: v }))}
          className={`text-[1.15em] font-medium mt-1 text-gray-600 ${commonEditableClass}`}
          data-placeholder={config.placeholders.personalInfo.jobTitle}
          dangerouslySetInnerHTML={{ __html: data?.jobTitle || '' }} />
      </div>
    );
  },

  contactInfo: ({ data, primaryColor, sectionId, onUpdateSectionData, isHighlighted }) => (
    <div className={sectionWrapClass(isHighlighted)}>
      <EditableContactList items={Array.isArray(data) ? data : []} sectionId={sectionId} primaryColor={primaryColor} onUpdateItems={onUpdateSectionData} />
    </div>
  ),

  objective: (props) => (
    <div className={sectionWrapClass(props.isHighlighted)}>
      <EditableSectionTitle {...props} />
      {renderDynamicList(props.settings?.sectionLayouts?.[props.sectionId] || 'paragraph', {
        items: Array.isArray(props.data) ? props.data : props.data ? [{ description: props.data }] : [],
        sectionId: props.sectionId, primaryColor: props.primaryColor, emptyItemTemplate: { description: '' },
        onUpdateItems: (id, updated) => props.onUpdateSectionData(id, updated),
      })}
    </div>
  ),

  customSectionRenderer: ({ data, primaryColor, sectionId, onUpdateSectionData, isHighlighted }) => {
    const config = useTemplateContext();
    return (
      <div className={sectionWrapClass(isHighlighted)}>
        <h3 contentEditable suppressContentEditableWarning
          onBlur={(e) => handleHTMLBlur(e, 'title', (f, v) => onUpdateSectionData(sectionId, { ...data, [f]: v }))}
          className={`font-bold text-[1.1em] uppercase mb-3 pb-1.5 inline-block min-w-[150px] w-full ${commonEditableClass}`}
          style={{ color: primaryColor, borderBottom: `2px solid ${primaryColor}` }}
          data-placeholder="Tên mục"
          dangerouslySetInnerHTML={{ __html: data?.title || config.placeholders.sections.customSection }} />
        <div contentEditable suppressContentEditableWarning
          onBlur={(e) => handleHTMLBlur(e, 'content', (f, v) => onUpdateSectionData(sectionId, { ...data, [f]: v }))}
          className={`text-[1em] text-gray-700 leading-relaxed whitespace-pre-wrap min-h-[40px] w-full ${commonEditableClass}`}
          data-placeholder="Nội dung thông tin thêm..."
          dangerouslySetInnerHTML={{ __html: data?.content || '' }} />
      </div>
    );
  },

  // Map cho các sections còn lại
  skills: (props) => <div className={sectionWrapClass(props.isHighlighted)}><EditableSectionTitle {...props} />{renderDynamicList(props.settings?.sectionLayouts?.[props.sectionId] || 'tags', listProps('skills', props.data, props.sectionId, props.primaryColor, props.onUpdateSectionData))}</div>,
  hobbies: (props) => <div className={sectionWrapClass(props.isHighlighted)}><EditableSectionTitle {...props} />{renderDynamicList(props.settings?.sectionLayouts?.[props.sectionId] || 'tags', listProps('hobbies', props.data, props.sectionId, props.primaryColor, props.onUpdateSectionData))}</div>,
  experience: (props) => <div className={sectionWrapClass(props.isHighlighted)}><EditableSectionTitle {...props} />{renderDynamicList(props.settings?.sectionLayouts?.[props.sectionId] || 'timeline', listProps('experience', props.data, props.sectionId, props.primaryColor, props.onUpdateSectionData))}</div>,
  education: (props) => <div className={sectionWrapClass(props.isHighlighted)}><EditableSectionTitle {...props} />{renderDynamicList(props.settings?.sectionLayouts?.[props.sectionId] || 'timeline', listProps('education', props.data, props.sectionId, props.primaryColor, props.onUpdateSectionData))}</div>,
  activities: (props) => <div className={sectionWrapClass(props.isHighlighted)}><EditableSectionTitle {...props} />{renderDynamicList(props.settings?.sectionLayouts?.[props.sectionId] || 'row', listProps('activities', props.data, props.sectionId, props.primaryColor, props.onUpdateSectionData))}</div>,
  projects: (props) => <div className={sectionWrapClass(props.isHighlighted)}><EditableSectionTitle {...props} />{renderDynamicList(props.settings?.sectionLayouts?.[props.sectionId] || 'row', listProps('projects', props.data, props.sectionId, props.primaryColor, props.onUpdateSectionData))}</div>,
  certifications: (props) => <div className={sectionWrapClass(props.isHighlighted)}><EditableSectionTitle {...props} />{renderDynamicList(props.settings?.sectionLayouts?.[props.sectionId] || 'row', listProps('certifications', props.data, props.sectionId, props.primaryColor, props.onUpdateSectionData))}</div>,
  awards: (props) => <div className={sectionWrapClass(props.isHighlighted)}><EditableSectionTitle {...props} />{renderDynamicList(props.settings?.sectionLayouts?.[props.sectionId] || 'row', listProps('awards', props.data, props.sectionId, props.primaryColor, props.onUpdateSectionData))}</div>,
  references: (props) => <div className={sectionWrapClass(props.isHighlighted)}><EditableSectionTitle {...props} />{renderDynamicList(props.settings?.sectionLayouts?.[props.sectionId] || 'row', listProps('references', props.data, props.sectionId, props.primaryColor, props.onUpdateSectionData))}</div>,
};

const getFontSizeClass = (size) => {
  switch (String(size)) {
    case '3': return 'text-[12px]'; // Nhỏ
    case '4': return 'text-[14px]'; // Vừa (Mặc định)
    case '6': return 'text-[16px]'; // Lớn
    case '7': return 'text-[18px]'; // Rất lớn
    default: return 'text-[14px]';
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// SIMPLE TEMPLATE MAIN COMPONENT
// Bọc bằng TemplateContext.Provider để phát tán cấu hình xuống component con
// ─────────────────────────────────────────────────────────────────────────────

const SimpleTemplate = ({ cvData, onSectionClick, onUpdateSectionData }) => {
  const { layout, data, settings } = cvData;
  const [highlightedSection, setHighlightedSection] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => setupPagination(containerRef), [cvData.layout, cvData.data]);

  const handleSectionClick = (sectionId) => {
    setHighlightedSection(sectionId);
    if (onSectionClick) onSectionClick(sectionId);
  };

  const renderItems = (itemIds) =>
    itemIds.map((itemId) => {
      const isCustomSection = itemId.startsWith('customSection_');
      const SectionComponent = isCustomSection ? SECTION_RENDERER.customSectionRenderer : SECTION_RENDERER[itemId];
      if (!SectionComponent) return null;

      return (
        <div key={itemId} onClick={() => handleSectionClick(itemId)} className="transition-all cv-section">
          <SectionComponent
            data={data[itemId]}
            sectionTitle={data.sectionTitles?.[itemId]}
            allSectionTitles={data.sectionTitles || {}}
            primaryColor={settings.primaryColor}
            settings={settings}
            isHighlighted={highlightedSection === itemId}
            sectionId={itemId}
            onUpdateSectionData={onUpdateSectionData}
          />
        </div>
      );
    });

  const baseFontSizeClass = getFontSizeClass(settings.fontSize);

  return (
    <TemplateContext.Provider value={SIMPLE_TEMPLATE_CONFIG}>
      <div
        ref={containerRef}
        className={`w-full h-fit min-h-[1123px] bg-white p-[50px] text-gray-800 relative z-10 ${baseFontSizeClass}`} 
        style={{ fontFamily: `${settings.font}, sans-serif` }}
      >
        {layout.activeRows.map((row) => {
          const { left, right } = getGridClasses(row.ratio);
          return (
            <div key={row.id} className="grid grid-cols-10 gap-x-8 gap-y-4 mb-4">
              <div className={left}>{renderItems(row.leftItems)}</div>
              {row.ratio !== '10-0' && row.ratio !== '100-0' && (
                <div className={right}>{renderItems(row.rightItems)}</div>
              )}
            </div>
          );
        })}
      </div>
    </TemplateContext.Provider>
  );
};

export default SimpleTemplate;
import React, { useState, useEffect, useRef } from 'react';
import { ArrowUp, ArrowDown, Plus } from 'lucide-react';
import EditableTimelineList from '../shared/EditableTimelineList';
import EditableRowList from '../shared/EditableRowList';
import EditableTagList from '../shared/EditableTagList';
import EditableParagraphList from '../shared/EditableParagraphList';
import {
  commonEditableClass,
  contactEditableClass,
  handleHTMLBlur,
  highlightClass,
  adaptDataForList,
  revertDataFromList,
  setupPagination,
} from './cvTemplateCore';

// ─────────────────────────────────────────────
// DEFAULT LAYOUT — Professional template tự quản lý bố cục mặc định của mình.
// index.jsx sẽ import và dùng khi user chọn template "professional".
//
// Thiết kế 2 cột: cột trái (sidebar màu) chứa avatar + personalInfo + contactInfo + skills + hobbies,
// cột phải (main) chứa objective + experience + education + projects + activities + ...
// ─────────────────────────────────────────────

export const DEFAULT_LAYOUT = {
  activeRows: [
    {
      id: 'row-1',
      ratio: '30-70',
      leftItems: ['avatar', 'personalInfo', 'contactInfo', 'skills', 'hobbies'],
      rightItems: ['objective', 'experience', 'education', 'projects', 'activities'],
    },
    {
      id: 'row-2',
      ratio: '10-0',
      leftItems: ['certifications', 'awards', 'references'],
      rightItems: [],
    },
  ],
  unusedItems: ['customSection'],
};

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────

const getSidebarColor = (settings) => settings?.primaryColor || '#1e3a8a';

const getSidebarTextColor = (hex) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const lum = 0.299 * r + 0.587 * g + 0.114 * b;
  return lum > 150 ? '#111827' : '#ffffff';
};

// ─────────────────────────────────────────────
// Professional Contact List (Thiết kế lại có viền đứt đoạn)
// ─────────────────────────────────────────────

const ProContactList = ({ items, sectionId, textColor, onUpdateItems }) => {
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
    updated.splice(index + 1, 0, { label: '', value: '', placeholder: 'Nhập nội dung...' });
    onUpdateItems(sectionId, updated);
  };

  return (
    <div className="space-y-3 mt-5 py-5 border-y border-dashed" style={{ borderColor: 'rgba(255,255,255,0.25)' }}>
      {items.map((item, index) => (
        <div key={index} className="relative group/item flex flex-col gap-0.5">
          {/* Mini toolbar */}
          <div
            className="absolute right-0 -top-8 flex-row gap-1 bg-gray-100 shadow-md border border-gray-200 rounded p-1 z-20 opacity-0 invisible group-hover/item:opacity-100 group-hover/item:visible transition-all flex"
            contentEditable="false"
          >
            <button onClick={() => handleMoveUp(index)} disabled={index === 0} className="p-1 hover:bg-gray-300 rounded text-gray-600 disabled:opacity-30"><ArrowUp size={12}/></button>
            <button onClick={() => handleMoveDown(index)} disabled={index === items.length - 1} className="p-1 hover:bg-gray-300 rounded text-gray-600 disabled:opacity-30"><ArrowDown size={12}/></button>
            <button onClick={() => handleDelete(index)} className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs">Xóa</button>
            <button onClick={() => handleAdd(index)} className="px-2 py-1 bg-[#00b14f] hover:bg-green-600 text-white rounded text-xs flex items-center gap-1"><Plus size={12}/>Thêm</button>
          </div>

          <div className="flex items-start gap-2">
            <div
              contentEditable suppressContentEditableWarning
              onBlur={(e) => handleHTMLBlur(e, 'label', (f, v) => handleTextChange(index, f, v))}
              className="font-semibold text-[11px] uppercase tracking-wider opacity-60 outline-none cursor-text min-w-[70px]"
              style={{ color: textColor }}
              data-placeholder="Tiêu đề"
              dangerouslySetInnerHTML={{ __html: item.label }}
            />
            <div
              contentEditable suppressContentEditableWarning
              onBlur={(e) => handleHTMLBlur(e, 'value', (f, v) => handleTextChange(index, f, v))}
              className={`text-[12px] font-medium break-all flex-1 ${contactEditableClass}`}
              style={{ color: textColor }}
              data-placeholder={item.placeholder || 'Nhập nội dung...'}
              dangerouslySetInnerHTML={{ __html: item.value }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};


// ─────────────────────────────────────────────
// Section Title variants (Thiết kế Bo tròn - Pill Shape)
// ─────────────────────────────────────────────

/** Section title cho cột trái (sidebar) - Bo tròn viên thuốc có nền làm mờ */
const SidebarSectionTitle = ({ sectionId, defaultTitle, sectionTitle, allSectionTitles, textColor, onUpdateSectionData }) => (
  <div className="mb-4 w-full text-center">
    <h3
      contentEditable suppressContentEditableWarning
      onBlur={(e) => handleHTMLBlur(e, sectionId, (f, v) => onUpdateSectionData('sectionTitles', { ...allSectionTitles, [f]: v }))}
      className={`font-bold text-[13px] uppercase tracking-wider px-5 py-1.5 rounded-full inline-block ${commonEditableClass}`}
      style={{ color: textColor, backgroundColor: 'rgba(255,255,255,0.15)' }}
      data-placeholder={defaultTitle}
      dangerouslySetInnerHTML={{ __html: sectionTitle ?? defaultTitle }}
    />
  </div>
);

/** Section title cho cột phải (main content) - Nền màu chủ đạo bo tròn + đường kẻ ngang */
const MainSectionTitle = ({ sectionId, defaultTitle, sectionTitle, allSectionTitles, primaryColor, onUpdateSectionData }) => (
  <div className="mb-4 flex items-center w-full">
    <h3
      contentEditable suppressContentEditableWarning
      onBlur={(e) => handleHTMLBlur(e, sectionId, (f, v) => onUpdateSectionData('sectionTitles', { ...allSectionTitles, [f]: v }))}
      className={`font-bold text-[14px] uppercase tracking-wide px-5 py-1.5 rounded-full inline-block whitespace-nowrap z-10 ${commonEditableClass}`}
      style={{ backgroundColor: primaryColor, color: '#ffffff' }}
      data-placeholder={defaultTitle}
      dangerouslySetInnerHTML={{ __html: sectionTitle ?? defaultTitle }}
    />
    <div className="flex-1 h-[2px] ml-[-10px] z-0 opacity-20" style={{ backgroundColor: primaryColor }}></div>
  </div>
);


// ─────────────────────────────────────────────
// renderDynamicList
// ─────────────────────────────────────────────

const renderDynamicList = (layoutType, props) => {
  switch (layoutType) {
    case 'row':       return <EditableRowList {...props} />;
    case 'tags':      return <EditableTagList {...props} />;
    case 'paragraph': return <EditableParagraphList {...props} />;
    case 'timeline':
    default:          return <EditableTimelineList {...props} />;
  }
};


// ─────────────────────────────────────────────
// SECTION RENDERERS — CỘT TRÁI (SIDEBAR)
// ─────────────────────────────────────────────

const SIDEBAR_RENDERER = {
  avatar: ({ data, settings, sectionId, onUpdateSectionData, isHighlighted }) => {
    const fileInputRef = useRef(null);
    const size = settings?.avatarSize || 130;
    const isCircle = settings?.avatarShape === 'circle';

    const handleImageChange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => onUpdateSectionData(sectionId, { ...data, url: reader.result });
        reader.readAsDataURL(file);
      }
    };

    const imgStyle = {
      width: `${size}px`,
      height: isCircle ? `${size}px` : `${size * 1.33}px`,
      borderRadius: isCircle ? '50%' : '12px',
      border: '4px solid rgba(255,255,255,0.3)',
    };

    return (
      <div
        className={`mb-4 flex justify-center items-start cursor-pointer transition-all relative group ${highlightClass(isHighlighted)}`}
        onClick={() => fileInputRef.current?.click()}
      >
        <img
          src={data?.url || 'http://localhost:8080/uploads/logos/user.jpg'}
          alt="Avatar"
          className="object-cover"
          style={imgStyle}
        />
        <div className="absolute flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity" style={imgStyle}>
          <span className="text-white text-xs font-semibold">Đổi ảnh</span>
        </div>
        <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
      </div>
    );
  },

  personalInfo: ({ data, sectionId, onUpdateSectionData, isHighlighted, textColor }) => (
    <div className={`mb-6 text-center cursor-pointer transition-all ${highlightClass(isHighlighted)}`}>
      <h1
        contentEditable suppressContentEditableWarning
        onBlur={(e) => handleHTMLBlur(e, 'fullName', (f, v) => onUpdateSectionData(sectionId, { ...data, [f]: v }))}
        className={`text-[22px] font-bold tracking-wide min-w-[80px] ${commonEditableClass}`}
        style={{ color: textColor }}
        data-placeholder="HỌ VÀ TÊN"
        dangerouslySetInnerHTML={{ __html: data?.fullName || '' }}
      />
      <div
        contentEditable suppressContentEditableWarning
        onBlur={(e) => handleHTMLBlur(e, 'jobTitle', (f, v) => onUpdateSectionData(sectionId, { ...data, [f]: v }))}
        className={`text-[14px] italic mt-1 opacity-80 ${commonEditableClass}`}
        style={{ color: textColor }}
        data-placeholder="Vị trí ứng tuyển"
        dangerouslySetInnerHTML={{ __html: data?.jobTitle || '' }}
      />
    </div>
  ),

  contactInfo: ({ data, sectionId, onUpdateSectionData, isHighlighted, settings, textColor }) => {
    const defaultItems = [
      { label: 'Điện thoại',  value: '', placeholder: '0123 456 789' },
      { label: 'Email',        value: '', placeholder: 'email@example.com' },
      { label: 'Website',      value: '', placeholder: 'facebook.com/TopCV.vn' },
      { label: 'Địa chỉ',     value: '', placeholder: 'Quận A, TP. Hà Nội' },
    ];
    const items = Array.isArray(data) && data.length > 0
        ? data.map((d) => ({ ...d, placeholder: d.placeholder || defaultItems.find((x) => x.label === d.label)?.placeholder || 'Nhập...' }))
        : defaultItems;
    return (
      <div className={`mb-6 cursor-pointer transition-all ${highlightClass(isHighlighted)}`}>
        <ProContactList items={items} sectionId={sectionId} textColor={textColor} onUpdateItems={onUpdateSectionData} />
      </div>
    );
  },

  skills: ({ data, sectionId, onUpdateSectionData, isHighlighted, sectionTitle, allSectionTitles, settings, textColor }) => {
    const layoutType = settings?.sectionLayouts?.[sectionId] || 'tags';
    return (
      <div className={`mb-6 mt-6 cursor-pointer transition-all ${highlightClass(isHighlighted)}`}>
        <SidebarSectionTitle sectionId={sectionId} defaultTitle="KỸ NĂNG" sectionTitle={sectionTitle} allSectionTitles={allSectionTitles} textColor={textColor} onUpdateSectionData={onUpdateSectionData} />
        {renderDynamicList(layoutType, { items: adaptDataForList(data, 'skills'), sectionId, primaryColor: textColor, emptyItemTemplate: { date: '', title: '', subtitle: '', description: '' }, onUpdateItems: (id, updated) => onUpdateSectionData(id, revertDataFromList(updated, 'skills')) })}
      </div>
    );
  },

  hobbies: ({ data, sectionId, onUpdateSectionData, isHighlighted, sectionTitle, allSectionTitles, settings, textColor }) => {
    const layoutType = settings?.sectionLayouts?.[sectionId] || 'tags';
    return (
      <div className={`mb-6 mt-6 cursor-pointer transition-all ${highlightClass(isHighlighted)}`}>
        <SidebarSectionTitle sectionId={sectionId} defaultTitle="SỞ THÍCH" sectionTitle={sectionTitle} allSectionTitles={allSectionTitles} textColor={textColor} onUpdateSectionData={onUpdateSectionData} />
        {renderDynamicList(layoutType, { items: adaptDataForList(data, 'hobbies'), sectionId, primaryColor: textColor, emptyItemTemplate: { date: '', title: '', subtitle: '', description: '' }, onUpdateItems: (id, updated) => onUpdateSectionData(id, revertDataFromList(updated, 'hobbies')) })}
      </div>
    );
  },

  references: ({ data, sectionId, onUpdateSectionData, isHighlighted, sectionTitle, allSectionTitles, settings, textColor }) => {
    const layoutType = settings?.sectionLayouts?.[sectionId] || 'row';
    return (
      <div className={`mb-6 mt-6 cursor-pointer transition-all ${highlightClass(isHighlighted)}`}>
        <SidebarSectionTitle sectionId={sectionId} defaultTitle="NGƯỜI THAM CHIẾU" sectionTitle={sectionTitle} allSectionTitles={allSectionTitles} textColor={textColor} onUpdateSectionData={onUpdateSectionData} />
        {renderDynamicList(layoutType, { items: adaptDataForList(data, 'references'), sectionId, primaryColor: textColor, emptyItemTemplate: { date: '', title: '', subtitle: '', description: '' }, onUpdateItems: (id, updated) => onUpdateSectionData(id, revertDataFromList(updated, 'references')) })}
      </div>
    );
  },

  certifications: ({ data, sectionId, onUpdateSectionData, isHighlighted, sectionTitle, allSectionTitles, settings, textColor }) => {
    const layoutType = settings?.sectionLayouts?.[sectionId] || 'row';
    return (
      <div className={`mb-6 mt-6 cursor-pointer transition-all ${highlightClass(isHighlighted)}`}>
        <SidebarSectionTitle sectionId={sectionId} defaultTitle="CHỨNG CHỈ" sectionTitle={sectionTitle} allSectionTitles={allSectionTitles} textColor={textColor} onUpdateSectionData={onUpdateSectionData} />
        {renderDynamicList(layoutType, { items: adaptDataForList(data, 'certifications'), sectionId, primaryColor: textColor, emptyItemTemplate: { date: '', title: '', subtitle: '', description: '' }, onUpdateItems: (id, updated) => onUpdateSectionData(id, revertDataFromList(updated, 'certifications')) })}
      </div>
    );
  },

  awards: ({ data, sectionId, onUpdateSectionData, isHighlighted, sectionTitle, allSectionTitles, settings, textColor }) => {
    const layoutType = settings?.sectionLayouts?.[sectionId] || 'row';
    return (
      <div className={`mb-6 mt-6 cursor-pointer transition-all ${highlightClass(isHighlighted)}`}>
        <SidebarSectionTitle sectionId={sectionId} defaultTitle="GIẢI THƯỞNG" sectionTitle={sectionTitle} allSectionTitles={allSectionTitles} textColor={textColor} onUpdateSectionData={onUpdateSectionData} />
        {renderDynamicList(layoutType, { items: adaptDataForList(data, 'awards'), sectionId, primaryColor: textColor, emptyItemTemplate: { date: '', title: '', subtitle: '', description: '' }, onUpdateItems: (id, updated) => onUpdateSectionData(id, revertDataFromList(updated, 'awards')) })}
      </div>
    );
  },

  customSectionRenderer: ({ data, sectionId, onUpdateSectionData, isHighlighted, textColor }) => (
    <div className={`mb-6 mt-6 cursor-pointer transition-all ${highlightClass(isHighlighted)}`}>
      <SidebarSectionTitle sectionId={sectionId} defaultTitle="THÔNG TIN THÊM" sectionTitle={data?.title} allSectionTitles={{}} textColor={textColor} onUpdateSectionData={onUpdateSectionData} />
      <div
        contentEditable suppressContentEditableWarning
        onBlur={(e) => handleHTMLBlur(e, 'content', (f, v) => onUpdateSectionData(sectionId, { ...data, [f]: v }))}
        className={`text-[13px] leading-relaxed whitespace-pre-wrap min-h-[30px] w-full ${commonEditableClass}`}
        style={{ color: textColor }}
        data-placeholder="Nội dung..."
        dangerouslySetInnerHTML={{ __html: data?.content || '' }}
      />
    </div>
  ),

  // Các section này KHÔNG render trong sidebar — nhường cho MAIN_RENDERER
  avatar: () => null,
  contactInfo: () => null,
};


// ─────────────────────────────────────────────
// SECTION RENDERERS — CỘT PHẢI (MAIN CONTENT)
// ─────────────────────────────────────────────

const MAIN_RENDERER = {
  personalInfo: ({ data, sectionId, onUpdateSectionData, isHighlighted, primaryColor }) => (
    <div className={`mb-6 cursor-pointer transition-all ${highlightClass(isHighlighted)}`}>
      <h1
        contentEditable suppressContentEditableWarning
        onBlur={(e) => handleHTMLBlur(e, 'fullName', (f, v) => onUpdateSectionData(sectionId, { ...data, [f]: v }))}
        className={`text-[28px] font-bold tracking-tight min-w-[200px] ${commonEditableClass}`}
        style={{ color: primaryColor }}
        data-placeholder="HỌ VÀ TÊN"
        dangerouslySetInnerHTML={{ __html: data?.fullName || '' }}
      />
      <div
        contentEditable suppressContentEditableWarning
        onBlur={(e) => handleHTMLBlur(e, 'jobTitle', (f, v) => onUpdateSectionData(sectionId, { ...data, [f]: v }))}
        className={`text-[15px] font-medium mt-1 text-gray-500 ${commonEditableClass}`}
        data-placeholder="Vị trí ứng tuyển"
        dangerouslySetInnerHTML={{ __html: data?.jobTitle || '' }}
      />
    </div>
  ),

  objective: ({ data, sectionId, onUpdateSectionData, isHighlighted, sectionTitle, allSectionTitles, settings, primaryColor }) => {
    const layoutType = settings?.sectionLayouts?.[sectionId] || 'paragraph';
    const items = Array.isArray(data) ? data : data ? [{ description: data }] : [];
    return (
      <div className={`mb-8 cursor-pointer transition-all ${highlightClass(isHighlighted)}`}>
        <MainSectionTitle sectionId={sectionId} defaultTitle="MỤC TIÊU NGHỀ NGHIỆP" sectionTitle={sectionTitle} allSectionTitles={allSectionTitles} primaryColor={primaryColor} onUpdateSectionData={onUpdateSectionData} />
        {renderDynamicList(layoutType, { items, sectionId, primaryColor, emptyItemTemplate: { description: '' }, onUpdateItems: (id, updated) => onUpdateSectionData(id, updated) })}
      </div>
    );
  },

  experience: ({ data, sectionId, onUpdateSectionData, isHighlighted, sectionTitle, allSectionTitles, settings, primaryColor }) => {
    const layoutType = settings?.sectionLayouts?.[sectionId] || 'timeline';
    return (
      <div className={`mb-8 cursor-pointer transition-all ${highlightClass(isHighlighted)}`}>
        <MainSectionTitle sectionId={sectionId} defaultTitle="KINH NGHIỆM LÀM VIỆC" sectionTitle={sectionTitle} allSectionTitles={allSectionTitles} primaryColor={primaryColor} onUpdateSectionData={onUpdateSectionData} />
        {renderDynamicList(layoutType, { items: adaptDataForList(data, 'experience'), sectionId, primaryColor, emptyItemTemplate: { date: '', title: '', subtitle: '', description: '' }, onUpdateItems: (id, updated) => onUpdateSectionData(id, revertDataFromList(updated, 'experience')) })}
      </div>
    );
  },

  education: ({ data, sectionId, onUpdateSectionData, isHighlighted, sectionTitle, allSectionTitles, settings, primaryColor }) => {
    const layoutType = settings?.sectionLayouts?.[sectionId] || 'timeline';
    return (
      <div className={`mb-8 cursor-pointer transition-all ${highlightClass(isHighlighted)}`}>
        <MainSectionTitle sectionId={sectionId} defaultTitle="HỌC VẤN" sectionTitle={sectionTitle} allSectionTitles={allSectionTitles} primaryColor={primaryColor} onUpdateSectionData={onUpdateSectionData} />
        {renderDynamicList(layoutType, { items: adaptDataForList(data, 'education'), sectionId, primaryColor, emptyItemTemplate: { date: '', title: '', subtitle: '', description: '' }, onUpdateItems: (id, updated) => onUpdateSectionData(id, revertDataFromList(updated, 'education')) })}
      </div>
    );
  },

  projects: ({ data, sectionId, onUpdateSectionData, isHighlighted, sectionTitle, allSectionTitles, settings, primaryColor }) => {
    const layoutType = settings?.sectionLayouts?.[sectionId] || 'timeline';
    return (
      <div className={`mb-8 cursor-pointer transition-all ${highlightClass(isHighlighted)}`}>
        <MainSectionTitle sectionId={sectionId} defaultTitle="DỰ ÁN" sectionTitle={sectionTitle} allSectionTitles={allSectionTitles} primaryColor={primaryColor} onUpdateSectionData={onUpdateSectionData} />
        {renderDynamicList(layoutType, { items: adaptDataForList(data, 'projects'), sectionId, primaryColor, emptyItemTemplate: { date: '', title: '', subtitle: '', description: '' }, onUpdateItems: (id, updated) => onUpdateSectionData(id, revertDataFromList(updated, 'projects')) })}
      </div>
    );
  },

  activities: ({ data, sectionId, onUpdateSectionData, isHighlighted, sectionTitle, allSectionTitles, settings, primaryColor }) => {
    const layoutType = settings?.sectionLayouts?.[sectionId] || 'timeline';
    return (
      <div className={`mb-8 cursor-pointer transition-all ${highlightClass(isHighlighted)}`}>
        <MainSectionTitle sectionId={sectionId} defaultTitle="HOẠT ĐỘNG" sectionTitle={sectionTitle} allSectionTitles={allSectionTitles} primaryColor={primaryColor} onUpdateSectionData={onUpdateSectionData} />
        {renderDynamicList(layoutType, { items: adaptDataForList(data, 'activities'), sectionId, primaryColor, emptyItemTemplate: { date: '', title: '', subtitle: '', description: '' }, onUpdateItems: (id, updated) => onUpdateSectionData(id, revertDataFromList(updated, 'activities')) })}
      </div>
    );
  },

  skills: ({ data, sectionId, onUpdateSectionData, isHighlighted, sectionTitle, allSectionTitles, settings, primaryColor }) => {
    const layoutType = settings?.sectionLayouts?.[sectionId] || 'tags';
    return (
      <div className={`mb-8 cursor-pointer transition-all ${highlightClass(isHighlighted)}`}>
        <MainSectionTitle sectionId={sectionId} defaultTitle="KỸ NĂNG" sectionTitle={sectionTitle} allSectionTitles={allSectionTitles} primaryColor={primaryColor} onUpdateSectionData={onUpdateSectionData} />
        {renderDynamicList(layoutType, { items: adaptDataForList(data, 'skills'), sectionId, primaryColor, emptyItemTemplate: { date: '', title: '', subtitle: '', description: '' }, onUpdateItems: (id, updated) => onUpdateSectionData(id, revertDataFromList(updated, 'skills')) })}
      </div>
    );
  },

  hobbies: ({ data, sectionId, onUpdateSectionData, isHighlighted, sectionTitle, allSectionTitles, settings, primaryColor }) => {
    const layoutType = settings?.sectionLayouts?.[sectionId] || 'tags';
    return (
      <div className={`mb-8 cursor-pointer transition-all ${highlightClass(isHighlighted)}`}>
        <MainSectionTitle sectionId={sectionId} defaultTitle="SỞ THÍCH" sectionTitle={sectionTitle} allSectionTitles={allSectionTitles} primaryColor={primaryColor} onUpdateSectionData={onUpdateSectionData} />
        {renderDynamicList(layoutType, { items: adaptDataForList(data, 'hobbies'), sectionId, primaryColor, emptyItemTemplate: { date: '', title: '', subtitle: '', description: '' }, onUpdateItems: (id, updated) => onUpdateSectionData(id, revertDataFromList(updated, 'hobbies')) })}
      </div>
    );
  },

  certifications: ({ data, sectionId, onUpdateSectionData, isHighlighted, sectionTitle, allSectionTitles, settings, primaryColor }) => {
    const layoutType = settings?.sectionLayouts?.[sectionId] || 'row';
    return (
      <div className={`mb-8 cursor-pointer transition-all ${highlightClass(isHighlighted)}`}>
        <MainSectionTitle sectionId={sectionId} defaultTitle="CHỨNG CHỈ" sectionTitle={sectionTitle} allSectionTitles={allSectionTitles} primaryColor={primaryColor} onUpdateSectionData={onUpdateSectionData} />
        {renderDynamicList(layoutType, { items: adaptDataForList(data, 'certifications'), sectionId, primaryColor, emptyItemTemplate: { date: '', title: '', subtitle: '', description: '' }, onUpdateItems: (id, updated) => onUpdateSectionData(id, revertDataFromList(updated, 'certifications')) })}
      </div>
    );
  },

  awards: ({ data, sectionId, onUpdateSectionData, isHighlighted, sectionTitle, allSectionTitles, settings, primaryColor }) => {
    const layoutType = settings?.sectionLayouts?.[sectionId] || 'row';
    return (
      <div className={`mb-8 cursor-pointer transition-all ${highlightClass(isHighlighted)}`}>
        <MainSectionTitle sectionId={sectionId} defaultTitle="GIẢI THƯỞNG" sectionTitle={sectionTitle} allSectionTitles={allSectionTitles} primaryColor={primaryColor} onUpdateSectionData={onUpdateSectionData} />
        {renderDynamicList(layoutType, { items: adaptDataForList(data, 'awards'), sectionId, primaryColor, emptyItemTemplate: { date: '', title: '', subtitle: '', description: '' }, onUpdateItems: (id, updated) => onUpdateSectionData(id, revertDataFromList(updated, 'awards')) })}
      </div>
    );
  },

  references: ({ data, sectionId, onUpdateSectionData, isHighlighted, sectionTitle, allSectionTitles, settings, primaryColor }) => {
    const layoutType = settings?.sectionLayouts?.[sectionId] || 'row';
    return (
      <div className={`mb-8 cursor-pointer transition-all ${highlightClass(isHighlighted)}`}>
        <MainSectionTitle sectionId={sectionId} defaultTitle="NGƯỜI THAM CHIẾU" sectionTitle={sectionTitle} allSectionTitles={allSectionTitles} primaryColor={primaryColor} onUpdateSectionData={onUpdateSectionData} />
        {renderDynamicList(layoutType, { items: adaptDataForList(data, 'references'), sectionId, primaryColor, emptyItemTemplate: { date: '', title: '', subtitle: '', description: '' }, onUpdateItems: (id, updated) => onUpdateSectionData(id, revertDataFromList(updated, 'references')) })}
      </div>
    );
  },

  customSectionRenderer: ({ data, sectionId, onUpdateSectionData, isHighlighted, primaryColor }) => (
    <div className={`mb-8 cursor-pointer transition-all ${highlightClass(isHighlighted)}`}>
      <MainSectionTitle sectionId={sectionId} defaultTitle="THÔNG TIN THÊM" sectionTitle={data?.title} allSectionTitles={{}} primaryColor={primaryColor} onUpdateSectionData={onUpdateSectionData} />
      <div
        contentEditable suppressContentEditableWarning
        onBlur={(e) => handleHTMLBlur(e, 'content', (f, v) => onUpdateSectionData(sectionId, { ...data, [f]: v }))}
        className={`text-[13px] text-gray-700 leading-relaxed whitespace-pre-wrap min-h-[40px] w-full ${commonEditableClass}`}
        data-placeholder="Nội dung..."
        dangerouslySetInnerHTML={{ __html: data?.content || '' }}
      />
    </div>
  ),

  avatar: () => null,
  contactInfo: () => null,
};


// ─────────────────────────────────────────────
// PROFESSIONAL TEMPLATE COMPONENT
// ─────────────────────────────────────────────

const ProfessionalTemplate = ({ cvData, onSectionClick, onUpdateSectionData }) => {
  const { layout, data, settings } = cvData;
  const [highlightedSection, setHighlightedSection] = useState(null);
  const containerRef = useRef(null);

  const sidebarColor = getSidebarColor(settings);
  const sidebarTextColor = getSidebarTextColor(sidebarColor);
  const primaryColor = settings?.primaryColor || sidebarColor;

  useEffect(() => setupPagination(containerRef), [cvData.layout, cvData.data]);

  const handleSectionClick = (sectionId) => {
    setHighlightedSection(sectionId);
    if (onSectionClick) onSectionClick(sectionId);
  };

  const renderSidebarItems = (itemIds) =>
    itemIds.map((itemId) => {
      const isCustomSection = itemId.startsWith('customSection_');
      const SectionComponent = isCustomSection
        ? SIDEBAR_RENDERER.customSectionRenderer
        : SIDEBAR_RENDERER[itemId];
      
      const FallbackComponent = isCustomSection
        ? MAIN_RENDERER.customSectionRenderer
        : MAIN_RENDERER[itemId];
      const Component = SectionComponent || FallbackComponent;
      if (!Component) return null;
      return (
        <div key={itemId} onClick={() => handleSectionClick(itemId)} className="transition-all cv-section">
          <Component
            data={data[itemId]}
            sectionTitle={data.sectionTitles?.[itemId]}
            allSectionTitles={data.sectionTitles || {}}
            primaryColor={sidebarColor}
            textColor={sidebarTextColor}
            settings={settings}
            isHighlighted={highlightedSection === itemId}
            sectionId={itemId}
            onUpdateSectionData={onUpdateSectionData}
          />
        </div>
      );
    });

  const renderMainItems = (itemIds) =>
    itemIds.map((itemId) => {
      const isCustomSection = itemId.startsWith('customSection_');
      const SectionComponent = isCustomSection
        ? MAIN_RENDERER.customSectionRenderer
        : MAIN_RENDERER[itemId];
      if (!SectionComponent) return null;
      return (
        <div key={itemId} onClick={() => handleSectionClick(itemId)} className="transition-all cv-section">
          <SectionComponent
            data={data[itemId]}
            sectionTitle={data.sectionTitles?.[itemId]}
            allSectionTitles={data.sectionTitles || {}}
            primaryColor={primaryColor}
            settings={settings}
            isHighlighted={highlightedSection === itemId}
            sectionId={itemId}
            onUpdateSectionData={onUpdateSectionData}
          />
        </div>
      );
    });

  return (
    <div
      ref={containerRef}
      className="w-full h-fit min-h-[1123px] bg-white relative z-10 flex flex-col"
      style={{ fontFamily: `${settings?.font || 'Inter'}, sans-serif`, fontSize: '13px' }}
    >
      {layout.activeRows.map((row) => {
        const isFullWidth = row.ratio === '10-0' || row.ratio === '100-0';

        return (
          <div key={row.id} className="w-full flex">
            {/* CỘT TRÁI (SIDEBAR) */}
            <div
              className="flex-shrink-0"
              style={{
                width: '35%',
                backgroundColor: sidebarColor,
              }}
            >
              {!isFullWidth && row.leftItems && row.leftItems.length > 0 && (
                <div className="px-6 py-10">
                  {renderSidebarItems(row.leftItems)}
                </div>
              )}
            </div>

            {/* CỘT PHẢI (MAIN CONTENT) */}
            <div className="flex-1 px-8 py-10 bg-white">
              {isFullWidth
                ? renderMainItems(row.leftItems || [])
                : renderMainItems(row.rightItems || [])}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProfessionalTemplate;

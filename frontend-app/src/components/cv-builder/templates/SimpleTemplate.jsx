import React, { useState, useEffect, useRef } from 'react';
import { ArrowUp, ArrowDown, Trash2, Plus } from 'lucide-react';
import EditableTimelineList from '../shared/EditableTimelineList';
// IMPORT THÊM 2 COMPONENT MỚI
import EditableRowList from '../shared/EditableRowList';
import EditableTagList from '../shared/EditableTagList';
import EditableParagraphList from '../shared/EditableParagraphList';

const handleHTMLBlur = (e, field, updateFn) => {
  let val = e.currentTarget.innerHTML.trim();
  if (val === '<br>') val = '';
  updateFn(field, val);
};

const EditableContactList = ({ items, sectionId, primaryColor, onUpdateItems }) => {
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

  const contactEditableClass = "outline-none focus:bg-blue-50 focus:ring-1 focus:ring-blue-300 rounded px-1 transition-all empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400 empty:before:pointer-events-none empty:before:block cursor-text empty:border empty:border-dashed empty:border-red-400 empty:bg-red-50/20 min-w-[40px] inline-block";

  return (
    <div className="w-full relative group/section mt-3">
      <div className="space-y-1 relative">
        {items.map((item, index) => (
          <div key={index} className="relative flex flex-wrap items-start group/item transition-all border border-transparent hover:border-dashed hover:border-gray-300 p-1 -ml-1 rounded">
            {/* Toolbar mini bằng CSS Hover */}
            <div className="absolute right-0 -top-8 flex-row gap-1 bg-gray-100 shadow-md border border-gray-200 rounded p-1 z-20 opacity-0 invisible group-hover/item:opacity-100 group-hover/item:visible transition-all flex" contentEditable="false">
              <button onClick={() => handleMoveUp(index)} disabled={index === 0} className="p-1 hover:bg-gray-300 rounded text-gray-600 disabled:opacity-30"><ArrowUp size={12}/></button>
              <button onClick={() => handleMoveDown(index)} disabled={index === items.length - 1} className="p-1 hover:bg-gray-300 rounded text-gray-600 disabled:opacity-30"><ArrowDown size={12}/></button>
              <button onClick={() => handleDelete(index)} className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs flex items-center gap-1">Xóa</button>
              <button onClick={() => handleAdd(index)} className="px-2 py-1 bg-[#00b14f] hover:bg-green-600 text-white rounded text-xs flex items-center gap-1"><Plus size={12} /> Thêm</button>
            </div>
            
            <div 
              contentEditable suppressContentEditableWarning 
              onBlur={(e) => handleHTMLBlur(e, 'label', (f, v) => handleTextChange(index, f, v))} 
              className={`font-bold text-[13px] mr-1 mt-0.5 ${contactEditableClass}`} 
              style={{ color: primaryColor }}
              data-placeholder="Tiêu đề" 
              dangerouslySetInnerHTML={{ __html: item.label }} 
            />
            <span className="font-bold text-[13px] mr-2 mt-0.5" style={{ color: primaryColor }}>:</span>
            
            <div contentEditable suppressContentEditableWarning onBlur={(e) => handleHTMLBlur(e, 'value', (f, v) => handleTextChange(index, f, v))} className={`text-gray-700 flex-1 text-[13px] mt-0.5 ${contactEditableClass}`} data-placeholder={item.placeholder || "Nhập nội dung..."} dangerouslySetInnerHTML={{ __html: item.value }} />
          </div>
        ))}
      </div>
    </div>
  );
};

const commonEditableClass = "outline-none focus:bg-blue-50 focus:ring-1 focus:ring-blue-300 rounded p-0.5 transition-all empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400 empty:before:pointer-events-none empty:before:block cursor-text inline-block min-w-[30px]";

const EditableSectionTitle = ({ sectionId, defaultTitle, sectionTitle, allSectionTitles, primaryColor, onUpdateSectionData }) => (
  <h3 
    contentEditable suppressContentEditableWarning 
    onBlur={e => handleHTMLBlur(e, sectionId, (f, v) => onUpdateSectionData('sectionTitles', { ...allSectionTitles, [f]: v }))}
    className={`font-bold text-[15px] uppercase mb-3 pb-1.5 w-full ${commonEditableClass}`} 
    style={{ color: primaryColor, borderBottom: `2px solid ${primaryColor}` }}
    data-placeholder={defaultTitle}
    dangerouslySetInnerHTML={{ __html: sectionTitle ?? defaultTitle }}
  />
);

// ĐỔI TÊN HÀM: adaptDataForTimeline -> adaptDataForList
const adaptDataForList = (data, type) => {
  if (!data || !Array.isArray(data)) return [];
  return data.map(item => {
    switch (type) {
      case 'experience': return { date: item.duration, title: item.company, subtitle: item.role, description: item.description };
      case 'education': return { date: item.duration, title: item.school, subtitle: item.major, description: item.gpa ? `GPA: ${item.gpa}\n${item.description || ''}` : item.description };
      case 'activities': return { date: item.duration, title: item.organization, subtitle: item.role, description: item.description };
      case 'projects': return { date: item.duration, title: item.name, subtitle: item.role, description: item.description };
      case 'certifications': return { date: item.date, title: item.name, subtitle: item.issuer, description: '' };
      case 'awards': return { date: item.date, title: item.title, subtitle: item.issuer, description: '' };
      case 'references': return { date: '', title: item.name, subtitle: item.position ? `${item.position} - ${item.company}` : item.company, description: '' };
      case 'skills': return { date: '', title: item.name, subtitle: '', description: item.description };
      case 'hobbies': return { date: '', title: item.name, subtitle: '', description: '' };
      default: return item;
    }
  });
};

const revertDataFromList = (listData, type) => {
  // Nếu dữ liệu trả về là chuỗi (từ ParagraphList), trả về thẳng chuỗi đó
  if (type === 'objective' && listData.length > 0) return listData[0].description;
  
  return listData.map(item => {
    switch (type) {
      case 'experience': return { duration: item.date, company: item.title, role: item.subtitle, description: item.description };
      case 'education': {
        const gpaMatch = item.description?.match(/GPA:\s*(.*)\n?/);
        const desc = item.description?.replace(/GPA:\s*.*\n?/, '') || '';
        return { duration: item.date, school: item.title, major: item.subtitle, gpa: gpaMatch ? gpaMatch[1] : '', description: desc.trim() };
      }
      case 'activities': return { duration: item.date, organization: item.title, role: item.subtitle, description: item.description };
      case 'projects': return { duration: item.date, name: item.title, role: item.subtitle, description: item.description };
      case 'certifications': return { date: item.date, name: item.title, issuer: item.subtitle };
      case 'awards': return { date: item.date, title: item.title, issuer: item.subtitle };
      case 'references': {
        const [position, company] = item.subtitle ? item.subtitle.split(' - ') : ['', ''];
        return { name: item.title, position: position?.trim() || '', company: company?.trim() || '' };
      }
      case 'skills': return { name: item.title, description: item.description };
      case 'hobbies': return { name: item.title };
      default: return item;
    }
  });
};

// HÀM HELPER ĐỂ RENDER LIST DỰA TRÊN LAYOUT TYPE
const renderDynamicList = (layoutType, props) => {
  switch (layoutType) {
    case 'row': return <EditableRowList {...props} />;
    case 'tags': return <EditableTagList {...props} />;
    case 'paragraph': return <EditableParagraphList {...props} />;
    case 'timeline':
    default: return <EditableTimelineList {...props} />;
  }
};

const SECTION_RENDERER = {
  avatar: ({ data, primaryColor, settings, isHighlighted }) => {
    const size = settings?.avatarSize || 120;
    const isCircle = settings?.avatarShape === 'circle';
    return (
      <div className={`mb-4 flex justify-start cursor-pointer transition-all ${isHighlighted ? 'outline outline-2 outline-dashed outline-yellow-400 p-2 rounded' : ''}`}>
        <img 
          src={data?.url || 'http://localhost:8080/uploads/logos/user.jpg'} 
          alt="Avatar" 
          className="bg-gray-200 object-cover" 
          style={{ 
            width: `${size}px`, 
            height: isCircle ? `${size}px` : `${size * 1.33}px`,
            borderRadius: isCircle ? '50%' : '8px',
            border: `3px solid ${primaryColor}` 
          }} 
        />
      </div>
    );
  },

  personalInfo: ({ data, primaryColor, sectionId, onUpdateSectionData, isHighlighted }) => (
    <div className={`mb-2 text-left cursor-pointer transition-all ${isHighlighted ? 'outline outline-2 outline-dashed outline-yellow-400 p-2 rounded' : ''}`}>
      <h1 
        contentEditable suppressContentEditableWarning 
        onBlur={e => handleHTMLBlur(e, 'fullName', (f, v) => onUpdateSectionData(sectionId, { ...data, [f]: v }))}
        className={`text-[28px] font-extrabold tracking-tight min-w-[200px] ${commonEditableClass}`}
        style={{ color: primaryColor }}
        data-placeholder="HỌ VÀ TÊN"
        dangerouslySetInnerHTML={{ __html: data?.fullName || '' }}
      />
      <br/>
      <h2 
        contentEditable suppressContentEditableWarning 
        onBlur={e => handleHTMLBlur(e, 'jobTitle', (f, v) => onUpdateSectionData(sectionId, { ...data, [f]: v }))}
        className={`text-base font-medium mt-1 text-gray-600 ${commonEditableClass}`}
        data-placeholder="Vị trí ứng tuyển"
        dangerouslySetInnerHTML={{ __html: data?.jobTitle || '' }}
      />
    </div>
  ),

  contactInfo: ({ data, primaryColor, sectionId, onUpdateSectionData, isHighlighted }) => {
    const defaultItems = [
      { label: 'Ngày sinh', value: '', placeholder: 'DD/MM/YYYY' },
      { label: 'Giới tính', value: '', placeholder: 'Nam/Nữ' },
      { label: 'Số điện thoại', value: '', placeholder: '0123 456 789' },
      { label: 'Email', value: '', placeholder: 'email@example.com' },
      { label: 'Website', value: '', placeholder: 'facebook.com/TopCV.vn' },
      { label: 'Địa chỉ', value: '', placeholder: 'Quận A, thành phố Hà Nội' },
    ];
    let items = Array.isArray(data) && data.length > 0 ? data.map(d => ({ ...d, placeholder: d.placeholder || (defaultItems.find(def => def.label === d.label)?.placeholder || 'Nhập nội dung...') })) : defaultItems; 

    return (
      <div className={`mb-6 cursor-pointer transition-all ${isHighlighted ? 'outline outline-2 outline-dashed outline-yellow-400 p-2 rounded' : ''}`}>
        <EditableContactList items={items} sectionId={sectionId} primaryColor={primaryColor} onUpdateItems={onUpdateSectionData} />
      </div>
    );
  },

  objective: ({ data, primaryColor, sectionId, onUpdateSectionData, isHighlighted, sectionTitle, allSectionTitles, settings }) => {
  const layoutType = settings?.sectionLayouts?.[sectionId] || 'paragraph';
  
  // data bây giờ là array [{ description: '...' }], không phải string nữa
  const items = Array.isArray(data) ? data : (data ? [{ description: data }] : []);

  return (
    <div className={`mb-6 cursor-pointer transition-all ${isHighlighted ? 'outline outline-2 outline-dashed outline-yellow-400 p-2 rounded' : ''}`}>
      <EditableSectionTitle sectionId={sectionId} defaultTitle="MỤC TIÊU NGHỀ NGHIỆP" sectionTitle={sectionTitle} allSectionTitles={allSectionTitles} primaryColor={primaryColor} onUpdateSectionData={onUpdateSectionData} />
      {renderDynamicList(layoutType, {
        items: items,
        sectionId,
        primaryColor,
        emptyItemTemplate: { description: '' },
        // Lưu thẳng array vào state, không convert về string nữa
        onUpdateItems: (id, updated) => onUpdateSectionData(id, updated)
      })}
    </div>
  );
},

  customSectionRenderer: ({ data, primaryColor, sectionId, onUpdateSectionData, isHighlighted }) => (
    <div className={`mb-6 cursor-pointer transition-all ${isHighlighted ? 'outline outline-2 outline-dashed outline-yellow-400 p-2 rounded' : ''}`}>
      <h3 
        contentEditable suppressContentEditableWarning 
        onBlur={e => handleHTMLBlur(e, 'title', (f, v) => onUpdateSectionData(sectionId, { ...data, [f]: v }))}
        className={`font-bold text-[15px] uppercase mb-3 pb-1.5 inline-block min-w-[150px] w-full ${commonEditableClass}`} 
        style={{ color: primaryColor, borderBottom: `2px solid ${primaryColor}` }}
        data-placeholder="Tên mục"
        dangerouslySetInnerHTML={{ __html: data?.title || 'Thông tin thêm' }}
      />
      <div 
        contentEditable suppressContentEditableWarning 
        onBlur={e => handleHTMLBlur(e, 'content', (f, v) => onUpdateSectionData(sectionId, { ...data, [f]: v }))}
        className={`text-sm text-gray-700 leading-relaxed whitespace-pre-wrap min-h-[40px] w-full ${commonEditableClass}`}
        data-placeholder="Nội dung thông tin thêm..."
        dangerouslySetInnerHTML={{ __html: data?.content || '' }}
      />
    </div>
  ),

  skills: ({ data, primaryColor, sectionId, onUpdateSectionData, isHighlighted, sectionTitle, allSectionTitles, settings }) => {
    const layoutType = settings?.sectionLayouts?.[sectionId] || 'tags'; // Mặc định Kỹ năng là dạng Thẻ (Tags)
    return (
      <div className={`mb-6 cursor-pointer transition-all ${isHighlighted ? 'outline outline-2 outline-dashed outline-yellow-400 p-2 rounded' : ''}`}>
        <EditableSectionTitle sectionId={sectionId} defaultTitle="KỸ NĂNG" sectionTitle={sectionTitle} allSectionTitles={allSectionTitles} primaryColor={primaryColor} onUpdateSectionData={onUpdateSectionData} />
        {renderDynamicList(layoutType, {
          items: adaptDataForList(data, 'skills'),
          sectionId, primaryColor, emptyItemTemplate: { date: '', title: '', subtitle: '', description: '' },
          onUpdateItems: (id, updated) => onUpdateSectionData(id, revertDataFromList(updated, 'skills'))
        })}
      </div>
    );
  },

  hobbies: ({ data, primaryColor, sectionId, onUpdateSectionData, isHighlighted, sectionTitle, allSectionTitles, settings }) => {
    const layoutType = settings?.sectionLayouts?.[sectionId] || 'tags'; // Mặc định Sở thích là dạng Thẻ (Tags)
    return (
      <div className={`mb-6 cursor-pointer transition-all ${isHighlighted ? 'outline outline-2 outline-dashed outline-yellow-400 p-2 rounded' : ''}`}>
        <EditableSectionTitle sectionId={sectionId} defaultTitle="SỞ THÍCH" sectionTitle={sectionTitle} allSectionTitles={allSectionTitles} primaryColor={primaryColor} onUpdateSectionData={onUpdateSectionData} />
        {renderDynamicList(layoutType, {
          items: adaptDataForList(data, 'hobbies'),
          sectionId, primaryColor, emptyItemTemplate: { date: '', title: '', subtitle: '', description: '' },
          onUpdateItems: (id, updated) => onUpdateSectionData(id, revertDataFromList(updated, 'hobbies'))
        })}
      </div>
    );
  },

  experience: ({ data, primaryColor, sectionId, onUpdateSectionData, isHighlighted, sectionTitle, allSectionTitles, settings }) => {
    const layoutType = settings?.sectionLayouts?.[sectionId] || 'timeline'; // Mặc định Kinh nghiệm là dạng Timeline
    return (
      <div className={`mb-6 cursor-pointer transition-all ${isHighlighted ? 'outline outline-2 outline-dashed outline-yellow-400 p-2 rounded' : ''}`}>
        <EditableSectionTitle sectionId={sectionId} defaultTitle="KINH NGHIỆM LÀM VIỆC" sectionTitle={sectionTitle} allSectionTitles={allSectionTitles} primaryColor={primaryColor} onUpdateSectionData={onUpdateSectionData} />
        {renderDynamicList(layoutType, {
          items: adaptDataForList(data, 'experience'),
          sectionId, primaryColor, emptyItemTemplate: { date: '', title: '', subtitle: '', description: '' },
          onUpdateItems: (id, updated) => onUpdateSectionData(id, revertDataFromList(updated, 'experience'))
        })}
      </div>
    );
  },

  education: ({ data, primaryColor, sectionId, onUpdateSectionData, isHighlighted, sectionTitle, allSectionTitles, settings }) => {
    const layoutType = settings?.sectionLayouts?.[sectionId] || 'timeline'; // Mặc định Học vấn là dạng Timeline
    return (
      <div className={`mb-6 cursor-pointer transition-all ${isHighlighted ? 'outline outline-2 outline-dashed outline-yellow-400 p-2 rounded' : ''}`}>
        <EditableSectionTitle sectionId={sectionId} defaultTitle="HỌC VẤN" sectionTitle={sectionTitle} allSectionTitles={allSectionTitles} primaryColor={primaryColor} onUpdateSectionData={onUpdateSectionData} />
        {renderDynamicList(layoutType, {
          items: adaptDataForList(data, 'education'),
          sectionId, primaryColor, emptyItemTemplate: { date: '', title: '', subtitle: '', description: '' },
          onUpdateItems: (id, updated) => onUpdateSectionData(id, revertDataFromList(updated, 'education'))
        })}
      </div>
    );
  },

  activities: ({ data, primaryColor, sectionId, onUpdateSectionData, isHighlighted, sectionTitle, allSectionTitles, settings }) => {
    const layoutType = settings?.sectionLayouts?.[sectionId] || 'row'; // Mặc định Hoạt động là dạng Danh sách (Row)
    return (
      <div className={`mb-6 cursor-pointer transition-all ${isHighlighted ? 'outline outline-2 outline-dashed outline-yellow-400 p-2 rounded' : ''}`}>
        <EditableSectionTitle sectionId={sectionId} defaultTitle="HOẠT ĐỘNG" sectionTitle={sectionTitle} allSectionTitles={allSectionTitles} primaryColor={primaryColor} onUpdateSectionData={onUpdateSectionData} />
        {renderDynamicList(layoutType, {
          items: adaptDataForList(data, 'activities'),
          sectionId, primaryColor, emptyItemTemplate: { date: '', title: '', subtitle: '', description: '' },
          onUpdateItems: (id, updated) => onUpdateSectionData(id, revertDataFromList(updated, 'activities'))
        })}
      </div>
    );
  },

  projects: ({ data, primaryColor, sectionId, onUpdateSectionData, isHighlighted, sectionTitle, allSectionTitles, settings }) => {
    const layoutType = settings?.sectionLayouts?.[sectionId] || 'row'; // Mặc định Dự án là dạng Danh sách (Row)
    return (
      <div className={`mb-6 cursor-pointer transition-all ${isHighlighted ? 'outline outline-2 outline-dashed outline-yellow-400 p-2 rounded' : ''}`}>
        <EditableSectionTitle sectionId={sectionId} defaultTitle="DỰ ÁN" sectionTitle={sectionTitle} allSectionTitles={allSectionTitles} primaryColor={primaryColor} onUpdateSectionData={onUpdateSectionData} />
        {renderDynamicList(layoutType, {
          items: adaptDataForList(data, 'projects'),
          sectionId, primaryColor, emptyItemTemplate: { date: '', title: '', subtitle: '', description: '' },
          onUpdateItems: (id, updated) => onUpdateSectionData(id, revertDataFromList(updated, 'projects'))
        })}
      </div>
    );
  },

  certifications: ({ data, primaryColor, sectionId, onUpdateSectionData, isHighlighted, sectionTitle, allSectionTitles, settings }) => {
    const layoutType = settings?.sectionLayouts?.[sectionId] || 'row'; // Mặc định Chứng chỉ là dạng Danh sách (Row)
    return (
      <div className={`mb-6 cursor-pointer transition-all ${isHighlighted ? 'outline outline-2 outline-dashed outline-yellow-400 p-2 rounded' : ''}`}>
        <EditableSectionTitle sectionId={sectionId} defaultTitle="CHỨNG CHỈ" sectionTitle={sectionTitle} allSectionTitles={allSectionTitles} primaryColor={primaryColor} onUpdateSectionData={onUpdateSectionData} />
        {renderDynamicList(layoutType, {
          items: adaptDataForList(data, 'certifications'),
          sectionId, primaryColor, emptyItemTemplate: { date: '', title: '', subtitle: '', description: '' },
          onUpdateItems: (id, updated) => onUpdateSectionData(id, revertDataFromList(updated, 'certifications'))
        })}
      </div>
    );
  },

  awards: ({ data, primaryColor, sectionId, onUpdateSectionData, isHighlighted, sectionTitle, allSectionTitles, settings }) => {
    const layoutType = settings?.sectionLayouts?.[sectionId] || 'row'; // Mặc định Giải thưởng là dạng Danh sách (Row)
    return (
      <div className={`mb-6 cursor-pointer transition-all ${isHighlighted ? 'outline outline-2 outline-dashed outline-yellow-400 p-2 rounded' : ''}`}>
        <EditableSectionTitle sectionId={sectionId} defaultTitle="GIẢI THƯỞNG" sectionTitle={sectionTitle} allSectionTitles={allSectionTitles} primaryColor={primaryColor} onUpdateSectionData={onUpdateSectionData} />
        {renderDynamicList(layoutType, {
          items: adaptDataForList(data, 'awards'),
          sectionId, primaryColor, emptyItemTemplate: { date: '', title: '', subtitle: '', description: '' },
          onUpdateItems: (id, updated) => onUpdateSectionData(id, revertDataFromList(updated, 'awards'))
        })}
      </div>
    );
  },

  references: ({ data, primaryColor, sectionId, onUpdateSectionData, isHighlighted, sectionTitle, allSectionTitles, settings }) => {
    const layoutType = settings?.sectionLayouts?.[sectionId] || 'row'; // Mặc định Người tham chiếu là dạng Danh sách (Row)
    return (
      <div className={`mb-6 cursor-pointer transition-all ${isHighlighted ? 'outline outline-2 outline-dashed outline-yellow-400 p-2 rounded' : ''}`}>
        <EditableSectionTitle sectionId={sectionId} defaultTitle="NGƯỜI THAM CHIẾU" sectionTitle={sectionTitle} allSectionTitles={allSectionTitles} primaryColor={primaryColor} onUpdateSectionData={onUpdateSectionData} />
        {renderDynamicList(layoutType, {
          items: adaptDataForList(data, 'references'),
          sectionId, primaryColor, emptyItemTemplate: { date: '', title: '', subtitle: '', description: '' },
          onUpdateItems: (id, updated) => onUpdateSectionData(id, revertDataFromList(updated, 'references'))
        })}
      </div>
    );
  }
};

const getGridClasses = (ratio) => {
  switch (ratio) {
    case '10-0': case '100-0': return { left: 'col-span-10', right: 'hidden' };
    case '3-7': case '30-70': return { left: 'col-span-3', right: 'col-span-7' };
    case '4-6': case '40-60': return { left: 'col-span-4', right: 'col-span-6' };
    case '5-5': case '50-50': return { left: 'col-span-5', right: 'col-span-5' };
    case '6-4': case '60-40': return { left: 'col-span-6', right: 'col-span-4' };
    case '7-3': case '70-30': return { left: 'col-span-7', right: 'col-span-3' };
    case '8-2': case '80-20': return { left: 'col-span-8', right: 'col-span-2' };
    default: return { left: 'col-span-10', right: 'hidden' };
  }
};

const SimpleTemplate = ({ cvData, onSectionClick, onUpdateSectionData }) => {
  const { layout, data, settings } = cvData;
  const [highlightedSection, setHighlightedSection] = useState(null);
  
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const paginate = () => {
      const PAGE_HEIGHT = 1123;
      const TOP_PADDING = 30;

      const sections = Array.from(container.querySelectorAll('.cv-section'));
      sections.forEach(sec => { sec.style.marginTop = '0px'; });

      sections.forEach(sec => {
        const canvasRect = container.getBoundingClientRect();
        const secRect = sec.getBoundingClientRect();

        const top = secRect.top - canvasRect.top;
        const height = secRect.height;
        const bottom = top + height;
        const currentPage = Math.floor(top / PAGE_HEIGHT);
        const pageBottom = (currentPage + 1) * PAGE_HEIGHT;

        if (bottom > pageBottom && height < PAGE_HEIGHT) {
          const pushAmount = pageBottom - top + TOP_PADDING;
          sec.style.marginTop = `${pushAmount}px`;
        }
      });
    };

    let timeout;
    const observer = new MutationObserver(() => {
      clearTimeout(timeout);
      timeout = setTimeout(paginate, 100); 
    });

    observer.observe(container, { childList: true, subtree: true, characterData: true, attributes: false });
    setTimeout(paginate, 100);

    return () => { observer.disconnect(); clearTimeout(timeout); };
  }, [cvData.layout, cvData.data]);

  const handleSectionClick = (sectionId) => {
    setHighlightedSection(sectionId);
    if (onSectionClick) onSectionClick(sectionId);
  };

  const renderItems = (itemIds) => {
    return itemIds.map(itemId => {
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
  };

  return (
    <div ref={containerRef} className="w-full h-fit min-h-[1123px] bg-white p-[50px] text-gray-800 relative z-10" style={{ fontFamily: `${settings.font}, sans-serif` }}>
      {layout.activeRows.map(row => {
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
  );
};

export default SimpleTemplate;
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
  getGridClasses,
  adaptDataForList,
  revertDataFromList,
  setupPagination,
} from './cvTemplateCore';

// ─────────────────────────────────────────────
// Harvard-specific: Contact inline (không cần label đậm, chỉ cần value)
// ─────────────────────────────────────────────

/**
 * Harvard Contact — hiển thị dạng "value · value · value" trên một dòng,
 * truyền thống Mỹ không in nhãn, tất cả căn giữa dưới tên.
 */
const HarvardContactRow = ({ items, sectionId, onUpdateItems }) => {
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
    updated.splice(index + 1, 0, { label: '', value: '', placeholder: 'Nhập thông tin...' });
    onUpdateItems(sectionId, updated);
  };

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-1 mt-1">
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && <span className="text-gray-400 text-[12px] select-none">·</span>}
          <div className="relative group/item flex items-center">
            {/* Mini toolbar */}
            <div
              className="absolute -top-8 left-1/2 -translate-x-1/2 flex-row gap-1 bg-gray-100 shadow-md border border-gray-200 rounded p-1 z-20 opacity-0 invisible group-hover/item:opacity-100 group-hover/item:visible transition-all flex"
              contentEditable="false"
            >
              <button onClick={() => handleMoveUp(index)} disabled={index === 0} className="p-1 hover:bg-gray-300 rounded text-gray-600 disabled:opacity-30"><ArrowUp size={12}/></button>
              <button onClick={() => handleMoveDown(index)} disabled={index === items.length - 1} className="p-1 hover:bg-gray-300 rounded text-gray-600 disabled:opacity-30"><ArrowDown size={12}/></button>
              <button onClick={() => handleDelete(index)} className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs">Xóa</button>
              <button onClick={() => handleAdd(index)} className="px-2 py-1 bg-[#00b14f] hover:bg-green-600 text-white rounded text-xs flex items-center gap-1"><Plus size={12}/>Thêm</button>
            </div>
            <div
              contentEditable suppressContentEditableWarning
              onBlur={(e) => handleHTMLBlur(e, 'value', (f, v) => handleTextChange(index, f, v))}
              className={`text-[12px] text-gray-700 ${contactEditableClass}`}
              data-placeholder={item.placeholder || 'Nhập thông tin...'}
              dangerouslySetInnerHTML={{ __html: item.value }}
            />
          </div>
        </React.Fragment>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────
// Harvard Section Title — đường kẻ ngang full-width, chữ in hoa
// ─────────────────────────────────────────────

const HarvardSectionTitle = ({ sectionId, defaultTitle, sectionTitle, allSectionTitles, onUpdateSectionData }) => (
  <div className="mb-3 mt-1">
    <h3
      contentEditable suppressContentEditableWarning
      onBlur={(e) => handleHTMLBlur(e, sectionId, (f, v) => onUpdateSectionData('sectionTitles', { ...allSectionTitles, [f]: v }))}
      className={`font-bold text-[13px] uppercase tracking-widest text-black inline-block ${commonEditableClass}`}
      data-placeholder={defaultTitle}
      dangerouslySetInnerHTML={{ __html: sectionTitle ?? defaultTitle }}
    />
    {/* Đường kẻ đặc trưng Harvard */}
    <div className="border-t-2 border-black mt-0.5" />
  </div>
);

// ─────────────────────────────────────────────
// renderDynamicList (dùng chung logic từ SimpleTemplate)
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
// SECTION RENDERERS — Harvard variant
// ─────────────────────────────────────────────
// Không có avatar (chuẩn Harvard không dùng ảnh).
// primaryColor luôn là #000 — truyền vào để tương thích API chung,
// nhưng template tự override về black/gray.

const SECTION_RENDERER = {
  // Harvard không render avatar — trả null
  avatar: () => null,

  personalInfo: ({ data, sectionId, onUpdateSectionData, isHighlighted }) => (
    <div className={`text-center mb-0 cursor-pointer transition-all ${highlightClass(isHighlighted)}`}>
      <h1
        contentEditable suppressContentEditableWarning
        onBlur={(e) => handleHTMLBlur(e, 'fullName', (f, v) => onUpdateSectionData(sectionId, { ...data, [f]: v }))}
        className={`text-[22px] font-bold tracking-wide uppercase text-black min-w-[200px] ${commonEditableClass}`}
        data-placeholder="HỌ VÀ TÊN"
        dangerouslySetInnerHTML={{ __html: data?.fullName || '' }}
      />
      <div
        contentEditable suppressContentEditableWarning
        onBlur={(e) => handleHTMLBlur(e, 'jobTitle', (f, v) => onUpdateSectionData(sectionId, { ...data, [f]: v }))}
        className={`text-[13px] font-medium text-gray-600 mt-0.5 ${commonEditableClass}`}
        data-placeholder="Vị trí ứng tuyển"
        dangerouslySetInnerHTML={{ __html: data?.jobTitle || '' }}
      />
    </div>
  ),

  contactInfo: ({ data, sectionId, onUpdateSectionData, isHighlighted }) => {
    const defaultItems = [
      { label: 'Điện thoại', value: '', placeholder: '0123 456 789' },
      { label: 'Email',      value: '', placeholder: 'email@example.com' },
      { label: 'LinkedIn',   value: '', placeholder: 'linkedin.com/in/...' },
      { label: 'Địa chỉ',   value: '', placeholder: 'Hà Nội, Việt Nam' },
    ];
    const items =
      Array.isArray(data) && data.length > 0
        ? data.map((d) => ({ ...d, placeholder: d.placeholder || defaultItems.find((x) => x.label === d.label)?.placeholder || 'Nhập...' }))
        : defaultItems;

    return (
      <div className={`mb-4 cursor-pointer transition-all ${highlightClass(isHighlighted)}`}>
        <HarvardContactRow items={items} sectionId={sectionId} onUpdateItems={onUpdateSectionData} />
      </div>
    );
  },

  objective: ({ data, sectionId, onUpdateSectionData, isHighlighted, sectionTitle, allSectionTitles, settings }) => {
    const layoutType = settings?.sectionLayouts?.[sectionId] || 'paragraph';
    const items = Array.isArray(data) ? data : data ? [{ description: data }] : [];
    return (
      <div className={`mb-5 cursor-pointer transition-all ${highlightClass(isHighlighted)}`}>
        <HarvardSectionTitle sectionId={sectionId} defaultTitle="MỤC TIÊU NGHỀ NGHIỆP" sectionTitle={sectionTitle} allSectionTitles={allSectionTitles} onUpdateSectionData={onUpdateSectionData} />
        {renderDynamicList(layoutType, {
          items, sectionId, primaryColor: '#000',
          emptyItemTemplate: { description: '' },
          onUpdateItems: (id, updated) => onUpdateSectionData(id, updated),
        })}
      </div>
    );
  },

  education: ({ data, sectionId, onUpdateSectionData, isHighlighted, sectionTitle, allSectionTitles, settings }) => {
    const layoutType = settings?.sectionLayouts?.[sectionId] || 'timeline';
    return (
      <div className={`mb-5 cursor-pointer transition-all ${highlightClass(isHighlighted)}`}>
        <HarvardSectionTitle sectionId={sectionId} defaultTitle="HỌC VẤN" sectionTitle={sectionTitle} allSectionTitles={allSectionTitles} onUpdateSectionData={onUpdateSectionData} />
        {renderDynamicList(layoutType, {
          items: adaptDataForList(data, 'education'),
          sectionId, primaryColor: '#000',
          emptyItemTemplate: { date: '', title: '', subtitle: '', description: '' },
          onUpdateItems: (id, updated) => onUpdateSectionData(id, revertDataFromList(updated, 'education')),
        })}
      </div>
    );
  },

  experience: ({ data, sectionId, onUpdateSectionData, isHighlighted, sectionTitle, allSectionTitles, settings }) => {
    const layoutType = settings?.sectionLayouts?.[sectionId] || 'timeline';
    return (
      <div className={`mb-5 cursor-pointer transition-all ${highlightClass(isHighlighted)}`}>
        <HarvardSectionTitle sectionId={sectionId} defaultTitle="KINH NGHIỆM LÀM VIỆC" sectionTitle={sectionTitle} allSectionTitles={allSectionTitles} onUpdateSectionData={onUpdateSectionData} />
        {renderDynamicList(layoutType, {
          items: adaptDataForList(data, 'experience'),
          sectionId, primaryColor: '#000',
          emptyItemTemplate: { date: '', title: '', subtitle: '', description: '' },
          onUpdateItems: (id, updated) => onUpdateSectionData(id, revertDataFromList(updated, 'experience')),
        })}
      </div>
    );
  },

  skills: ({ data, sectionId, onUpdateSectionData, isHighlighted, sectionTitle, allSectionTitles, settings }) => {
    const layoutType = settings?.sectionLayouts?.[sectionId] || 'row';
    return (
      <div className={`mb-5 cursor-pointer transition-all ${highlightClass(isHighlighted)}`}>
        <HarvardSectionTitle sectionId={sectionId} defaultTitle="KỸ NĂNG" sectionTitle={sectionTitle} allSectionTitles={allSectionTitles} onUpdateSectionData={onUpdateSectionData} />
        {renderDynamicList(layoutType, {
          items: adaptDataForList(data, 'skills'),
          sectionId, primaryColor: '#000',
          emptyItemTemplate: { date: '', title: '', subtitle: '', description: '' },
          onUpdateItems: (id, updated) => onUpdateSectionData(id, revertDataFromList(updated, 'skills')),
        })}
      </div>
    );
  },

  activities: ({ data, sectionId, onUpdateSectionData, isHighlighted, sectionTitle, allSectionTitles, settings }) => {
    const layoutType = settings?.sectionLayouts?.[sectionId] || 'timeline';
    return (
      <div className={`mb-5 cursor-pointer transition-all ${highlightClass(isHighlighted)}`}>
        <HarvardSectionTitle sectionId={sectionId} defaultTitle="HOẠT ĐỘNG" sectionTitle={sectionTitle} allSectionTitles={allSectionTitles} onUpdateSectionData={onUpdateSectionData} />
        {renderDynamicList(layoutType, {
          items: adaptDataForList(data, 'activities'),
          sectionId, primaryColor: '#000',
          emptyItemTemplate: { date: '', title: '', subtitle: '', description: '' },
          onUpdateItems: (id, updated) => onUpdateSectionData(id, revertDataFromList(updated, 'activities')),
        })}
      </div>
    );
  },

  projects: ({ data, sectionId, onUpdateSectionData, isHighlighted, sectionTitle, allSectionTitles, settings }) => {
    const layoutType = settings?.sectionLayouts?.[sectionId] || 'timeline';
    return (
      <div className={`mb-5 cursor-pointer transition-all ${highlightClass(isHighlighted)}`}>
        <HarvardSectionTitle sectionId={sectionId} defaultTitle="DỰ ÁN" sectionTitle={sectionTitle} allSectionTitles={allSectionTitles} onUpdateSectionData={onUpdateSectionData} />
        {renderDynamicList(layoutType, {
          items: adaptDataForList(data, 'projects'),
          sectionId, primaryColor: '#000',
          emptyItemTemplate: { date: '', title: '', subtitle: '', description: '' },
          onUpdateItems: (id, updated) => onUpdateSectionData(id, revertDataFromList(updated, 'projects')),
        })}
      </div>
    );
  },

  certifications: ({ data, sectionId, onUpdateSectionData, isHighlighted, sectionTitle, allSectionTitles, settings }) => {
    const layoutType = settings?.sectionLayouts?.[sectionId] || 'row';
    return (
      <div className={`mb-5 cursor-pointer transition-all ${highlightClass(isHighlighted)}`}>
        <HarvardSectionTitle sectionId={sectionId} defaultTitle="CHỨNG CHỈ" sectionTitle={sectionTitle} allSectionTitles={allSectionTitles} onUpdateSectionData={onUpdateSectionData} />
        {renderDynamicList(layoutType, {
          items: adaptDataForList(data, 'certifications'),
          sectionId, primaryColor: '#000',
          emptyItemTemplate: { date: '', title: '', subtitle: '', description: '' },
          onUpdateItems: (id, updated) => onUpdateSectionData(id, revertDataFromList(updated, 'certifications')),
        })}
      </div>
    );
  },

  awards: ({ data, sectionId, onUpdateSectionData, isHighlighted, sectionTitle, allSectionTitles, settings }) => {
    const layoutType = settings?.sectionLayouts?.[sectionId] || 'row';
    return (
      <div className={`mb-5 cursor-pointer transition-all ${highlightClass(isHighlighted)}`}>
        <HarvardSectionTitle sectionId={sectionId} defaultTitle="GIẢI THƯỞNG" sectionTitle={sectionTitle} allSectionTitles={allSectionTitles} onUpdateSectionData={onUpdateSectionData} />
        {renderDynamicList(layoutType, {
          items: adaptDataForList(data, 'awards'),
          sectionId, primaryColor: '#000',
          emptyItemTemplate: { date: '', title: '', subtitle: '', description: '' },
          onUpdateItems: (id, updated) => onUpdateSectionData(id, revertDataFromList(updated, 'awards')),
        })}
      </div>
    );
  },

  hobbies: ({ data, sectionId, onUpdateSectionData, isHighlighted, sectionTitle, allSectionTitles, settings }) => {
    const layoutType = settings?.sectionLayouts?.[sectionId] || 'tags';
    return (
      <div className={`mb-5 cursor-pointer transition-all ${highlightClass(isHighlighted)}`}>
        <HarvardSectionTitle sectionId={sectionId} defaultTitle="SỞ THÍCH" sectionTitle={sectionTitle} allSectionTitles={allSectionTitles} onUpdateSectionData={onUpdateSectionData} />
        {renderDynamicList(layoutType, {
          items: adaptDataForList(data, 'hobbies'),
          sectionId, primaryColor: '#000',
          emptyItemTemplate: { date: '', title: '', subtitle: '', description: '' },
          onUpdateItems: (id, updated) => onUpdateSectionData(id, revertDataFromList(updated, 'hobbies')),
        })}
      </div>
    );
  },

  references: ({ data, sectionId, onUpdateSectionData, isHighlighted, sectionTitle, allSectionTitles, settings }) => {
    const layoutType = settings?.sectionLayouts?.[sectionId] || 'row';
    return (
      <div className={`mb-5 cursor-pointer transition-all ${highlightClass(isHighlighted)}`}>
        <HarvardSectionTitle sectionId={sectionId} defaultTitle="NGƯỜI THAM CHIẾU" sectionTitle={sectionTitle} allSectionTitles={allSectionTitles} onUpdateSectionData={onUpdateSectionData} />
        {renderDynamicList(layoutType, {
          items: adaptDataForList(data, 'references'),
          sectionId, primaryColor: '#000',
          emptyItemTemplate: { date: '', title: '', subtitle: '', description: '' },
          onUpdateItems: (id, updated) => onUpdateSectionData(id, revertDataFromList(updated, 'references')),
        })}
      </div>
    );
  },

  customSectionRenderer: ({ data, sectionId, onUpdateSectionData, isHighlighted }) => (
    <div className={`mb-5 cursor-pointer transition-all ${highlightClass(isHighlighted)}`}>
      <div className="mb-3 mt-1">
        <h3
          contentEditable suppressContentEditableWarning
          onBlur={(e) => handleHTMLBlur(e, 'title', (f, v) => onUpdateSectionData(sectionId, { ...data, [f]: v }))}
          className={`font-bold text-[13px] uppercase tracking-widest text-black inline-block ${commonEditableClass}`}
          data-placeholder="Tên mục"
          dangerouslySetInnerHTML={{ __html: data?.title || 'Thông tin thêm' }}
        />
        <div className="border-t-2 border-black mt-0.5" />
      </div>
      <div
        contentEditable suppressContentEditableWarning
        onBlur={(e) => handleHTMLBlur(e, 'content', (f, v) => onUpdateSectionData(sectionId, { ...data, [f]: v }))}
        className={`text-sm text-gray-700 leading-relaxed whitespace-pre-wrap min-h-[40px] w-full ${commonEditableClass}`}
        data-placeholder="Nội dung..."
        dangerouslySetInnerHTML={{ __html: data?.content || '' }}
      />
    </div>
  ),
};

// ─────────────────────────────────────────────
// HARVARD TEMPLATE COMPONENT
// ─────────────────────────────────────────────

/**
 * HarvardTemplate
 *
 * Thiết kế theo chuẩn Harvard Office of Career Services:
 * - 1 cột, full-width, không ảnh, không màu sắc sặc sỡ
 * - Header căn giữa: Họ tên in hoa + chức danh + contact inline (· separator)
 * - Section title: chữ in hoa tracking-widest + đường kẻ ngang đen 2px
 * - Font Garamond/Times — khai báo qua settings.font
 * - Lề: 50px (tương đương ~1.27cm, chuẩn Word A4)
 */
const HarvardTemplate = ({ cvData, onSectionClick, onUpdateSectionData }) => {
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
      const SectionComponent = isCustomSection
        ? SECTION_RENDERER.customSectionRenderer
        : SECTION_RENDERER[itemId];
      if (!SectionComponent) return null;
      return (
        <div key={itemId} onClick={() => handleSectionClick(itemId)} className="transition-all cv-section">
          <SectionComponent
            data={data[itemId]}
            sectionTitle={data.sectionTitles?.[itemId]}
            allSectionTitles={data.sectionTitles || {}}
            primaryColor="#000"
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
      className="w-full h-fit min-h-[1123px] bg-white text-gray-900 relative z-10"
      style={{
        fontFamily: `${settings?.font || 'Georgia'}, 'Times New Roman', serif`,
        padding: '50px 60px', // lề trái-phải rộng hơn một chút cho cảm giác academic
        fontSize: '13px',
        lineHeight: '1.5',
      }}
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
  );
};

export default HarvardTemplate;

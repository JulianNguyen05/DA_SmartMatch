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
} from './cvTemplateCore';

// ─────────────────────────────────────────────────────────────────────────────
// PRIVATE CONSTANTS (chỉ dùng trong file này)
// ─────────────────────────────────────────────────────────────────────────────

const contactEditableClass =
  'outline-none focus:bg-blue-50 focus:ring-1 focus:ring-blue-300 rounded px-1 transition-all ' +
  'empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400 ' +
  'empty:before:pointer-events-none empty:before:block cursor-text empty:border ' +
  'empty:border-dashed empty:border-red-400 empty:bg-red-50/20 min-w-[40px] inline-block';

const sectionWrapClass = (isHighlighted) =>
  `mb-6 cursor-pointer transition-all ${
    isHighlighted ? 'outline outline-2 outline-dashed outline-yellow-400 p-2 rounded' : ''
  }`;

const EMPTY_ITEM = { date: '', title: '', subtitle: '', description: '' };

// ─────────────────────────────────────────────────────────────────────────────
// EditableContactList
// ─────────────────────────────────────────────────────────────────────────────

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

  const handleDelete = (index) =>
    onUpdateItems(sectionId, items.filter((_, i) => i !== index));

  const handleAdd = (index) => {
    const updated = [...items];
    updated.splice(index + 1, 0, { label: '', value: '', placeholder: 'Nhập nội dung...' });
    onUpdateItems(sectionId, updated);
  };

  return (
    <div className="w-full relative group/section mt-3">
      <div className="space-y-1 relative">
        {items.map((item, index) => (
          <div
            key={index}
            className="relative flex flex-wrap items-start group/item transition-all border border-transparent hover:border-dashed hover:border-gray-300 p-1 -ml-1 rounded"
          >
            {/* Mini toolbar */}
            <div
              className="absolute right-0 -top-8 flex-row gap-1 bg-gray-100 shadow-md border border-gray-200 rounded p-1 z-20 opacity-0 invisible group-hover/item:opacity-100 group-hover/item:visible transition-all flex"
              contentEditable="false"
            >
              <button
                onClick={() => handleMoveUp(index)}
                disabled={index === 0}
                className="p-1 hover:bg-gray-300 rounded text-gray-600 disabled:opacity-30"
              >
                <ArrowUp size={12} />
              </button>
              <button
                onClick={() => handleMoveDown(index)}
                disabled={index === items.length - 1}
                className="p-1 hover:bg-gray-300 rounded text-gray-600 disabled:opacity-30"
              >
                <ArrowDown size={12} />
              </button>
              <button
                onClick={() => handleDelete(index)}
                className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs flex items-center gap-1"
              >
                Xóa
              </button>
              <button
                onClick={() => handleAdd(index)}
                className="px-2 py-1 bg-[#00b14f] hover:bg-green-600 text-white rounded text-xs flex items-center gap-1"
              >
                <Plus size={12} /> Thêm
              </button>
            </div>

            {/* Label */}
            <div
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) =>
                handleHTMLBlur(e, 'label', (f, v) => handleTextChange(index, f, v))
              }
              className={`font-bold text-[13px] mr-1 mt-0.5 ${contactEditableClass}`}
              style={{ color: primaryColor }}
              data-placeholder="Tiêu đề"
              dangerouslySetInnerHTML={{ __html: item.label }}
            />
            <span className="font-bold text-[13px] mr-2 mt-0.5" style={{ color: primaryColor }}>
              :
            </span>

            {/* Value */}
            <div
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) =>
                handleHTMLBlur(e, 'value', (f, v) => handleTextChange(index, f, v))
              }
              className={`text-gray-700 flex-1 text-[13px] mt-0.5 ${contactEditableClass}`}
              data-placeholder={item.placeholder || 'Nhập nội dung...'}
              dangerouslySetInnerHTML={{ __html: item.value }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// EditableSectionTitle
// ─────────────────────────────────────────────────────────────────────────────

const EditableSectionTitle = ({
  sectionId,
  defaultTitle,
  sectionTitle,
  allSectionTitles,
  primaryColor,
  onUpdateSectionData,
}) => (
  <h3
    contentEditable
    suppressContentEditableWarning
    onBlur={(e) =>
      handleHTMLBlur(e, sectionId, (f, v) =>
        onUpdateSectionData('sectionTitles', { ...allSectionTitles, [f]: v })
      )
    }
    className={`font-bold text-[15px] uppercase mb-3 pb-1.5 w-full ${commonEditableClass}`}
    style={{ color: primaryColor, borderBottom: `2px solid ${primaryColor}` }}
    data-placeholder={defaultTitle}
    dangerouslySetInnerHTML={{ __html: sectionTitle ?? defaultTitle }}
  />
);

// ─────────────────────────────────────────────────────────────────────────────
// renderDynamicList
// ─────────────────────────────────────────────────────────────────────────────

const renderDynamicList = (layoutType, props) => {
  switch (layoutType) {
    case 'row':       return <EditableRowList {...props} />;
    case 'tags':      return <EditableTagList {...props} />;
    case 'paragraph': return <EditableParagraphList {...props} />;
    case 'timeline':
    default:          return <EditableTimelineList {...props} />;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Helper: build props cho renderDynamicList — tránh lặp code ở mỗi section
// ─────────────────────────────────────────────────────────────────────────────

const listProps = (dataType, data, sectionId, primaryColor, onUpdateSectionData) => ({
  items: adaptDataForList(data, dataType),
  sectionId,
  primaryColor,
  emptyItemTemplate: EMPTY_ITEM,
  onUpdateItems: (id, updated) =>
    onUpdateSectionData(id, revertDataFromList(updated, dataType)),
});

// ─────────────────────────────────────────────────────────────────────────────
// SECTION RENDERERS
// ─────────────────────────────────────────────────────────────────────────────

const SECTION_RENDERER = {
  // ── Avatar ────────────────────────────────────────────────────────────────
  avatar: ({ data, primaryColor, settings, isHighlighted, sectionId, onUpdateSectionData }) => {
    const size = settings?.avatarSize || 120;
    const isCircle = settings?.avatarShape === 'circle';
    const fileInputRef = useRef(null);

    const handleImageChange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onloadend = () =>
        onUpdateSectionData(sectionId, { ...data, url: reader.result });
      reader.readAsDataURL(file);
    };

    const imgStyle = {
      width: `${size}px`,
      height: isCircle ? `${size}px` : `${size * 1.33}px`,
      borderRadius: isCircle ? '50%' : '8px',
      border: `3px solid ${primaryColor}`,
    };

    return (
      <div
        className={`mb-4 flex justify-start cursor-pointer transition-all relative group ${
          isHighlighted ? 'outline outline-2 outline-dashed outline-yellow-400 p-2 rounded' : ''
        }`}
        onClick={() => fileInputRef.current?.click()}
      >
        <img
          src={data?.url || 'http://localhost:8080/uploads/logos/user.jpg'}
          alt="Avatar"
          className="bg-gray-200 object-cover"
          style={imgStyle}
        />
        <div
          className="absolute flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity"
          style={imgStyle}
        >
          <span className="text-white text-xs font-semibold">Đổi ảnh</span>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageChange}
          accept="image/*"
          className="hidden"
        />
      </div>
    );
  },

  // ── Personal Info ─────────────────────────────────────────────────────────
  personalInfo: ({ data, primaryColor, sectionId, onUpdateSectionData, isHighlighted }) => (
    <div className={`mb-2 text-left cursor-pointer transition-all ${isHighlighted ? 'outline outline-2 outline-dashed outline-yellow-400 p-2 rounded' : ''}`}>
      <h1
        contentEditable
        suppressContentEditableWarning
        onBlur={(e) =>
          handleHTMLBlur(e, 'fullName', (f, v) =>
            onUpdateSectionData(sectionId, { ...data, [f]: v })
          )
        }
        className={`text-[28px] font-extrabold tracking-tight min-w-[200px] ${commonEditableClass}`}
        style={{ color: primaryColor }}
        data-placeholder="HỌ VÀ TÊN"
        dangerouslySetInnerHTML={{ __html: data?.fullName || '' }}
      />
      <br />
      <h2
        contentEditable
        suppressContentEditableWarning
        onBlur={(e) =>
          handleHTMLBlur(e, 'jobTitle', (f, v) =>
            onUpdateSectionData(sectionId, { ...data, [f]: v })
          )
        }
        className={`text-base font-medium mt-1 text-gray-600 ${commonEditableClass}`}
        data-placeholder="Vị trí ứng tuyển"
        dangerouslySetInnerHTML={{ __html: data?.jobTitle || '' }}
      />
    </div>
  ),

  // ── Contact Info ──────────────────────────────────────────────────────────
  contactInfo: ({ data, primaryColor, sectionId, onUpdateSectionData, isHighlighted }) => {
    const defaultItems = [
      { label: 'Ngày sinh',     value: '', placeholder: 'DD/MM/YYYY' },
      { label: 'Giới tính',     value: '', placeholder: 'Nam/Nữ' },
      { label: 'Số điện thoại', value: '', placeholder: '0123 456 789' },
      { label: 'Email',         value: '', placeholder: 'email@example.com' },
      { label: 'Website',       value: '', placeholder: 'facebook.com/TopCV.vn' },
      { label: 'Địa chỉ',      value: '', placeholder: 'Quận A, thành phố Hà Nội' },
    ];
    const items =
      Array.isArray(data) && data.length > 0
        ? data.map((d) => ({
            ...d,
            placeholder:
              d.placeholder ||
              defaultItems.find((def) => def.label === d.label)?.placeholder ||
              'Nhập nội dung...',
          }))
        : defaultItems;

    return (
      <div className={sectionWrapClass(isHighlighted)}>
        <EditableContactList
          items={items}
          sectionId={sectionId}
          primaryColor={primaryColor}
          onUpdateItems={onUpdateSectionData}
        />
      </div>
    );
  },

  // ── Objective ─────────────────────────────────────────────────────────────
  objective: ({ data, primaryColor, sectionId, onUpdateSectionData, isHighlighted, sectionTitle, allSectionTitles, settings }) => {
    const layoutType = settings?.sectionLayouts?.[sectionId] || 'paragraph';
    // data là array [{ description: '...' }] — không còn là string
    const items = Array.isArray(data) ? data : data ? [{ description: data }] : [];

    return (
      <div className={sectionWrapClass(isHighlighted)}>
        <EditableSectionTitle
          sectionId={sectionId}
          defaultTitle="MỤC TIÊU NGHỀ NGHIỆP"
          sectionTitle={sectionTitle}
          allSectionTitles={allSectionTitles}
          primaryColor={primaryColor}
          onUpdateSectionData={onUpdateSectionData}
        />
        {renderDynamicList(layoutType, {
          items,
          sectionId,
          primaryColor,
          emptyItemTemplate: { description: '' },
          // Lưu thẳng array vào state (không revert về string)
          onUpdateItems: (id, updated) => onUpdateSectionData(id, updated),
        })}
      </div>
    );
  },

  // ── Custom Section ────────────────────────────────────────────────────────
  customSectionRenderer: ({ data, primaryColor, sectionId, onUpdateSectionData, isHighlighted }) => (
    <div className={sectionWrapClass(isHighlighted)}>
      <h3
        contentEditable
        suppressContentEditableWarning
        onBlur={(e) =>
          handleHTMLBlur(e, 'title', (f, v) =>
            onUpdateSectionData(sectionId, { ...data, [f]: v })
          )
        }
        className={`font-bold text-[15px] uppercase mb-3 pb-1.5 inline-block min-w-[150px] w-full ${commonEditableClass}`}
        style={{ color: primaryColor, borderBottom: `2px solid ${primaryColor}` }}
        data-placeholder="Tên mục"
        dangerouslySetInnerHTML={{ __html: data?.title || 'Thông tin thêm' }}
      />
      <div
        contentEditable
        suppressContentEditableWarning
        onBlur={(e) =>
          handleHTMLBlur(e, 'content', (f, v) =>
            onUpdateSectionData(sectionId, { ...data, [f]: v })
          )
        }
        className={`text-sm text-gray-700 leading-relaxed whitespace-pre-wrap min-h-[40px] w-full ${commonEditableClass}`}
        data-placeholder="Nội dung thông tin thêm..."
        dangerouslySetInnerHTML={{ __html: data?.content || '' }}
      />
    </div>
  ),

  // ── Skills ────────────────────────────────────────────────────────────────
  skills: ({ data, primaryColor, sectionId, onUpdateSectionData, isHighlighted, sectionTitle, allSectionTitles, settings }) => {
    const layoutType = settings?.sectionLayouts?.[sectionId] || 'tags';
    return (
      <div className={sectionWrapClass(isHighlighted)}>
        <EditableSectionTitle sectionId={sectionId} defaultTitle="KỸ NĂNG" sectionTitle={sectionTitle} allSectionTitles={allSectionTitles} primaryColor={primaryColor} onUpdateSectionData={onUpdateSectionData} />
        {renderDynamicList(layoutType, listProps('skills', data, sectionId, primaryColor, onUpdateSectionData))}
      </div>
    );
  },

  // ── Hobbies ───────────────────────────────────────────────────────────────
  hobbies: ({ data, primaryColor, sectionId, onUpdateSectionData, isHighlighted, sectionTitle, allSectionTitles, settings }) => {
    const layoutType = settings?.sectionLayouts?.[sectionId] || 'tags';
    return (
      <div className={sectionWrapClass(isHighlighted)}>
        <EditableSectionTitle sectionId={sectionId} defaultTitle="SỞ THÍCH" sectionTitle={sectionTitle} allSectionTitles={allSectionTitles} primaryColor={primaryColor} onUpdateSectionData={onUpdateSectionData} />
        {renderDynamicList(layoutType, listProps('hobbies', data, sectionId, primaryColor, onUpdateSectionData))}
      </div>
    );
  },

  // ── Experience ────────────────────────────────────────────────────────────
  experience: ({ data, primaryColor, sectionId, onUpdateSectionData, isHighlighted, sectionTitle, allSectionTitles, settings }) => {
    const layoutType = settings?.sectionLayouts?.[sectionId] || 'timeline';
    return (
      <div className={sectionWrapClass(isHighlighted)}>
        <EditableSectionTitle sectionId={sectionId} defaultTitle="KINH NGHIỆM LÀM VIỆC" sectionTitle={sectionTitle} allSectionTitles={allSectionTitles} primaryColor={primaryColor} onUpdateSectionData={onUpdateSectionData} />
        {renderDynamicList(layoutType, listProps('experience', data, sectionId, primaryColor, onUpdateSectionData))}
      </div>
    );
  },

  // ── Education ─────────────────────────────────────────────────────────────
  education: ({ data, primaryColor, sectionId, onUpdateSectionData, isHighlighted, sectionTitle, allSectionTitles, settings }) => {
    const layoutType = settings?.sectionLayouts?.[sectionId] || 'timeline';
    return (
      <div className={sectionWrapClass(isHighlighted)}>
        <EditableSectionTitle sectionId={sectionId} defaultTitle="HỌC VẤN" sectionTitle={sectionTitle} allSectionTitles={allSectionTitles} primaryColor={primaryColor} onUpdateSectionData={onUpdateSectionData} />
        {renderDynamicList(layoutType, listProps('education', data, sectionId, primaryColor, onUpdateSectionData))}
      </div>
    );
  },

  // ── Activities ────────────────────────────────────────────────────────────
  activities: ({ data, primaryColor, sectionId, onUpdateSectionData, isHighlighted, sectionTitle, allSectionTitles, settings }) => {
    const layoutType = settings?.sectionLayouts?.[sectionId] || 'row';
    return (
      <div className={sectionWrapClass(isHighlighted)}>
        <EditableSectionTitle sectionId={sectionId} defaultTitle="HOẠT ĐỘNG" sectionTitle={sectionTitle} allSectionTitles={allSectionTitles} primaryColor={primaryColor} onUpdateSectionData={onUpdateSectionData} />
        {renderDynamicList(layoutType, listProps('activities', data, sectionId, primaryColor, onUpdateSectionData))}
      </div>
    );
  },

  // ── Projects ──────────────────────────────────────────────────────────────
  projects: ({ data, primaryColor, sectionId, onUpdateSectionData, isHighlighted, sectionTitle, allSectionTitles, settings }) => {
    const layoutType = settings?.sectionLayouts?.[sectionId] || 'row';
    return (
      <div className={sectionWrapClass(isHighlighted)}>
        <EditableSectionTitle sectionId={sectionId} defaultTitle="DỰ ÁN" sectionTitle={sectionTitle} allSectionTitles={allSectionTitles} primaryColor={primaryColor} onUpdateSectionData={onUpdateSectionData} />
        {renderDynamicList(layoutType, listProps('projects', data, sectionId, primaryColor, onUpdateSectionData))}
      </div>
    );
  },

  // ── Certifications ────────────────────────────────────────────────────────
  certifications: ({ data, primaryColor, sectionId, onUpdateSectionData, isHighlighted, sectionTitle, allSectionTitles, settings }) => {
    const layoutType = settings?.sectionLayouts?.[sectionId] || 'row';
    return (
      <div className={sectionWrapClass(isHighlighted)}>
        <EditableSectionTitle sectionId={sectionId} defaultTitle="CHỨNG CHỈ" sectionTitle={sectionTitle} allSectionTitles={allSectionTitles} primaryColor={primaryColor} onUpdateSectionData={onUpdateSectionData} />
        {renderDynamicList(layoutType, listProps('certifications', data, sectionId, primaryColor, onUpdateSectionData))}
      </div>
    );
  },

  // ── Awards ────────────────────────────────────────────────────────────────
  awards: ({ data, primaryColor, sectionId, onUpdateSectionData, isHighlighted, sectionTitle, allSectionTitles, settings }) => {
    const layoutType = settings?.sectionLayouts?.[sectionId] || 'row';
    return (
      <div className={sectionWrapClass(isHighlighted)}>
        <EditableSectionTitle sectionId={sectionId} defaultTitle="GIẢI THƯỞNG" sectionTitle={sectionTitle} allSectionTitles={allSectionTitles} primaryColor={primaryColor} onUpdateSectionData={onUpdateSectionData} />
        {renderDynamicList(layoutType, listProps('awards', data, sectionId, primaryColor, onUpdateSectionData))}
      </div>
    );
  },

  // ── References ────────────────────────────────────────────────────────────
  references: ({ data, primaryColor, sectionId, onUpdateSectionData, isHighlighted, sectionTitle, allSectionTitles, settings }) => {
    const layoutType = settings?.sectionLayouts?.[sectionId] || 'row';
    return (
      <div className={sectionWrapClass(isHighlighted)}>
        <EditableSectionTitle sectionId={sectionId} defaultTitle="NGƯỜI THAM CHIẾU" sectionTitle={sectionTitle} allSectionTitles={allSectionTitles} primaryColor={primaryColor} onUpdateSectionData={onUpdateSectionData} />
        {renderDynamicList(layoutType, listProps('references', data, sectionId, primaryColor, onUpdateSectionData))}
      </div>
    );
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// SIMPLE TEMPLATE
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
      const SectionComponent = isCustomSection
        ? SECTION_RENDERER.customSectionRenderer
        : SECTION_RENDERER[itemId];
      if (!SectionComponent) return null;

      return (
        <div
          key={itemId}
          onClick={() => handleSectionClick(itemId)}
          className="transition-all cv-section"
        >
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

  return (
    <div
      ref={containerRef}
      className="w-full h-fit min-h-[1123px] bg-white p-[50px] text-gray-800 relative z-10"
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
  );
};

export default SimpleTemplate;

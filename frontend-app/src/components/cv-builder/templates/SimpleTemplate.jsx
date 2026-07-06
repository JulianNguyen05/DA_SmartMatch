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
    primaryColor: "#2563EB",
    accentColor: "#06B6D4",
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
// THEME COLORS - Dùng #2563EB làm gốc cho UI elements (không ảnh hưởng primaryColor)
// ─────────────────────────────────────────────────────────────────────────────
const THEME = {
  primary: '#2563EB',
  danger: '#EF4444',
  success: '#10B981',
};

// ─────────────────────────────────────────────────────────────────────────────
// PRIVATE CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────
const contactEditableClass = 'outline-none focus:bg-blue-50 focus:ring-2 focus:ring-blue-400 rounded px-0.5 transition-all empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400 empty:before:pointer-events-none empty:before:block cursor-text empty:border empty:border-dashed empty:border-blue-300 empty:bg-blue-50/40 min-w-[20px] inline-block';

// FIX: Sử dụng box-shadow inset thay vì outline + padding để tránh nhảy layout
// flow-root: ép mỗi section tạo Block Formatting Context riêng, chặn tuyệt đối
// hiện tượng margin-top của phần tử con "thoát" ra ngoài đè lên section phía trên.
const sectionWrapClass = (isHighlighted) => `mb-1 flow-root cursor-pointer transition-all duration-200 ${isHighlighted ? 'rounded-lg' : ''}`;

const highlightStyle = (isHighlighted, primaryColor = THEME.primary) => ({
  outline: isHighlighted ? `2px dashed ${primaryColor}` : '2px dashed transparent',
  outlineOffset: '4px',
  backgroundColor: isHighlighted ? 'rgba(37, 99, 235, 0.02)' : 'transparent',
  borderRadius: '4px',
  // Padding luôn giữ cố định 6px (không phụ thuộc isHighlighted) để việc bật/tắt viền
  // KHÔNG làm thay đổi kích thước khối -> không gây nhảy layout / vỡ chữ khi chụp thumbnail.
  padding: '2px',
});

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
    <div className="w-full relative group/section">
      <div className="space-y-0.5 relative">
        {items.map((item, index) => (
          <div key={index} className="relative flex flex-wrap items-start group/item transition-all border border-transparent hover:border-dashed hover:border-gray-300 rounded">
            <div className="absolute right-0 -top-8 flex-row gap-0.5 bg-white shadow-lg border border-gray-200 rounded-lg z-20 opacity-0 invisible group-hover/item:opacity-100 group-hover/item:visible transition-all flex" contentEditable="false">
              <button onClick={() => handleMoveUp(index)} disabled={index === 0} className="px-1.5 hover:bg-blue-100 rounded-md text-blue-600 disabled:opacity-30 disabled:text-gray-300 transition-colors" title="Di chuyển lên"><ArrowUp size={13} /></button>
              <button onClick={() => handleMoveDown(index)} disabled={index === items.length - 1} className="px-1.5 hover:bg-blue-100 rounded-md text-blue-600 disabled:opacity-30 disabled:text-gray-300 transition-colors" title="Di chuyển xuống"><ArrowDown size={13} /></button>
              <button onClick={() => handleDelete(index)} className="px-2.5 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-md text-xs font-medium flex items-center gap-0.5 transition-colors shadow-sm">Xóa</button>
              <button onClick={() => handleAdd(index)} className="px-2.5 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-xs font-medium flex items-center gap-0.5 transition-colors shadow-sm" style={{ backgroundColor: primaryColor || THEME.primary }}><Plus size={13} /> Thêm</button>
            </div>

            <div contentEditable suppressContentEditableWarning
              onBlur={(e) => handleHTMLBlur(e, 'label', (f, v) => handleTextChange(index, f, v))}
              className={`font-bold text-[0.9em] ${contactEditableClass}`} style={{ color: primaryColor }}
              data-placeholder={config.placeholders.contactInfo.title}
              dangerouslySetInnerHTML={{ __html: item.label }} />
            <span className="font-bold text-[0.9em]" style={{ color: primaryColor }}>:</span>

            <div contentEditable suppressContentEditableWarning
              onBlur={(e) => handleHTMLBlur(e, 'value', (f, v) => handleTextChange(index, f, v))}
              className={`text-gray-700 flex-1 text-[0.9em] ${contactEditableClass}`}
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
      className={`font-bold text-[1.1em] uppercase mb-1 pb-1.5 w-full ${commonEditableClass}`}
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
    const defaultW = settings?.avatarSize || 120;
    const defaultH = settings?.avatarShape === 'circle'
      ? (settings?.avatarSize || 120)
      : (settings?.avatarSize || 120) * 1.33;

    const [dims, setDims] = useState({
      w: data?.customW || defaultW,
      h: data?.customH || defaultH,
    });
    const [isHovered, setIsHovered] = useState(false);

    const outerRef = useRef(null);
    // Lưu maxW hiện tại để dùng trong resize handler
    const maxWRef = useRef(400);

    // Sync từ data bên ngoài (Undo/Redo)
    useEffect(() => {
      if (data?.customW || data?.customH) {
        setDims({ w: data.customW || defaultW, h: data.customH || defaultH });
      }
    }, [data?.customW, data?.customH]);

    // ResizeObserver: theo dõi khi cột cha thay đổi kích thước
    useEffect(() => {
      const el = outerRef.current;
      if (!el) return;

      const getColEl = () => el.parentElement; // div.cv-section trong cột grid

      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const colW = entry.contentRect.width;
          const newMaxW = Math.max(60, colW - 16); // trừ padding nhỏ
          maxWRef.current = newMaxW;

          // Clamp dims nếu ảnh đang rộng hơn cột mới
          setDims((prev) => {
            const clampedW = Math.min(prev.w, newMaxW);
            if (clampedW !== prev.w) {
              // Cập nhật data để persist
              // dùng setTimeout tránh setState trong ResizeObserver callback
              setTimeout(() => {
                onUpdateSectionData(sectionId, {
                  ...data,
                  customW: clampedW,
                  customH: prev.h,
                });
              }, 0);
              return { ...prev, w: clampedW };
            }
            return prev;
          });
        }
      });

      const colEl = getColEl();
      if (colEl) observer.observe(colEl);

      return () => observer.disconnect();
    }, [sectionId, data, onUpdateSectionData]);

    const isCircle = settings?.avatarShape === 'circle';
    const fileInputRef = useRef(null);
    const pc = primaryColor || '#2563EB';

    const handleImageChange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onloadend = () => onUpdateSectionData(sectionId, { ...data, url: reader.result });
      reader.readAsDataURL(file);
    };

    const handleResizeMouseDown = (e, dirX, dirY) => {
      e.preventDefault();
      e.stopPropagation();
      const startX = e.clientX;
      const startY = e.clientY;
      const startW = dims.w;
      const startH = dims.h;

      // Dùng maxWRef đã được ResizeObserver cập nhật
      const maxW = maxWRef.current;
      const maxH = 500;

      const onMouseMove = (moveEvent) => {
        const dx = (moveEvent.clientX - startX) * dirX;
        const dy = (moveEvent.clientY - startY) * dirY;
        setDims({
          w: dirX !== 0 ? Math.max(60, Math.min(maxW, startW + dx)) : startW,
          h: dirY !== 0 ? Math.max(60, Math.min(maxH, startH + dy)) : startH,
        });
      };

      const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        setDims((final) => {
          onUpdateSectionData(sectionId, { ...data, customW: final.w, customH: final.h });
          return final;
        });
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    };

    const displayW = dims.w;
    const displayH = isCircle ? dims.w : dims.h;
    const borderRadius = isCircle ? '50%' : '6px';

    const handles = [
      { dirX: -1, dirY: -1, cursor: 'nwse-resize', style: { top: -10, left: -10 },             rotate: 0   },
      { dirX:  1, dirY: -1, cursor: 'nesw-resize', style: { top: -10, right: -10 },            rotate: 90  },
      { dirX:  1, dirY:  1, cursor: 'nwse-resize', style: { bottom: -10, right: -10 },         rotate: 180 },
      { dirX: -1, dirY:  1, cursor: 'nesw-resize', style: { bottom: -10, left: -10 },          rotate: 270 },
      { dirX:  0, dirY: -1, cursor: 'ns-resize',   style: { top: -10, left: '50%', transform: 'translateX(-50%)' },    rotate: 0,   straight: true },
      { dirX:  0, dirY:  1, cursor: 'ns-resize',   style: { bottom: -10, left: '50%', transform: 'translateX(-50%)' }, rotate: 180, straight: true },
      { dirX: -1, dirY:  0, cursor: 'ew-resize',   style: { left: -10, top: '50%', transform: 'translateY(-50%)' },    rotate: 270, straight: true },
      { dirX:  1, dirY:  0, cursor: 'ew-resize',   style: { right: -10, top: '50%', transform: 'translateY(-50%)' },   rotate: 90,  straight: true },
    ];

    const activeHandles = isCircle
      ? handles.slice(0, 4).map(h => ({ ...h, dirY: h.dirX }))
      : handles;

    const ArrowCorner = ({ color }) => (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M2 2h6M2 2v6" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M2 2l5 5" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
      </svg>
    );

    const ArrowStraight = ({ color }) => (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M9 3v-2M9 1l-2.5 3M9 1l2.5 3" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );

    return (
    <div
            ref={outerRef}
            className="flex justify-center transition-all"
            style={isHighlighted ? {
              outline: `2px dashed ${pc}`, // Đổi sang màu theme động theo primaryColor
              outlineOffset: '6px',
              borderRadius: '4px',
            } : {
              outline: '2px dashed transparent', // Giữ chỗ outline
              outlineOffset: '6px',
              borderRadius: '4px',
            }}
          >
        <div
          className="relative"
          style={{ width: `${displayW}px`, height: `${displayH}px`, flexShrink: 0 }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <img
            src={data?.url || 'http://localhost:8080/uploads/logos/user.jpg'}
            alt="Avatar"
            style={{
              width: '100%', height: '100%',
              objectFit: 'cover', objectPosition: 'center top',
              borderRadius, display: 'block',
            }}
          />

          {isHovered && (
            <div className="absolute inset-0 pointer-events-none"
              style={{ borderRadius, border: `2px dashed ${pc}`, boxSizing: 'border-box' }}
            />
          )}

          {isHovered && (
            <button
              onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
              className="absolute bottom-3 text-white px-3.5 py-1.5 rounded-full flex items-center justify-center gap-1.5 text-xs font-medium z-10 shadow w-max cursor-pointer"
              style={{ background: pc, left: '50%', transform: 'translateX(-50%)' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
              </svg>
              Sửa ảnh
            </button>
          )}

          {isHovered && activeHandles.map((h, i) => (
            <div key={i}
              onMouseDown={(e) => handleResizeMouseDown(e, h.dirX, h.dirY)}
              style={{
                position: 'absolute', cursor: h.cursor, zIndex: 30, padding: '2px',
                ...h.style,
                transform: [h.style.transform || '', `rotate(${h.rotate}deg)`].filter(Boolean).join(' '),
              }}
            >
              {h.straight ? <ArrowStraight color={pc} /> : <ArrowCorner color={pc} />}
            </div>
          ))}

          <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
        </div>
      </div>
    );
  },

  personalInfo: ({ data, primaryColor, sectionId, onUpdateSectionData, isHighlighted }) => {
    const config = useTemplateContext();
    return (
      <div style={highlightStyle(isHighlighted, primaryColor)} className={`${sectionWrapClass(isHighlighted)} text-left`}>
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
    <div style={highlightStyle(isHighlighted, primaryColor)} className={sectionWrapClass(isHighlighted)}>
      <EditableContactList items={Array.isArray(data) ? data : []} sectionId={sectionId} primaryColor={primaryColor} onUpdateItems={onUpdateSectionData} />
    </div>
  ),

  objective: (props) => (
    <div style={highlightStyle(props.isHighlighted, props.primaryColor)} className={sectionWrapClass(props.isHighlighted)}>
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
      <div style={highlightStyle(isHighlighted, primaryColor)} className={sectionWrapClass(isHighlighted)}>
        <h3 contentEditable suppressContentEditableWarning
          onBlur={(e) => handleHTMLBlur(e, 'title', (f, v) => onUpdateSectionData(sectionId, { ...data, [f]: v }))}
          className={`font-bold text-[1.1em] uppercase mb-2 pb-1.5 inline-block min-w-[150px] w-full ${commonEditableClass}`}
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
  skills: (props) => <div style={highlightStyle(props.isHighlighted, props.primaryColor)} className={sectionWrapClass(props.isHighlighted)}><EditableSectionTitle {...props} />{renderDynamicList(props.settings?.sectionLayouts?.[props.sectionId] || 'tags', listProps('skills', props.data, props.sectionId, props.primaryColor, props.onUpdateSectionData))}</div>,
  hobbies: (props) => <div style={highlightStyle(props.isHighlighted, props.primaryColor)} className={sectionWrapClass(props.isHighlighted)}><EditableSectionTitle {...props} />{renderDynamicList(props.settings?.sectionLayouts?.[props.sectionId] || 'tags', listProps('hobbies', props.data, props.sectionId, props.primaryColor, props.onUpdateSectionData))}</div>,
  experience: (props) => <div style={highlightStyle(props.isHighlighted, props.primaryColor)} className={sectionWrapClass(props.isHighlighted)}><EditableSectionTitle {...props} />{renderDynamicList(props.settings?.sectionLayouts?.[props.sectionId] || 'timeline', listProps('experience', props.data, props.sectionId, props.primaryColor, props.onUpdateSectionData))}</div>,
  education: (props) => <div style={highlightStyle(props.isHighlighted, props.primaryColor)} className={sectionWrapClass(props.isHighlighted)}><EditableSectionTitle {...props} />{renderDynamicList(props.settings?.sectionLayouts?.[props.sectionId] || 'timeline', listProps('education', props.data, props.sectionId, props.primaryColor, props.onUpdateSectionData))}</div>,
  activities: (props) => <div style={highlightStyle(props.isHighlighted, props.primaryColor)} className={sectionWrapClass(props.isHighlighted)}><EditableSectionTitle {...props} />{renderDynamicList(props.settings?.sectionLayouts?.[props.sectionId] || 'row', listProps('activities', props.data, props.sectionId, props.primaryColor, props.onUpdateSectionData))}</div>,
  projects: (props) => <div style={highlightStyle(props.isHighlighted, props.primaryColor)} className={sectionWrapClass(props.isHighlighted)}><EditableSectionTitle {...props} />{renderDynamicList(props.settings?.sectionLayouts?.[props.sectionId] || 'row', listProps('projects', props.data, props.sectionId, props.primaryColor, props.onUpdateSectionData))}</div>,
  certifications: (props) => <div style={highlightStyle(props.isHighlighted, props.primaryColor)} className={sectionWrapClass(props.isHighlighted)}><EditableSectionTitle {...props} />{renderDynamicList(props.settings?.sectionLayouts?.[props.sectionId] || 'row', listProps('certifications', props.data, props.sectionId, props.primaryColor, props.onUpdateSectionData))}</div>,
  awards: (props) => <div style={highlightStyle(props.isHighlighted, props.primaryColor)} className={sectionWrapClass(props.isHighlighted)}><EditableSectionTitle {...props} />{renderDynamicList(props.settings?.sectionLayouts?.[props.sectionId] || 'row', listProps('awards', props.data, props.sectionId, props.primaryColor, props.onUpdateSectionData))}</div>,
  references: (props) => <div style={highlightStyle(props.isHighlighted, props.primaryColor)} className={sectionWrapClass(props.isHighlighted)}><EditableSectionTitle {...props} />{renderDynamicList(props.settings?.sectionLayouts?.[props.sectionId] || 'row', listProps('references', props.data, props.sectionId, props.primaryColor, props.onUpdateSectionData))}</div>,
};

const getFontSizeStyle = (sizeValue) => {
  // sizeValue khớp với CV_FONT_SIZES[i].value ('small'|'medium'|'large'|'xlarge')
  switch (sizeValue) {
    case 'small':  return '10px';
    case 'medium': return '13px';
    case 'large':  return '16px';
    case 'xlarge': return '20px';
    default:       return '13px';
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// SIMPLE TEMPLATE MAIN COMPONENT
// Bọc bằng TemplateContext.Provider để phát tán cấu hình xuống component con
// ─────────────────────────────────────────────────────────────────────────────

const SimpleTemplate = ({ cvData, selectedSection, onSectionClick, onUpdateSectionData }) => {
  const { layout, data, settings } = cvData;
  const containerRef = useRef(null);

  // Cơ chế phân trang A4 đã bị xóa - hiện tại là layout linh hoạt 1 trang dài

  const handleSectionClick = (e, sectionId) => {
    // Chặn sự kiện nổi bọt lên canvas cha, tránh bị hiểu nhầm là "click ra ngoài"
    // và bị setSelectedSection(null) đè ngay sau đó.
    e.stopPropagation();
    if (onSectionClick) onSectionClick(sectionId);
  };

  const renderItems = (itemIds) =>
    itemIds.map((itemId) => {
      const isCustomSection = itemId.startsWith('customSection_');
      const SectionComponent = isCustomSection ? SECTION_RENDERER.customSectionRenderer : SECTION_RENDERER[itemId];
      if (!SectionComponent) return null;

      return (
        <div key={itemId} onClick={(e) => handleSectionClick(e, itemId)} className="transition-all cv-section flow-root">
          <SectionComponent
            data={data[itemId]}
            sectionTitle={data.sectionTitles?.[itemId]}
            allSectionTitles={data.sectionTitles || {}}
            primaryColor={settings.primaryColor}
            settings={settings}
            isHighlighted={selectedSection === itemId}
            sectionId={itemId}
            onUpdateSectionData={onUpdateSectionData}
          />
        </div>
      );
    });

return (
    <TemplateContext.Provider value={SIMPLE_TEMPLATE_CONFIG}>
      <div
        ref={containerRef}
        className="bg-white mx-auto p-3 box-border" 
        style={{ fontFamily: `${settings.font}, sans-serif`, fontSize: getFontSizeStyle(settings.fontSize) }}
      >
        {layout.activeRows.map((row) => {
          const { left, right } = getGridClasses(row.ratio);
          return (
            <div key={row.id} className="grid grid-cols-10 gap-x-3">
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
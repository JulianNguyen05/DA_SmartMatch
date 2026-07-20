import React, { useState, useEffect, useRef } from 'react';
import { ArrowUp, ArrowDown, Plus, MoveLeft, MoveRight, Trash2 } from 'lucide-react';
import EditableTimelineList from '../shared/EditableTimelineList';
import EditableRowList from '../shared/EditableRowList';
import EditableTagList from '../shared/EditableTagList';
import EditableParagraphList from '../shared/EditableParagraphList';
import { getFileUrl } from '../../../utils/fileUrl'; // TODO: chỉnh lại path cho đúng cấu trúc thư mục thật
import {
  commonEditableClass,
  handleHTMLBlur,
  adaptDataForList,
  revertDataFromList,
  getGridClasses,
  TemplateContext,
  useTemplateContext,
} from './cvTemplateCore';

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE MASTER CONFIGURATION
// Cùng "hình dạng" với SIMPLE_TEMPLATE_CONFIG để tương thích với toàn bộ hạ tầng
// hiện có (TabPanel, LayoutSidebar, chuyển đổi template, khởi tạo CV mới...).
// Khác biệt chính: font mặc định Times New Roman, không ảnh đại diện mặc định,
// Education đặt trước Experience (chuẩn CV học thuật Harvard), contactInfo hiển
// thị dạng 1 dòng ở giữa trang thay vì cột nhãn:giá trị.
// ─────────────────────────────────────────────────────────────────────────────

export const HARVARD_TEMPLATE_CONFIG = {
  id: 'harvard',

  sectionOrder: [
    "avatar", "contactInfo", "personalInfo", "objective", "education",
    "experience", "activities", "certifications", "awards", "skills",
    "references", "hobbies", "projects", "customSection"
  ],

  defaultSettings: {
    template: "harvard",
    font: "Times New Roman",
    fontSize: "medium",
    primaryColor: "#111827",
    accentColor: "#111827",
    avatarShape: "square",
    avatarSize: 100,
  },

  defaultData: {
    sectionTitles: {},
    avatar: { url: "http://localhost:8080/uploads/logos/user.jpg" },
    personalInfo: { fullName: "", jobTitle: "" },
    contactInfo: [
      { label: "Địa chỉ",      value: "" },
      { label: "Điện thoại",   value: "" },
      { label: "Email",        value: "" },
      { label: "Website",      value: "" },
    ],
    objective: [], experience: [], education: [], activities: [],
    skills: [], hobbies: [], awards: [], certifications: [],
    projects: [], references: [],
  },

  // Bố cục mặc định: 1 cột duy nhất, Education đứng trước Experience — đúng chuẩn
  // CV Harvard cho sinh viên/mới ra trường. Avatar mặc định KHÔNG dùng (Harvard CV
  // truyền thống không có ảnh) nhưng vẫn nằm trong unusedItems để người dùng có thể
  // kéo vào layout qua tab "Bố cục" nếu muốn.
  // Chỉ bật sẵn 9/14 block đúng khung CV Harvard chuẩn: Header (2) + Mục tiêu +
  // Học vấn + Kinh nghiệm + Hoạt động + Giải thưởng + Kỹ năng + Người tham chiếu.
  // 5 block còn lại (Ảnh đại diện, Chứng chỉ, Dự án, Sở thích, Thông tin thêm) ít
  // xuất hiện trong CV học thuật truyền thống nên để mặc định ở "Mục chưa sử dụng" —
  // người dùng vẫn kéo vào layout bất cứ lúc nào qua tab "Bố cục".
  defaultLayout: {
    activeRows: [
      {
        id: 'row-1', ratio: '10-0',
        leftItems: ['personalInfo', 'contactInfo'],
        rightItems: [],
      },
      {
        id: 'row-2', ratio: '10-0',
        leftItems: [
          'objective', 'education', 'experience', 'activities',
          'awards', 'skills', 'references',
        ],
        rightItems: [],
      },
    ],
    unusedItems: ['avatar', 'certifications', 'projects', 'hobbies', 'customSection'],
  },

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
const contactEditableClass = 'outline-none focus:bg-blue-50 focus:ring-1 focus:ring-blue-300 rounded px-1 transition-all empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400 empty:before:pointer-events-none empty:before:block cursor-text min-w-[20px] inline-block';

// flow-root: mỗi section tự tạo Block Formatting Context riêng, tránh margin của
// phần tử con "thoát ra ngoài" đè lên section phía trên (giống SimpleTemplate).
const sectionWrapClass = (isHighlighted) => `mb-2 flow-root cursor-pointer transition-all duration-200 ${isHighlighted ? 'rounded-lg' : ''}`;

const highlightStyle = (isHighlighted, primaryColor = '#111827') => ({
  outline: isHighlighted ? `2px dashed ${primaryColor}` : '2px dashed transparent',
  outlineOffset: '4px',
  backgroundColor: isHighlighted ? 'rgba(17, 24, 39, 0.03)' : 'transparent',
  borderRadius: '4px',
  // Padding cố định để bật/tắt viền không làm nhảy layout / vỡ chữ khi chụp thumbnail.
  padding: '2px',
});

const EMPTY_ITEM = { date: '', title: '', subtitle: '', description: '' };

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

// Danh thiếp kiểu Harvard: hiển thị 1 dòng ngang, canh giữa, ngăn cách bằng dấu "•".
// Vẫn dùng chung cấu trúc dữ liệu { label, value } như Simple để tương thích ngược.
const EditableHeaderContactList = ({ items, sectionId, primaryColor, onUpdateItems }) => {
  const config = useTemplateContext();

  const handleTextChange = (index, field, newText) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: newText };
    onUpdateItems(sectionId, updated);
  };
  const handleMoveLeft = (index) => {
    if (index === 0) return;
    const updated = [...items];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    onUpdateItems(sectionId, updated);
  };
  const handleMoveRight = (index) => {
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
      <div className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1">
        {items.map((item, index) => (
          <React.Fragment key={index}>
            <div className="relative inline-flex items-baseline group/item">
              <div
                className="absolute left-1/2 -translate-x-1/2 -top-7 flex-row gap-0.5 bg-white shadow-lg border border-gray-200 rounded-md z-20 opacity-0 invisible group-hover/item:opacity-100 group-hover/item:visible transition-all flex"
                contentEditable="false"
              >
                <button onClick={() => handleMoveLeft(index)} disabled={index === 0} className="p-1 hover:bg-gray-100 rounded text-gray-600 disabled:opacity-30" title="Sang trái"><MoveLeft size={12} /></button>
                <button onClick={() => handleMoveRight(index)} disabled={index === items.length - 1} className="p-1 hover:bg-gray-100 rounded text-gray-600 disabled:opacity-30" title="Sang phải"><MoveRight size={12} /></button>
                <button onClick={() => handleAdd(index)} className="p-1 hover:bg-gray-100 rounded" style={{ color: primaryColor }} title="Thêm mục"><Plus size={12} /></button>
                <button onClick={() => handleDelete(index)} className="p-1 hover:bg-red-50 rounded text-red-500" title="Xóa"><Trash2 size={12} /></button>
              </div>

              <span
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => handleHTMLBlur(e, 'label', (f, v) => handleTextChange(index, f, v))}
                className={`text-[0.85em] uppercase tracking-wide text-gray-500 mr-1 ${contactEditableClass}`}
                data-placeholder={config.placeholders.contactInfo.title}
                dangerouslySetInnerHTML={{ __html: item.label }}
              />
              <span
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => handleHTMLBlur(e, 'value', (f, v) => handleTextChange(index, f, v))}
                className={`text-[0.95em] text-gray-800 ${contactEditableClass}`}
                data-placeholder={item.placeholder || config.placeholders.contactInfo.value}
                dangerouslySetInnerHTML={{ __html: item.value }}
              />
            </div>
            {index < items.length - 1 && <span className="text-gray-400 select-none">•</span>}
          </React.Fragment>
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
      className={`font-bold text-[1.05em] uppercase tracking-[0.08em] mb-2 pb-1 w-full ${commonEditableClass}`}
      style={{ color: primaryColor, borderBottom: `1.5px solid ${primaryColor}` }}
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
// Mọi section vẫn tôn trọng cvData.settings.sectionLayouts[sectionId] — đây chính
// là cầu nối để 4 nút "Bố cục" (Dòng TG / Danh sách / Dạng Thẻ / Đoạn văn) trong
// tab "Thiết kế" hoạt động y hệt SimpleTemplate.
// ─────────────────────────────────────────────────────────────────────────────
const SECTION_RENDERER = {
  avatar: ({ data, primaryColor, settings, isHighlighted, sectionId, onUpdateSectionData }) => {
    const defaultW = settings?.avatarSize || 100;
    const defaultH = settings?.avatarShape === 'circle'
      ? (settings?.avatarSize || 100)
      : (settings?.avatarSize || 100) * 1.25;

    const [dims, setDims] = useState({
      w: data?.customW || defaultW,
      h: data?.customH || defaultH,
    });
    const [isHovered, setIsHovered] = useState(false);
    const outerRef = useRef(null);
    const maxWRef = useRef(400);
    const fileInputRef = useRef(null);

    useEffect(() => {
      if (data?.customW || data?.customH) {
        setDims({ w: data.customW || defaultW, h: data.customH || defaultH });
      }
    }, [data?.customW, data?.customH]);

    useEffect(() => {
      const el = outerRef.current;
      if (!el) return;
      const getColEl = () => el.parentElement;
      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const colW = entry.contentRect.width;
          const newMaxW = Math.max(60, colW - 16);
          maxWRef.current = newMaxW;
          setDims((prev) => {
            const clampedW = Math.min(prev.w, newMaxW);
            if (clampedW !== prev.w) {
              setTimeout(() => {
                onUpdateSectionData(sectionId, { ...data, customW: clampedW, customH: prev.h });
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
    const pc = primaryColor || '#111827';

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
    const borderRadius = isCircle ? '50%' : '2px';

    const handles = [
      { dirX: -1, dirY: -1, cursor: 'nwse-resize', style: { top: -10, left: -10 } },
      { dirX: 1, dirY: -1, cursor: 'nesw-resize', style: { top: -10, right: -10 } },
      { dirX: 1, dirY: 1, cursor: 'nwse-resize', style: { bottom: -10, right: -10 } },
      { dirX: -1, dirY: 1, cursor: 'nesw-resize', style: { bottom: -10, left: -10 } },
      { dirX: 0, dirY: -1, cursor: 'ns-resize', style: { top: -10, left: '50%', transform: 'translateX(-50%)' } },
      { dirX: 0, dirY: 1, cursor: 'ns-resize', style: { bottom: -10, left: '50%', transform: 'translateX(-50%)' } },
      { dirX: -1, dirY: 0, cursor: 'ew-resize', style: { left: -10, top: '50%', transform: 'translateY(-50%)' } },
      { dirX: 1, dirY: 0, cursor: 'ew-resize', style: { right: -10, top: '50%', transform: 'translateY(-50%)' } },
    ];
    const activeHandles = isCircle ? handles.slice(0, 4).map(h => ({ ...h, dirY: h.dirX })) : handles;

    return (
      <div
        ref={outerRef}
        className="flex justify-center transition-all"
        style={isHighlighted
          ? { outline: `2px dashed ${pc}`, outlineOffset: '6px', borderRadius: '4px' }
          : { outline: '2px dashed transparent', outlineOffset: '6px', borderRadius: '4px' }}
      >
        <div
          className="relative"
          style={{ width: `${displayW}px`, height: `${displayH}px`, flexShrink: 0 }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <img
            src={getFileUrl(data?.url) || 'http://localhost:8080/uploads/logos/user.jpg'}
            alt="Avatar"
            style={{
              width: '100%', height: '100%',
              objectFit: 'cover', objectPosition: 'center top',
              borderRadius, display: 'block',
              border: '1px solid #d1d5db',
              filter: 'grayscale(15%)',
            }}
          />
          {isHovered && (
            <div className="absolute inset-0 pointer-events-none"
              style={{ borderRadius, border: `2px dashed ${pc}`, boxSizing: 'border-box' }} />
          )}
          {isHovered && (
            <button
              onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
              className="absolute bottom-2 text-white px-3 py-1 rounded-full flex items-center justify-center gap-1.5 text-[11px] font-medium z-10 shadow w-max cursor-pointer"
              style={{ background: pc, left: '50%', transform: 'translateX(-50%)' }}
            >
              Sửa ảnh
            </button>
          )}
          {isHovered && activeHandles.map((h, i) => (
            <div key={i}
              onMouseDown={(e) => handleResizeMouseDown(e, h.dirX, h.dirY)}
              style={{ position: 'absolute', cursor: h.cursor, zIndex: 30, width: 10, height: 10, background: pc, borderRadius: 2, ...h.style }}
            />
          ))}
          <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
        </div>
      </div>
    );
  },

  personalInfo: ({ data, primaryColor, sectionId, onUpdateSectionData, isHighlighted }) => {
    const config = useTemplateContext();
    return (
      <div style={highlightStyle(isHighlighted, primaryColor)} className={`${sectionWrapClass(isHighlighted)} text-center`}>
        <h1 contentEditable suppressContentEditableWarning
          onBlur={(e) => handleHTMLBlur(e, 'fullName', (f, v) => onUpdateSectionData(sectionId, { ...data, [f]: v }))}
          className={`text-[1.9em] font-bold uppercase tracking-[0.14em] ${commonEditableClass}`}
          style={{ color: primaryColor }}
          data-placeholder={config.placeholders.personalInfo.fullName}
          dangerouslySetInnerHTML={{ __html: data?.fullName || '' }} />
        <br />
        <h2 contentEditable suppressContentEditableWarning
          onBlur={(e) => handleHTMLBlur(e, 'jobTitle', (f, v) => onUpdateSectionData(sectionId, { ...data, [f]: v }))}
          className={`text-[1em] italic mt-1 text-gray-600 ${commonEditableClass}`}
          data-placeholder={config.placeholders.personalInfo.jobTitle}
          dangerouslySetInnerHTML={{ __html: data?.jobTitle || '' }} />
      </div>
    );
  },

  // Danh thiếp nằm ngay dưới tên, canh giữa, có 1 đường kẻ mảnh phía dưới để tách
  // khối header khỏi phần thân — đặc trưng dễ nhận biết nhất của CV Harvard.
  contactInfo: ({ data, primaryColor, sectionId, onUpdateSectionData, isHighlighted }) => (
    <div
      style={highlightStyle(isHighlighted, primaryColor)}
      className={`${sectionWrapClass(isHighlighted)} pb-3 mb-4`}
    >
      <EditableHeaderContactList items={Array.isArray(data) ? data : []} sectionId={sectionId} primaryColor={primaryColor} onUpdateItems={onUpdateSectionData} />
      <div className="mt-3 border-b" style={{ borderColor: primaryColor, opacity: 0.6 }} />
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
          className={`font-bold text-[1.05em] uppercase tracking-[0.08em] mb-2 pb-1 inline-block min-w-[150px] w-full ${commonEditableClass}`}
          style={{ color: primaryColor, borderBottom: `1.5px solid ${primaryColor}` }}
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

  skills: (props) => <div style={highlightStyle(props.isHighlighted, props.primaryColor)} className={sectionWrapClass(props.isHighlighted)}><EditableSectionTitle {...props} />{renderDynamicList(props.settings?.sectionLayouts?.[props.sectionId] || 'row', listProps('skills', props.data, props.sectionId, props.primaryColor, props.onUpdateSectionData))}</div>,
  hobbies: (props) => <div style={highlightStyle(props.isHighlighted, props.primaryColor)} className={sectionWrapClass(props.isHighlighted)}><EditableSectionTitle {...props} />{renderDynamicList(props.settings?.sectionLayouts?.[props.sectionId] || 'row', listProps('hobbies', props.data, props.sectionId, props.primaryColor, props.onUpdateSectionData))}</div>,
  experience: (props) => <div style={highlightStyle(props.isHighlighted, props.primaryColor)} className={sectionWrapClass(props.isHighlighted)}><EditableSectionTitle {...props} />{renderDynamicList(props.settings?.sectionLayouts?.[props.sectionId] || 'row', listProps('experience', props.data, props.sectionId, props.primaryColor, props.onUpdateSectionData))}</div>,
  education: (props) => <div style={highlightStyle(props.isHighlighted, props.primaryColor)} className={sectionWrapClass(props.isHighlighted)}><EditableSectionTitle {...props} />{renderDynamicList(props.settings?.sectionLayouts?.[props.sectionId] || 'row', listProps('education', props.data, props.sectionId, props.primaryColor, props.onUpdateSectionData))}</div>,
  activities: (props) => <div style={highlightStyle(props.isHighlighted, props.primaryColor)} className={sectionWrapClass(props.isHighlighted)}><EditableSectionTitle {...props} />{renderDynamicList(props.settings?.sectionLayouts?.[props.sectionId] || 'row', listProps('activities', props.data, props.sectionId, props.primaryColor, props.onUpdateSectionData))}</div>,
  projects: (props) => <div style={highlightStyle(props.isHighlighted, props.primaryColor)} className={sectionWrapClass(props.isHighlighted)}><EditableSectionTitle {...props} />{renderDynamicList(props.settings?.sectionLayouts?.[props.sectionId] || 'row', listProps('projects', props.data, props.sectionId, props.primaryColor, props.onUpdateSectionData))}</div>,
  certifications: (props) => <div style={highlightStyle(props.isHighlighted, props.primaryColor)} className={sectionWrapClass(props.isHighlighted)}><EditableSectionTitle {...props} />{renderDynamicList(props.settings?.sectionLayouts?.[props.sectionId] || 'row', listProps('certifications', props.data, props.sectionId, props.primaryColor, props.onUpdateSectionData))}</div>,
  awards: (props) => <div style={highlightStyle(props.isHighlighted, props.primaryColor)} className={sectionWrapClass(props.isHighlighted)}><EditableSectionTitle {...props} />{renderDynamicList(props.settings?.sectionLayouts?.[props.sectionId] || 'row', listProps('awards', props.data, props.sectionId, props.primaryColor, props.onUpdateSectionData))}</div>,
  references: (props) => <div style={highlightStyle(props.isHighlighted, props.primaryColor)} className={sectionWrapClass(props.isHighlighted)}><EditableSectionTitle {...props} />{renderDynamicList(props.settings?.sectionLayouts?.[props.sectionId] || 'row', listProps('references', props.data, props.sectionId, props.primaryColor, props.onUpdateSectionData))}</div>,
};

const getFontSizeStyle = (sizeValue) => {
  switch (sizeValue) {
    case 'small': return '10px';
    case 'medium': return '13px';
    case 'large': return '16px';
    case 'xlarge': return '20px';
    default: return '13px';
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// HARVARD TEMPLATE MAIN COMPONENT
// Cấu trúc render (grid theo activeRows/ratio, click-to-select section...) giữ
// nguyên y hệt SimpleTemplate — đây là phần đảm bảo tab "Bố cục" (kéo thả hàng,
// đổi tỉ lệ cột trái/phải) hoạt động giống hệt nhau giữa 2 mẫu.
// ─────────────────────────────────────────────────────────────────────────────
const HarvardTemplate = ({ cvData, selectedSection, onSectionClick, onUpdateSectionData }) => {
  const { layout, data, settings } = cvData;
  const containerRef = useRef(null);

  const handleSectionClick = (e, sectionId) => {
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
    <TemplateContext.Provider value={HARVARD_TEMPLATE_CONFIG}>
      <div
        ref={containerRef}
        className="bg-white mx-auto px-10 py-8 box-border"
        style={{ fontFamily: `${settings.font}, serif`, fontSize: getFontSizeStyle(settings.fontSize), color: '#1f2937' }}
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

export default HarvardTemplate;

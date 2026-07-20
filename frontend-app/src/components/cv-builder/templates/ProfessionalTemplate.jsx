import React, { useState, useEffect, useRef } from 'react';
import { ArrowUp, ArrowDown, Plus, Phone, Calendar, Mail, Globe, MapPin, User } from 'lucide-react';
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
// Cùng hình dạng với SIMPLE_TEMPLATE_CONFIG / HARVARD_TEMPLATE_CONFIG để tương
// thích ngược với toàn bộ hạ tầng hiện có (TabPanel, LayoutSidebar...).
// Đặc trưng: 1 hàng duy nhất tỉ lệ 30-70 — cột trái là "sidebar" tối (ảnh, thông
// tin cá nhân, danh thiếp, học vấn, kỹ năng), cột phải là nội dung chính nền sáng.
// ─────────────────────────────────────────────────────────────────────────────

export const PROFESSIONAL_TEMPLATE_CONFIG = {
  id: 'professional',

  sectionOrder: [
    "avatar", "contactInfo", "personalInfo", "objective", "education",
    "experience", "activities", "certifications", "awards", "skills",
    "references", "hobbies", "projects", "customSection"
  ],

  defaultSettings: {
    template: "professional",
    font: "Roboto",
    fontSize: "medium",
    primaryColor: "#7C2D12",
    accentColor: "#F2C185",
    avatarShape: "circle",
    avatarSize: 110,
  },

  defaultData: {
    sectionTitles: {},
    avatar: { url: "http://localhost:8080/uploads/logos/user.jpg" },
    personalInfo: { fullName: "", jobTitle: "" },
    contactInfo: [
      { label: "Số điện thoại", value: "" },
      { label: "Ngày sinh",     value: "" },
      { label: "Email",        value: "" },
      { label: "Facebook",     value: "" },
      { label: "Địa chỉ",      value: "" },
    ],
    objective: [], experience: [], education: [], activities: [],
    skills: [], hobbies: [], awards: [], certifications: [],
    projects: [], references: [],
  },

  // 1 hàng duy nhất (không chia theo section) để nền tối của sidebar liền mạch,
  // không bị đứt quãng giữa các mục — khác với Simple/Harvard vốn tách hàng riêng
  // cho khối đầu trang. Nếu người dùng bấm "Thêm hàng mới", hàng mới sẽ hiển thị
  // nền sáng bình thường (xem ghi chú isSidebarRow trong component chính).
  defaultLayout: {
    activeRows: [
      {
        id: 'row-1', ratio: '30-70',
        leftItems: ['avatar', 'personalInfo', 'contactInfo', 'education', 'skills'],
        rightItems: [
          'objective', 'experience', 'awards', 'activities',
          'projects', 'certifications', 'references', 'hobbies',
        ],
      },
    ],
    unusedItems: ['customSection'],
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
      awards: "DANH HIỆU VÀ GIẢI THƯỞNG",
      references: "NGƯỜI THAM CHIẾU",
      customSection: "Thông tin thêm"
    }
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// COLOR HELPERS — tự tính màu nền tối / màu tag từ primaryColor do người dùng
// chọn ở "Chủ đề màu sắc". Đây là phần LOGIC RIÊNG của ProfessionalTemplate,
// không có trong cvTemplateCore.js dùng chung.
// ─────────────────────────────────────────────────────────────────────────────
const hexToRgb = (hex) => {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || '');
  return m ? { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) } : { r: 124, g: 45, b: 18 };
};
// percent âm = tối hơn (pha đen), percent dương = sáng hơn (pha trắng)
const shadeRgb = (hex, percent) => {
  const { r, g, b } = hexToRgb(hex);
  const target = percent < 0 ? 0 : 255;
  const p = Math.min(1, Math.abs(percent));
  const mix = (c) => Math.round((target - c) * p) + c;
  return { r: mix(r), g: mix(g), b: mix(b) };
};
const rgbToCss = ({ r, g, b }) => `rgb(${r}, ${g}, ${b})`;

// Độ sáng tương đối theo công thức WCAG — dùng để TỰ ĐỘNG chọn chữ trắng hay đen
// dựa trên chính màu nền vừa tính ra, thay vì giả định cứng "nền tối thì luôn chữ
// trắng". Nhờ vậy nếu sau này thêm theme màu pastel/nhạt, chữ vẫn tự đảo màu đúng.
const getLuminance = ({ r, g, b }) => {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
};
const pickContrastColor = (bgRgb) => (getLuminance(bgRgb) < 0.5 ? '#FFFFFF' : '#111827');
const pickMutedContrastColor = (bgRgb) =>
  getLuminance(bgRgb) < 0.5 ? 'rgba(255,255,255,0.62)' : 'rgba(17,24,39,0.6)';

// Màu viền/outline khi section được chọn (đang sửa): ở cột tối PHẢI dùng accentColor
// (màu phụ) chứ không phải primaryColor — vì sidebarBg chính là bản tối của
// primaryColor, dùng lại nó làm viền sẽ bị "chìm" vào nền như lỗi đã gặp.
const getOutlineColor = (variant, primaryColor, accentColor) =>
  variant === 'dark' ? (accentColor || '#F2C185') : primaryColor;

// Đoán icon phù hợp theo nội dung nhãn (label) người dùng nhập cho từng dòng danh
// thiếp — chỉ mang tính gợi ý trực quan (giống bản mẫu tham khảo), không ảnh hưởng
// dữ liệu thật; nếu không khớp từ khoá nào, dùng icon User làm mặc định.
const pickContactIcon = (label = '') => {
  const l = (label || '').toLowerCase();
  if (l.includes('điện thoại') || l.includes('phone') || l.includes('sđt') || l.includes('sdt')) return Phone;
  if (l.includes('sinh') || l.includes('ngày')) return Calendar;
  if (l.includes('email') || l.includes('mail')) return Mail;
  if (l.includes('địa chỉ') || l.includes('address')) return MapPin;
  if (l.includes('web') || l.includes('link') || l.includes('facebook') || l.includes('github') || l.includes('http')) return Globe;
  return User;
};

// Ép màu chữ của các list component DÙNG CHUNG (vốn code cứng cho nền sáng)
// sang màu sáng khi được đặt trong sidebar tối. Chỉ nhắm đúng các class Tailwind
// đã biết trong EditableRowList/EditableTimelineList/EditableParagraphList.
// Lưu ý: EditableTagList tô màu chữ bằng inline style nên KHÔNG override được
// bằng cách này — vì vậy tránh dùng layout "tags" cho các section trong sidebar.
const sidebarListOverrideClass =
  "[&_.text-gray-900]:!text-white [&_.text-gray-700]:!text-white/80 " +
  "[&_.text-gray-600]:!text-white/60 [&_.border-gray-100]:!border-white/10";

const EMPTY_ITEM = { date: '', title: '', subtitle: '', description: '' };

const highlightStyle = (isHighlighted, primaryColor) => ({
  outline: isHighlighted ? `2px dashed ${primaryColor}` : '2px dashed transparent',
  outlineOffset: '4px',
  borderRadius: '4px',
  padding: '2px',
});

const sectionWrapClass = (isHighlighted) => `mb-3 flow-root cursor-pointer transition-all duration-200 ${isHighlighted ? 'rounded-lg' : ''}`;

// commonEditableClass (dùng chung, có sẵn "focus:bg-blue-50" thiết kế cho nền trắng)
// sẽ tạo 1 khối nền trắng/xanh nhạt đè lên chữ trắng khi đang gõ trên sidebar tối —
// đúng lỗi "gõ tên bị mất chữ vì nền trắng" đã gặp. Đây là hằng số DÙNG CHUNG
// (Simple/Harvard cũng dùng) nên không sửa trực tiếp được — ProfessionalTemplate
// định nghĩa riêng 1 class cho vùng tối: thay khối nền đặc bằng hiệu ứng "kính mờ"
// (lớp phủ trắng trong suốt + backdrop-blur), vẫn báo hiệu đang focus nhưng không
// che chữ, đồng bộ với hiệu ứng kính đã thấy ở các khối khác.
const darkEditableFocusClass =
  'outline-none focus:bg-white/15 focus:backdrop-blur-sm focus:ring-1 focus:ring-white/40 rounded p-0.5 transition-all ' +
  'empty:before:content-[attr(data-placeholder)] empty:before:text-white/35 ' +
  'empty:before:pointer-events-none empty:before:block cursor-text inline-block min-w-[30px]';

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTS — "danh thiếp" (contactInfo) tương thích 2 biến thể sáng/tối vì
// mục này có thể bị kéo sang cột phải qua tab "Bố cục".
// ─────────────────────────────────────────────────────────────────────────────
const ContactList = ({ items, sectionId, primaryColor, accentColor, onUpdateItems, isDark, textColor, mutedColor }) => {
  const config = useTemplateContext();
  const iconBadgeTextColor = pickContrastColor(hexToRgb(accentColor));

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

  // Nhãn dùng thẳng accentColor (màu phụ) thay vì chữ xám/trắng mờ như trước — vừa
  // tăng độ tương phản, vừa tận dụng đúng "cụm màu chính + phụ" đã chọn ở Thiết kế.
  const labelStyle = isDark ? { color: accentColor } : { color: primaryColor };
  const valueStyle = isDark ? { color: textColor } : {};
  const labelClass = "text-[0.72em] font-semibold uppercase tracking-wide";
  const valueClass = isDark
    ? "text-[0.92em] font-medium"
    : "text-[0.92em] text-gray-700 font-medium";
  const editableBase = isDark
    ? "outline-none focus:bg-white/15 focus:backdrop-blur-sm focus:ring-1 focus:ring-white/40 rounded transition-all cursor-text empty:before:content-[attr(data-placeholder)] empty:before:text-white/35 empty:before:pointer-events-none empty:before:block"
    : "outline-none focus:bg-blue-50 focus:ring-1 focus:ring-blue-300 rounded transition-all cursor-text empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400 empty:before:pointer-events-none empty:before:block";

  return (
    <div className={`w-full relative group/section ${isDark ? 'space-y-2.5' : 'space-y-1.5'}`}>
      {items.map((item, index) => {
        const Icon = pickContactIcon(item.label);
        return (
          <div key={index} className="relative group/item flex items-start gap-2.5">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ backgroundColor: accentColor, color: iconBadgeTextColor }}
              contentEditable="false"
            >
              <Icon size={12} strokeWidth={2.5} />
            </div>

            <div className="flex-1 min-w-0 relative">
              <div
                className={`absolute right-0 -top-6 flex-row gap-0.5 rounded-md z-20 opacity-0 invisible group-hover/item:opacity-100 group-hover/item:visible transition-all flex ${isDark ? 'bg-gray-800' : 'bg-white shadow-lg border border-gray-200'}`}
                contentEditable="false"
              >
                <button onClick={() => handleMoveUp(index)} disabled={index === 0} className={`px-1.5 py-1 rounded disabled:opacity-30 ${isDark ? 'hover:bg-white/10 text-white/70' : 'hover:bg-blue-50 text-blue-600'}`}><ArrowUp size={12} /></button>
                <button onClick={() => handleMoveDown(index)} disabled={index === items.length - 1} className={`px-1.5 py-1 rounded disabled:opacity-30 ${isDark ? 'hover:bg-white/10 text-white/70' : 'hover:bg-blue-50 text-blue-600'}`}><ArrowDown size={12} /></button>
                <button onClick={() => handleAdd(index)} className={`px-1.5 py-1 rounded ${isDark ? 'hover:bg-white/10 text-white/70' : 'hover:bg-blue-50 text-blue-600'}`}><Plus size={12} /></button>
                <button onClick={() => handleDelete(index)} className={`px-2 py-1 rounded text-[10px] text-white ${isDark ? 'bg-red-500/80 hover:bg-red-500' : 'bg-red-500 hover:bg-red-600'}`}>Xóa</button>
              </div>

              <div contentEditable suppressContentEditableWarning
                onBlur={(e) => handleHTMLBlur(e, 'label', (f, v) => handleTextChange(index, f, v))}
                className={`${labelClass} ${editableBase}`}
                style={labelStyle}
                data-placeholder={config.placeholders.contactInfo.title}
                dangerouslySetInnerHTML={{ __html: item.label }} />
              <div contentEditable suppressContentEditableWarning
                onBlur={(e) => handleHTMLBlur(e, 'value', (f, v) => handleTextChange(index, f, v))}
                className={`${valueClass} ${editableBase} break-words`}
                style={valueStyle}
                data-placeholder={item.placeholder || config.placeholders.contactInfo.value}
                dangerouslySetInnerHTML={{ __html: item.value }} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Tiêu đề mục ở CỘT SÁNG: chữ đậm in hoa + ô vuông nhỏ màu primaryColor phía
// trước, viền dưới mảnh màu xám nhạt (không dùng primaryColor cho viền để giữ
// cột phải "sạch" như bản mẫu).
const MainSectionTitle = ({ sectionId, sectionTitle, allSectionTitles, primaryColor, onUpdateSectionData }) => {
  const config = useTemplateContext();
  const defaultTitle = config.placeholders.sections[sectionId.split('_')[0]] || "TIÊU ĐỀ";
  return (
    <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-gray-200">
      <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: primaryColor }} />
      <h3 contentEditable suppressContentEditableWarning
        onBlur={(e) => handleHTMLBlur(e, sectionId, (f, v) => onUpdateSectionData('sectionTitles', { ...allSectionTitles, [f]: v }))}
        className={`font-bold text-[1.05em] uppercase tracking-wide text-gray-800 flex-1 ${commonEditableClass}`}
        data-placeholder={defaultTitle}
        dangerouslySetInnerHTML={{ __html: sectionTitle ?? defaultTitle }}
      />
    </div>
  );
};

// Tiêu đề mục ở CỘT TỐI: pill nền ĐẶC bằng accentColor (màu phụ) — không dùng lớp
// phủ trắng mờ như bản trước vì độ tương phản quá thấp trên nền cùng tông màu.
// textColor ở đây là màu chữ RIÊNG cho pill (tính theo độ tương phản với chính
// accentColor), khác với textColor chung của toàn sidebar.
const SidebarSectionTitle = ({ sectionId, sectionTitle, allSectionTitles, onUpdateSectionData, textColor, pillBg }) => {
  const config = useTemplateContext();
  const defaultTitle = config.placeholders.sections[sectionId.split('_')[0]] || "TIÊU ĐỀ";
  return (
    <h3 contentEditable suppressContentEditableWarning
      onBlur={(e) => handleHTMLBlur(e, sectionId, (f, v) => onUpdateSectionData('sectionTitles', { ...allSectionTitles, [f]: v }))}
      className={`inline-block font-bold text-[0.8em] uppercase tracking-wider rounded-full px-3 py-1 mb-2.5 ${darkEditableFocusClass}`}
      style={{ color: textColor, backgroundColor: pillBg }}
      data-placeholder={defaultTitle}
      dangerouslySetInnerHTML={{ __html: sectionTitle ?? defaultTitle }}
    />
  );
};

const renderDynamicList = (layoutType, props) => {
  switch (layoutType) {
    case 'timeline': return <EditableTimelineList {...props} />;
    case 'tags': return <EditableTagList {...props} />;
    case 'paragraph': return <EditableParagraphList {...props} />;
    case 'row': default: return <EditableRowList {...props} />;
  }
};

const listProps = (dataType, data, sectionId, primaryColor, onUpdateSectionData) => ({
  items: adaptDataForList(data, dataType), sectionId, primaryColor, emptyItemTemplate: EMPTY_ITEM,
  onUpdateItems: (id, updated) => onUpdateSectionData(id, revertDataFromList(updated, dataType)),
});

// Factory dùng chung cho mọi section dạng danh sách (education/experience/skills...):
// tự chọn tiêu đề sáng/tối và bọc override màu chữ khi section đang nằm ở cột tối
// (props.variant do component cha truyền xuống theo CỘT thực tế đang render, chứ
// không cố định theo sectionId — nhờ vậy kéo thả qua tab "Bố cục" vẫn ra đúng màu).
const makeListSectionRenderer = (dataType, defaultLayoutType) => (props) => {
  const { isHighlighted, primaryColor, variant, textColor, pillBg, pillTextColor, settings } = props;
  const isDark = variant === 'dark';
  const outlineColor = getOutlineColor(variant, primaryColor, settings?.accentColor);
  return (
    <div style={highlightStyle(isHighlighted, outlineColor)} className={sectionWrapClass(isHighlighted)}>
      {isDark ? <SidebarSectionTitle {...props} textColor={pillTextColor} pillBg={pillBg} /> : <MainSectionTitle {...props} />}
      <div className={isDark ? sidebarListOverrideClass : ''}>
        {renderDynamicList(
          props.settings?.sectionLayouts?.[props.sectionId] || defaultLayoutType,
          listProps(dataType, props.data, props.sectionId, primaryColor, props.onUpdateSectionData)
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SECTION RENDERERS
// ─────────────────────────────────────────────────────────────────────────────
const SECTION_RENDERER = {
  avatar: ({ data, primaryColor, settings, isHighlighted, sectionId, onUpdateSectionData, variant, textColor }) => {
    const isDark = variant !== 'light';
    const defaultW = settings?.avatarSize || 110;
    const defaultH = settings?.avatarShape === 'circle' ? (settings?.avatarSize || 110) : (settings?.avatarSize || 110) * 1.25;

    const [dims, setDims] = useState({ w: data?.customW || defaultW, h: data?.customH || defaultH });
    const [isHovered, setIsHovered] = useState(false);
    const outerRef = useRef(null);
    const maxWRef = useRef(400);
    const fileInputRef = useRef(null);

    useEffect(() => {
      if (data?.customW || data?.customH) setDims({ w: data.customW || defaultW, h: data.customH || defaultH });
    }, [data?.customW, data?.customH]);

    useEffect(() => {
      const el = outerRef.current;
      if (!el) return;
      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const newMaxW = Math.max(60, entry.contentRect.width - 16);
          maxWRef.current = newMaxW;
          setDims((prev) => {
            const clampedW = Math.min(prev.w, newMaxW);
            if (clampedW !== prev.w) {
              setTimeout(() => onUpdateSectionData(sectionId, { ...data, customW: clampedW, customH: prev.h }), 0);
              return { ...prev, w: clampedW };
            }
            return prev;
          });
        }
      });
      const colEl = el.parentElement;
      if (colEl) observer.observe(colEl);
      return () => observer.disconnect();
    }, [sectionId, data, onUpdateSectionData]);

    const isCircle = settings?.avatarShape === 'circle';
    // Viền chọn/nút sửa ảnh: ở cột tối dùng accentColor (màu phụ) thay vì primaryColor,
    // vì nền sidebar chính là 1 bản tối của primaryColor — dùng lại primaryColor ở đây
    // sẽ bị "chìm" vào nền (đúng lỗi khung viền trùng màu nền đã gặp).
    const pc = isDark ? (settings?.accentColor || '#F2C185') : (primaryColor || '#7C2D12');

    const handleImageChange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onloadend = () => onUpdateSectionData(sectionId, { ...data, url: reader.result });
      reader.readAsDataURL(file);
    };

    const handleResizeMouseDown = (e, dirX, dirY) => {
      e.preventDefault(); e.stopPropagation();
      const startX = e.clientX, startY = e.clientY, startW = dims.w, startH = dims.h;
      const maxW = maxWRef.current, maxH = 500;
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
        setDims((final) => { onUpdateSectionData(sectionId, { ...data, customW: final.w, customH: final.h }); return final; });
      };
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    };

    const displayW = dims.w;
    const displayH = isCircle ? dims.w : dims.h;
    const borderRadius = isCircle ? '50%' : '4px';
    const handles = [
      { dirX: -1, dirY: -1, cursor: 'nwse-resize', style: { top: -10, left: -10 } },
      { dirX: 1, dirY: -1, cursor: 'nesw-resize', style: { top: -10, right: -10 } },
      { dirX: 1, dirY: 1, cursor: 'nwse-resize', style: { bottom: -10, right: -10 } },
      { dirX: -1, dirY: 1, cursor: 'nesw-resize', style: { bottom: -10, left: -10 } },
    ];
    const activeHandles = isCircle ? handles.map(h => ({ ...h, dirY: h.dirX })) : handles;

    return (
      <div
        ref={outerRef}
        className="flex justify-center transition-all mb-4"
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
              width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top',
              borderRadius, display: 'block',
              border: isDark ? `3px solid ${textColor === '#FFFFFF' ? 'rgba(255,255,255,0.25)' : 'rgba(17,24,39,0.2)'}` : '3px solid #e5e7eb',
            }}
          />
          {isHovered && (
            <div className="absolute inset-0 pointer-events-none" style={{ borderRadius, border: `2px dashed ${pc}`, boxSizing: 'border-box' }} />
          )}
          {isHovered && (
            <button
              onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
              className="absolute bottom-2 text-white px-3 py-1 rounded-full text-[11px] font-medium z-10 shadow w-max cursor-pointer"
              style={{ background: pc, left: '50%', transform: 'translateX(-50%)' }}
            >
              Sửa ảnh
            </button>
          )}
          {isHovered && activeHandles.map((h, i) => (
            <div key={i} onMouseDown={(e) => handleResizeMouseDown(e, h.dirX, h.dirY)}
              style={{ position: 'absolute', cursor: h.cursor, zIndex: 30, width: 10, height: 10, background: pc, borderRadius: 2, ...h.style }} />
          ))}
          <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
        </div>
      </div>
    );
  },

  personalInfo: ({ data, primaryColor, settings, sectionId, onUpdateSectionData, isHighlighted, variant, textColor, mutedColor }) => {
    const config = useTemplateContext();
    const isDark = variant !== 'light';
    const outlineColor = getOutlineColor(isDark ? 'dark' : 'light', primaryColor, settings?.accentColor);
    return (
      <div
        style={highlightStyle(isHighlighted, outlineColor)}
        className={`${sectionWrapClass(isHighlighted)} ${isDark ? 'text-center mb-5' : 'text-left'}`}
      >
        <h1 contentEditable suppressContentEditableWarning
          onBlur={(e) => handleHTMLBlur(e, 'fullName', (f, v) => onUpdateSectionData(sectionId, { ...data, [f]: v }))}
          className={`font-bold leading-tight ${isDark ? darkEditableFocusClass : commonEditableClass} ${isDark ? 'text-[1.5em]' : 'text-[1.9em] text-gray-900'}`}
          style={isDark ? { color: textColor } : { color: primaryColor }}
          data-placeholder={config.placeholders.personalInfo.fullName}
          dangerouslySetInnerHTML={{ __html: data?.fullName || '' }} />
        <br />
        <h2 contentEditable suppressContentEditableWarning
          onBlur={(e) => handleHTMLBlur(e, 'jobTitle', (f, v) => onUpdateSectionData(sectionId, { ...data, [f]: v }))}
          className={`mt-1 ${isDark ? darkEditableFocusClass : commonEditableClass} ${isDark ? 'text-[0.95em] uppercase tracking-wide' : 'text-[1.1em] text-gray-600'}`}
          style={isDark ? { color: mutedColor } : {}}
          data-placeholder={config.placeholders.personalInfo.jobTitle}
          dangerouslySetInnerHTML={{ __html: data?.jobTitle || '' }} />
      </div>
    );
  },

  contactInfo: ({ data, primaryColor, settings, sectionId, onUpdateSectionData, isHighlighted, variant, textColor, mutedColor }) => {
    const isDark = variant !== 'light';
    const outlineColor = getOutlineColor(isDark ? 'dark' : 'light', primaryColor, settings?.accentColor);
    return (
      <div style={highlightStyle(isHighlighted, outlineColor)} className={sectionWrapClass(isHighlighted)}>
        <ContactList items={Array.isArray(data) ? data : []} sectionId={sectionId} primaryColor={primaryColor} accentColor={settings?.accentColor || '#F2C185'} onUpdateItems={onUpdateSectionData} isDark={isDark} textColor={textColor} mutedColor={mutedColor} />
      </div>
    );
  },

  objective: (props) => {
    const isDark = props.variant === 'dark';
    const outlineColor = getOutlineColor(props.variant, props.primaryColor, props.settings?.accentColor);
    return (
      <div style={highlightStyle(props.isHighlighted, outlineColor)} className={sectionWrapClass(props.isHighlighted)}>
        {isDark ? <SidebarSectionTitle {...props} textColor={props.pillTextColor} pillBg={props.pillBg} /> : <MainSectionTitle {...props} />}
        <div className={isDark ? sidebarListOverrideClass : ''}>
          {renderDynamicList(props.settings?.sectionLayouts?.[props.sectionId] || 'paragraph', {
            items: Array.isArray(props.data) ? props.data : props.data ? [{ description: props.data }] : [],
            sectionId: props.sectionId, primaryColor: props.primaryColor, emptyItemTemplate: { description: '' },
            onUpdateItems: (id, updated) => props.onUpdateSectionData(id, updated),
          })}
        </div>
      </div>
    );
  },

  customSectionRenderer: ({ data, primaryColor, settings, sectionId, onUpdateSectionData, isHighlighted, variant, textColor, mutedColor }) => {
    const config = useTemplateContext();
    const isDark = variant === 'dark';
    const outlineColor = getOutlineColor(variant, primaryColor, settings?.accentColor);
    return (
      <div style={highlightStyle(isHighlighted, outlineColor)} className={sectionWrapClass(isHighlighted)}>
        <h3 contentEditable suppressContentEditableWarning
          onBlur={(e) => handleHTMLBlur(e, 'title', (f, v) => onUpdateSectionData(sectionId, { ...data, [f]: v }))}
          className={`font-bold text-[1.05em] uppercase tracking-wide mb-2 pb-1.5 w-full ${isDark ? darkEditableFocusClass : commonEditableClass} ${isDark ? '' : 'text-gray-800 border-b border-gray-200'}`}
          style={isDark ? { color: textColor, borderBottom: `1px solid ${mutedColor}` } : {}}
          data-placeholder="Tên mục"
          dangerouslySetInnerHTML={{ __html: data?.title || config.placeholders.sections.customSection }} />
        <div contentEditable suppressContentEditableWarning
          onBlur={(e) => handleHTMLBlur(e, 'content', (f, v) => onUpdateSectionData(sectionId, { ...data, [f]: v }))}
          className={`text-[1em] leading-relaxed whitespace-pre-wrap min-h-[40px] w-full ${isDark ? darkEditableFocusClass : commonEditableClass} ${isDark ? '' : 'text-gray-700'}`}
          style={isDark ? { color: mutedColor } : {}}
          data-placeholder="Nội dung thông tin thêm..."
          dangerouslySetInnerHTML={{ __html: data?.content || '' }} />
      </div>
    );
  },

  education: makeListSectionRenderer('education', 'row'),
  experience: makeListSectionRenderer('experience', 'row'),
  activities: makeListSectionRenderer('activities', 'row'),
  projects: makeListSectionRenderer('projects', 'row'),
  certifications: makeListSectionRenderer('certifications', 'row'),
  awards: makeListSectionRenderer('awards', 'row'),
  references: makeListSectionRenderer('references', 'row'),
  hobbies: makeListSectionRenderer('hobbies', 'row'),
  // Kỹ năng mặc định layout "row" (không phải "tags") vì lý do đã giải thích ở
  // sidebarListOverrideClass — người dùng vẫn có thể tự đổi sang "Dạng Thẻ" ở
  // tab Thiết kế nếu section đang nằm ở cột sáng.
  skills: makeListSectionRenderer('skills', 'row'),
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
// PROFESSIONAL TEMPLATE MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const ProfessionalTemplate = ({ cvData, selectedSection, onSectionClick, onUpdateSectionData }) => {
  const { layout, data, settings } = cvData;
  const containerRef = useRef(null);
  const primaryColor = settings.primaryColor || '#7C2D12';
  const accentColor = settings.accentColor || '#F2C185';
  const sidebarBgRgb = shadeRgb(primaryColor, -0.55);
  const sidebarBg = rgbToCss(sidebarBgRgb);
  // Tự động chọn chữ trắng hay đen dựa trên độ sáng THỰC TẾ của sidebarBg vừa tính,
  // thay vì giả định cứng "nền tối luôn là chữ trắng" — đúng yêu cầu tương phản tự động.
  const textColor = pickContrastColor(sidebarBgRgb);
  const mutedColor = pickMutedContrastColor(sidebarBgRgb);
  // Pill tiêu đề dùng NỀN ĐẶC bằng accentColor (màu phụ) — không dùng overlay trắng
  // mờ nữa vì độ tương phản quá thấp khi nền pill và nền sidebar cùng tông màu.
  const pillBg = accentColor;
  const pillTextColor = pickContrastColor(hexToRgb(accentColor));

  const handleSectionClick = (e, sectionId) => {
    e.stopPropagation();
    if (onSectionClick) onSectionClick(sectionId);
  };

  const renderItems = (itemIds, variant) =>
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
            primaryColor={primaryColor}
            settings={settings}
            isHighlighted={selectedSection === itemId}
            sectionId={itemId}
            onUpdateSectionData={onUpdateSectionData}
            variant={variant}
            textColor={variant === 'dark' ? textColor : undefined}
            mutedColor={variant === 'dark' ? mutedColor : undefined}
            pillBg={variant === 'dark' ? pillBg : undefined}
            pillTextColor={variant === 'dark' ? pillTextColor : undefined}
          />
        </div>
      );
    });

  return (
    <TemplateContext.Provider value={PROFESSIONAL_TEMPLATE_CONFIG}>
      <div
        ref={containerRef}
        className="bg-white mx-auto box-border"
        style={{ fontFamily: `${settings.font}, sans-serif`, fontSize: getFontSizeStyle(settings.fontSize) }}
      >
        {layout.activeRows.map((row) => {
          const { left, right } = getGridClasses(row.ratio);
          // Chỉ hàng 2 cột mới là "hàng sidebar" (cột trái tối, cột phải sáng).
          // Hàng 1 cột (10-0/100-0) — ví dụ khi người dùng bấm "Thêm hàng mới" —
          // hiển thị nền sáng bình thường, không ép tối để tránh vỡ layout.
          const hasRightCol = row.ratio !== '10-0' && row.ratio !== '100-0';

          return (
            <div key={row.id} className="grid grid-cols-10 items-stretch">
              <div className={`${left} ${hasRightCol ? 'p-0' : 'px-8 pt-8'}`}>
                {hasRightCol ? (
                  <div className="h-full p-6" style={{ backgroundColor: sidebarBg }}>
                    {renderItems(row.leftItems, 'dark')}
                  </div>
                ) : (
                  renderItems(row.leftItems, 'light')
                )}
              </div>
              {hasRightCol && (
                <div className={`${right} p-8`}>
                  {renderItems(row.rightItems, 'light')}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </TemplateContext.Provider>
  );
};

export default ProfessionalTemplate;

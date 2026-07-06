/**
 * cvTemplateCore.js
 */
import { createContext, useContext } from 'react';

export const CV_FONT_SIZES = [
  { label: 'Nhỏ',     value: 'small',  px: '10px' },
  { label: 'Vừa',     value: 'medium', px: '13px' },
  { label: 'Lớn',     value: 'large',  px: '16px' },
  { label: 'Rất lớn', value: 'xlarge', px: '20px' },
];

// Kích thước 1 trang A4 chuẩn ở 96dpi. Đây là NGUỒN DUY NHẤT cho kích thước trang
// trong toàn bộ ứng dụng — mọi nơi cần tới (khung giấy live editor, khung phân trang
// trong bản xem trước, mô phỏng ngắt trang khi chụp thumbnail...) đều import từ đây,
// tránh lặp lại số "magic" 794/1123 ở nhiều chỗ rồi lệch nhau khi cần đổi khổ giấy.
export const CV_PAGE_WIDTH_PX = 794;
export const CV_PAGE_HEIGHT_PX = 1123;

// 1. TẠO CONTEXT CHO TEMPLATE
export const TemplateContext = createContext(null);
export const useTemplateContext = () => useContext(TemplateContext);

// 2. CSS CLASS CONSTANTS
export const commonEditableClass =
  'outline-none focus:bg-blue-50 focus:ring-1 focus:ring-blue-300 rounded p-0.5 transition-all ' +
  'empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400 ' +
  'empty:before:pointer-events-none empty:before:block cursor-text inline-block min-w-[30px]';

export const contactEditableClass =
  'outline-none focus:bg-blue-50 focus:ring-1 focus:ring-blue-300 rounded px-1 transition-all ' +
  'empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400 ' +
  'empty:before:pointer-events-none empty:before:block cursor-text empty:border ' +
  'empty:border-dashed empty:border-red-400 empty:bg-red-50/20 min-w-[40px] inline-block';

// 3. HELPERS
export const handleHTMLBlur = (e, field, updateFn) => {
  let val = e.currentTarget.innerHTML.trim();
  if (val === '<br>') val = '';
  updateFn(field, val);
};

export const highlightClass = (isHighlighted) =>
  isHighlighted ? 'outline outline-2 outline-dashed outline-yellow-400 p-2 rounded' : '';

export const getGridClasses = (ratio) => {
  switch (ratio) {
    case '1-9':
    case '10-90':
      return { left: 'col-span-1', right: 'col-span-9' };

    case '2-8':
    case '20-80':
      return { left: 'col-span-2', right: 'col-span-8' };

    case '3-7':
    case '30-70':
      return { left: 'col-span-3', right: 'col-span-7' };

    case '4-6':
    case '40-60':
      return { left: 'col-span-4', right: 'col-span-6' };

    case '5-5':
    case '50-50':
      return { left: 'col-span-5', right: 'col-span-5' };

    case '6-4':
    case '60-40':
      return { left: 'col-span-6', right: 'col-span-4' };

    case '7-3':
    case '70-30':
      return { left: 'col-span-7', right: 'col-span-3' };

    case '8-2':
    case '80-20':
      return { left: 'col-span-8', right: 'col-span-2' };

    case '9-1':
    case '90-10':
      return { left: 'col-span-9', right: 'col-span-1' };

    case '10-0':
    case '100-0':
      return { left: 'col-span-10', right: 'hidden' };

    default:
      return { left: 'col-span-10', right: 'hidden' };
  }
};

// 4. DATA ADAPTERS
export const adaptDataForList = (data, type) => {
  if (!data || !Array.isArray(data)) return [];
  return data.map((item) => {
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

export const revertDataFromList = (listData, type) => {
  if (type === 'objective' && listData.length > 0) return listData[0].description;
  return listData.map((item) => {
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

// 5. NGẮT TRANG (dùng chung cho: khung xem trước live trong Modal + ảnh thumbnail)
// Đẩy nguyên khối .cv-section nào bị biên trang cắt ngang xuống đầu trang kế tiếp
// (gán margin-top), để không bao giờ cắt dở dang giữa 1 đoạn văn/1 mục kinh nghiệm.
// Trả về { height, restore } — height: chiều cao thật sau khi ngắt trang (dùng để tính
// lại số trang chính xác); restore: hàm khôi phục margin ban đầu (gọi khi không cần nữa).
// Selector đánh dấu 1 "mục" có title bên trong section (vd: từng dòng kinh nghiệm,
// học vấn... trong EditableRowList / EditableTimelineList). Xem ghi chú bên dưới.
const PAGEBREAK_ITEM_SELECTOR = '[data-cv-pagebreak-item]';

export const applyCvPageBreaks = (rootElement, options = {}) => {
  const {
    pageHeight = CV_PAGE_HEIGHT_PX,
    topPadding = 30,
    pageGap = 40,
  } = options;

  if (!rootElement) return { height: 0, restore: () => {} };

  const sections = Array.from(rootElement.querySelectorAll('.cv-section'));

  // Xây danh sách các "đơn vị ngắt trang" (breakable units) theo đúng thứ tự xuất
  // hiện trong DOM (từ trên xuống):
  //  - Nếu 1 section CÓ các item con được đánh dấu data-cv-pagebreak-item (mỗi item
  //    ứng với 1 "title" — 1 dòng kinh nghiệm/học vấn/hoạt động...), ngắt trang ở
  //    CẤP ITEM: chỉ item nào bị biên trang cắt ngang mới bị đẩy xuống, các item
  //    trước đó (title 1, title 2...) đã nằm trọn trong trang thì giữ nguyên vị trí.
  //  - Nếu section KHÔNG có item con đánh dấu (vd: mục tiêu nghề nghiệp dạng đoạn
  //    văn, section 1 khối...), vẫn ngắt ở CẤP SECTION như trước.
  const units = [];
  sections.forEach((sec) => {
    const items = Array.from(sec.querySelectorAll(PAGEBREAK_ITEM_SELECTOR));
    if (items.length > 0) {
      items.forEach((item) => units.push(item));
    } else {
      units.push(sec);
    }
  });

  const originalMargins = units.map((el) => el.style.marginTop);

  // Reset trước để phép đo không bị ảnh hưởng bởi lần ngắt trang trước đó
  units.forEach((el) => { el.style.marginTop = '0px'; });

  // Xử lý tuần tự từ trên xuống: mỗi lần đẩy 1 đơn vị (section hoặc item), các đơn vị
  // sau đọc lại đúng vị trí mới (getBoundingClientRect luôn ép reflow đồng bộ) nên
  // tính đúng dây chuyền — kể cả các item còn lại cùng section với item vừa bị đẩy.
  units.forEach((el) => {
    const canvasRect = rootElement.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    const top = elRect.top - canvasRect.top;
    const height = elRect.height;
    const bottom = top + height;
    const currentPage = Math.floor(top / pageHeight);
    const pageBottom = (currentPage + 1) * pageHeight;

    // Chỉ ngắt nếu đơn vị bị biên trang cắt ngang, và bản thân nó không dài hơn 1 trang
    if (bottom > pageBottom && height < pageHeight) {
      el.style.marginTop = `${pageBottom - top + topPadding + pageGap}px`;
    }
  });

  const height = rootElement.getBoundingClientRect().height;

  return {
    height,
    restore: () => { units.forEach((el, i) => { el.style.marginTop = originalMargins[i]; }); },
  };
};
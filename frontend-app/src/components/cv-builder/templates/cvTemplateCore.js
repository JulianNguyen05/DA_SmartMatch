/**
 * cvTemplateCore.js
 */
import { createContext, useContext } from 'react';

export const CV_FONT_SIZES = [
  { label: 'Nhỏ', value: '12px' },
  { label: 'Vừa', value: '14px' },
  { label: 'Lớn', value: '16px' },
  { label: 'Rất lớn', value: '18px' }
];

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

// 5. PAGINATION HOOK
export const setupPagination = (containerRef) => {
  const container = containerRef.current;
  if (!container) return;
  const PAGE_HEIGHT = 1123;
  const TOP_PADDING = 30;

  const paginate = () => {
    const sections = Array.from(container.querySelectorAll('.cv-section'));
    sections.forEach((sec) => { sec.style.marginTop = '0px'; });
    sections.forEach((sec) => {
      const canvasRect = container.getBoundingClientRect();
      const secRect = sec.getBoundingClientRect();
      const top = secRect.top - canvasRect.top;
      const height = secRect.height;
      const bottom = top + height;
      const currentPage = Math.floor(top / PAGE_HEIGHT);
      const pageBottom = (currentPage + 1) * PAGE_HEIGHT;
      if (bottom > pageBottom && height < PAGE_HEIGHT) {
        sec.style.marginTop = `${pageBottom - top + TOP_PADDING}px`;
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
};
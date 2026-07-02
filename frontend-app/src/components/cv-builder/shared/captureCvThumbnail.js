/**
 * captureCvThumbnail.js
 *
 * Pipeline dùng CHUNG để tạo ảnh thumbnail từ khung giấy CV (paperRef).
 * Dùng ở bất kỳ đâu cần "chụp lại" CV thành ảnh: CVBuilderPage (lúc lưu),
 * CVManagerPage (nút "Tạo lại ảnh xem trước"), v.v. Tránh copy-paste logic
 * chụp ảnh ở nhiều nơi rồi lệch nhau (chỗ nhớ fix, chỗ quên fix).
 *
 * Gộp lại 3 lớp fix đã áp dụng trước đó (xem lịch sử trao đổi):
 *  1. Tắt hẳn CSS transition trước khi chụp -> tránh chụp phải khung hình
 *     đang chuyển động dở dang (gây vỡ layout/chữ đè nhau).
 *  2. loadExternalStyleSheet: true -> nhúng đúng font Google Fonts vào ảnh,
 *     tránh ảnh bị fallback sang font khác (sai độ rộng chữ -> sai xuống dòng).
 *  3. Mô phỏng ngắt trang A4 (page-break) ngay trước khi chụp, dựa theo cơ chế
 *     phân trang cũ (setupPagination) nhưng chỉ áp dụng có chủ đích cho ảnh
 *     thumbnail, không đụng vào màn hình đang thiết kế trực tiếp.
 */
import domtoimage from 'dom-to-image-more';
import { CV_PAGE_HEIGHT_PX } from '../templates/cvTemplateCore';

const PAGE_TOP_PADDING_PX = 30;
const PAGE_GAP_PX = 40; // khoảng trắng hiển thị giữa 2 trang trong ảnh thumbnail

/**
 * Tạm thời đẩy các .cv-section bị "cắt ngang" bởi biên trang xuống đầu trang kế tiếp
 * (gán margin-top), để khi chụp ảnh nhìn giống hệt các trang PDF thật, có khoảng trắng
 * tách trang rõ ràng.
 * @returns {() => void} hàm cleanup để khôi phục margin ban đầu sau khi chụp xong.
 */
function applyPageBreaks(rootElement, pageHeight = CV_PAGE_HEIGHT_PX, gap = PAGE_GAP_PX) {
  const sections = Array.from(rootElement.querySelectorAll('.cv-section'));
  const originalMargins = sections.map((sec) => sec.style.marginTop);

  // Reset trước để phép đo bên dưới không bị ảnh hưởng bởi lần ngắt trang trước đó
  sections.forEach((sec) => { sec.style.marginTop = '0px'; });

  // Xử lý tuần tự từ trên xuống: mỗi lần đẩy 1 section, các section sau đọc lại
  // đúng vị trí mới (getBoundingClientRect luôn ép reflow đồng bộ) nên tính đúng dây chuyền.
  sections.forEach((sec) => {
    const canvasRect = rootElement.getBoundingClientRect();
    const secRect = sec.getBoundingClientRect();
    const top = secRect.top - canvasRect.top;
    const height = secRect.height;
    const bottom = top + height;
    const currentPage = Math.floor(top / pageHeight);
    const pageBottom = (currentPage + 1) * pageHeight;

    // Chỉ ngắt nếu section bị biên trang cắt ngang, và bản thân nó không dài hơn 1 trang
    if (bottom > pageBottom && height < pageHeight) {
      sec.style.marginTop = `${pageBottom - top + PAGE_TOP_PADDING_PX + gap}px`;
    }
  });

  return () => {
    sections.forEach((sec, i) => { sec.style.marginTop = originalMargins[i]; });
  };
}

/**
 * Chụp ảnh thumbnail từ khung giấy CV, có tách trang (page-break) giống bản in thật.
 *
 * @param {HTMLElement} rootElement - phần tử DOM khung giấy CV (vd: paperRef.current)
 * @param {Object} [options]
 * @param {boolean} [options.withPageBreaks=true] - có mô phỏng ngắt trang hay không
 * @param {number} [options.quality=0.85]
 * @param {string} [options.bgcolor='#ffffff']
 * @returns {Promise<Blob>}
 */
export async function captureCvThumbnail(rootElement, options = {}) {
  const { withPageBreaks = true, quality = 0.85, bgcolor = '#ffffff' } = options;

  if (!rootElement) throw new Error('captureCvThumbnail: rootElement không tồn tại');

  rootElement.classList.add('wl-no-transition');

  if (document.fonts?.ready) {
    try { await document.fonts.ready; } catch (_) { /* bỏ qua, vẫn tiếp tục chụp */ }
  }
  await new Promise((resolve) => requestAnimationFrame(resolve));

  const restorePageBreaks = withPageBreaks ? applyPageBreaks(rootElement) : null;

  // Đợi thêm 1 nhịp để marginTop vừa gán phản ánh đúng vào layout trước khi đo kích thước
  if (withPageBreaks) {
    await new Promise((resolve) => requestAnimationFrame(resolve));
  }

  try {
    const blob = await domtoimage.toBlob(rootElement, {
      quality,
      bgcolor,
      width: rootElement.offsetWidth,
      height: rootElement.offsetHeight,
      loadExternalStyleSheet: true,
    });
    return blob;
  } finally {
    restorePageBreaks?.();
    rootElement.classList.remove('wl-no-transition');
  }
}

/**
 * Tiện ích: chụp thumbnail rồi bọc luôn thành File (sẵn để upload).
 * @param {HTMLElement} rootElement
 * @param {string} fileName - vd: `cv_thumbnail_${cvId}.jpg`
 * @param {Object} [options] - xem captureCvThumbnail
 */
export async function captureCvThumbnailAsFile(rootElement, fileName, options = {}) {
  const blob = await captureCvThumbnail(rootElement, options);
  return new File([blob], fileName, { type: 'image/jpeg' });
}

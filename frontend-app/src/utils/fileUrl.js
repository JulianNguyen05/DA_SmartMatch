// src/utils/fileUrl.js
// Backend trả về đường dẫn TƯƠNG ĐỐI cho file tĩnh (avatar, logo công ty, cv...),
// ví dụ "avatars/1_xxx.jpg" — khớp với cách LocalFileStorageService.storeFile()
// trả về (subDirectory + "/" + finalFileName) và được WebMvcConfig map ra URL
// công khai dưới "/uploads/**".
//
// axiosClient.baseURL lại có hậu tố "/api/v1" (dùng cho gọi API), nên KHÔNG thể
// dùng thẳng cho file tĩnh — cần bỏ "/api/v1" để lấy đúng origin của backend.

const RAW_API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';
const BACKEND_ORIGIN = RAW_API_BASE.replace(/\/api\/v1\/?$/, '');

/**
 * Ghép đường dẫn tương đối (backend trả về) thành URL đầy đủ để dùng trong
 * <img src>, <a href>... Trả về null nếu không có path.
 *
 * @param {string} relativePath - vd "avatars/1_xxx.jpg" hoặc "companies/logos/logo1.jpg"
 * @returns {string|null}
 */
export const getFileUrl = (relativePath) => {
  if (!relativePath) return null;

  // Nếu backend đổi ý trả URL tuyệt đối trong tương lai thì vẫn chạy đúng
  if (/^https?:\/\//i.test(relativePath)) return relativePath;

  const cleanPath = relativePath.replace(/^\/+/, '');
  return `${BACKEND_ORIGIN}/uploads/${cleanPath}`;
};

export default getFileUrl;
